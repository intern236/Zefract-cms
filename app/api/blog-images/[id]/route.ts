import { Binary, ObjectId } from 'mongodb'
import { getDb, BLOG_IMAGES_COLLECTION } from '@/lib/mongodb'

/**
 * Serves an uploaded blog image out of MongoDB.
 *
 * Public on purpose — these are the images inside published posts, fetched by
 * every visitor's browser. The lookup is by ObjectId and nothing else, so there
 * is no filename, no path and no traversal surface: an id either parses and
 * exists or the response is a 404.
 *
 * `immutable` IS SAFE HERE and is what makes DB-served images cheap: an id is
 * minted once per upload and its bytes never change — replacing an image in a
 * post means uploading again and getting a new id. So browsers and the CDN may
 * cache for a year without ever revalidating, and Mongo is only asked once per
 * cache, not once per view.
 *
 * `nosniff` pins the browser to the stored Content-Type, which the upload route
 * derived from the file's own magic bytes — the pair is what stops anything
 * non-image ever being interpreted as something else.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  let objectId: ObjectId
  try {
    objectId = new ObjectId(id)
  } catch {
    return new Response('Not found', { status: 404 })
  }

  try {
    const db = await getDb()
    const doc = await db.collection(BLOG_IMAGES_COLLECTION).findOne({ _id: objectId })
    if (!doc || !(doc.data instanceof Binary)) {
      return new Response('Not found', { status: 404 })
    }

    return new Response(Buffer.from(doc.data.buffer), {
      headers: {
        'Content-Type': String(doc.contentType || 'application/octet-stream'),
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (error) {
    console.error('[blog] failed to serve image %s', id, error)
    return new Response('Unavailable', { status: 503 })
  }
}
