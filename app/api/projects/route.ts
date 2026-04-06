import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  getMongoDb,
  getMongoConfigDiagnostics,
  getProjectsCollectionName,
  hasMongoConfig,
} from '@/lib/mongodb';

const projectSchema = z.object({
  title: z.string().trim().min(1),
  cat: z.string().trim().min(1),
  desc: z.string().trim().min(1),
  tags: z.array(z.string().trim()).default([]),
  img: z.string().trim().optional().default(''),
  link: z.string().trim().optional().default(''),
  showOnHome: z.boolean().optional().default(false),
  homeSelectionOrder: z.number().int().min(1).nullable().optional(),
});

const projectIdentitySchema = z
  .object({
    _id: z.string().trim().optional(),
    id: z.number().int().positive().optional(),
  });

function hasProjectIdentity(value: { _id?: string; id?: number }) {
  const mongoId = typeof value._id === 'string' ? value._id.trim() : '';
  return Boolean(mongoId) || typeof value.id === 'number';
}

const projectUpdateSchema = projectSchema
  .merge(projectIdentitySchema)
  .refine(hasProjectIdentity, {
    message: 'Project id or _id is required.',
  });

const projectDeleteSchema = projectIdentitySchema.refine(hasProjectIdentity, {
  message: 'Project id or _id is required.',
});

type ProjectPayload = z.infer<typeof projectSchema>;
type ProjectIdentity = z.infer<typeof projectIdentitySchema>;
type ProjectWithIdentity = z.infer<typeof projectUpdateSchema>;

type ProjectDocument = {
  _id?: ObjectId | string;
  id?: number;
  title: string;
  cat: string;
  desc: string;
  tags: string[];
  img: string;
  link: string;
  showOnHome: boolean;
  homeSelectionOrder: number | null;
  createdAt?: Date;
  updatedAt?: Date;
};

type ProjectResponse = {
  _id: string;
  id: number;
  title: string;
  cat: string;
  desc: string;
  tags: string[];
  img: string;
  link: string;
  showOnHome: boolean;
  homeSelectionOrder: number | null;
};

const PROJECTS_RESPONSE_CACHE_CONTROL = 'no-store';
const DEFAULT_PROJECT_IMAGE_PATH = '/images/projects/default.png';
const MAX_LITE_INLINE_IMAGE_CHARS = 600_000;
const PROJECT_IMAGE_UPLOADS_PUBLIC_PREFIX = '/images/projects/uploads/';
const PROJECT_IMAGE_UPLOADS_DIR = join(
  process.cwd(),
  'public',
  'images',
  'projects',
  'uploads'
);
const DATA_URL_IMAGE_PATTERN = /^data:(image\/[a-zA-Z0-9.+-]+);base64,([\s\S]+)$/;
const MIME_TO_EXTENSION: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
};

function isReadOnlyFileSystemError(error: unknown) {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code?: unknown }).code;
    if (code === 'EROFS' || code === 'EPERM' || code === 'EACCES') {
      return true;
    }
  }

  if (error instanceof Error) {
    return /EROFS|read-only file system/i.test(error.message);
  }

  if (typeof error === 'string') {
    return /EROFS|read-only file system/i.test(error);
  }

  return false;
}

function shouldPreferInlineImageStorage() {
  const configuredMode = (process.env.PROJECT_IMAGE_STORAGE_MODE || '').trim().toLowerCase();

  if (configuredMode === 'inline') {
    return true;
  }

  if (configuredMode === 'filesystem' || configuredMode === 'fs') {
    return false;
  }

  if (process.env.NODE_ENV === 'production') {
    return true;
  }

  // Serverless bundles (for example Vercel /var/task) are typically read-only.
  if (process.env.VERCEL === '1' || process.cwd().startsWith('/var/task')) {
    return true;
  }

  return false;
}

