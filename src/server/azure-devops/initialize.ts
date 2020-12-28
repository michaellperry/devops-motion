import { Organization, Project } from "@shared/model/project";
import { Jinaga } from "jinaga";
import { Console, withConsole } from "../interactive/console";
import { devOpsAdvice, errorMessage, getAccessToken, reconfiguringAzureDevOps, settingUpAzureDevOps, settingUpAzureDevOpsAgain, success } from "../interactive/messages";
import { Configuration, Device } from "./configuration";
import { AzureDevOps } from "./proxy";

export async function initializeDevOps(j: Jinaga, reconfigure: boolean): Promise<Configuration> {
    const device = await j.local<Device>();
    const configurations = await j.query(device, j.for(Configuration.forDevice));

    const configuration = (configurations.length === 1 && !reconfigure) ? configurations[0] :
        await withConsole(console => setUpAzureDevOps(console, j, device, configurations));

    return configuration;
}

async function setUpAzureDevOps(console: Console, j: Jinaga, device: Device, prior: Configuration[]) : Promise<Configuration> {
    while (true) {
        if (prior.length === 0) {
            console.write(settingUpAzureDevOps);
        }
        else if (prior.length === 1) {
            console.write(reconfiguringAzureDevOps);
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

        const accessToken = await console.password("Access token");
        console.write("\n");

        const proxy = new AzureDevOps(organization, project, accessToken);

        try {
            await proxy.listReleaseDefinitions();
            console.write(success);
        }
        catch (err) {
            console.write(errorMessage(devOpsAdvice(organization, project), err));
            continue;
        }

        const organizationFact = new Organization(organization);
        const projectFact = new Project(organizationFact, project);
        const configuration = new Configuration(
            device, projectFact, accessToken, prior);
        return await j.fact(configuration);
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