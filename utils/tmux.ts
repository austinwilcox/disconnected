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


export type WindowOptions = {
  startDirectory?: string;
};

export class TmuxBuilder {
  private commands: string[] = [];
  private dryRunMode = false;
  private windowTargets: Map<string, string> = new Map();
  private sessionName = '';

  dryRun(): this {
    this.dryRunMode = true;
    return this;
  }

  newSession(sessionName: string, basePath?: string): this {
    this.sessionName = sessionName;
    const path = basePath ?? '~';
    this.commands.push(`new-session -d -s ${this.escape(sessionName)} -c ${this.escape(path)}`);
    return this;
  }

  newWindow(name: string, options?: WindowOptions): this {
    const index = this.windowTargets.size;
    const path = options?.startDirectory ?? '~';
    const target = `${this.sessionName}:${index}`;
    this.windowTargets.set(name, target);

    this.commands.push(`new-window -t ${target} -n ${this.escape(name)} -c ${this.escape(path)}`);

    return this;
  }

  runInWindow(name: string, command: string): this {
    const target = this.windowTargets.get(name);
    if (!target) {
      throw new Error(`Window "${name}" not found. Make sure to create it first.`);
    }

    this.commands.push(`send-keys -t ${target} ${this.escape(command)} C-m`);
    return this;
  }

  sendCommand(name: string, command: string): this {
    this.commands.push(`send-keys ${this.escape(command)} C-m`);
    return this;
  }

  selectWindow(name: string): this {
    const target = this.windowTargets.get(name) ?? name;
    this.commands.push(`select-window -t ${this.escape(target)}`);
    return this;
  }

  renameWindow(newName: string): this {
    this.commands.push(`rename-window ${this.escape(newName)}`);
    return this;
  }

  splitWindow(target: string, direction: 'h' | 'v', startDirectory?: string): this {
    const path = startDirectory ? `-c ${this.escape(startDirectory)}` : '';
    this.commands.push(`split-window -${direction} -t ${this.escape(target)} ${path}`);
    return this;
  }

  killWindow(name: string): this {
    const target = this.windowTargets.get(name) ?? name;
    this.commands.push(`kill-window -t ${this.escape(target)}`);
    return this;
  }

  attachSession(name: string): this {
    this.commands.push(`attach-session -t ${this.escape(name)}`);
    return this;
  }

  build(): string {
    if (this.commands.length === 0) {
      throw new Error('No tmux commands to build.');
    }
    return `tmux ${this.commands.join(' \\; ')}`;
  }

  async spawn(): Promise<void> {
    const command = this.build();
    if (this.dryRunMode) {
      console.log(`[Dry Run] ${command}`);
      return;
    }

    const proc = new Deno.Command("sh", {
      args: ["-c", command],
      stdin: "inherit",
      stdout: "inherit",
      stderr: "inherit"
    });

    const result = await proc.spawn().status;
    if (!result.success) {
      console.error("Tmux command failed:", result);
    }
  }

  private escape(value: string): string {
    return `'${value.replace(/'/g, `'\\''`)}'`;
  }
}
