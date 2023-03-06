export const createNeededDirectoriesAndFiles = async function(basePathToDisconnectedDirectory: string, baseConfigFile: string) {
  try {
    const basePath = `${basePathToDisconnectedDirectory}/base`;
    const fileInfo = await Deno.stat(basePath)
    .catch(() => {
      console.log("Creating project config files");
    });

    if(fileInfo && fileInfo.isDirectory) {
      console.log("Project files already found, no need to run init.");
      return;
    }

    await Deno.mkdir(basePath, { recursive: true })
    await Deno.mkdir(`${basePathToDisconnectedDirectory}/bashScripts`, { recursive: true })

    const encoder = new TextEncoder();
    const data = encoder.encode(baseConfigFile)
    Deno.writeFileSync(`${basePath}/baseConfig.json`, data)
  } catch(err) {
    console.log(err)
  }
}
