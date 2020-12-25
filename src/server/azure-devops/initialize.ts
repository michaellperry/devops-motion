import { Jinaga } from "jinaga";
import { withConsole, Console } from "../interactive/console";
import { devOpsAdvice, errorMessage, getAccessToken, settingUpAzureDevOps, settingUpAzureDevOpsAgain } from "../interactive/messages";
import { Configuration, Device } from "./configuration";
import { AzureDevOps } from "./proxy";

export async function initializeDevOps(j: Jinaga): Promise<AzureDevOps> {
    const device = await j.local<Device>();
    const configurations = await j.query(device, j.for(Configuration.forDevice));

    const configuration = configurations.length === 1 ? configurations[0] :
        await withConsole(console => setUpAzureDevOps(console, device, configurations));

    return new AzureDevOps(configuration.organization, configuration.project, configuration.apiSecret);
}

async function setUpAzureDevOps(console: Console, device: Device, prior: Configuration[]) : Promise<Configuration> {
    while (true) {
        if (prior.length === 0) {
            console.write(settingUpAzureDevOps);
        }
        else {
            console.write(settingUpAzureDevOpsAgain);
        }
    
        const organization = await console.question("Organization");
        const project = await console.question("Project");
        console.write("\n");
        if (!isValidOrganization(organization)) {
            console.write("Organization is required.");
            continue;
        }
        if (!isValidProject(project)) {
            console.write("Project is required.");
            continue;
        }

        console.write(getAccessToken(organization));

        const accessToken = await console.question("Access token");
        console.write("\n");

        const proxy = new AzureDevOps(organization, project, accessToken);

        try {
            const releaseDefinitions = await proxy.listReleaseDefinitions();
            const releaseDefinitionNames = releaseDefinitions.map(d => d.name);
            // console.write(selectReleaseDefinition(releaseDefinitionNames))
        }
        catch (err) {
            console.write(errorMessage(devOpsAdvice(organization, project), err));
            continue;
        }
    }
}

function isValidOrganization(organization: string) {
    if (!organization) {
        return false;
    }

    return true;
}

function isValidProject(project: string) {
    if (!project) {
        return false;
    }

    return true;
}