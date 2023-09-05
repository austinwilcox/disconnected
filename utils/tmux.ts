export interface ITmux {
  listSessions: () => Promise<string>;
}

export const Tmux: ITmux = {
  listSessions: async () => {
    const tmuxLsCommand = new Deno.Command("tmux", { args: ['ls'] })
    const { stdout } = await tmuxLsCommand.output();
    // await tmuxLsCommand.status();
    const decodedText = new TextDecoder().decode(stdout);
    return decodedText;
  }
}
