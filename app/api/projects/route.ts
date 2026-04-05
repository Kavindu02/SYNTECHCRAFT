import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getPool, hasDatabaseConfig, getDatabaseConfigDiagnostics } from '@/lib/mysql';
import projectsData from '@/data/projects.json';
import { promises as fs } from 'fs';
import path from 'path';

const projectSchema = z.object({
  title: z.string().min(1),
  cat: z.string().min(1),
  desc: z.string().min(1),
  tags: z.array(z.string()).default([]),
  img: z.string().min(1),
  link: z.string().optional().or(z.literal('')),
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

const projectsFilePath = path.join(process.cwd(), 'data', 'projects.json');
const PROJECTS_RESPONSE_CACHE_CONTROL = 'public, s-maxage=60, stale-while-revalidate=300';
const DB_PROJECTS_QUERY_TIMEOUT_MS = Number(process.env.DB_PROJECTS_QUERY_TIMEOUT_MS || 2000);
const HAS_DATABASE_CONFIG = hasDatabaseConfig();
const DATABASE_CONFIG_DIAGNOSTICS = getDatabaseConfigDiagnostics();
const PROJECTS_DATA_SEED: unknown[] = Array.isArray(projectsData) ? projectsData : [];

type DatabaseErrorLike = {
  code?: unknown;
  message?: unknown;
  sqlMessage?: unknown;
};

function isReadOnlyFileWriteError(error: unknown) {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const code = (error as { code?: unknown }).code;
  return code === 'EROFS' || code === 'EACCES' || code === 'EPERM';
}

function getDatabaseErrorSummary(error: unknown) {
  if (!error || typeof error !== 'object') {
    return null;
  }

  const dbError = error as DatabaseErrorLike;
  const code = typeof dbError.code === 'string' ? dbError.code : '';
  const message =
    typeof dbError.sqlMessage === 'string'
      ? dbError.sqlMessage
      : typeof dbError.message === 'string'
        ? dbError.message
        : '';

  if (code && message) {
    return `${code}: ${message}`;
  }

  if (code) {
    return code;
  }

  if (message) {
    return message;
  }

  return null;
}

function isUnknownColumnError(error: unknown) {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const code = (error as DatabaseErrorLike).code;
  return code === 'ER_BAD_FIELD_ERROR';
}

function mutationUnavailableErrorMessage(databaseErrorSummary?: string | null) {
  const baseMessage = HAS_DATABASE_CONFIG
    ? 'Failed to persist project data. Database and file fallback are unavailable.'
    : 'Project write is unavailable in this deployment. Set DATABASE_URL or DB_HOST/DB_USER/DB_PASSWORD/DB_NAME in your deployment environment.';

  const diagnosticsMessage = `Detected env -> URL:${DATABASE_CONFIG_DIAGNOSTICS.hasUrl}, HOST:${DATABASE_CONFIG_DIAGNOSTICS.hasHost}, USER:${DATABASE_CONFIG_DIAGNOSTICS.hasUser}, PASSWORD:${DATABASE_CONFIG_DIAGNOSTICS.hasPassword}, DB:${DATABASE_CONFIG_DIAGNOSTICS.hasDatabase}.`;

  if (HAS_DATABASE_CONFIG && databaseErrorSummary) {
    return `${baseMessage} (${databaseErrorSummary}) ${diagnosticsMessage}`;
  }

  if (!HAS_DATABASE_CONFIG) {
    return `${baseMessage} ${diagnosticsMessage}`;
  }

  return baseMessage;
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

function isAdmin(request: Request) {
  const cookieHeader = request.headers.get('cookie') || '';
  return cookieHeader.split(';').some((cookie) => cookie.trim() === 'admin_session=true');
}

function asProjectWithIds(items: unknown[]): ProjectWithId[] {
  return items.map((item, index) => {
    const candidate = item as Partial<ProjectWithId>;
    const fallback = PROJECTS_DATA_SEED[index] as ProjectPayload | undefined;

    return {
      id:
        typeof candidate.id === 'number' && Number.isInteger(candidate.id) && candidate.id > 0
          ? candidate.id
          : index + 1,
      title: typeof candidate.title === 'string' ? candidate.title : fallback?.title || '',
      cat: typeof candidate.cat === 'string' ? candidate.cat : fallback?.cat || '',
      desc: typeof candidate.desc === 'string' ? candidate.desc : fallback?.desc || '',
      tags: normalizeTags(candidate.tags),
      img: typeof candidate.img === 'string' ? candidate.img : fallback?.img || '',
      link: typeof candidate.link === 'string' ? candidate.link : fallback?.link || '',
      showOnHome:
        typeof candidate.showOnHome === 'boolean'
          ? candidate.showOnHome
          : Boolean(fallback?.showOnHome),
      homeSelectionOrder:
        typeof candidate.homeSelectionOrder === 'number' &&
        Number.isInteger(candidate.homeSelectionOrder) &&
        candidate.homeSelectionOrder >= 1
          ? candidate.homeSelectionOrder
          : null,
    };
  });
}

async function readProjectsFromFile(): Promise<ProjectWithId[]> {
  try {
    const raw = await fs.readFile(projectsFilePath, 'utf-8');
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return asProjectWithIds(PROJECTS_DATA_SEED);
    }

    return asProjectWithIds(parsed);
  } catch {
    return asProjectWithIds(PROJECTS_DATA_SEED);
  }
}

async function writeProjectsToFile(projects: ProjectWithId[]) {
  await fs.writeFile(projectsFilePath, `${JSON.stringify(projects, null, 2)}\n`, 'utf-8');
}

export async function GET() {
  if (HAS_DATABASE_CONFIG) {
    try {
      const pool = getPool();
      const [rows] = await pool.query({
        sql: 'SELECT * FROM projects ORDER BY id DESC',
        timeout: DB_PROJECTS_QUERY_TIMEOUT_MS,
      });

      const dbProjects = (rows as any[]).map((project) => {
        const rawShowOnHome = project.show_on_home ?? project.showOnHome;
        return {
          id: project.id,
          title: project.title,
          cat: project.cat,
          desc: project.desc,
          tags: normalizeTags(project.tags),
          img: project.img,
          link: project.link ?? '',
          showOnHome: rawShowOnHome === true || rawShowOnHome === 1,
          homeSelectionOrder:
            typeof project.home_selection_order === 'number'
              ? project.home_selection_order
              : typeof project.homeSelectionOrder === 'number'
                ? project.homeSelectionOrder
                : null,
        };
      });

      if (dbProjects.length > 0) {
        return NextResponse.json(dbProjects, {
          headers: {
            'Cache-Control': PROJECTS_RESPONSE_CACHE_CONTROL,
          },
        });
      }
    } catch (error) {
      console.error('[api/projects][GET] Database read failed. Falling back to file.', error);
    }
  }

  const fileProjects = await readProjectsFromFile();
  return NextResponse.json(fileProjects, {
    headers: {
      'Cache-Control': PROJECTS_RESPONSE_CACHE_CONTROL,
    },
  });
}

export async function POST(request: Request) {
  if (!isAdmin(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  let project: ProjectPayload;

  try {
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

  let dbWriteErrorSummary: string | null = null;

  if (HAS_DATABASE_CONFIG) {
    const pool = getPool();

    try {
      const [result] = await pool.execute(
        'INSERT INTO projects (title, cat, `desc`, tags, img, link, show_on_home, home_selection_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
          project.title,
          project.cat,
          project.desc,
          JSON.stringify(project.tags),
          project.img,
          project.link || null,
          project.showOnHome ? 1 : 0,
          project.showOnHome ? project.homeSelectionOrder ?? null : null,
        ]
      );

      const insertedId = (result as any).insertId;

      return NextResponse.json({
        success: true,
        project: { ...project, id: insertedId },
      });
    } catch (error) {
      dbWriteErrorSummary = getDatabaseErrorSummary(error);
      console.error('[api/projects][POST] Database write failed.', error);

      if (isUnknownColumnError(error)) {
        try {
          const [legacyResult] = await pool.execute(
            'INSERT INTO projects (title, cat, `desc`, tags, img, link) VALUES (?, ?, ?, ?, ?, ?)',
            [
              project.title,
              project.cat,
              project.desc,
              JSON.stringify(project.tags),
              project.img,
              project.link || null,
            ]
          );

          const insertedId = (legacyResult as any).insertId;

          return NextResponse.json({
            success: true,
            project: { ...project, id: insertedId, showOnHome: false, homeSelectionOrder: null },
          });
        } catch (legacyError) {
          dbWriteErrorSummary = getDatabaseErrorSummary(legacyError) || dbWriteErrorSummary;
          console.error('[api/projects][POST] Legacy database write failed.', legacyError);
        }
      }
    }
  }

  try {
    const existing = await readProjectsFromFile();
    const nextId = existing.length > 0 ? Math.max(...existing.map((item) => item.id)) + 1 : 1;
    const savedProject: ProjectWithId = { ...project, id: nextId };

    await writeProjectsToFile([savedProject, ...existing]);

    return NextResponse.json({ success: true, project: savedProject });
  } catch (error) {
    if (isReadOnlyFileWriteError(error)) {
      return NextResponse.json(
        { success: false, error: mutationUnavailableErrorMessage(dbWriteErrorSummary) },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to save project.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  if (!isAdmin(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  let project: ProjectWithId;

  try {
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

  let dbWriteErrorSummary: string | null = null;

  if (HAS_DATABASE_CONFIG) {
    const pool = getPool();

    try {
      await pool.execute(
        'UPDATE projects SET title = ?, cat = ?, `desc` = ?, tags = ?, img = ?, link = ?, show_on_home = ?, home_selection_order = ? WHERE id = ?',
        [
          project.title,
          project.cat,
          project.desc,
          JSON.stringify(project.tags),
          project.img,
          project.link || null,
          project.showOnHome ? 1 : 0,
          project.showOnHome ? project.homeSelectionOrder ?? null : null,
          project.id,
        ]
      );

      return NextResponse.json({ success: true, project });
    } catch (error) {
      dbWriteErrorSummary = getDatabaseErrorSummary(error);
      console.error('[api/projects][PUT] Database write failed.', error);

      if (isUnknownColumnError(error)) {
        try {
          await pool.execute(
            'UPDATE projects SET title = ?, cat = ?, `desc` = ?, tags = ?, img = ?, link = ? WHERE id = ?',
            [
              project.title,
              project.cat,
              project.desc,
              JSON.stringify(project.tags),
              project.img,
              project.link || null,
              project.id,
            ]
          );

          return NextResponse.json({ success: true, project });
        } catch (legacyError) {
          dbWriteErrorSummary = getDatabaseErrorSummary(legacyError) || dbWriteErrorSummary;
          console.error('[api/projects][PUT] Legacy database write failed.', legacyError);
        }
      }
    }
  }

  try {
    const existing = await readProjectsFromFile();
    const updated = existing.map((item) => (item.id === project.id ? project : item));

    await writeProjectsToFile(updated);

    return NextResponse.json({ success: true, project });
  } catch (error) {
    if (isReadOnlyFileWriteError(error)) {
      return NextResponse.json(
        { success: false, error: mutationUnavailableErrorMessage(dbWriteErrorSummary) },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update project.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  if (!isAdmin(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  let id: number;

  try {
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

  let dbWriteErrorSummary: string | null = null;

  if (HAS_DATABASE_CONFIG) {
    try {
      const pool = getPool();

      await pool.execute('DELETE FROM projects WHERE id = ?', [id]);

      return NextResponse.json({ success: true });
    } catch (error) {
      dbWriteErrorSummary = getDatabaseErrorSummary(error);
      console.error('[api/projects][DELETE] Database write failed.', error);
    }
  }

  try {
    const existing = await readProjectsFromFile();
    const filtered = existing.filter((item) => item.id !== id);

    await writeProjectsToFile(filtered);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (isReadOnlyFileWriteError(error)) {
      return NextResponse.json(
        { success: false, error: mutationUnavailableErrorMessage(dbWriteErrorSummary) },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to delete project.' },
      { status: 500 }
    );
  }
}
