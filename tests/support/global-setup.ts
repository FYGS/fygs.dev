/**
 * Vitest globalSetup for the integration suite.
 *
 * - launched through `pnpm test:integration` (scripts/test-db.mjs run): the
 *   database already exists, TEST_DB_PROVIDED=1 and TEST_DATABASE_URL is used;
 * - launched directly (`vitest --config vitest.integration.config.ts`, watch
 *   mode, IDE): an embedded PostgreSQL is started here and removed afterwards.
 *
 * DATABASE_URL from the shell or `.env` is deliberately ignored, so the suite
 * can never run against the remote development database.
 */
import { assertDisposableDatabase, startTestDb } from "../../scripts/test-db.mjs";

export default async function setup() {
  let stop = async () => {};

  if (process.env.TEST_DB_PROVIDED === "1" && process.env.TEST_DATABASE_URL) {
    assertDisposableDatabase(process.env.TEST_DATABASE_URL);
    process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
  } else {
    const db = await startTestDb();
    process.env.DATABASE_URL = db.url;
    stop = db.stop;
  }

  return async () => {
    await stop();
  };
}
