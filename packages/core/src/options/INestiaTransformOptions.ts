export interface INestiaTransformOptions {
  validate?: INestiaTransformOptions.Validate;
  stringify?: INestiaTransformOptions.Stringify | null;
  throws?: boolean;
}
export namespace INestiaTransformOptions {
  export type Validate =
    // NORMAL
    | "assert"
    | "is"
    | "validate"
    // STRICT
    | "assertEquals"
    | "equals"
    | "validateEquals"
    // CLONE
    | "assertClone"
    | "validateClone"
    // PRUNE
    | "assertPrune"
    | "validatePrune";

  export type Stringify =
    | "stringify"
    | "assert"
    | "is"
    | "validate"
    | "validate.log";
}
