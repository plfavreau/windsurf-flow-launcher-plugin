import * as fs from "fs";
import * as path from "path";
import SSHConfig from "ssh-config";
import { SshHost, WindsurfInstance } from "./types";

/**
 * Finds configured SSH remote machines for a given Windsurf instance.
 * @param instance The Windsurf instance to check.
 * @returns A promise resolving to an array of SSH hosts.
 */
export async function getRemoteMachines(
  instance: WindsurfInstance
): Promise<SshHost[]> {
  const settingsPath = path.join(instance.appDataPath, "User", "settings.json");
  if (!fs.existsSync(settingsPath)) {
    return [];
  }

  try {
    const content = fs
      .readFileSync(settingsPath, "utf-8")
      .replace(
        /\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g,
        (m: string, g: string) => (g ? "" : m)
      );

    const settings = JSON.parse(content);
    const sshConfigPath = settings["remote.SSH.configFile"];

    if (sshConfigPath && fs.existsSync(sshConfigPath)) {
      const sshFileContent = fs.readFileSync(sshConfigPath, "utf-8");
      const config = SSHConfig.parse(sshFileContent);

      const hosts: SshHost[] = [];
      for (const section of config) {
        if (
          "param" in section &&
          "value" in section &&
          section.param === "Host" &&
          section.value !== "*"
        ) {
          const hostValue = Array.isArray(section.value)
            ? section.value[0]
            : section.value;
          const hostDetails = config.compute(hostValue);
          hosts.push({
            host: hostValue,
            hostName: Array.isArray(hostDetails.HostName)
              ? hostDetails.HostName[0]
              : hostDetails.HostName,
            user: Array.isArray(hostDetails.User)
              ? hostDetails.User[0]
              : hostDetails.User,
          });
        }
      }
      return hosts;
    }
  } catch (error) {
    console.error(
      `Failed to read or parse Windsurf remote machine settings:`,
      error
    );
  }
  return [];
}
