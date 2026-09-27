import { readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(process.cwd(), "apps", "web", "app");
const mapPath = join(process.cwd(), "specs", "003-saas-admin", "contracts", "page-data-map.md");

function filesUnder(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(path) : [path];
  });
}

function routeFor(filePath: string): string {
  const file = relative(root, filePath).split(sep);
  file.pop();
  const segments = file.filter((segment) => !/^\([^)]*\)$/.test(segment));
  const route = segments.join("/");
  return route ? `/${route}` : "/";
}

describe("page data map contract", () => {
  it("maps every App Router page and route handler", () => {
    const appRoutes = filesUnder(root)
      .filter((filePath) => /(?:page\.tsx|route\.tsx?|route\.ts)$/.test(filePath))
      .map(routeFor);
    const documented = new Set<string>();
    for (const line of readFileSync(mapPath, "utf8")
      .split("\n")
      .filter((entry) => entry.startsWith("|"))) {
      const firstCell = line.split("|")[1];
      if (firstCell.includes("`/`") || firstCell.includes(" / ")) documented.add("/");
      for (const route of firstCell.match(/\/[A-Za-z0-9()[\]{}_-]+(?:\/[A-Za-z0-9()[\]{}_-]+)*/g) ??
        [])
        documented.add(route);
    }

    expect(
      appRoutes.filter(
        (route, index) => appRoutes.indexOf(route) === index && !documented.has(route),
      ),
    ).toEqual([]);
  });
});
