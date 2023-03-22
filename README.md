# Disconnected
Disconnected is a powerful and versatile application that allows you to manage your terminal sessions with ease. As an alternative to tmuxinator, it offers a simple and intuitive cli that is perfect for both beginners and advanced users. With Disconnected, you can easily create, modify, and manage your terminal sessions with just a few commands.

One of the key features of Disconnected is its use of a JSON configuration file, which makes it easy to configure and customize your terminal sessions to your liking. Whether you're working on a complex project or just need to manage a few terminals at once, Disconnected makes it easy to get started.

Disconnected is a constantly updated program, it is fully functional in it's 0.2.2 version, but is always due to change.

## Setup
1. To setup Disconnected, ensure that you have [Deno](https://deno.land/manual@v1.31.1/getting_started/installation) installed on your machine.
NOTE: Disconnected will only work on Mac or Linux, and ~~ currently only works for NVIM users~~ now works for all users who have the $EDITOR env variable set.
2. Run the compile.sh script
3. This will generate a disconnected executable that you can run on your machine. You can add this directory to your path, or toss it in the bin folder with your shell.
```bash
cp disconnected /usr/local/bin
```
NOTE: Depending on your user permissions you may need to run this with sudo.
5. After you have disconnected added to path run
```bash
disconnected
```
or
```bash
disconnected init
```
This will create the necessary folders and files in the ~/.config/disconnected folder so that disconnected can save settings.
5. Create a new config file with 
```bash
disconnected new NameOfService
```
with nameOfService being whatever you would like to call the config file
TODO Do some name validation here to ensure no spaces are in the name
6. You'll be presented with a json file in your editor of choice that you can modify and edit to setup your sessions.

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
      "shouldCloseAfterCommand": false
    },
    {
      "name": "htop",
      "basePath": "",
      "commands": ["htop"],
      "shouldCloseAfterCommand": true
    }
  ]
}
```
name: This will be the name of the tmux session 
TODO Update this so that the name auto defaults to the name of the file.

basePath: This will be the base path for your project you are working in.

startingWindow: The default option is 1, in my tmux config I do 1-9, and I don't use 0. This is my opinionated config for tmux.

windows:
*  name: Name of the tmux window
*  basePath: This will build on basePath from the parent, so if your basePath in the parent is "~/Software" this one could drill down into the tools folder by suppying "tools" as the option here.
*  commands: A series of shell commands that you want run in that window.
*  shouldCloseAfterCommand: tells tmux whether or not to close the window after the commands are complete.
  
## TODO
- [ ] Update this so that the name auto defaults to the name of the file.
- [ ] Support panes in the future.
- [ ] Do some name validation here to ensure no spaces are in the name
