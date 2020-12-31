import { Story } from "./story";

export class Task {
    static Type = "DevOpsMotion.Task";
    type = Task.Type;

    constructor(
        public story: Story,
        public id: number
    ) { }
}