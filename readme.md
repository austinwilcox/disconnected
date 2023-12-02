# Disconnected
Disconnected is a powerful and versatile application that allows you to manage your tmux sessions with ease. As an alternative to tmuxinator, it offers a simple config setup for users that prefer json over yaml. With Disconnected, you can easily create, modify, and manage your tmux sessions with just a few commands.

One of the key features of Disconnected is its use of a JSON configuration file, which makes it easy to configure and customize your tmux sessions to your liking. Whether you're working on a complex project or just need to manage a few terminals at once, Disconnected makes it easy to get started.

Disconnected is a constantly updated program, it is fully functional in it's 0.2.1 version, but is currently due to change.

## Setup
1. To setup Disconnected, ensure that you have [Deno](https://deno.land/manual@v1.31.1/getting_started/installation) installed on your machine.
NOTE: Disconnected will only work on Mac or Linux, and ~~currently only works for NVIM users~~ now works for all users who have the $EDITOR env variable set.
2. Run the following command
```bash
deno compile --allow-read --allow-env --allow-write --allow-run --output disconnected index.ts
```
or you can download the most recent release in the releases.
3. This will generate a disconnected executable that you can run on your machine. You can add this directory to your path, or toss it in the bin folder with your shell.
```bash
cp disconnected /usr/local/bin
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
<!-- TODO: Update this so that the name auto defaults to the name of the file. -->

basePath: This will be the base path for your project you are working in.

startingWindow: The default option is 1, in my tmux config I do 1-9, and I don't use 0. This is my opinionated config for tmux.

windows:
*  name: Name of the tmux window
*  basePath: This will build on basePath from the parent, so if your basePath in the parent is "~/Software" this one could drill down into the tools folder by suppying "tools" as the option here.
*  commands: A series of shell commands that you want run in that window.
*  shouldCloseAfterCommand: tells tmux whether or not to close the window after the commands are complete.
*  concatenateBasePathToGlobalBasePath: determines whether or not to concatenate the global basePath with the window basePath. Default value is false.
  
## TODO
- [x] Update this so that the name auto defaults to the name of the file.
- [ ] Support panes in the future.
- [ ] Do some name validation here to ensure no spaces are in the name
- [ ] Improve the text validation for attaching to a service that has already been started (currently it's a simple includes)
- [ ] Disconnected update - auto pull the new executable and place it in the correct path area. This will pull from github releases the new version of the application.
- [ ] Ability to send key input to several windows/panes at a time, an example command would be this:  ```tmux send-keys -t arbPortal:API:NVIM 'git pull' Enter && tmux send-keys -t arbPortal:Portal:NVIM 'git pull' Enter && tmux send-keys -t arbPortal:Lib:NVIM 'git pull' Enter```, I would love to be able to run ```disconnected send-actions 4-6 'git pull' Enter``` or something like ```disconnected send-actions arbPortal 4-6 'git pull' Enter``` for something like the connected session I can pass in the flag -c so it would look like this if you want to run it on the connected session: ```disconnected send-actions -c 4-6 'git pull' Enter``` and this would run it on the currently attached tmux session, but this makes some assumption that you are using disconnected as your default way to manage tmux, which may not always be the case, but I suppose it does not matter because tmux will still run all the commands you send.
