import * as path from "path";
import { Workspace, WorkspaceLocation } from "./types";

const LocalWorkspaceRegex = /^file:\/\/\/(.+)$/;
const RemoteSSHRegex = /^vscode-remote:\/\/ssh-remote\+(.+?(?=\/))(.+)$/;
const RemoteWSLRegex = /^vscode-remote:\/\/wsl\+(.+?(?=\/))(.+)$/;
const DevContainerRegex = /^vscode-remote:\/\/dev-container\+(.+?\/)(.+)$/;

/**
 * Parses a VSCode/Windsurf URI into a structured Workspace object.
 * @param uri The URI string from the history database.
 * @returns A partial Workspace object or null if parsing fails.
 */
export function parseWorkspaceUri(
  uri: string
): Omit<Workspace, "instance"> | null {
  const unescapedUri = decodeURIComponent(uri);

  let match;

  if ((match = unescapedUri.match(RemoteSSHRegex))) {
    return {
      path: uri,
      displayPath: match[2],
      folderName: path.basename(match[2]),
      machineName: match[1],
      location: WorkspaceLocation.RemoteSSH,
    };
  }

  if ((match = unescapedUri.match(RemoteWSLRegex))) {
    const displayPath = match[2].replace(/\//g, "\\");
    return {
      path: uri,
      displayPath,
      folderName: path.basename(displayPath),
      machineName: `WSL: ${match[1]}`,
      location: WorkspaceLocation.RemoteWSL,
    };
  }

  if ((match = unescapedUri.match(DevContainerRegex))) {
    return {
      path: uri,
      displayPath: match[2],
      folderName: path.basename(match[2]),
      machineName: "Dev Container",
      location: WorkspaceLocation.DevContainer,
    };
  }

  if ((match = unescapedUri.match(LocalWorkspaceRegex))) {
    const displayPath = match[1].replace(/\//g, "\\");
    return {
      path: uri,
      displayPath,
      folderName: path.basename(displayPath) || displayPath,
      location: WorkspaceLocation.Local,
    };
  }

  return null;
}
