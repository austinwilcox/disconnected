import { ITmux, Tmux } from "./tmux.ts";

export async function isTmuxSessionCurrentlyRunning(tmux: ITmux, nameOfConfig: string): Promise<boolean> {
  try {
    const output = await tmux.listSessions();
    return output.includes(nameOfConfig)
  } catch(err) {
    console.error(err);
    return false
  }
}
