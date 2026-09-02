import { execFile } from "node:child_process";
import { writeFile as fsWriteFile } from "node:fs";

export async function runCommand(
  command: string,
  args: string[],
): Promise<{ stdout: string; stderr: string }> {
  return new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
    execFile(command, args, { encoding: "utf8" }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(error.message));
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

export async function writeFile(path: string, content: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    fsWriteFile(path, content, { encoding: "utf8" }, (error) => {
      if (error) {
        reject(new Error(error.message));
      } else {
        resolve();
      }
    });
  });
}
