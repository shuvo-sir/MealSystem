import test from "node:test";
import assert from "node:assert/strict";

import { startServer } from "../src/server.js";

test("startServer rejects when the required environment is missing", async () => {
  const previousClerk = process.env.CLERK_SECRET_KEY;
  const previousMongo = process.env.MONGO_URI;

  try {
    process.env.CLERK_SECRET_KEY = "test-secret";
    delete process.env.MONGO_URI;

    await assert.rejects(startServer, /MONGO_URI|MongoDB/i);
  } finally {
    if (previousClerk === undefined) {
      delete process.env.CLERK_SECRET_KEY;
    } else {
      process.env.CLERK_SECRET_KEY = previousClerk;
    }

    if (previousMongo === undefined) {
      delete process.env.MONGO_URI;
    } else {
      process.env.MONGO_URI = previousMongo;
    }
  }
});
