import { Organization, Project } from "@shared/model/project";
import { Jinaga } from "jinaga";
import { readPassword, readQuestion, write } from "../interactive/interactive";
import { devOpsAdvice, errorMessage, getAccessToken, reconfiguringAzureDevOps, settingUpAzureDevOps, settingUpAzureDevOpsAgain, success } from "../interactive/messages";
import { Configuration, Device } from "./configuration";
import { AzureDevOps } from "./proxy";

export async function initializeDevOps(j: Jinaga, reconfigure: boolean): Promise<Configuration> {
    const device = await j.local<Device>();
    const configurations = await j.query(device, j.for(Configuration.forDevice));

    const configuration = (configurations.length === 1 && !reconfigure) ? configurations[0] :
        await setUpAzureDevOps(j, device, configurations);

    return configuration;
}

async function setUpAzureDevOps(j: Jinaga, device: Device, prior: Configuration[]) : Promise<Configuration> {
    while (true) {
        if (prior.length === 0) {
            write(settingUpAzureDevOps);
        }
        else if (prior.length === 1) {
            write(reconfiguringAzureDevOps);
        }
        else {
            write(settingUpAzureDevOpsAgain);
        }
    
        const organization = await readQuestion("Organization");
        const project = await readQuestion("Project");
        write("\n");
        if (!isValidOrganization(organization)) {
            write("Organization is required.");
            continue;
        }
        if (!isValidProject(project)) {
            write("Project is required.");
            continue;
        }

        write(getAccessToken(organization));

        const accessToken = await readPassword("Access token");
        write("\n");

        const proxy = new AzureDevOps(organization, project, accessToken);

        try {
            await proxy.listReleaseDefinitions();
            write(success);
        }
        catch (err) {
            write(errorMessage(devOpsAdvice(organization, project), err));
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