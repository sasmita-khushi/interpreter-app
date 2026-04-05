import { BlockStatement } from "@/ast/block-statement";
import { Identifier } from "@/ast/identifier";
import { Environment } from "./environment";
import { Object, ObjectType } from "./object";

export const FUNCTION_OBJ: ObjectType = "FUNCTION";

export class FunctionObject implements Object {
  parameters: Identifier[];
  body: BlockStatement;
  env: Environment;

  constructor(
    parameters: Identifier[],
    body: BlockStatement,
    env: Environment,
  ) {
    this.parameters = parameters;
    this.body = body;
    this.env = env;
  }

  Type(): ObjectType {
    return FUNCTION_OBJ;
  }

  Inspect(): string {
    const params = this.parameters
      .map((parameter) => parameter.string())
      .join(", ");
    return `fn(${params}) { ${this.body.string()} }`;
  }
}
