import { Jinaga as j } from "jinaga";

export class Device {
    static Type = "Jinaga.Device";
    public type = Device.Type;

    constructor(
    ) { }
}

export class Configuration {
    static Type = "DevOpsMotion.Configuration";
    public type = Configuration.Type;

    constructor(
        public device: Device,
        public organization: string,
        public project: string,
        public apiSecret: string,
        public prior: Configuration[]
    ) { }

    static forDevice(device: Device) {
        return j.match(<Configuration>{
            type: Configuration.Type,
            device
        }).suchThat(Configuration.isCurrent);
    }

    static isCurrent(next: Configuration) {
        return j.notExists(<Configuration>{
            type: Configuration.Type,
            prior: [next]
        });
    }
}
