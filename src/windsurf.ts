// src/windsurf.ts
import * as fs from "fs";
import * as path from "path";
import { WindsurfInstance } from "./types";

// IMPORTANT: You must verify these values for Windsurf
const WINDSURF_EXECUTABLE_NAME = "Windsurf.exe"; // or 'windsurf'
const WINDSURF_APP_DATA_FOLDER_NAME = "Windsurf"; // e.g., in %APPDATA%

/**
 * Finds all Windsurf installations on the system by checking the PATH environment variable.
 * This is the same strategy used by the original C# plugin.
 * @returns An array of found Windsurf instances.
 */
export function findWindsurfInstances(): WindsurfInstance[] {
  const instances: WindsurfInstance[] = [];
  const appDataPath = process.env.APPDATA;

  if (!appDataPath) {
    return [];
  }

  const systemPaths = process.env.PATH?.split(";") || [];

  for (const p of systemPaths) {
    try {
      if (p.toLowerCase().includes("windsurf")) {
        const executablePath = path.join(p, WINDSURF_EXECUTABLE_NAME);

        if (fs.existsSync(executablePath)) {
          const appData = path.join(appDataPath, WINDSURF_APP_DATA_FOLDER_NAME);

          if (fs.existsSync(appData)) {
            const instance: WindsurfInstance = {
              executablePath,
              appDataPath: appData,
            };

            if (
              !instances.some(
                (i) => i.executablePath === instance.executablePath
              )
            ) {
              instances.push(instance);
            }
          }
        }
      }
    } catch (error) {}
  }

  if (instances.length === 0) {
    const commonPaths = [
      path.join(
        process.env.LOCALAPPDATA || "",
        "Programs",
        "Windsurf",
        "Windsurf.exe"
      ),
      path.join(process.env.PROGRAMFILES || "", "Windsurf", "Windsurf.exe"),
      path.join(
        process.env["PROGRAMFILES(X86)"] || "",
        "Windsurf",
        "Windsurf.exe"
      ),
    ];

    for (const execPath of commonPaths) {
      if (fs.existsSync(execPath)) {
        const appData = path.join(appDataPath, WINDSURF_APP_DATA_FOLDER_NAME);
        if (fs.existsSync(appData)) {
          instances.push({
            executablePath: execPath,
            appDataPath: appData,
          });
          break;
        }
      }
    }
  }

  if (instances.length === 0) {
    const knownPath = path.join(
      process.env.LOCALAPPDATA || "",
      "Programs",
      "Windsurf",
      "Windsurf.exe"
    );
    if (fs.existsSync(knownPath)) {
      const appData = path.join(appDataPath, WINDSURF_APP_DATA_FOLDER_NAME);
      if (fs.existsSync(appData)) {
        instances.push({
          executablePath: knownPath,
          appDataPath: appData,
        });
      }
    }
  }

  if (instances.length === 0) {
    for (const p of systemPaths) {
      const execPath = path.join(p, WINDSURF_EXECUTABLE_NAME);
      if (fs.existsSync(execPath)) {
        const appData = path.join(appDataPath, WINDSURF_APP_DATA_FOLDER_NAME);
        if (fs.existsSync(appData)) {
          instances.push({
            executablePath: execPath,
            appDataPath: appData,
          });
          break;
        }
      }
    }
  }

  return instances;
}
