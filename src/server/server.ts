import { initializeDevOps } from "./azure-devops/initialize";
import { welcome } from "./interactive/messages";
import { initializeStore } from "./database/store";

async function main() {
    console.log(welcome);
    const server = await initializeStore();
    const configuration = await initializeDevOps(server.j);
}

main().catch(err => console.error(err));
