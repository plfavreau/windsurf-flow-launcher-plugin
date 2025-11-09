export interface WindsurfInstance {
  executablePath: string;
  appDataPath: string;
}

export interface Workspace {
  path: string;
  displayPath: string;
  folderName: string;
  machineName?: string;
  location: WorkspaceLocation;
  instance: WindsurfInstance;
  label?: string;
}

export enum WorkspaceLocation {
  Local,
  RemoteSSH,
  RemoteWSL,
  DevContainer,
  Codespaces,
  Unknown,
}

export interface SshHost {
  host: string;
  hostName?: string;
  user?: string;
}
