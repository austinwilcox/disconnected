export interface ITmux {
  listSessions: () => Promise<string>;
  attach: (name: string) => Promise<void>;
}

export const Tmux: ITmux = {
  listSessions: async () => {
    const tmuxLsCommand = new Deno.Command("tmux", { args: ['ls'] })
    const { stdout } = await tmuxLsCommand.output();
    // await tmuxLsCommand.status();
    const decodedText = new TextDecoder().decode(stdout);
    return decodedText;
  },

  attach: async (name: string) => {
    const attachCommand = new Deno.Command("tmux", { args: ["attach", "-t", name]});
    attachCommand.spawn();
  }
}
