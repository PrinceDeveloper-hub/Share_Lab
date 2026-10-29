#!/usr/bin/env node
/**
 * ShareLab smoke check.
 *
 * Runs the checks that do not need a browser:
 *   1. Backend PHPUnit suite (requires MariaDB `sharelab_test`)
 *   2. Frontend TypeScript check
 *   3. Frontend ESLint
 *   4. Frontend production build
 *
 * The API and dev server must be started separately (`composer dev`,
 * `pnpm dev`); this script only validates the code and the test suite.
 */
import { spawnSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const frontend = resolve(here, '..')
const backend = resolve(frontend, '..', 'sharelab-api', 'backend')

const steps = [
  { name: 'backend tests', cwd: backend, cmd: 'php', args: ['artisan', 'test'] },
  { name: 'typescript', cwd: frontend, cmd: 'pnpm', args: ['tsc', '--noEmit'], shell: true },
  { name: 'eslint', cwd: frontend, cmd: 'pnpm', args: ['lint'], shell: true },
  { name: 'production build', cwd: frontend, cmd: 'pnpm', args: ['build'], shell: true },
]

const results = []

for (const step of steps) {
  process.stdout.write(`\n▶ ${step.name}\n`)
  const run = spawnSync(step.cmd, step.args, {
    cwd: step.cwd,
    stdio: 'inherit',
    shell: Boolean(step.shell),
  })
  const ok = run.status === 0
  results.push({ name: step.name, ok })
}

const failed = results.filter((result) => !result.ok)

console.log('\n──────── smoke summary ────────')
for (const result of results) {
  console.log(`${result.ok ? 'PASS' : 'FAIL'}  ${result.name}`)
}
console.log('───────────────────────────────')

if (failed.length > 0) {
  console.log(`RESULT: FAIL (${failed.length} of ${results.length} stages failed)`)
  process.exit(1)
}

console.log(`RESULT: PASS (${results.length} of ${results.length} stages passed)`)
