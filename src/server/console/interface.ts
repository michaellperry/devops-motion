import { createInterface } from "readline";

export interface Console {
    question<T>(output: string, defaultValue: string, parse: (input: string) => T): Promise<T>;
    write(output: string): void;
}

export async function withConsole(action: ((console: Console) => Promise<void>)) {
    const i = createInterface(process.stdin, process.stdout);

    try {
        await action({
            question: async (output, defaultValue, parse) => {
                const query = defaultValue ? `${output} (default ${defaultValue}): ` : `${output}: `;
                while (true) {
                    try {
                        const entered = await new Promise<string>((resolve, error) => {
                            i.question(query, (answer) => resolve(answer));
                        });
                        const input = entered || defaultValue;
                        const value = parse(input);
                        return value;
                    }
                    catch (err) {
                        i.write(err.message + "\n");
                    }
                }
            },
            write: (output) => {
                i.write(output + "\n");
            }
        });
    }
    finally {
        i.close();
    }
}