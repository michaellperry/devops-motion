import { refreshAll } from "./azure-devops/refresh";
import { welcome } from "./interactive/messages";
import { initializeStore } from "./interactive/store";

async function main() {
    console.log(welcome);
    const server = await initializeStore();
    await refreshAll(server.j);
}

main().catch(err => console.error(err));
