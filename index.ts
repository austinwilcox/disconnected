import { Command } from "https://deno.land/x/cliffy@v0.25.2/command/mod.ts";
import * as path from "https://deno.land/std@0.167.0/path/mod.ts";
import { createNeededDirectoriesAndFiles } from "./startup.ts";
import { isTmuxSessionCurrentlyRunning } from "./utils/index.ts";
import { Tmux } from "./utils/tmux.ts";

const home = Deno.env.get("HOME");
const isInTmux = Deno.env.get("TERM_PROGRAM")?.includes("tmux");
const shell = Deno.env.get("SHELL") ?? "";
const basePathToDisconnectedDirectory = `${home}/.config/disconnected`;
let editor = Deno.env.get("EDITOR");
if (!editor) {
  editor = "nano";
}
const decoder = new TextDecoder("utf-8");

interface IWindow {
  name: string;
  basePath: string;
  commands: string[];
  shouldCloseAfterCommand: boolean;
  concatenateBasePathToGlobalBasePath: boolean;
}

const baseConfigFile = `{
  "name": "SampleBaseConfig",
  "basePath": "~/",
  "startingWindow": "1",
  "windows": [
    {
      "name": "listfiles",
      "basePath": "",
      "commands": ["ls"],
      "shouldCloseAfterCommand": false,
      "concatenateBasePathToGlobalBasePath": false
    },
    {
      "name": "htop",
      "basePath": "",
      "commands": ["htop"],
      "shouldCloseAfterCommand": true,
      "concatenateBasePathToGlobalBasePath": false
    }
  ]
}`;

const initCommand = new Command()
  .description(
    `Create all the files and folders needed to run disconnected. Files will be placed in ${basePathToDisconnectedDirectory}`,
  )
  .action(async () => {
    await createNeededDirectoriesAndFiles(
      basePathToDisconnectedDirectory,
      baseConfigFile,
    );
  });

const startCommand = new Command()
  .arguments("<name:string>")
  .description("Start tmux with the supplied config file name.")
  .action(async (_options, name: string) => {
    let doesFileExist = false;
    for await (
      const dirEntry of Deno.readDir(
        basePathToDisconnectedDirectory,
      )
    ) {
      if (dirEntry.name.includes(name)) {
        doesFileExist = true;
        break;
      }
    }

    if (doesFileExist == false) {
      console.log(`Could not find config file for ${name}`);
      console.log(`Did you mean to run: disconnected new ${name}?`);
      return;
    }

    if (await isTmuxSessionCurrentlyRunning(Tmux, name)) {
      if (isInTmux) {
        Tmux.switchClient(name);
      } else {
        Tmux.attach(name);
      }
      return;
    }

    const file = await Deno.readFile(
      `${basePathToDisconnectedDirectory}/${name}.json`,
    );

    const data = decoder.decode(file);
    const configFile = JSON.parse(data.toString());
    const lines = [];
    const paneNumber = 1; //NOTE: Read from a .tmux.conf file and see if they start at 1, because some people may not
    configFile.windows.forEach((window: IWindow, index: number) => {
      if (!window.name) {
        const error = `Window name is required for window ${index + 1}`;
        console.error(error);
        throw new Error(error);
      }
      if (configFile.basePath.includes("~")) {
        configFile.basePath = configFile.basePath.replace("~", home as string);
      }
      if (window.basePath.includes("~")) {
        window.basePath = window.basePath.replace("~", home as string);
      }
      if (window.name.includes(" ")) {
        window.name = window.name.replace(" ", "-");
      }
      const windowNumber = index + 1;
      if (index === 0) {
        lines.push(`tmux new-session -d -s ${name} -n ${window.name}`);
      } else {
        lines.push(`tmux neww -t ${name} -n "${window.name}"`);
      }

      if (window.concatenateBasePathToGlobalBasePath) {
        lines.push(
          `tmux send -t ${name}:${windowNumber}.${paneNumber} "cd ${
            path.join(
              configFile.basePath,
              window.basePath,
            )
          }" C-m`,
        );
      } else {
        lines.push(
          `tmux send -t ${name}:${windowNumber}.${paneNumber} "cd ${window.basePath}" C-m`,
        );
      }

      window.commands.forEach((cmd: string) => {
        lines.push(
          `tmux send -t ${name}:${windowNumber}.${paneNumber} "${cmd}" C-m`,
        );
      });

      if (
        "shouldCloseAfterCommand" in window &&
        window.shouldCloseAfterCommand
      ) {
        lines.push(
          `tmux send -t ${name}:${windowNumber}.${paneNumber} "exit" C-m`,
        );
      }
    });
    lines.push(`tmux select-window -t ${configFile.startingWindow}`);
    lines.push(
      `tmux ${isInTmux ? "switch-client" : "attach"} -t ${name} ${
        isInTmux ? "" : `-c ${configFile.basePath}`
      }`,
    );

    const runTmuxCommand = new Deno.Command(shell, {
      args: ["-c", lines.join("\n")],
    });
    runTmuxCommand.spawn();

    console.log(
      "Run the following command to attach to the newly created tmux session:",
    );
    console.log(`tmux a -t ${name}`);
  });

