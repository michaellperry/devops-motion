import read from "read";
import { assertIsError } from "@shared/error";

export function readQuestion(output: string, defaultValue?: string): Promise<string>;
export function readQuestion<T>(output: string, defaultValue: string, parse?: (input: string) => T): Promise<T>;
export async function readQuestion<T>(output: string, defaultValue?: string, parse?: (input: string) => T): Promise<T | string> {
    const query = defaultValue ? `  ${output} (default ${defaultValue}): ` : `  ${output}: `;
    while (true) {
        try {
            const entered = await new Promise<string>((resolve, error) => {
                read({
                    prompt: query
                }, (err, answer) => {
                    if (err) {
                        error(err);
                    }
                    else {
                        resolve(answer);
                    }
                });
            });
            const input = entered || defaultValue || "";
            const value = parse ? parse(input) : input;
            return value;
        }
        catch (err) {
            assertIsError(err);
            if (err.message === "canceled") {
                process.exit(1);
            }
            console.log(err.message);
        }
    }
}

export async function readPassword(output: string) {
    return await new Promise<string>((resolve, error) => {
        read({
            prompt: `  ${output}: `,
            silent: true,
            replace: "*"
        }, (err, answer) => {
            if (err) {
                error(err);
            }
            else {
                resolve(answer);
            }
        });
    });
}

export async function write(output: string) {
    console.log(output);
}
