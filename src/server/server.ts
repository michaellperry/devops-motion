import { refreshAll } from "./azure-devops/refresh";
import { initializeStore } from "./store";

async function main() {
    const j = await initializeStore();
    await refreshAll(j);
}

main().catch(err => console.error(err));
