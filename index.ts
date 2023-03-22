import { Command } from "https://deno.land/x/cliffy@v0.25.2/command/mod.ts";
import * as path from "https://deno.land/std@0.167.0/path/mod.ts";
import { createNeededDirectoriesAndFiles } from "./startup.ts";

const home = Deno.env.get("HOME");
const basePathToDisconnectedDirectory = `${home}/.config/disconnected`;

interface IWindow {
  name: string;
  basePath: string;
  commands: string[];
  shouldCloseAfterCommand: boolean;
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
      "shouldCloseAfterCommand": false
    },
    {
      "name": "htop",
      "basePath": "",
      "commands": ["htop"],
      "shouldCloseAfterCommand": true
    }
  ]
}`

const initCommand = new Command()
.description(`Create all the files and folders needed to run disconnected. Files will be placed in ${basePathToDisconnectedDirectory}`)
.action(async () => {
  await createNeededDirectoriesAndFiles(basePathToDisconnectedDirectory, baseConfigFile);
})

const startCommand = new Command()
.arguments("<name:string>")
.description("Start tmux with the supplied config file name.")
.action(async ( _options, name: string ) => {
  const pathToBashScriptFile = `${basePathToDisconnectedDirectory}/bashScripts/${name}.sh`;

  let doesFileExist = false;
  for await (const dirEntry of Deno.readDir(basePathToDisconnectedDirectory)) {
    if(dirEntry.name.includes(name)) {
      doesFileExist = true;
      break;
    }
  }

  if(doesFileExist == false) {
    console.log(`Could not find config file with name: ${name}`);
    console.log(`Did you mean to run: disconnected new ${name}?`);
    return;
  }
  const decoder = new TextDecoder("utf-8");
  const file = await Deno.readFile(`${basePathToDisconnectedDirectory}/${name}.json`);

  const data = decoder.decode(file);
  const configFile = JSON.parse(data.toString());
  const lines = [];
  const paneNumber = 1;
  configFile.windows.forEach((window: IWindow, index: number) => {
    const windowNumber = index + 1;
    if (index === 0) {
      lines.push(`tmux new-session -d -s ${name} -n ${window.name}`);
    } else {
      lines.push(`tmux neww -t ${name} -n "${window.name}"`);
    }

    lines.push(
      `tmux send -t ${name}:${windowNumber}.${paneNumber} "cd ${path.join(configFile.basePath, window.basePath)}" C-m`
    );

    window.commands.forEach((cmd: string) => {
      lines.push(`tmux send -t ${name}:${windowNumber}.${paneNumber} "${cmd}" C-m`);
    });

    if("shouldCloseAfterCommand" in window && window.shouldCloseAfterCommand) {
      lines.push(`tmux send -t ${name}:${windowNumber}.${paneNumber} "exit" C-m`);
    }
  });
  lines.push(`tmux select-window -t ${configFile.startingWindow}`)
  lines.push(`tmux attach -t ${name}`);

  await Deno.writeTextFile(pathToBashScriptFile, lines.join("\n"));
  await Deno.chmod(pathToBashScriptFile, 0o777);

  const executeFile = Deno.run({ cmd: ["bash", `${pathToBashScriptFile}`] })
  await executeFile.status();

  console.log("Run following command to attach to tmux.");
  console.log(`tmux a -t ${name}`);
})

const listCommand = new Command()
.description("List all config files")
.action(async ( _options ) => {
  for await (const dirEntry of Deno.readDir(basePathToDisconnectedDirectory)) {
    if(dirEntry.isFile) {
      if(dirEntry.name.includes(".json")) {
        console.log(dirEntry.name.split(".json")[0]);
      } else {
        console.log(dirEntry.name);
      }
    }
  }
})

const createNewConfigCommand = new Command()
.arguments("<name:string>")
.description("Create the config file")
.action(async ( _options, name: string ) => {
  for await (const dirEntry of Deno.readDir(basePathToDisconnectedDirectory)) {
    if(dirEntry.name.includes(name)) {
      console.log(`File already exists with name: ${name}`);
      console.log(`Did you mean to run: disconnected edit ${name}?`);
      return;
    }
  }
  
  const encoder = new TextEncoder();
  const data = encoder.encode(baseConfigFile)
  Deno.writeFileSync(`${basePathToDisconnectedDirectory}/${name}.json`, data)
  console.log("File created, opening in neovim");

  const p = Deno.run({ cmd: ["nvim", `${basePathToDisconnectedDirectory}/${name}.json`] })
  await p.status();
})

const deleteConfigCommand = new Command()
.arguments("<name:string>")
.description("Delete the config file")
.action(( _options, name: string ) => {
  console.log(`You have hit the delete command with ${name}`)
})

const editConfigCommand = new Command()
.arguments("<name:string>")
.description("Edit the config file")
.action(async ( _options, name: string ) => {
  let doesTheDirectoryContainTheFile = false;
  for await (const dirEntry of Deno.readDir(basePathToDisconnectedDirectory)) {
    if(dirEntry.name.includes(name)) {
      doesTheDirectoryContainTheFile = true;
      break;
    }
  }

  if(doesTheDirectoryContainTheFile === false) {
    console.log(`Could not find config file with name: ${name}`);
    console.log(`Did you mean to run: disconnected new ${name}?`);
    return;
  }

  const p = Deno.run({ cmd: ["nvim", `${basePathToDisconnectedDirectory}/${name}.json`] })
  await p.status();
})

await new Command()
.name("Disconnected")
.version("0.1.2`")
.description(`Disconnected is a powerful and versatile application that allows you to manage your terminal sessions with ease. As an alternative to tmuxinator, it offers a simple and intuitive cli that is perfect for both beginners and advanced users. With Disconnected, you can easily create, modify, and manage your terminal sessions with just a few commands.

One of the key features of Disconnected is its use of a JSON configuration file, which makes it easy to configure and customize your terminal sessions to your liking. Whether you're working on a complex project or just need to manage a few terminals at once, Disconnected makes it easy to get started.`)
.action(async (_options, ...args) => {
  await createNeededDirectoriesAndFiles(basePathToDisconnectedDirectory, baseConfigFile);
})
.command("init", initCommand)
.command("start", startCommand)
.command("list", listCommand)
.command("new", createNewConfigCommand)
.command("delete", deleteConfigCommand)
.command("edit", editConfigCommand)
.parse(Deno.args);
