import mysql from 'mysql2/promise';

let pool: mysql.Pool | null = null;

type DatabaseConfig = {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
};

function readFirstEnv(keys: string[]) {
  for (const key of keys) {
    const value = process.env[key];
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed.length > 0) {
        return trimmed;
      }
    }
  }

  return '';
}

function getDatabaseUrlFromEnv() {
  return readFirstEnv(['DATABASE_URL', 'MYSQL_URL', 'DB_URL']);
}

function getPortFromEnv() {
  const rawPort = readFirstEnv(['DB_PORT', 'MYSQL_PORT']);
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
  const host = readFirstEnv(['DB_HOST', 'MYSQL_HOST']);
  const user = readFirstEnv(['DB_USER', 'MYSQL_USER']);
  const password = readFirstEnv(['DB_PASSWORD', 'MYSQL_PASSWORD']);
  const database = readFirstEnv(['DB_NAME', 'DB_DATABASE', 'MYSQL_DATABASE']);

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

export function hasDatabaseConfig() {
  if (getDatabaseUrlFromEnv()) {
    return true;
  }

  return getExplicitDatabaseConfigFromEnv() !== null;
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
