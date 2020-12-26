import { Jinaga } from "jinaga";
import { initialValue, ViewModel, ViewModelDeclaration } from "./declaration";
import { setField, Transformer } from "./mutator";

export { field } from "./specifications/field";
export { ascending, descending, hashSet, toArray } from "./specifications/hashset";
export { property } from "./specifications/property";

interface Type<T> extends Function {
    new (...args: any[]): T;
}

export function structureFor<M, VMD extends ViewModelDeclaration<M>>(modelConstructor: Type<M>, declaration: VMD) {
    type VM = ViewModel<M, VMD>;

    function begin(j: Jinaga, start: M) {
        let structure = initialValue(start, declaration);
        function setStructure(transformer: Transformer<VM>) {
            structure = transformer(structure);
        }

        const watches = Object.keys(declaration).map(fieldName => {
            const fieldDeclaration = declaration[fieldName];
            const watches = fieldDeclaration.createFieldWatches(
                (preposition, resultAdded) =>
                    j.watch(start, preposition,
                        result => resultAdded(setField(fieldName, setStructure) as any, result),
                        c => c.resultRemoved()));
            return watches;
        }).reduce((a,b) => a.concat(b));

        return {
            getValue: () => structure,
            watches
        };
    }

    return {
        query: async (j: Jinaga, start: M) => {
            const context = begin(j, start);
            await Promise.all(context.watches.map(w => w.load()));
            context.watches.forEach(w => w.stop());
            return context.getValue();
        }
    };
}