function getDatabaseErrorSummary(error: unknown) {
  if (!error || typeof error !== 'object') {
    return null;
  }

  const candidate = error as { message?: unknown; code?: unknown; name?: unknown };
  const code = typeof candidate.code === 'string' ? candidate.code : '';
  const name = typeof candidate.name === 'string' ? candidate.name : '';
  const message = typeof candidate.message === 'string' ? candidate.message : '';

  const prefix = code || name;
  if (prefix && message) {
    return `${prefix}: ${message}`;
  }

  return prefix || message || null;
}

function databaseUnavailableErrorMessage() {
  const diagnostics = getMongoConfigDiagnostics();

  return `Project API requires MongoDB configuration. Set MONGODB_URI (or compatible key). Detected env -> URI:${diagnostics.hasUri}, DB_NAME:${diagnostics.hasDatabaseName}.`;
}

function normalizeTags(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === 'string');
      }
      return [];
    } catch {
      return [];
    }
  }

  return [];
}

function normalizeProjectImageForResponse(value: unknown, liteMode: boolean) {
  if (typeof value !== 'string') {
    return DEFAULT_PROJECT_IMAGE_PATH;
  }

  const normalized = value.trim();
  if (!normalized) {
    return DEFAULT_PROJECT_IMAGE_PATH;
  }

  const isInlineImage = normalized.startsWith('data:image/');

  if (liteMode && isInlineImage && normalized.length > MAX_LITE_INLINE_IMAGE_CHARS) {
    return DEFAULT_PROJECT_IMAGE_PATH;
  }

  return normalized;
}

function getImageExtensionFromMimeType(mimeType: string) {
  return MIME_TO_EXTENSION[mimeType.toLowerCase()] || 'webp';
}

function isManagedProjectImagePath(value: unknown): value is string {
  return typeof value === 'string' && value.startsWith(PROJECT_IMAGE_UPLOADS_PUBLIC_PREFIX);
}

function getManagedProjectImageFilePath(publicPath: string) {
  const fileName = publicPath.slice(PROJECT_IMAGE_UPLOADS_PUBLIC_PREFIX.length);

  if (!/^[a-zA-Z0-9._-]+$/.test(fileName)) {
    return null;
  }

  return join(PROJECT_IMAGE_UPLOADS_DIR, fileName);
}

async function removeManagedProjectImageFile(value: unknown) {
  if (!isManagedProjectImagePath(value)) {
    return;
  }

  const filePath = getManagedProjectImageFilePath(value);
  if (!filePath) {
    return;
  }

  try {
    await unlink(filePath);
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error) {
      const code = (error as { code?: unknown }).code;
      if (code === 'ENOENT') {
        return;
      }
    }

    console.warn('[api/projects] Failed to remove project image file.', { value, error });
  }
}

async function persistProjectImage(value: string) {
  const normalized = value.trim();

  if (!normalized) {
    return DEFAULT_PROJECT_IMAGE_PATH;
  }

  if (!normalized.startsWith('data:image/')) {
    return normalized;
  }

  if (shouldPreferInlineImageStorage()) {
    return normalized;
  }

  const match = normalized.match(DATA_URL_IMAGE_PATTERN);
  if (!match) {
    return DEFAULT_PROJECT_IMAGE_PATH;
  }

  const mimeType = match[1].toLowerCase();
  const base64Payload = match[2].replace(/\s+/g, '');

  if (!base64Payload) {
    return DEFAULT_PROJECT_IMAGE_PATH;
  }

  const binary = Buffer.from(base64Payload, 'base64');
  if (binary.length === 0) {
    return DEFAULT_PROJECT_IMAGE_PATH;
  }

  const extension = getImageExtensionFromMimeType(mimeType);
  const fileName = `project-${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extension}`;
  const filePath = join(PROJECT_IMAGE_UPLOADS_DIR, fileName);

  try {
    await mkdir(PROJECT_IMAGE_UPLOADS_DIR, { recursive: true });
    await writeFile(filePath, binary);
    return `${PROJECT_IMAGE_UPLOADS_PUBLIC_PREFIX}${fileName}`;
  } catch (error) {
    if (isReadOnlyFileSystemError(error)) {
      // Some serverless environments (e.g. /var/task) are read-only at runtime.
      // Fall back to inline storage so project saves do not fail.
      console.warn('[api/projects] Upload directory is read-only. Falling back to inline image storage.');
      return normalized;
    }

    if (
      error instanceof Error &&
      /\/var\/task|read-only file system|EROFS|EPERM|EACCES/i.test(error.message)
    ) {
      console.warn('[api/projects] Non-writable runtime detected. Falling back to inline image storage.');
      return normalized;
    }

    throw error;
  }
}

