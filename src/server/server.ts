import { initializeDevOps } from "./azure-devops/initialize";
import { welcome } from "./interactive/messages";
import { initializeStore } from "./database/store";

async function main() {
    console.log(welcome);
    const server = await initializeStore();
    const reconfigure = process.argv[2] === "-r";
    console.log(reconfigure ? "I'm ready to reconfigure": "nope!");
    const azureDevOps = await initializeDevOps(server.j, reconfigure);
}

main().catch(err => console.error(err));
