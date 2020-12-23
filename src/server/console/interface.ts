import { createInterface } from "readline";

export interface Console {
    question(output: string): Promise<string>;
}

export async function withConsole(action: ((console: Console) => Promise<void>)) {
    const i = createInterface(process.stdin, process.stdout);

    try {
        await action({
            question: (output) => {
                return new Promise<string>((resolve, error) => {
                    i.question(output, (answer) => resolve(answer));
                });
            }
        });
    }
    finally {
        i.close();
    }
}