function normalizeProjectForResponse(
  project: Partial<ProjectDocument>,
  fallbackId: number,
  options?: { liteMode?: boolean }
): ProjectResponse {
  const liteMode = Boolean(options?.liteMode);
  const normalizedId =
    typeof project.id === 'number' && Number.isInteger(project.id) && project.id > 0
      ? project.id
      : fallbackId;

  const normalizedImage = normalizeProjectImageForResponse(project.img, liteMode);

  return {
    _id:
      project._id instanceof ObjectId
        ? project._id.toHexString()
        : typeof project._id === 'string'
          ? project._id
          : '',
    id: normalizedId,
    title: typeof project.title === 'string' ? project.title : '',
    cat: typeof project.cat === 'string' ? project.cat : '',
    desc: typeof project.desc === 'string' ? project.desc : '',
    tags: normalizeTags(project.tags),
    img: normalizedImage,
    link: typeof project.link === 'string' ? project.link : '',
    showOnHome: Boolean(project.showOnHome),
    homeSelectionOrder:
      typeof project.homeSelectionOrder === 'number' &&
      Number.isInteger(project.homeSelectionOrder) &&
      project.homeSelectionOrder >= 1
        ? project.homeSelectionOrder
        : null,
  };
}

function createProjectsResponse(projects: ProjectResponse[]) {
  return NextResponse.json(projects, {
    headers: {
      'Cache-Control': PROJECTS_RESPONSE_CACHE_CONTROL,
      'X-Projects-Source': 'database',
    },
  });
}

function isAdmin(request: Request) {
  const cookieHeader = request.headers.get('cookie') || '';
  return cookieHeader.split(';').some((cookie) => cookie.trim() === 'admin_session=true');
}

async function getProjectsCollection() {
  const db = await getMongoDb();
  return db.collection<ProjectDocument>(getProjectsCollectionName());
}

async function getNextProjectId() {
  const projects = await getProjectsCollection();

  const rows = await projects
    .aggregate<{ id?: unknown }>([
      { $match: { $expr: { $isNumber: '$id' } } },
      { $sort: { id: -1 } },
      { $limit: 1 },
      { $project: { id: 1 } },
    ])
    .toArray();

  const current = rows[0]?.id;
  if (typeof current === 'number' && Number.isInteger(current) && current > 0) {
    return current + 1;
  }

  return 1;
}

function getProjectFilter(identity: ProjectIdentity): Record<string, unknown> {
  const mongoId = typeof identity._id === 'string' ? identity._id.trim() : '';

  if (mongoId) {
    return {
      _id: ObjectId.isValid(mongoId) ? new ObjectId(mongoId) : mongoId,
    };
  }

  if (typeof identity.id === 'number') {
    return { id: identity.id };
  }

  throw new Error('Project identity is missing.');
}

function parseProjectIdentityFromSearchParams(searchParams: URLSearchParams): {
  identity: ProjectIdentity | null;
  error?: string;
} {
  const mongoId = (searchParams.get('_id') || '').trim();
  if (mongoId) {
    return { identity: { _id: mongoId } };
  }

  const idRaw = searchParams.get('id');
  if (idRaw === null || idRaw.trim().length === 0) {
    return { identity: null };
  }

  const parsedId = Number(idRaw.trim());
  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    return { identity: null, error: 'Invalid id query parameter.' };
  }

  return { identity: { id: parsedId } };
}

