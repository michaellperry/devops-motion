import { createInterface } from "readline";

export interface Console {
    question(output: string): Promise<string>;
    write(output: string): void;
}

export async function withConsole(action: ((console: Console) => Promise<void>)) {
    const i = createInterface(process.stdin, process.stdout);

    try {
        await action({
            question: (output) => {
                return new Promise<string>((resolve, error) => {
                    i.question(output, (answer) => resolve(answer));
                });
            },
            write: (output) => {
                i.write(output);
            }
        });
    }
    finally {
        i.close();
    }
}