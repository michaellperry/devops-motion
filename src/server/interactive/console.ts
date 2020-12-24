import { createInterface } from "readline";

export interface Console {
    question(output: string, defaultValue?: string): Promise<string>;
    question<T>(output: string, defaultValue: string, parse?: (input: string) => T): Promise<T>;
    write(output: string): void;
}

export async function withConsole<T>(action: ((console: Console) => Promise<T>)) {
    const i = createInterface(process.stdin, process.stdout);

    try {
        return await action({
            question: async <T>(output: string, defaultValue: string, parse?: (input: string) => T) => {
                const query = defaultValue ? `${output} (default ${defaultValue}): ` : `${output}: `;
                while (true) {
                    try {
                        const entered = await new Promise<string>((resolve, error) => {
                            i.question(query, (answer) => resolve(answer));
                        });
                        const input = entered || defaultValue;
                        const value = parse ? parse(input) : input;
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