async function hasSelectionOrderConflict(
  homeSelectionOrder: number | null,
  excludedIdentity?: ProjectIdentity
) {
  if (homeSelectionOrder === null) {
    return false;
  }

  const projects = await getProjectsCollection();
  const conflict = await projects.findOne({ showOnHome: true, homeSelectionOrder });

  if (!conflict) {
    return false;
  }

  if (!excludedIdentity) {
    return true;
  }

  if (
    typeof excludedIdentity.id === 'number' &&
    typeof conflict.id === 'number' &&
    excludedIdentity.id === conflict.id
  ) {
    return false;
  }

  const excludedMongoId =
    typeof excludedIdentity._id === 'string' ? excludedIdentity._id.trim() : '';

  if (excludedMongoId) {
    const conflictMongoId =
      conflict._id instanceof ObjectId
        ? conflict._id.toHexString()
        : typeof conflict._id === 'string'
          ? conflict._id
          : '';

    if (conflictMongoId && conflictMongoId === excludedMongoId) {
      return false;
    }
  }

  return true;
}

export async function GET(request: Request) {
  if (!hasMongoConfig()) {
    return NextResponse.json(
      { success: false, error: databaseUnavailableErrorMessage() },
      { status: 503 }
    );
  }

  try {
    const url = new URL(request.url);
    const liteMode = ['1', 'true', 'yes'].includes(
      (url.searchParams.get('lite') || '').toLowerCase()
    );
    const queryIdentity = parseProjectIdentityFromSearchParams(url.searchParams);

    if (queryIdentity.error) {
      return NextResponse.json(
        { success: false, error: queryIdentity.error },
        { status: 400 }
      );
    }

    const projects = await getProjectsCollection();

    if (queryIdentity.identity) {
      let filter: Record<string, unknown>;

      try {
        filter = getProjectFilter(queryIdentity.identity);
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            error: error instanceof Error ? error.message : 'Invalid project identifier.',
          },
          { status: 400 }
        );
      }

      const project = await projects.findOne(filter);
      if (!project) {
        return NextResponse.json({ success: false, error: 'Project not found.' }, { status: 404 });
      }

      const fallbackId =
        typeof project.id === 'number' && Number.isInteger(project.id) && project.id > 0
          ? project.id
          : 1;

      return NextResponse.json(normalizeProjectForResponse(project, fallbackId), {
        headers: {
          'Cache-Control': 'no-store',
          'X-Projects-Source': 'database',
        },
      });
    }

    const rows = liteMode
      ? await projects
          .aggregate<Partial<ProjectDocument>>([
            { $sort: { id: -1, _id: -1 } },
            {
              $project: {
                _id: 1,
                id: 1,
                title: 1,
                cat: 1,
                desc: 1,
                tags: 1,
                link: 1,
                showOnHome: 1,
                homeSelectionOrder: 1,
                img: {
                  $let: {
                    vars: {
                      imgValue: '$img',
                      imgType: { $type: '$img' },
                    },
                    in: {
                      $cond: [
                        { $eq: ['$$imgType', 'string'] },
                        {
                          $cond: [
                            {
                              $and: [
                                { $regexMatch: { input: '$$imgValue', regex: '^data:image/' } },
                                { $gt: [{ $strLenCP: '$$imgValue' }, MAX_LITE_INLINE_IMAGE_CHARS] },
                              ],
                            },
                            DEFAULT_PROJECT_IMAGE_PATH,
                            '$$imgValue',
                          ],
                        },
                        DEFAULT_PROJECT_IMAGE_PATH,
                      ],
                    },
                  },
                },
              },
            },
          ])
          .toArray()
      : await projects.find().sort({ id: -1, _id: -1 }).toArray();

    const response = rows.map((project, index) =>
      normalizeProjectForResponse(project, rows.length - index, { liteMode })
    );

    return createProjectsResponse(response);
  } catch (error) {
    console.error('[api/projects][GET] Database read failed.', error);
    const summary = getDatabaseErrorSummary(error);

    return NextResponse.json(
      {
        success: false,
        error: summary ? `Failed to read projects. ${summary}` : 'Failed to read projects.',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (!isAdmin(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasMongoConfig()) {
    return NextResponse.json(
      { success: false, error: databaseUnavailableErrorMessage() },
      { status: 503 }
    );
  }

  let project: ProjectPayload;

  try {
    const body = await request.json();
    project = projectSchema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Invalid project data' }, { status: 400 });
    }

    return NextResponse.json(
      { success: false, error: 'Failed to parse project data.' },
      { status: 500 }
    );
  }

  const normalizedProject: ProjectPayload = {
    ...project,
    title: project.title.trim(),
    cat: project.cat.trim(),
    desc: project.desc.trim(),
    tags: project.tags.map((tag) => tag.trim()).filter(Boolean),
    img: (project.img || '').trim() || DEFAULT_PROJECT_IMAGE_PATH,
    link: (project.link || '').trim(),
    showOnHome: Boolean(project.showOnHome),
    homeSelectionOrder: project.showOnHome ? project.homeSelectionOrder ?? null : null,
  };

  if (
    normalizedProject.showOnHome &&
    (await hasSelectionOrderConflict(normalizedProject.homeSelectionOrder ?? null))
  ) {
    return NextResponse.json(
      { success: false, error: 'This home selection order is already in use.' },
      { status: 409 }
    );
  }

  try {
    const id = await getNextProjectId();
    const now = new Date();
    const projects = await getProjectsCollection();
    const persistedImage = await persistProjectImage(normalizedProject.img);

    const result = await projects.insertOne({
      id,
      title: normalizedProject.title,
      cat: normalizedProject.cat,
      desc: normalizedProject.desc,
      tags: normalizedProject.tags,
      img: persistedImage,
      link: normalizedProject.link || '',
      showOnHome: Boolean(normalizedProject.showOnHome),
      homeSelectionOrder: normalizedProject.homeSelectionOrder ?? null,
      createdAt: now,
      updatedAt: now,
    });

    const insertedMongoId =
      result.insertedId instanceof ObjectId
        ? result.insertedId.toHexString()
        : String(result.insertedId);

    return NextResponse.json({
      success: true,
      project: {
        _id: insertedMongoId,
        id,
      },
    });
  } catch (error) {
    console.error('[api/projects][POST] Database write failed.', error);
    const summary = getDatabaseErrorSummary(error);

    return NextResponse.json(
      {
        success: false,
        error: summary ? `Failed to save project. ${summary}` : 'Failed to save project.',
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  if (!isAdmin(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasMongoConfig()) {
    return NextResponse.json(
      { success: false, error: databaseUnavailableErrorMessage() },
      { status: 503 }
    );
  }

  let project: ProjectWithIdentity;
  let includesImageField = false;

  try {
    const body = await request.json();
    includesImageField =
      typeof body === 'object' && body !== null && Object.prototype.hasOwnProperty.call(body, 'img');
    project = projectUpdateSchema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Invalid project data' }, { status: 400 });
    }

    return NextResponse.json(
      { success: false, error: 'Failed to parse project data.' },
      { status: 500 }
    );
  }

  const normalizedProject: ProjectWithIdentity = {
    ...project,
    title: project.title.trim(),
    cat: project.cat.trim(),
    desc: project.desc.trim(),
    tags: project.tags.map((tag) => tag.trim()).filter(Boolean),
    img: (project.img || '').trim() || DEFAULT_PROJECT_IMAGE_PATH,
    link: (project.link || '').trim(),
    showOnHome: Boolean(project.showOnHome),
    homeSelectionOrder: project.showOnHome ? project.homeSelectionOrder ?? null : null,
  };

  const normalizedImage = (project.img || '').trim() || DEFAULT_PROJECT_IMAGE_PATH;

  if (
    normalizedProject.showOnHome &&
    (await hasSelectionOrderConflict(normalizedProject.homeSelectionOrder ?? null, normalizedProject))
  ) {
    return NextResponse.json(
      { success: false, error: 'This home selection order is already in use.' },
      { status: 409 }
    );
  }

  let filter: Record<string, unknown>;

  try {
    filter = getProjectFilter(normalizedProject);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Invalid project identifier.',
      },
      { status: 400 }
    );
  }

  try {
    const projects = await getProjectsCollection();
    const existingProject = await projects.findOne(filter);

    if (!existingProject) {
      return NextResponse.json({ success: false, error: 'Project not found.' }, { status: 404 });
    }

    let nextImage =
      typeof existingProject.img === 'string' && existingProject.img.trim().length > 0
        ? existingProject.img
        : DEFAULT_PROJECT_IMAGE_PATH;

    if (includesImageField) {
      nextImage = await persistProjectImage(normalizedImage);
    }

    const updateSet: Partial<ProjectDocument> = {
      title: normalizedProject.title,
      cat: normalizedProject.cat,
      desc: normalizedProject.desc,
      tags: normalizedProject.tags,
      link: normalizedProject.link || '',
      showOnHome: Boolean(normalizedProject.showOnHome),
      homeSelectionOrder: normalizedProject.homeSelectionOrder ?? null,
      updatedAt: new Date(),
    };

    if (includesImageField) {
      updateSet.img = nextImage;
    }

    const result = await projects.updateOne(filter, {
      $set: updateSet,
    });

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, error: 'Project not found.' }, { status: 404 });
    }

    if (includesImageField && nextImage !== existingProject.img) {
      await removeManagedProjectImageFile(existingProject.img);
    }

    return NextResponse.json({
      success: true,
      project: {
        _id: typeof normalizedProject._id === 'string' ? normalizedProject._id : '',
        id: typeof normalizedProject.id === 'number' ? normalizedProject.id : null,
      },
    });
  } catch (error) {
    console.error('[api/projects][PUT] Database write failed.', error);
    const summary = getDatabaseErrorSummary(error);

    return NextResponse.json(
      {
        success: false,
        error: summary ? `Failed to update project. ${summary}` : 'Failed to update project.',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  if (!isAdmin(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasMongoConfig()) {
    return NextResponse.json(
      { success: false, error: databaseUnavailableErrorMessage() },
      { status: 503 }
    );
  }

  let identity: ProjectIdentity;

  try {
    const body = await request.json();
    identity = projectDeleteSchema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Invalid delete request' }, { status: 400 });
    }

    return NextResponse.json(
      { success: false, error: 'Failed to parse delete request.' },
      { status: 500 }
    );
  }

  let filter: Record<string, unknown>;

  try {
    filter = getProjectFilter(identity);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Invalid project identifier.',
      },
      { status: 400 }
    );
  }

  try {
    const projects = await getProjectsCollection();
    const existingProject = await projects.findOne(filter, { projection: { img: 1 } });

    if (!existingProject) {
      return NextResponse.json({ success: false, error: 'Project not found.' }, { status: 404 });
    }

    const result = await projects.deleteOne(filter);

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, error: 'Project not found.' }, { status: 404 });
    }

    await removeManagedProjectImageFile(existingProject.img);

    return NextResponse.json({ success: true, source: 'database' });
  } catch (error) {
    console.error('[api/projects][DELETE] Database write failed.', error);
    const summary = getDatabaseErrorSummary(error);

    return NextResponse.json(
      {
        success: false,
        error: summary ? `Failed to delete project. ${summary}` : 'Failed to delete project.',
      },
      { status: 500 }
    );
  }
}
