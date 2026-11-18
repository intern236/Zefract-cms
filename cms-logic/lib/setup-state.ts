import 'server-only'
import { sys } from '@cms-logic/lib/db'

export async function userCount(): Promise<number> {
  return (await sys()).users.count()
}
