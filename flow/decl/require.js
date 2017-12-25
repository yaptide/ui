/* @flow */

declare var require: {
    (id: string): any;
    ensure(ids: Array<string>, callback?: { (require: typeof require): void }, chunk?: string): void
}
declare var BASE_URL: bool;
