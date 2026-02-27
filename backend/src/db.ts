import { Database } from 'bun:sqlite'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { getEnv } from './config'

export type ProjectRow = {
  id: number
  token_address: string | null
  escrow_address: string | null
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
      token_address TEXT,
      escrow_address TEXT,
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
}

export function nowUnix(): number {
  return Math.floor(Date.now() / 1000)
}

export function upsertProject(input: Omit<ProjectRow, 'created_at' | 'updated_at'>) {
  const db = getDb()
  const ts = nowUnix()
  db.prepare(
    `INSERT INTO projects (
        id, token_address, escrow_address, creator, funding_goal, total_raised, deadline, status, created_at, updated_at
      ) VALUES (
        $id, $token_address, $escrow_address, $creator, $funding_goal, $total_raised, $deadline, $status, $created_at, $updated_at
      )
      ON CONFLICT(id) DO UPDATE SET
        token_address=excluded.token_address,
        escrow_address=excluded.escrow_address,
        creator=excluded.creator,
        funding_goal=excluded.funding_goal,
        total_raised=excluded.total_raised,
        deadline=excluded.deadline,
        status=excluded.status,
        updated_at=excluded.updated_at
    `,
  ).run({
    ...input,
    created_at: ts,
    updated_at: ts,
  })
}

export function listProjects(): ProjectRow[] {
  const db = getDb()
  return db
    .prepare(
      `SELECT id, token_address, escrow_address, creator, funding_goal, total_raised, deadline, status, created_at, updated_at
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
        `SELECT id, token_address, escrow_address, creator, funding_goal, total_raised, deadline, status, created_at, updated_at
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
    ...params,
    created_at: ts,
    updated_at: ts,
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
    ...params,
    tx_hash: params.tx_hash ?? null,
    created_at: ts,
  })
}

export function listContributors(projectId: number): ContributionAggRow[] {
  const db = getDb()
  return db
    .prepare(
      `SELECT contributor, CAST(SUM(CAST(amount AS REAL)) AS TEXT) AS amount
       FROM contributions
       WHERE project_id = ?
       GROUP BY contributor
       ORDER BY CAST(amount AS REAL) DESC`,
    )
    .all(projectId) as ContributionAggRow[]
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
