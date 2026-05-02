import { Db, MongoClient } from 'mongodb';

let clientPromise: Promise<MongoClient> | null = null;
type MongoClientOptions = ConstructorParameters<typeof MongoClient>[1];

const MONGO_URI_KEYS = [
  'MONGODB_URI',
  'MONGODB_URL',
  'MONGO_URI',
  'MONGO_URL',
  'NEXT_PUBLIC_MONGODB_URI',
];

const MONGO_DB_NAME_KEYS = [
  'MONGODB_DB_NAME',
  'MONGODB_DATABASE',
  'MONGO_DB_NAME',
  'MONGO_DATABASE',
  'DATABASE_NAME',
  'DB_NAME',
];

const MONGO_PROJECTS_COLLECTION_KEYS = [
  'MONGODB_PROJECTS_COLLECTION',
  'MONGO_PROJECTS_COLLECTION',
];

const DEFAULT_MONGO_SERVER_SELECTION_TIMEOUT_MS = 10000;
const DEFAULT_MONGO_CONNECT_TIMEOUT_MS = 10000;
const DEFAULT_MONGO_CONNECT_MAX_ATTEMPTS = 5;
const DEFAULT_MONGO_CONNECT_RETRY_DELAY_MS = 1000;

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

function readFirstEnv(keys: string[]) {
  for (const key of keys) {
    const value = process.env[key];
    if (typeof value !== 'string') {
      continue;
    }

    const normalized = normalizeEnvValue(value);
    if (normalized.length > 0) {
      return normalized;
    }
  }

  return '';
}

function hasAnyEnv(keys: string[]) {
  return keys.some((key) => {
    const value = process.env[key];
    return typeof value === 'string' && normalizeEnvValue(value).length > 0;
  });
}

function getPositiveIntegerEnv(key: string, fallback: number) {
  const raw = process.env[key];

  if (typeof raw !== 'string') {
    return fallback;
  }

  const normalized = normalizeEnvValue(raw);
  const parsed = Number(normalized);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.floor(parsed);
}

function isTransientMongoConnectError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? '');
  const normalized = message.toUpperCase();

  return (
    normalized.includes('ENOTFOUND') ||
    normalized.includes('EAI_AGAIN') ||
    normalized.includes('ETIMEOUT') ||
    normalized.includes('ECONNRESET') ||
    normalized.includes('MONGOSERVERSELECTIONERROR')
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function connectMongoClientWithRetry(
  uri: string,
  options: MongoClientOptions,
  maxAttempts: number,
  retryDelayMs: number
) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const client = new MongoClient(uri, options);

    try {
      return await client.connect();
    } catch (error) {
      lastError = error;

      try {
        await client.close();
      } catch {
      }

      const canRetry = attempt < maxAttempts && isTransientMongoConnectError(error);

      if (!canRetry) {
        throw error;
      }

      await sleep(retryDelayMs * attempt);
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('Failed to connect to MongoDB.');
}

function isMongoUri(value: string) {
  return value.startsWith('mongodb://') || value.startsWith('mongodb+srv://');
}

function getMongoUriFromEnv() {
  const explicitUri = readFirstEnv(MONGO_URI_KEYS);
  if (explicitUri) {
    return explicitUri;
  }

  const databaseUrl = readFirstEnv(['DATABASE_URL']);
  if (databaseUrl && isMongoUri(databaseUrl)) {
    return databaseUrl;
  }

  return '';
}

function getDatabaseNameFromMongoUri(uri: string) {
  try {
    const parsed = new URL(uri);
    const pathname = parsed.pathname.replace(/^\/+/, '');

    if (!pathname) {
      return '';
    }

    return decodeURIComponent(pathname.split('/')[0] || '');
  } catch {
    return '';
  }
}

function getMongoDatabaseName(uri: string) {
  const explicitName = readFirstEnv(MONGO_DB_NAME_KEYS);
  if (explicitName) {
    return explicitName;
  }

  const nameFromUri = getDatabaseNameFromMongoUri(uri);
  if (nameFromUri) {
    return nameFromUri;
  }

  throw new Error(
    'MongoDB database name is missing. Set MONGODB_DB_NAME or include it in MONGODB_URI.'
  );
}

export function getMongoConfigDiagnostics() {
  const explicitUri = hasAnyEnv(MONGO_URI_KEYS);
  const databaseUrl = readFirstEnv(['DATABASE_URL']);
  const hasMongoDatabaseUrl = databaseUrl ? isMongoUri(databaseUrl) : false;
  const hasUri = explicitUri || hasMongoDatabaseUrl;

  return {
    hasUri,
    hasDatabaseName: hasAnyEnv(MONGO_DB_NAME_KEYS),
    hasConfig: hasUri,
  };
}

export function hasMongoConfig() {
  return getMongoConfigDiagnostics().hasConfig;
}

function getMongoUriOrThrow() {
  const uri = getMongoUriFromEnv();

  if (!uri) {
    throw new Error(
      'MongoDB configuration is missing. Set MONGODB_URI (or DATABASE_URL with mongodb:// scheme).'
    );
  }

  return uri;
}

async function getMongoClient() {
  if (!clientPromise) {
    const uri = getMongoUriOrThrow();

    const serverSelectionTimeoutMS = getPositiveIntegerEnv(
      'MONGODB_SERVER_SELECTION_TIMEOUT_MS',
      DEFAULT_MONGO_SERVER_SELECTION_TIMEOUT_MS
    );

    const connectTimeoutMS = getPositiveIntegerEnv(
      'MONGODB_CONNECT_TIMEOUT_MS',
      DEFAULT_MONGO_CONNECT_TIMEOUT_MS
    );

    const maxAttempts = getPositiveIntegerEnv(
      'MONGODB_CONNECT_MAX_ATTEMPTS',
      DEFAULT_MONGO_CONNECT_MAX_ATTEMPTS
    );

    const retryDelayMs = getPositiveIntegerEnv(
      'MONGODB_CONNECT_RETRY_DELAY_MS',
      DEFAULT_MONGO_CONNECT_RETRY_DELAY_MS
    );

    const options: MongoClientOptions = {
      maxPoolSize: 10,
      minPoolSize: 1,
      serverSelectionTimeoutMS,
      connectTimeoutMS,
    };

    clientPromise = connectMongoClientWithRetry(uri, options, maxAttempts, retryDelayMs).catch(
      async (error) => {
        clientPromise = null;
        if (isTransientMongoConnectError(error)) {
          console.warn('[mongodb] Connection failed after retries.', {
            maxAttempts,
            serverSelectionTimeoutMS,
            connectTimeoutMS,
          });
        }
        throw error;
      }
    );
  }

  return clientPromise;
}

export async function getMongoDb(): Promise<Db> {
  const uri = getMongoUriOrThrow();
  const dbName = getMongoDatabaseName(uri);
  const client = await getMongoClient();

  return client.db(dbName);
}

export function getProjectsCollectionName() {
  return readFirstEnv(MONGO_PROJECTS_COLLECTION_KEYS) || 'projects';
}
