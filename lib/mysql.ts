import mysql from 'mysql2/promise';

let pool: mysql.Pool | null = null;

type DatabaseConfig = {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
};

const DATABASE_URL_KEYS = [
  'DATABASE_URL',
  'MYSQL_URL',
  'DB_URL',
  'DATABASE_URI',
  'DATABASE_CONNECTION_STRING',
  'JAWSDB_URL',
  // Last-resort compatibility for misconfigured deployments.
  'NEXT_PUBLIC_DATABASE_URL',
];

const DB_HOST_KEYS = ['DB_HOST', 'MYSQL_HOST', 'DATABASE_HOST', 'DBHOST'];
const DB_PORT_KEYS = ['DB_PORT', 'MYSQL_PORT', 'DATABASE_PORT'];
const DB_USER_KEYS = [
  'DB_USER',
  'MYSQL_USER',
  'DATABASE_USER',
  'DB_USERNAME',
  'MYSQL_USERNAME',
];
const DB_PASSWORD_KEYS = ['DB_PASSWORD', 'MYSQL_PASSWORD', 'DATABASE_PASSWORD', 'DB_PASS', 'MYSQL_PASS'];
const DB_NAME_KEYS = ['DB_NAME', 'DB_DATABASE', 'MYSQL_DATABASE', 'DATABASE_NAME'];

function normalizeEnvValue(value: string) {
  const trimmed = value.trim();

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
}

function hasAnyEnv(keys: string[]) {
  return keys.some((key) => {
    const value = process.env[key];
    return typeof value === 'string' && normalizeEnvValue(value).length > 0;
  });
}

function readFirstEnv(keys: string[]) {
  for (const key of keys) {
    const value = process.env[key];
    if (typeof value === 'string') {
      const trimmed = normalizeEnvValue(value);
      if (trimmed.length > 0) {
        return trimmed;
      }
    }
  }

  return '';
}

function getDatabaseUrlFromEnv() {
  return readFirstEnv(DATABASE_URL_KEYS);
}

function getPortFromEnv() {
  const rawPort = readFirstEnv(DB_PORT_KEYS);
  if (!rawPort) {
    return 3306;
  }

  const parsedPort = Number(rawPort);
  if (!Number.isFinite(parsedPort) || parsedPort <= 0) {
    return 3306;
  }

  return parsedPort;
}

function getExplicitDatabaseConfigFromEnv(): DatabaseConfig | null {
  const host = readFirstEnv(DB_HOST_KEYS);
  const user = readFirstEnv(DB_USER_KEYS);
  const password = readFirstEnv(DB_PASSWORD_KEYS);
  const database = readFirstEnv(DB_NAME_KEYS);

  if (!host || !user || !database) {
    return null;
  }

  return {
    host,
    port: getPortFromEnv(),
    user,
    password,
    database,
  };
}

export function getDatabaseConfigDiagnostics() {
  const hasUrl = hasAnyEnv(DATABASE_URL_KEYS);
  const hasHost = hasAnyEnv(DB_HOST_KEYS);
  const hasUser = hasAnyEnv(DB_USER_KEYS);
  const hasPassword = hasAnyEnv(DB_PASSWORD_KEYS);
  const hasDatabase = hasAnyEnv(DB_NAME_KEYS);

  return {
    hasUrl,
    hasHost,
    hasUser,
    hasPassword,
    hasDatabase,
    hasConfig: hasUrl || (hasHost && hasUser && hasDatabase),
  };
}

export function hasDatabaseConfig() {
  return getDatabaseConfigDiagnostics().hasConfig;
}

function getDatabaseConfig() {
  const databaseUrl = getDatabaseUrlFromEnv();

  if (databaseUrl) {
    const parsed = new URL(databaseUrl);

    return {
      host: parsed.hostname,
      port: Number(parsed.port || 3306),
      user: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
      database: parsed.pathname.replace(/^\//, ''),
    };
  }

  const explicitConfig = getExplicitDatabaseConfigFromEnv();
  if (explicitConfig) {
    return explicitConfig;
  }

  throw new Error(
    'Database configuration is missing. Provide DATABASE_URL or DB_HOST/DB_USER/DB_PASSWORD/DB_NAME.'
  );
}

export function getPool() {
  if (pool) {
    return pool;
  }

  const config = getDatabaseConfig();

  pool = mysql.createPool({
    ...config,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  return pool;
}
