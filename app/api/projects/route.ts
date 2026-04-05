import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getMongoDb, getMongoConfigDiagnostics, getProjectsCollectionName, hasMongoConfig } from '@/lib/mongodb';
import fallbackProjectsSource from '@/data/projects.json';

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

const projectUpdateSchema = projectSchema.extend({
  id: z.number().int().positive(),
});

const projectDeleteSchema = z.object({
  id: z.number().int().positive(),
});

type ProjectPayload = {
  title: string;
  cat: string;
  desc: string;
  tags: string[];
  img: string;
  link?: string;
  showOnHome?: boolean;
  homeSelectionOrder?: number | null;
};

type ProjectWithId = ProjectPayload & { id: number };

type ProjectDocument = {
  id: number;
  title: string;
  cat: string;
  desc: string;
  tags: string[];
  img: string;
  link: string;
  showOnHome: boolean;
  homeSelectionOrder: number | null;
  createdAt: Date;
  updatedAt: Date;
};

type DeletedProjectDocument = {
  identityKey: string;
  id?: number | null;
  deletedAt: Date;
};

type CounterDocument = {
  _id: string;
  seq: number;
};

const PROJECTS_RESPONSE_CACHE_CONTROL = 'public, s-maxage=60, stale-while-revalidate=300';
const DEFAULT_PROJECT_IMAGE_PATH = '/images/projects/default.png';

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

