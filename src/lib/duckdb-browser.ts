import * as duckdb from '@duckdb/duckdb-wasm';
import duckdbMvpWasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url';
import duckdbEhWasm from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url';
import mvpWorker from '@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url';
import ehWorker from '@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url';
import { tableFromJSON, type Table } from 'apache-arrow';
import type { KernelRow } from './decision-intelligence-kernel';

export type DuckDbQueryResult = {
  columns: string[];
  rows: Array<Record<string, unknown>>;
  durationMs: number;
  engine: 'DuckDB-Wasm';
};

export type DuckDbSession = {
  db: duckdb.AsyncDuckDB;
  connection: duckdb.AsyncDuckDBConnection;
  close: () => Promise<void>;
};

const MANUAL_BUNDLES: duckdb.DuckDBBundles = {
  mvp: { mainModule: duckdbMvpWasm, mainWorker: mvpWorker },
  eh: { mainModule: duckdbEhWasm, mainWorker: ehWorker },
};

function safeName(name: string): string {
  return name.replace(/[^A-Za-z0-9_]/g, '_').replace(/^\d/, '_$&') || 'source_rows';
}

function arrowRows(table: Table<any>): Array<Record<string, unknown>> {
  const rows = table.toArray() as Array<Record<string, unknown>>;
  return rows.map((row) => {
    const output: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(row)) {
      output[key] = typeof value === 'bigint' ? Number(value) : value;
    }
    return output;
  });
}

export async function createDuckDbSession(): Promise<DuckDbSession> {
  if (typeof Worker === 'undefined') {
    throw new Error('DUCKDB_BROWSER_WORKER_UNAVAILABLE');
  }

  const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);
  if (!bundle.mainModule || !bundle.mainWorker) {
    throw new Error('DUCKDB_BROWSER_BUNDLE_UNAVAILABLE');
  }

  const worker = new Worker(bundle.mainWorker);
  const db = new duckdb.AsyncDuckDB(new duckdb.ConsoleLogger(), worker);

  try {
    await db.instantiate(bundle.mainModule, bundle.pthreadWorker ?? undefined);
    const connection = await db.connect();
    return {
      db,
      connection,
      close: async () => {
        await connection.close();
        await db.terminate();
      },
    };
  } catch (error) {
    await db.terminate().catch(() => undefined);
    worker.terminate();
    throw error;
  }
}

export async function registerArrowRows(
  connection: duckdb.AsyncDuckDBConnection,
  tableName: string,
  rows: KernelRow[],
): Promise<string> {
  const name = safeName(tableName);
  const arrowTable = tableFromJSON(rows) as Table<any>;
  await connection.insertArrowTable(arrowTable, { name, create: true, overwrite: true });
  return name;
}

export async function queryArrowRows(
  connection: duckdb.AsyncDuckDBConnection,
  sql: string,
): Promise<DuckDbQueryResult> {
  const started = performance.now();
  const result = await connection.query(sql);
  const rows = arrowRows(result);
  return {
    columns: result.schema.fields.map((field) => field.name),
    rows,
    durationMs: Math.round((performance.now() - started) * 100) / 100,
    engine: 'DuckDB-Wasm',
  };
}

export async function analyzeRowsWithDuckDb(
  rows: KernelRow[],
  options: { tableName?: string; query?: string } = {},
): Promise<DuckDbQueryResult> {
  const session = await createDuckDbSession();
  try {
    const tableName = await registerArrowRows(session.connection, options.tableName ?? 'source_rows', rows);
    const query = options.query ?? [
      'SELECT COUNT(*) AS row_count,',
      '       COUNT(DISTINCT *) AS distinct_row_count',
      'FROM ' + tableName,
    ].join(' ');
    return await queryArrowRows(session.connection, query);
  } finally {
    await session.close();
  }
}
