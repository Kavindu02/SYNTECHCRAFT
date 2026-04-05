import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getPool, hasDatabaseConfig, getDatabaseConfigDiagnostics } from '@/lib/mysql';

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

type DatabaseProjectRow = {
  id: number;
  title: string;
  cat: string;
  desc: string;
  tags: unknown;
  img: string;
  link: string | null;
  show_on_home?: number | boolean | null;
  showOnHome?: number | boolean | null;
  home_selection_order?: number | null;
  homeSelectionOrder?: number | null;
};

type DatabaseErrorLike = {
  code?: unknown;
  message?: unknown;
  sqlMessage?: unknown;
};

const PROJECTS_RESPONSE_CACHE_CONTROL = 'public, s-maxage=60, stale-while-revalidate=300';
const DB_PROJECTS_QUERY_TIMEOUT_MS = Number(process.env.DB_PROJECTS_QUERY_TIMEOUT_MS || 2000);
const HAS_DATABASE_CONFIG = hasDatabaseConfig();
const DATABASE_CONFIG_DIAGNOSTICS = getDatabaseConfigDiagnostics();

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

function databaseUnavailableErrorMessage() {
  return `Project API requires MySQL configuration. Set DATABASE_URL or DB_HOST/DB_USER/DB_PASSWORD/DB_NAME. Detected env -> URL:${DATABASE_CONFIG_DIAGNOSTICS.hasUrl}, HOST:${DATABASE_CONFIG_DIAGNOSTICS.hasHost}, USER:${DATABASE_CONFIG_DIAGNOSTICS.hasUser}, PASSWORD:${DATABASE_CONFIG_DIAGNOSTICS.hasPassword}, DB:${DATABASE_CONFIG_DIAGNOSTICS.hasDatabase}.`;
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

function mapDatabaseProject(row: DatabaseProjectRow, fallbackHomeFields = false): ProjectWithId {
  const rawShowOnHome = row.show_on_home ?? row.showOnHome;

  return {
    id: row.id,
    title: row.title,
    cat: row.cat,
    desc: row.desc,
    tags: normalizeTags(row.tags),
    img: row.img,
    link: row.link ?? '',
    showOnHome: fallbackHomeFields ? false : rawShowOnHome === true || rawShowOnHome === 1,
    homeSelectionOrder: fallbackHomeFields
      ? null
      : typeof row.home_selection_order === 'number'
        ? row.home_selection_order
        : typeof row.homeSelectionOrder === 'number'
          ? row.homeSelectionOrder
          : null,
  };
}

async function readProjectsFromDatabase(): Promise<ProjectWithId[]> {
  const pool = getPool();

  try {
    const [rows] = await pool.query({
      sql: 'SELECT id, title, cat, `desc`, tags, img, link, show_on_home, home_selection_order FROM projects ORDER BY id DESC',
      timeout: DB_PROJECTS_QUERY_TIMEOUT_MS,
    });

    return (rows as DatabaseProjectRow[]).map((project) => mapDatabaseProject(project));
  } catch (error) {
    if (!isUnknownColumnError(error)) {
      throw error;
    }

    const [legacyRows] = await pool.query({
      sql: 'SELECT id, title, cat, `desc`, tags, img, link FROM projects ORDER BY id DESC',
      timeout: DB_PROJECTS_QUERY_TIMEOUT_MS,
    });

    return (legacyRows as DatabaseProjectRow[]).map((project) => mapDatabaseProject(project, true));
  }
}

export async function GET() {
  if (!HAS_DATABASE_CONFIG) {
    return NextResponse.json(
      { success: false, error: databaseUnavailableErrorMessage() },
      { status: 503 }
    );
  }

  try {
    const projects = await readProjectsFromDatabase();

    return NextResponse.json(projects, {
      headers: {
        'Cache-Control': PROJECTS_RESPONSE_CACHE_CONTROL,
      },
    });
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

  if (!HAS_DATABASE_CONFIG) {
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

    const insertedId = (result as { insertId: number }).insertId;

    return NextResponse.json({
      success: true,
      project: { ...project, id: insertedId },
    });
  } catch (error) {
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

        const insertedId = (legacyResult as { insertId: number }).insertId;

        return NextResponse.json({
          success: true,
          project: { ...project, id: insertedId, showOnHome: false, homeSelectionOrder: null },
        });
      } catch (legacyError) {
        console.error('[api/projects][POST] Legacy database write failed.', legacyError);
        const summary = getDatabaseErrorSummary(legacyError) || getDatabaseErrorSummary(error);

        return NextResponse.json(
          {
            success: false,
            error: summary ? `Failed to save project. ${summary}` : 'Failed to save project.',
          },
          { status: 500 }
        );
      }
    }

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

  if (!HAS_DATABASE_CONFIG) {
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
        console.error('[api/projects][PUT] Legacy database write failed.', legacyError);
        const summary = getDatabaseErrorSummary(legacyError) || getDatabaseErrorSummary(error);

        return NextResponse.json(
          {
            success: false,
            error: summary ? `Failed to update project. ${summary}` : 'Failed to update project.',
          },
          { status: 500 }
        );
      }
    }

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

  if (!HAS_DATABASE_CONFIG) {
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
    const pool = getPool();
    await pool.execute('DELETE FROM projects WHERE id = ?', [id]);

    return NextResponse.json({ success: true });
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
