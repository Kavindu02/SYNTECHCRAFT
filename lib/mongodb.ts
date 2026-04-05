import { Db, MongoClient } from 'mongodb';

let clientPromise: Promise<MongoClient> | null = null;

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
    const client = new MongoClient(uri, {
      maxPoolSize: 10,
      minPoolSize: 1,
    });

    clientPromise = client.connect().catch(async (error) => {
      clientPromise = null;
      try {
        await client.close();
      } catch {
      }

      throw error;
    });
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
