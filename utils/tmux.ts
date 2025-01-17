export interface ITmux {
  listSessions: () => Promise<string>;
  attach: (name: string) => void;
  switchClient: (name: string) => void;
}

export const Tmux: ITmux = {
  listSessions: async () => {
    const tmuxLsCommand = new Deno.Command("tmux", { args: ["ls"] });
    const { stdout } = await tmuxLsCommand.output();
    // await tmuxLsCommand.status();
    const decodedText = new TextDecoder().decode(stdout);
    return decodedText;
  },

  attach: (name: string) => {
    const attachCommand = new Deno.Command("tmux", {
      args: ["attach", "-t", name],
    });
    attachCommand.spawn();
  },

  switchClient: (name: string) => {
    const switchClientCommand = new Deno.Command("tmux", {
      args: ["switch-client", "-t", name],
    });
    switchClientCommand.spawn();
  },
};
