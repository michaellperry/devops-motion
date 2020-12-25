import { Jinaga } from "jinaga";
import { Console, withConsole } from "../interactive/console";
import { devOpsAdvice, errorMessage, getAccessToken, selectReleaseDefinition, settingUpAzureDevOps, settingUpAzureDevOpsAgain } from "../interactive/messages";
import { Configuration, Device } from "./configuration";
import { AzureDevOps } from "./proxy";
import { ReleaseDefinition } from "./release-definition";

export async function initializeDevOps(j: Jinaga): Promise<Configuration> {
    const device = await j.local<Device>();
    const configurations = await j.query(device, j.for(Configuration.forDevice));

    const configuration = configurations.length === 1 ? configurations[0] :
        await withConsole(console => setUpAzureDevOps(console, j, device, configurations));

    return configuration;
}

async function setUpAzureDevOps(console: Console, j: Jinaga, device: Device, prior: Configuration[]) : Promise<Configuration> {
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

        let releaseDefinitionId: number;
        try {
            const releaseDefinitions = await proxy.listReleaseDefinitions();
            releaseDefinitionId = await inputReleaseDefinition(console, releaseDefinitions);
        }
        catch (err) {
            console.write(errorMessage(devOpsAdvice(organization, project), err));
            continue;
        }

        const configuration = new Configuration(
            device, organization, project, accessToken, releaseDefinitionId, prior);
        return await j.fact(configuration);
    }
}

async function inputReleaseDefinition(console: Console, releaseDefinitions: ReleaseDefinition[]) {
    while (true) {
        console.write(selectReleaseDefinition(releaseDefinitions.map(d => d.name)));
        const releaseDefinitionName = await console.question("Release pipeilne");
        const releaseDefinition = releaseDefinitions.find(d => d.name === releaseDefinitionName);
        if (!releaseDefinition) {
            console.write("Please select one of the release pipelines.");
            continue;
        }

        return releaseDefinition.id;
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