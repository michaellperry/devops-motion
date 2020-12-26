import { Jinaga, Preposition } from "jinaga";
import { FieldDeclaration, initialValue, ViewModel, ViewModelDeclaration } from "../declaration";
import { Mutator, setField } from "../mutator";

export type HashSet<VM> = { [hash: string]: VM };

function addObject<VM>(hash: string, vm: VM, mutator: Mutator<HashSet<VM>>) {
    mutator(collection => Object.assign({}, collection, {
        [hash]: vm
    }));
}

function mutateObject<VM>(hash: string, mutator: Mutator<HashSet<VM>>): Mutator<VM> {
    return transformer => mutator(collection => Object.assign({}, collection, {
        [hash]: transformer(collection[hash])
    }));
}

function removeObject<VM>(hash: string, mutator: Mutator<HashSet<VM>>) {
    mutator(collection => {
        const { [hash]: removed, ...result } = collection;
        return result;
    });
}

export function toArray<VM>(hashSet: HashSet<VM>, orderBy: (a: VM, b: VM) => number): VM[] {
    return Object.keys(hashSet)
        .map(hash => hashSet[hash])
        .sort(orderBy);
}

export function ascending<VM, T>(field: (obj: VM) => T): (a: VM, b: VM) => number {
    return (a, b) => {
        const fa = field(a);
        const fb = field(b);
        return fa < fb ? -1 : fa > fb ? 1 : 0;
    };
}

export function descending<VM, T>(field: (obj: VM) => T): (a: VM, b: VM) => number {
    return (a, b) => {
        const fa = field(a);
        const fb = field(b);
        return fa > fb ? -1 : fa < fb ? 1 : 0;
    };
}

export function hashSet<M, U, D extends ViewModelDeclaration<U>>(
    preposition: Preposition<M, U>,
    declaration: D
): FieldDeclaration<M, HashSet<ViewModel<U, D>>> {
    return {
        initialFieldValue: () => ({}),
        createFieldWatches: beginWatch => {
            const watch = beginWatch<U, HashSet<ViewModel<U, D>>>(preposition, (mutator, child) => {
                const hash = Jinaga.hash(child);

                addObject(hash, initialValue(child, declaration), mutator);
                return {
                    mutator: mutateObject(hash, mutator),
                    resultRemoved: () => {
                        removeObject(hash, mutator);
                    }
                };
            });

            for (const fieldName in declaration) {
                const fieldDeclaration = declaration[fieldName];
                fieldDeclaration.createFieldWatches(
                    (preposition, resultAdded) =>
                        watch.watch(preposition,
                            (parent, result) => resultAdded(setField(fieldName, parent.mutator), result),
                            c => c.resultRemoved()));
            }
    
            return [watch];
        }
    };
}
