
export async function validateResponse(response: Response) {
    if (!response.ok) {
        const body = await response.text();
        const message = body || response.statusText;
        throw new Error(message);
    }
}