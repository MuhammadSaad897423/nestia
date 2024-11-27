import ts from "typescript";

import { SdkOperationTransformer } from "./transformers/SdkOperationTransformer";

export const transform = (
  program: ts.Program,
): ts.TransformerFactory<ts.SourceFile> =>
  SdkOperationTransformer.iterateFile(program.getTypeChecker());
export default transform;
