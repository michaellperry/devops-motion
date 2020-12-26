import { Mutator } from "./mutator";
import { Preposition, Watch } from "jinaga";

export interface WatchContext {
    mutator: Mutator<any>;
    resultRemoved(): void;
}

export type BeginWatch<M> = <U, VM>(
    preposition: Preposition<M, U>,
    resultAdded: (mutator: Mutator<VM>, child: U) => WatchContext
) => Watch<U, WatchContext>;

export interface FieldDeclaration<M, T> {
    initialFieldValue(m: M): T;
    createFieldWatches(
        beginWatch: BeginWatch<M>
    ): Watch<any, WatchContext>[];
}

export type ViewModelDeclaration<M> = {
    [fieldName: string]: FieldDeclaration<M, any>;
};

type FieldType<M, D> = D extends FieldDeclaration<M, infer T> ? T : never;

export type ViewModel<M, D> = {
    [F in keyof D]: FieldType<M, D[F]>;
};

export function initialValue<M, D extends ViewModelDeclaration<M>>(m: M, declaration: D) {
    return Object.keys(declaration)
        .reduce((vm, fieldName) => Object.assign({}, vm, {
            [fieldName]: declaration[fieldName].initialFieldValue(m)
        }), {} as ViewModel<M, D>);
}
