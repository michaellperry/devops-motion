export type Transformer<T> = (oldValue: T) => T;

export type Mutator<T> = (transformer: Transformer<T>) => void;

export function setField<VM, K extends keyof VM>(fieldName: K, mutator: Mutator<VM>): Mutator<VM[K]> {
    return transformer => mutator(vm => Object.assign({}, vm, {
        [fieldName]: transformer(vm[fieldName])
    }));
}