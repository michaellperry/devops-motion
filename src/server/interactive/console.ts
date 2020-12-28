import { createInterface } from "readline";

export interface Console {
    question(output: string, defaultValue?: string): Promise<string>;
    question<T>(output: string, defaultValue: string, parse?: (input: string) => T): Promise<T>;
    password(output: string): Promise<string>;
    write(output: string): void;
}

export async function withConsole<T>(action: ((console: Console) => Promise<T>)) {
    let muted = false;
    const outStream: NodeJS.WritableStream = process.stdout;
    const write: any = (str: string, arg2: any, arg3: any) => {
        if (muted) {
            str = "*";
        }
        return outStream.write(str, arg2, arg3);
    }

    const mutableStream: NodeJS.WritableStream = {
        ...outStream,
        write: write
    };

    const i = createInterface(process.stdin, process.stdout);

    try {
        return await action({
            question: async <T>(output: string, defaultValue: string, parse?: (input: string) => T) => {
                const query = defaultValue ? `  ${output} (default ${defaultValue}): ` : `  ${output}: `;
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
            password: async(output: string) => {
                muted = true;
                try {
                    return await new Promise<string>((resolve, error) => {
                        i.question(`  ${output}: `, (answer) => resolve(answer));
                    });
                }
                finally {
                    muted = false;
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
