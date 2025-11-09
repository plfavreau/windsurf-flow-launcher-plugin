import * as child_process from "child_process";
import { getRemoteMachines } from "./remotes";
import { SshHost, Workspace } from "./types";
import { findWindsurfInstances } from "./windsurf";
import { getRecentWorkspaces } from "./workspaces";

let cachedWorkspaces: Workspace[] = [];
let cachedRemotes: SshHost[] = [];
let cacheLoaded = false;

/**
 * Load workspaces and remotes into cache
 */
async function loadCache() {
  if (cacheLoaded) return;

  try {
    const instances = findWindsurfInstances();

    if (instances.length === 0) {
      cacheLoaded = true;
      return;
    }

    const workspacePromises = instances.map(getRecentWorkspaces);
    const remotePromises = instances.map(getRemoteMachines);

    const allWorkspaces = await Promise.all(workspacePromises);
    const allRemotes = await Promise.all(remotePromises);

    cachedWorkspaces = allWorkspaces
      .flat()
      .filter((w, i, a) => a.findIndex((v) => v.path === w.path) === i);
    cachedRemotes = allRemotes
      .flat()
      .filter((r, i, a) => a.findIndex((v) => v.host === r.host) === i);

    cacheLoaded = true;
  } catch (error) {
    cacheLoaded = true;
  }
}

/**
 * Handle query from Flow Launcher
 */
async function handleQuery(query: string) {
  await loadCache();

  const results: any[] = [];
  const lowerQuery = query.toLowerCase();
  cachedWorkspaces
    .filter(
      (w) =>
        !query ||
        w.folderName.toLowerCase().includes(lowerQuery) ||
        w.displayPath.toLowerCase().includes(lowerQuery) ||
        (w.label && w.label.toLowerCase().includes(lowerQuery))
    )
    .forEach((w) => {
      const subtitle = w.machineName
        ? `${w.machineName} - ${w.displayPath}`
        : w.displayPath;
      results.push({
        Title: w.label || w.folderName,
        Subtitle: subtitle,
        JsonRPCAction: {
          method: "open_workspace",
          parameters: [w.instance.executablePath, w.path],
          dontHideAfterAction: false,
        },
        IcoPath: "icon.png",
      });
    });

  cachedRemotes
    .filter((r) => !query || r.host.toLowerCase().includes(lowerQuery))
    .forEach((r) => {
      let subtitle = "SSH Remote Machine";
      if (r.user && r.hostName) subtitle = `${r.user}@${r.hostName}`;

      const instance = findWindsurfInstances()[0];
      if (instance) {
        results.push({
          Title: r.host,
          Subtitle: subtitle,
          JsonRPCAction: {
            method: "open_remote",
            parameters: [instance.executablePath, r.host],
            dontHideAfterAction: false,
          },
          IcoPath: "icon.png",
        });
      }
    });

  if (results.length === 0) {
    results.push({
      Title: "No workspaces found",
      Subtitle:
        cachedWorkspaces.length === 0
          ? "No recent Windsurf workspaces detected"
          : "Try a different search query",
      IcoPath: "icon.png",
    });
  }

  return results;
}

/**
 * Open a workspace in Windsurf
 */
function openWorkspace(executablePath: string, workspacePath: string) {
  try {
    child_process
      .spawn(executablePath, ["--folder-uri", workspacePath], {
        detached: true,
        stdio: "ignore",
      })
      .unref();
  } catch (error) {
    console.error("Failed to open workspace:", error);
  }
}

/**
 * Open a remote SSH connection in Windsurf
 */
function openRemote(executablePath: string, host: string) {
  try {
    child_process
      .spawn(
        executablePath,
        ["--new-window", "--remote", `ssh-remote+${host}`],
        {
          detached: true,
          stdio: "ignore",
        }
      )
      .unref();
  } catch (error) {
    console.error("Failed to open remote:", error);
  }
}

(async () => {
  try {
    const input = JSON.parse(process.argv[2]);
    const { method, parameters } = input;

    if (method === "query") {
      const query = parameters[0] || "";
      const results = await handleQuery(query);
      console.log(JSON.stringify({ result: results }));
    } else if (method === "open_workspace") {
      const [executablePath, workspacePath] = parameters;
      openWorkspace(executablePath, workspacePath);
    } else if (method === "open_remote") {
      const [executablePath, host] = parameters;
      openRemote(executablePath, host);
    }
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
})();