function normalizeProjectForResponse(project: Partial<ProjectDocument>, fallbackId: number): ProjectWithId {
  const normalizedId =
    typeof project.id === 'number' && Number.isInteger(project.id) && project.id > 0
      ? project.id
      : fallbackId;

  const normalizedImage =
    typeof project.img === 'string' && project.img.trim().length > 0
      ? project.img
      : DEFAULT_PROJECT_IMAGE_PATH;

  return {
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

function getFallbackProjects(): ProjectWithId[] {
  if (!Array.isArray(fallbackProjectsSource)) {
    return [];
  }

  return fallbackProjectsSource.map((project, index) => {
    const candidate = project as Partial<ProjectDocument>;
    const fallbackOrder = index + 1;

    return normalizeProjectForResponse(
      {
        ...candidate,
        id:
          typeof candidate.id === 'number' && Number.isInteger(candidate.id) && candidate.id > 0
            ? candidate.id
            : fallbackOrder,
        showOnHome: typeof candidate.showOnHome === 'boolean' ? candidate.showOnHome : true,
        homeSelectionOrder:
          typeof candidate.homeSelectionOrder === 'number' &&
          Number.isInteger(candidate.homeSelectionOrder) &&
          candidate.homeSelectionOrder > 0
            ? candidate.homeSelectionOrder
            : fallbackOrder,
      },
      fallbackOrder
    );
  });
}

function createProjectsResponse(projects: ProjectWithId[], source: string) {
  return NextResponse.json(projects, {
    headers: {
      'Cache-Control': PROJECTS_RESPONSE_CACHE_CONTROL,
      'X-Projects-Source': source,
    },
  });
}

function getProjectIdentityKey(project: Partial<ProjectWithId>) {
  const title = typeof project.title === 'string' ? project.title.trim().toLowerCase() : '';
  const link = typeof project.link === 'string' ? project.link.trim().toLowerCase() : '';

  if (title || link) {
    return `${title}::${link}`;
  }

  if (typeof project.id === 'number' && Number.isInteger(project.id) && project.id > 0) {
    return `id:${project.id}`;
  }

  return '';
}

function mergeProjectLists(primary: ProjectWithId[], secondary: ProjectWithId[]) {
  const merged: ProjectWithId[] = [];
  const seenKeys = new Set<string>();

  const pushIfMissing = (project: ProjectWithId) => {
    const identityKey = getProjectIdentityKey(project);

    if (identityKey && seenKeys.has(identityKey)) {
      return;
    }

    if (identityKey) {
      seenKeys.add(identityKey);
    }

    merged.push(project);
  };

  primary.forEach(pushIfMissing);
  secondary.forEach(pushIfMissing);

  return merged;
}

function isAdmin(request: Request) {
  const cookieHeader = request.headers.get('cookie') || '';
  return cookieHeader.split(';').some((cookie) => cookie.trim() === 'admin_session=true');
}

async function getProjectsCollection() {
  const db = await getMongoDb();
  return db.collection<ProjectDocument>(getProjectsCollectionName());
}

async function getDeletedProjectsCollection() {
  const db = await getMongoDb();
  return db.collection<DeletedProjectDocument>('projects_deleted');
}

async function getDeletedProjectIdentityKeys() {
  const deletedProjects = await getDeletedProjectsCollection();
  const rows = await deletedProjects
    .find({}, { projection: { identityKey: 1 } })
    .toArray();

  const keys = new Set<string>();

  for (const row of rows) {
    if (typeof row.identityKey === 'string' && row.identityKey.length > 0) {
      keys.add(row.identityKey);
    }
  }

  return keys;
}

async function markProjectIdentityDeleted(project: Partial<ProjectWithId>) {
  const identityKey = getProjectIdentityKey(project);

  if (!identityKey) {
    return;
  }

  const deletedProjects = await getDeletedProjectsCollection();

  await deletedProjects.updateOne(
    { identityKey },
    {
      $set: {
        identityKey,
        id: typeof project.id === 'number' && Number.isInteger(project.id) ? project.id : null,
        deletedAt: new Date(),
      },
    },
    { upsert: true }
  );
}

async function getNextProjectId() {
  const db = await getMongoDb();
  const counters = db.collection<CounterDocument>('counters');

  const counter = await counters.findOneAndUpdate(
    { _id: 'projects' },
    { $inc: { seq: 1 } },
    {
      upsert: true,
      returnDocument: 'after',
      includeResultMetadata: false,
    }
  );

  if (!counter || typeof counter.seq !== 'number') {
    throw new Error('Failed to generate project id.');
  }

  return counter.seq;
}

async function hasSelectionOrderConflict(
  homeSelectionOrder: number | null,
  excludedProjectId?: number
) {
  if (homeSelectionOrder === null) {
    return false;
  }

  const projects = await getProjectsCollection();

  const query: Record<string, unknown> = {
    showOnHome: true,
    homeSelectionOrder,
  };

  if (typeof excludedProjectId === 'number') {
    query.id = { $ne: excludedProjectId };
  }

  const conflict = await projects.findOne(query);
  return Boolean(conflict);
}

export async function GET() {
  const fallbackProjects = getFallbackProjects();

  if (!hasMongoConfig()) {
    if (fallbackProjects.length > 0) {
      return createProjectsResponse(fallbackProjects, 'fallback-no-db-config');
    }

    return NextResponse.json(
      { success: false, error: databaseUnavailableErrorMessage() },
      { status: 503 }
    );
  }

  try {
    const projects = await getProjectsCollection();
    const rows = await projects.find().sort({ id: -1 }).toArray();
    const deletedIdentityKeys = await getDeletedProjectIdentityKeys();

    const response = rows.map((project: ProjectDocument, index: number) =>
      normalizeProjectForResponse(project, index + 1)
    );

    const filteredFallbackProjects = fallbackProjects.filter((project) => {
      const identityKey = getProjectIdentityKey(project);

      if (!identityKey) {
        return true;
      }

      return !deletedIdentityKeys.has(identityKey);
    });

    if (response.length === 0 && filteredFallbackProjects.length > 0) {
      return createProjectsResponse(filteredFallbackProjects, 'fallback-empty-db');
    }

    const fallbackProjectsForMerge = filteredFallbackProjects.map((project) => ({
      ...project,
      showOnHome: false,
      homeSelectionOrder: null,
    }));

    const mergedResponse = mergeProjectLists(response, fallbackProjectsForMerge);
    const source = mergedResponse.length > response.length ? 'database+fallback-merge' : 'database';

    return createProjectsResponse(mergedResponse, source);
  } catch (error) {
    console.error('[api/projects][GET] Database read failed.', error);
    const summary = getDatabaseErrorSummary(error);

    if (fallbackProjects.length > 0) {
      return createProjectsResponse(fallbackProjects, 'fallback-db-error');
    }

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

    await projects.insertOne({
      id,
      title: normalizedProject.title,
      cat: normalizedProject.cat,
      desc: normalizedProject.desc,
      tags: normalizedProject.tags,
      img: normalizedProject.img,
      link: normalizedProject.link || '',
      showOnHome: Boolean(normalizedProject.showOnHome),
      homeSelectionOrder: normalizedProject.homeSelectionOrder ?? null,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({
      success: true,
      project: { ...normalizedProject, id },
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

  let project: ProjectWithId;

  try {
    const body = await request.json();
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

  const normalizedProject: ProjectWithId = {
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
    (await hasSelectionOrderConflict(normalizedProject.homeSelectionOrder ?? null, normalizedProject.id))
  ) {
    return NextResponse.json(
      { success: false, error: 'This home selection order is already in use.' },
      { status: 409 }
    );
  }

  try {
    const projects = await getProjectsCollection();

    const result = await projects.updateOne(
      { id: normalizedProject.id },
      {
        $set: {
          title: normalizedProject.title,
          cat: normalizedProject.cat,
          desc: normalizedProject.desc,
          tags: normalizedProject.tags,
          img: normalizedProject.img,
          link: normalizedProject.link || '',
          showOnHome: Boolean(normalizedProject.showOnHome),
          homeSelectionOrder: normalizedProject.homeSelectionOrder ?? null,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Project not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, project: normalizedProject });
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

  let id: number;

  try {
    const body = await request.json();
    id = projectDeleteSchema.parse(body).id;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Invalid delete request' }, { status: 400 });
    }

    return NextResponse.json(
      { success: false, error: 'Failed to parse delete request.' },
      { status: 500 }
    );
  }

  try {
    const fallbackProject = getFallbackProjects().find((project) => project.id === id) ?? null;
    const projects = await getProjectsCollection();
    const existingProject = await projects.findOne({ id });

    if (!existingProject && !fallbackProject) {
      return NextResponse.json(
        { success: false, error: 'Project not found.' },
        { status: 404 }
      );
    }

    const result = await projects.deleteOne({ id });

    const deleteIdentityPayload: Partial<ProjectWithId> = {
      id,
      title:
        typeof existingProject?.title === 'string'
          ? existingProject.title
          : typeof fallbackProject?.title === 'string'
            ? fallbackProject.title
            : '',
      link:
        typeof existingProject?.link === 'string'
          ? existingProject.link
          : typeof fallbackProject?.link === 'string'
            ? fallbackProject.link
            : '',
    };

    await markProjectIdentityDeleted(deleteIdentityPayload);

    const source = result.deletedCount > 0 ? 'database' : 'fallback-only';

    return NextResponse.json({ success: true, source });
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
