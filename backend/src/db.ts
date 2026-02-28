import { Database } from 'bun:sqlite'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { getEnv } from './config'

export type ProjectRow = {
  id: number
  name: string | null
  tagline: string | null
  logo_url: string | null
  website_url: string | null
  symbol: string | null
  category: string | null
  token_address: string | null
  escrow_address: string | null
  controller_address: string | null
  creator: string | null
  funding_goal: string | null
  total_raised: string | null
  deadline: number | null
  status: string | null
  created_at: number
  updated_at: number
}

export type MilestoneRow = {
  id: number
  project_id: number
  milestone_index: number
  description: string
  unlock_amount: string
  verified: number
  released: number
  created_at: number
  updated_at: number
}

export type ContributionAggRow = {
  contributor: string
  amount: string
}

type ContributionRow = {
  contributor: string
  amount: string
}

let dbSingleton: Database | null = null

export function getDb(): Database {
  if (dbSingleton) return dbSingleton
  const env = getEnv()

  const dbPath = env.DATABASE_URL.startsWith('file:')
    ? env.DATABASE_URL.slice('file:'.length)
    : env.DATABASE_URL

  if (dbPath !== ':memory:') {
    const dir = dirname(dbPath)
    if (dir && dir !== '.' && dir !== '/') {
      mkdirSync(dir, { recursive: true })
    }
  }

  const db = new Database(dbPath)
  db.exec('PRAGMA journal_mode = WAL;')
  db.exec('PRAGMA foreign_keys = ON;')
  migrate(db)
  dbSingleton = db
  return db
}

