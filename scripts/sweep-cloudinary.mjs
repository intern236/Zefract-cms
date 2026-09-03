/**
 * Deletes Cloudinary assets that no post references.
 *
 * Usage:
 *   node scripts/sweep-cloudinary.mjs          list what would go, delete nothing
 *   node scripts/sweep-cloudinary.mjs --delete actually delete it
 *
 * WHY THIS EXISTS. A cover can be uploaded before the post is saved — the
 * editor has no post id until then — so someone who picks an image and closes
 * the tab leaves an asset nothing points at. Replacing an image or removing one
 * normally cleans up after itself, but a failed delete, a browser that died
 * mid-edit, or an image deleted straight out of the Cloudinary console all
 * leave the same residue.
 *
 * DERIVED FROM THE POSTS, NOT FROM A LEDGER. There is no table of "uploads we
 * meant to keep": the script asks Cloudinary what exists, asks MongoDB what is
 * referenced, and deletes the difference. A second list would be a second
 * source of truth, and the first thing it would do is disagree — the same
 * reasoning as getUsedCategories in lib/blog.ts.
 *
 * THE AGE GUARD IS LOAD-BEARING. An upload that finished thirty seconds ago is
 * legitimately unreferenced: the writer has not saved yet. Anything younger
 * than MIN_AGE_HOURS is left alone, so a sweep run mid-edit cannot delete the
 * image someone is looking at.
 *
 * DRY BY DEFAULT. It prints and exits; deleting takes --delete. A cleanup that
 * removes things the first time you run it to see what it does is a cleanup
 * nobody runs twice.
 */
/* @next/env is CommonJS, so its exports arrive on the default import rather
   than as named ones — the same reason scripts elsewhere here use createRequire
   for driver packages. */
import nextEnv from '@next/env'
import { v2 as cloudinary } from 'cloudinary'
import { MongoClient } from 'mongodb'

const { loadEnvConfig } = nextEnv

const MIN_AGE_HOURS = 24
const ROOT = 'admin-panel/posts'

const apply = process.argv.includes('--delete')

loadEnvConfig(process.cwd(), true, { info: () => {}, error: console.error })

const { NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, MONGODB_URI } =
  process.env

if (!NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.error('Cloudinary is not configured. See .env.example.')
  process.exit(1)
}
if (!MONGODB_URI) {
  console.error('MONGODB_URI is not set, so there is no way to know what is referenced.')
  process.exit(1)
}

cloudinary.config({
  cloud_name: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true,
})

/** Every asset under our root, paged — the API caps a response at 500. */
async function allAssets() {
  const found = []
  let cursor
  do {
    const page = await cloudinary.api.resources({
      type: 'upload',
      prefix: ROOT,
      max_results: 500,
      ...(cursor ? { next_cursor: cursor } : {}),
    })
    found.push(...page.resources)
    cursor = page.next_cursor
  } while (cursor)
  return found
}

/** Every public id any post points at: its cover, and anything in its HTML. */
async function referencedIds() {
  const client = await new MongoClient(MONGODB_URI).connect()
  try {
    const db = client.db(process.env.MONGODB_DB || 'zefract')
    const posts = await db
      .collection('blog_posts')
      .find({}, { projection: { coverImage: 1, contentHtml: 1 } })
      .toArray()

    const ids = new Set()
    for (const post of posts) {
      if (post.coverImage?.publicId) ids.add(post.coverImage.publicId)
      const html = typeof post.contentHtml === 'string' ? post.contentHtml : ''
      for (const match of html.matchAll(/\/image\/upload\/[^"]*?([^/"]+)"/g)) {
        /* The id is the last path segment before the quote, minus any
           extension. Transformation and version segments sit in front of it. */
        ids.add(match[1].replace(/\.[a-z0-9]+$/i, ''))
      }
      /* Ids include their folder, so also record the full path form. */
      for (const match of html.matchAll(/\/image\/upload\/(?:[^"]*?\/)?(admin-panel\/[^."]+)/g)) {
        ids.add(match[1])
      }
    }
    return ids
  } finally {
    await client.close()
  }
}

const [assets, referenced] = await Promise.all([allAssets(), referencedIds()])
const cutoff = Date.now() - MIN_AGE_HOURS * 60 * 60 * 1000

const orphans = assets.filter((asset) => {
  if (referenced.has(asset.public_id)) return false
  /* Also match on the bare filename, since an id read out of stored HTML may
     have lost its folder prefix depending on how the URL was written. */
  const bare = asset.public_id.split('/').pop()
  if (bare && referenced.has(bare)) return false
  return new Date(asset.created_at).getTime() < cutoff
})

console.log(`\n  ${assets.length} assets under ${ROOT}`)
console.log(`  ${referenced.size} referenced by a post`)
console.log(`  ${orphans.length} unreferenced and older than ${MIN_AGE_HOURS}h\n`)

if (orphans.length === 0) {
  console.log('  Nothing to remove.\n')
  process.exit(0)
}

for (const asset of orphans) {
  const kb = Math.round(asset.bytes / 1024)
  console.log(`    ${asset.public_id}  ${kb}KB  uploaded ${asset.created_at}`)
}

if (!apply) {
  console.log(`\n  Dry run. Re-run with --delete to remove these ${orphans.length}.\n`)
  process.exit(0)
}

let removed = 0
for (const asset of orphans) {
  const result = await cloudinary.uploader.destroy(asset.public_id, { invalidate: true })
  if (result.result === 'ok' || result.result === 'not found') removed++
  else console.error(`    failed: ${asset.public_id} (${result.result})`)
}
console.log(`\n  Deleted ${removed} of ${orphans.length}.\n`)
