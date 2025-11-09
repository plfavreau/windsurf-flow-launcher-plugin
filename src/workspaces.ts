import Database from "better-sqlite3";
import * as fs from "fs";
import * as path from "path";
import { WindsurfInstance, Workspace } from "./types";
import { parseWorkspaceUri } from "./uri";

/**
 * Retrieves recent workspaces for a given Windsurf instance.
 * @param instance The Windsurf instance to query.
 * @returns A promise that resolves to an array of found workspaces.
 */
export async function getRecentWorkspaces(
  instance: WindsurfInstance
): Promise<Workspace[]> {
  const dbPath = path.join(
    instance.appDataPath,
    "User",
    "globalStorage",
    "state.vscdb"
  );

  if (!fs.existsSync(dbPath)) {
    return [];
  }

  const workspaces: Workspace[] = [];
  try {
    const db = new Database(dbPath, { readonly: true, fileMustExist: true });
    const query =
      "SELECT value FROM ItemTable WHERE key = 'history.recentlyOpenedPathsList'";
    const result = db.prepare(query).get() as { value: string } | undefined;
    db.close();

    if (result) {
      const history = JSON.parse(result.value);
      const entries = history.entries || [];

      for (const entry of entries) {
        const uri = entry.folderUri || entry.workspace?.configPath;
        if (uri) {
          const parsed = parseWorkspaceUri(uri);
          if (parsed) {
            workspaces.push({
              ...parsed,
              label: entry.label,
              instance,
            });
          }
        }
      }
    }
  } catch (error) {}

  return workspaces;
}