function migrate(db: Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY,
      name TEXT,
      token_address TEXT,
      escrow_address TEXT,
      controller_address TEXT,
      creator TEXT,
      funding_goal TEXT,
      total_raised TEXT,
      deadline INTEGER,
      status TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS milestones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      milestone_index INTEGER NOT NULL,
      description TEXT NOT NULL,
      unlock_amount TEXT NOT NULL,
      verified INTEGER NOT NULL DEFAULT 0,
      released INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      UNIQUE(project_id, milestone_index),
      FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS contributions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      contributor TEXT NOT NULL,
      amount TEXT NOT NULL,
      tx_hash TEXT,
      created_at INTEGER NOT NULL,
      FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sync_state (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `)

  // Migration: add columns if they don't exist (for existing DBs)
  try { db.exec('ALTER TABLE projects ADD COLUMN name TEXT') } catch {}
  try { db.exec('ALTER TABLE projects ADD COLUMN controller_address TEXT') } catch {}
  try { db.exec('ALTER TABLE projects ADD COLUMN tagline TEXT') } catch {}
  try { db.exec('ALTER TABLE projects ADD COLUMN logo_url TEXT') } catch {}
  try { db.exec('ALTER TABLE projects ADD COLUMN website_url TEXT') } catch {}
  try { db.exec('ALTER TABLE projects ADD COLUMN symbol TEXT') } catch {}
  try { db.exec('ALTER TABLE projects ADD COLUMN category TEXT') } catch {}
}

export function nowUnix(): number {
  return Math.floor(Date.now() / 1000)
}

export function upsertProject(input: Omit<ProjectRow, 'created_at' | 'updated_at'>) {
  const db = getDb()
  const ts = nowUnix()
  db.prepare(
    `INSERT INTO projects (
        id, name, token_address, escrow_address, controller_address, creator, funding_goal, total_raised, deadline, status, created_at, updated_at
      ) VALUES (
        $id, $name, $token_address, $escrow_address, $controller_address, $creator, $funding_goal, $total_raised, $deadline, $status, $created_at, $updated_at
      )
      ON CONFLICT(id) DO UPDATE SET
        token_address=COALESCE(excluded.token_address, projects.token_address),
        escrow_address=COALESCE(excluded.escrow_address, projects.escrow_address),
        controller_address=COALESCE(excluded.controller_address, projects.controller_address),
        creator=CASE WHEN excluded.creator IS NOT NULL AND excluded.creator != '0x0000000000000000000000000000000000000000' THEN excluded.creator ELSE projects.creator END,
        name=COALESCE(excluded.name, projects.name),
        funding_goal=COALESCE(excluded.funding_goal, projects.funding_goal),
        total_raised=COALESCE(excluded.total_raised, projects.total_raised),
        deadline=COALESCE(excluded.deadline, projects.deadline),
        status=COALESCE(excluded.status, projects.status),
        updated_at=excluded.updated_at
    `,
  ).run({
    $id: input.id,
    $name: input.name ?? null,
    $token_address: input.token_address,
    $escrow_address: input.escrow_address,
    $controller_address: input.controller_address ?? null,
    $creator: input.creator,
    $funding_goal: input.funding_goal,
    $total_raised: input.total_raised,
    $deadline: input.deadline,
    $status: input.status,
    $created_at: ts,
    $updated_at: ts,
  })
}

/** Update project metadata from frontend after deployment */
export function updateProjectMeta(projectId: number, meta: {
  name?: string; creator?: string; tagline?: string;
  logo_url?: string; website_url?: string; symbol?: string; category?: string;
}) {
  const db = getDb()
  const ts = nowUnix()
  const sets: string[] = ['updated_at = $updated_at']
  const params: any = { $id: projectId, $updated_at: ts }

  const fields: (keyof typeof meta)[] = ['name', 'creator', 'tagline', 'logo_url', 'website_url', 'symbol', 'category']
  for (const field of fields) {
    if (meta[field]) {
      sets.push(`${field} = $${field}`)
      params[`$${field}`] = meta[field]
    }
  }

  db.prepare(`UPDATE projects SET ${sets.join(', ')} WHERE id = $id`).run(params)
}

export function listProjects(): ProjectRow[] {
  const db = getDb()
  return db
    .prepare(
      `SELECT id, name, tagline, logo_url, website_url, symbol, category, token_address, escrow_address, controller_address, creator, funding_goal, total_raised, deadline, status, created_at, updated_at
       FROM projects
       ORDER BY id DESC`,
    )
    .all() as ProjectRow[]
}

export function getProject(projectId: number): ProjectRow | null {
  const db = getDb()
  return (
    db
      .prepare(
        `SELECT id, name, tagline, logo_url, website_url, symbol, category, token_address, escrow_address, controller_address, creator, funding_goal, total_raised, deadline, status, created_at, updated_at
         FROM projects
         WHERE id = ?`,
      )
      .get(projectId) as ProjectRow | null
  )
}

export function listMilestones(projectId: number): MilestoneRow[] {
  const db = getDb()
  return db
    .prepare(
      `SELECT id, project_id, milestone_index, description, unlock_amount, verified, released, created_at, updated_at
       FROM milestones
       WHERE project_id = ?
       ORDER BY milestone_index ASC`,
    )
    .all(projectId) as MilestoneRow[]
}

export function upsertMilestone(params: {
  project_id: number
  milestone_index: number
  description: string
  unlock_amount: string
  verified?: number
  released?: number
}) {
  const db = getDb()
  const ts = nowUnix()
  db.prepare(
    `INSERT INTO milestones (
        project_id, milestone_index, description, unlock_amount, verified, released, created_at, updated_at
      ) VALUES (
        $project_id, $milestone_index, $description, $unlock_amount,
        COALESCE($verified, 0), COALESCE($released, 0), $created_at, $updated_at
      )
      ON CONFLICT(project_id, milestone_index) DO UPDATE SET
        description=excluded.description,
        unlock_amount=excluded.unlock_amount,
        verified=COALESCE($verified, milestones.verified),
        released=COALESCE($released, milestones.released),
        updated_at=excluded.updated_at
    `,
  ).run({
    $project_id: params.project_id,
    $milestone_index: params.milestone_index,
    $description: params.description,
    $unlock_amount: params.unlock_amount,
    $verified: params.verified ?? null,
    $released: params.released ?? null,
    $created_at: ts,
    $updated_at: ts,
  })
}

export function addContribution(params: {
  project_id: number
  contributor: string
  amount: string
  tx_hash?: string | null
}) {
  const db = getDb()
  const ts = nowUnix()

  db.prepare(
    `INSERT INTO contributions (project_id, contributor, amount, tx_hash, created_at)
     VALUES ($project_id, $contributor, $amount, $tx_hash, $created_at)`,
  ).run({
    $project_id: params.project_id,
    $contributor: params.contributor,
    $amount: params.amount,
    $tx_hash: params.tx_hash ?? null,
    $created_at: ts,
  })

  // Keep projects.total_raised in sync (stored as wei string).
  const rows = db
    .prepare('SELECT contributor, amount FROM contributions WHERE project_id = ?')
    .all(params.project_id) as ContributionRow[]

  let total = 0n
  for (const row of rows) {
    try {
      total += BigInt(row.amount)
    } catch {
      // ignore malformed rows
    }
  }

  db.prepare('UPDATE projects SET total_raised = ?, updated_at = ? WHERE id = ?').run(
    total.toString(),
    ts,
    params.project_id,
  )
}

export function listContributors(projectId: number): ContributionAggRow[] {
  const db = getDb()

  const rows = db
    .prepare('SELECT contributor, amount FROM contributions WHERE project_id = ?')
    .all(projectId) as ContributionRow[]

  const sums = new Map<string, bigint>()
  for (const row of rows) {
    const who = (row.contributor || '').toLowerCase()
    if (!who) continue
    try {
      const amountWei = BigInt(row.amount)
      sums.set(who, (sums.get(who) ?? 0n) + amountWei)
    } catch {
      // ignore malformed rows
    }
  }

  return [...sums.entries()]
    .sort((a, b) => (a[1] === b[1] ? 0 : a[1] > b[1] ? -1 : 1))
    .map(([contributor, amount]) => ({ contributor, amount: amount.toString() }))
}

export function getSyncState(key: string): string | null {
  const db = getDb()
  const row = db.prepare('SELECT value FROM sync_state WHERE key = ?').get(key) as
    | { value: string }
    | undefined
  return row?.value ?? null
}

export function setSyncState(key: string, value: string) {
  const db = getDb()
  db.prepare(
    `INSERT INTO sync_state(key, value) VALUES(?, ?)
     ON CONFLICT(key) DO UPDATE SET value=excluded.value`,
  ).run(key, value)
}
