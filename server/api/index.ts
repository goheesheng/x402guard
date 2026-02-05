import type { Express } from "express";
import { createServer } from "../src/server.js";

// Vercel entrypoint shim.
// Keep runtime behavior aligned with the hardened src/* server implementation.
const app: Express = createServer();

export default app;
