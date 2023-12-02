import { assertEquals } from "https://deno.land/std@0.201.0/assert/mod.ts";
import { ITmux } from "./tmux.ts";
import { isTmuxSessionCurrentlyRunning } from "./index.ts";

const tmuxTest: ITmux = {
  listSessions: async () => {
    return await Promise.resolve("testOutput");
  },
  attach: async (name: string) => {
    await Promise.resolve(console.log(`${name}`));
  }
}

Deno.test("Tmux session is currently running the session 'testOutput'", async () => {
  const response = await isTmuxSessionCurrentlyRunning(tmuxTest, "testOutput")
  assertEquals(response, true);
});


Deno.test("Tmux session is NOT currently running the session 'testing'", async () => {
  const response = await isTmuxSessionCurrentlyRunning(tmuxTest, "testing")
  assertEquals(response, false);
});
