# Disconnected
Disconnected is a simple tmux session creator. Using JSON you can specify how many windows you want, and what commands to run in each of those windows.

## Setup
1. To setup Disconnected, ensure that you have Deno installed on your machine.
2. Run the following command
```bash
deno compile --allow-read --allow-env --allow-write --allow-run --output ./dist/disconnected index.ts
```
or you can download the most recent release in the releases.
3. This will generate a disconnected executable that you can run on your machine. You can add this directory to your path, or toss it in the bin folder with your shell.
```bash
cp ./dist/disconnected /usr/local/bin
```
NOTE: Depending on your user permissions you may need to run this with sudo.

3. After you have disconnected added to path run
```bash
disconnected
```
or
```bash
disconnected init
```
This will create the necessary folders and files in the ~/.config/disconnected folder so that disconnected can save settings.

4. Create a new config file with 
```bash
disconnected new NameOfService
```
with nameOfService being whatever you would like to call the config file
<!-- TODO: Do some name validation here to ensure no spaces are in the name -->

5. You'll be presented with a json file in your editor of choice that you can modify and edit to setup your sessions.

## Build from source
```
deno compile --allow-read --allow-env --allow-write --allow-run --output ./dist/disconnected index.ts
chmod +x ./dist/disconnected
```

## The Config File
Here is the sample config file that is generated for you
```
{
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
}
```
name: This will be the name of the tmux session 

basePath: This will be the base path for your project you are working in.

startingWindow: The default option is 1, in my tmux config I do 1-9, and I don't use 0. This is my opinionated config for tmux.

windows:
*  name: Name of the tmux window
*  basePath: This ***may*** build on the global basePath, so if your basePath that is set globally is ```~/Software``` this one could drill down into the tools folder by suppyling ```tools``` as the option here. With the concatenateBasePathToGlobalBasePath you now have to specify that value as true if you want to build off the global base path.
*  commands: A series of shell commands that you want run in that window.
*  shouldCloseAfterCommand: tells tmux whether or not to close the window after the commands are complete.
*  concatenateBasePathToGlobalBasePath: determines whether or not to concatenate the global basePath with the window basePath. Default value is false.
  
## TODO
- [x] Update this so that the name auto defaults to the name of the file.
- [ ] Support panes in the future.
- [x] Do some name validation here to ensure no spaces are in the name
- [x] Improve the text validation for attaching to a service that has already been started (currently it's a simple includes)
