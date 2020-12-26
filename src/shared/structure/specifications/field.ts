import { FieldDeclaration } from "../declaration";

export function field<M, T>(
    selector: (m: M) => T
): FieldDeclaration<M, T> {
    return {
        initialFieldValue: m => selector(m),
        createFieldWatches: () => []
    };
}
