import { readFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { describe, expect, it } from "vitest";

const __dirname = dirname(fileURLToPath(import.meta.url));
const serverRoot = resolve(__dirname, "..");

describe("deployment shim", () => {
  it("routes Vercel traffic to the hardened src server", () => {
    const vercelConfig = JSON.parse(
      readFileSync(resolve(serverRoot, "vercel.json"), "utf8")
    );

    const builds = Array.isArray(vercelConfig.builds) ? vercelConfig.builds : [];
    const routes = Array.isArray(vercelConfig.routes) ? vercelConfig.routes : [];

    expect(
      builds.some((build: any) => build?.src === "src/index.ts")
    ).toBe(true);
    expect(
      routes.some((route: any) => route?.dest === "src/index.ts")
    ).toBe(true);
  });

  it("keeps api/index.ts as a thin shim", () => {
    const shim = readFileSync(resolve(serverRoot, "api/index.ts"), "utf8");

    expect(shim).toMatch(/createServer/);
    expect(shim).toMatch(/src\/server/);
  });
});