const listCommand = new Command()
  .description("List all config files")
  .action(async (_options) => {
    for await (
      const dirEntry of Deno.readDir(
        basePathToDisconnectedDirectory,
      )
    ) {
      if (dirEntry.isFile) {
        if (dirEntry.name.includes(".json")) {
          console.log(dirEntry.name.split(".json")[0]);
        } else {
          console.log(dirEntry.name);
        }
      }
    }
  });

const createNewConfigCommand = new Command()
  .arguments("<name:string>")
  .description("Create the config file")
  .action(async (_options, name: string) => {
    for await (
      const dirEntry of Deno.readDir(
        basePathToDisconnectedDirectory,
      )
    ) {
      if (dirEntry.name.includes(name)) {
        console.log(`File already exists with name: ${name}`);
        console.log(`Did you mean to run: disconnected edit ${name}?`);
        return;
      }
    }

    const encoder = new TextEncoder();
    const newConfigFile = baseConfigFile.replace(/SampleBaseConfig/gi, name);
    const data = encoder.encode(newConfigFile);
    Deno.writeFileSync(`${basePathToDisconnectedDirectory}/${name}.json`, data);
    console.log(`File created, opening in ${editor}`);

    const p = new Deno.Command(editor as string, {
      args: [`${basePathToDisconnectedDirectory}/${name}.json`],
    });
    p.spawn();
  });

const editConfigCommand = new Command()
  .arguments("<name:string>")
  .description("Edit the config file")
  .action(async (_options, name: string) => {
    let doesTheDirectoryContainTheFile = false;
    for await (
      const dirEntry of Deno.readDir(
        basePathToDisconnectedDirectory,
      )
    ) {
      if (dirEntry.name.includes(name)) {
        doesTheDirectoryContainTheFile = true;
        break;
      }
    }

    if (doesTheDirectoryContainTheFile === false) {
      console.log(`Could not find config file for ${name}`);
      console.log(`Did you mean to run: disconnected new ${name}?`);
      return;
    }

    const p = new Deno.Command(editor as string, {
      args: [`${basePathToDisconnectedDirectory}/${name}.json`],
    });
    p.spawn();
  });

const rmConfigCommand = new Command()
  .arguments("<name:string>")
  .description("Delete the config file")
  .action(async (_options, name: string) => {
    await Deno.remove(
      path.join(basePathToDisconnectedDirectory, `${name}.json`),
    );
  });

await new Command()
  .name("Disconnected")
  .version("0.3.4")
  .description(
    "Disconnected is a simple tmux session creator. Using JSON you can specify how many windows you want, and what commands to run in each of those windows.",
  )
  .action(async (_options, ..._args) => {
    await createNeededDirectoriesAndFiles(
      basePathToDisconnectedDirectory,
      baseConfigFile,
    );
  })
  .command("init", initCommand)
  .command("start", startCommand)
  .command("list", listCommand)
  .command("new", createNewConfigCommand)
  .command("edit", editConfigCommand)
  .command("rm", rmConfigCommand)
  .parse(Deno.args);
