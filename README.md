# Disconnected
Disconnected is an alternative to [Tmuxinator](https://github.com/tmuxinator/tmuxinator) that uses a simpler structure, and uses json instead of yaml. 

Disconnected is a constantly updated program, it is fully functional in it's 0.1.0 version, but is always due to change.

## Setup
1. To setup Disconnected, ensure that you have [Deno](https://deno.land/manual@v1.31.1/getting_started/installation) installed on your machine.
NOTE: Disconnected will only work on Mac or Linux, and currently only works for NVIM users.
2. Run the compile.sh script
3. This will generate a disconnected executable that you can run on your machine. You can add this directory to your path, or toss it in the bin folder with your shell.
4. After you have disconnected added to path run
```bash
disconnected init
```
This will create the necessary folders in the ~/.config/ folder so that disconnected can save settings.
5. Create a new config file with 
```bash
disconnected new NameOfService
```
6. You'll be presented with a json file in NVIM that you can modify and edit to setup your sessions.
