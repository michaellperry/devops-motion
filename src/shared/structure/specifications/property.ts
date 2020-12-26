import { Preposition } from "jinaga";
import { BeginWatch, FieldDeclaration, WatchContext } from "../declaration";
import { Mutator } from "../mutator";

export function property<M, U, T>(
    preposition: Preposition<M, U>,
    selector: (m: U) => T,
    initialValue: T
): FieldDeclaration<M, T> {
    function createFieldWatches(
        beginWatch: BeginWatch<M>
    ) {
        function resultAdded(mutator: Mutator<unknown>, child: U): WatchContext {
            mutator(() => selector(child));
            return {
                mutator: () => {},
                resultRemoved: () => {}
            };
        }

        const watch = beginWatch(preposition, resultAdded);

        return [watch];
    }

    return {
        initialFieldValue: () => initialValue,
        createFieldWatches
    };
}
