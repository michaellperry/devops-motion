import { initializeDevOps } from "./azure-devops/initialize";
import { welcome } from "./interactive/messages";
import { initializeStore } from "./database/store";

async function main() {
    console.log(welcome);
    const server = await initializeStore();
    const reconfigure = process.argv.includes("-r");
    const azureDevOps = await initializeDevOps(server.j, reconfigure);
}

main().catch(err => console.error(err));
