import { spawnSync } from 'node:child_process'

const apiOrigin = process.env.VITE_API_ORIGIN

if (!apiOrigin) throw new Error('VITE_API_ORIGIN must be set in .env')

const result = spawnSync(
  'npx',
  ['openapi-typescript', `${apiOrigin}/openapi.json`, '-o', 'src/types/api.d.ts'],
  { stdio: 'inherit', shell: true },
)

process.exit(result.status ?? 1)
