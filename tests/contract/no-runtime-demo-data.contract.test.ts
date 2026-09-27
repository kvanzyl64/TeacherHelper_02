import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const routeRoot = join(process.cwd(), "apps", "web", "app");
const forbidden =
  /(?:^|["'])((?:demo|sample)[A-Za-z0-9_-]*|(?:create)?inMemory[A-Za-z0-9_-]*)|from\s+["'][^"']*in-memory[^"']*["']/i;

function routeModules(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return routeModules(path);
    return /\.(?:ts|tsx)$/.test(entry.name) &&
      !/^(?:layout|loading|error|not-found)\.(?:ts|tsx)$/.test(entry.name)
      ? [path]
      : [];
  });
}

describe("runtime data source contract", () => {
  it("does not import demo, sample, or in-memory data into production routes", () => {
    const violations = routeModules(routeRoot).flatMap((filePath) => {
      const source = readFileSync(filePath, "utf8");
      return forbidden.test(source) ? [filePath.replace(`${process.cwd()}\\`, "")] : [];
    });

    expect(violations).toEqual([]);
  });
});
