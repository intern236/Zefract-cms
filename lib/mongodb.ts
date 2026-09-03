import { MongoClient, type Db } from 'mongodb'

/**
 * One MongoDB connection, shared.
 *
 * WHY THE GLOBAL. A `MongoClient` owns a connection pool, and creating one per request would
 * exhaust the server's connection limit under any real traffic — Atlas's shared tiers cap at a
 * few hundred. Worse in development: every hot reload re-evaluates this module, so without a
 * cache a long editing session leaks a pool per save until Atlas starts refusing connections.
 * Stashing the promise on `globalThis` survives module re-evaluation, which a module-scope
 * variable does not. This is the pattern Next's own MongoDB example uses, for the same reason.
 *
 * The promise, not the resolved client, is cached: two requests arriving before the first
 * connection settles then await the same attempt instead of racing to open two pools.
 *
 * NOT IMPORTED BY ANY COMPONENT. This is server-only — it reads a secret and opens a socket.
 * It is reached from the route handler in app/api/contact/route.ts and nowhere else. Importing
 * it into a client component would be a build error, which is the outcome we want.
 */

/** Fail loudly and early rather than at the first form submission. */
function connectionString(): string {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error(
      'MONGODB_URI is not set. Add it to .env.local for development and to the hosting ' +
        'environment for deploys. See the setup notes in .env.example.'
    )
  }
  return uri
}

/**
 * Database name comes from the environment too, defaulting to `zefract`.
 *
 * Separate from the URI on purpose: the same cluster usually holds a staging and a production
 * database, and switching between them should not mean editing a connection string that also
 * contains credentials.
 */
const DB_NAME = process.env.MONGODB_DB || 'zefract'

/** The collection this site writes contact submissions to. Exported so the route handler and
 *  any future admin view cannot disagree about the name. */
export const CONTACT_COLLECTION = 'contact_submissions'

/** Blog posts, written by the in-site admin at /admin/blog and read by /blog. */
export const BLOG_COLLECTION = 'blog_posts'

/**
 * Post authors, managed at /admin/authors and shown on /authors/[slug].
 *
 * A SEPARATE COLLECTION RATHER THAN A NAME ON EACH POST, which is the shortcut
 * this replaces. A string byline cannot carry a photograph, a bio or a profile
 * page, and it drifts the first time someone types "Ajit Kumar" one week and
 * "Ajit kumar" the next — at which point the site has two authors who are the
 * same person and no way to notice. Posts hold an `authorId`, so renaming an
 * author or replacing their photo is one edit that reaches every post they
 * wrote.
 */
export const AUTHORS_COLLECTION = 'authors'

/** Uploaded blog images. Stored in the database because the host has no persistent disk —
 *  a serverless function's filesystem does not survive the request. Served by
 *  app/api/blog-images/[id]/route.ts with immutable cache headers. */
export const BLOG_IMAGES_COLLECTION = 'blog_images'

/** Live two-factor challenges: one per password step that is waiting on a code.
 *  The code is stored hashed and the document expires via a TTL index — see
 *  lib/admin-auth.ts, which is the only thing that touches this. */
export const ADMIN_CHALLENGE_COLLECTION = 'admin_2fa_challenges'

/** Failed admin login attempts, one document per attempt, for rate limiting.
 *  A Mongo collection rather than an in-memory counter because each serverless
 *  invocation gets fresh memory — a counter that resets per request limits nothing.
 *  Documents expire via a TTL index that lib/admin-auth.ts ensures on first use. */
export const LOGIN_ATTEMPTS_COLLECTION = 'admin_login_attempts'

declare global {
  var _zefractMongo: Promise<MongoClient> | undefined
}

function clientPromise(): Promise<MongoClient> {
  if (!globalThis._zefractMongo) {
    globalThis._zefractMongo = new MongoClient(connectionString(), {
      // Fail a submission in a few seconds rather than leaving the visitor watching a spinner
      // if the cluster is unreachable or the IP is not allow-listed.
      serverSelectionTimeoutMS: 8000,
      // Atlas's free tier is happiest with a small pool, and this route is not hot.
      maxPoolSize: 10,
    }).connect()
  }
  return globalThis._zefractMongo
}

export async function getDb(): Promise<Db> {
  const client = await clientPromise()
  return client.db(DB_NAME)
}
