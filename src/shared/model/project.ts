import { Jinaga as j } from "jinaga";

export class Organization {
    static Type = "DevOpsMotion.Organization";
    public type = Organization.Type;

    constructor(
        public organization: string
    ) { }
}

export class Project {
    static Type = "DevOpsMotion.Project";
    public type = Project.Type;

    constructor(
        public organization: Organization,
        public project: string
    ) { }
}