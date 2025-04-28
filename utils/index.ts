import { ITmux } from "./tmux.ts";

export async function isTmuxSessionCurrentlyRunning(
  tmux: ITmux,
  nameOfConfig: string,
): Promise<boolean> {
  try {
    const output = await tmux.listSessions();
    const lines = output.split("\n");
    const sessionNames = lines.map((line) => line.split(":")[0]);
    return sessionNames.some((name) => name === nameOfConfig);
    // return output.includes(nameOfConfig);
  } catch (err) {
    console.error(err);
    return false;
  }
}

/**
 * Checks if a file with the given name exists in the specified directory.
 * @param nameOfConfig - The name of the config file to check for. DO NOT include the file extension
*/
export function doesConfigFileExist(
  nameOfConfig: string
): boolean {
  const home = Deno.env.get("HOME");
  const basePathToDisconnectedDirectory = `${home}/.config/disconnected`;

  for (const dirEntry of Deno.readDirSync(basePathToDisconnectedDirectory)) {
    if (dirEntry.isFile && dirEntry.name === `${nameOfConfig}.json`) {
      return true;
    }
  }

  return false;
}
