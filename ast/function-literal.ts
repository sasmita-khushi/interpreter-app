import { Token } from "@/lexer/token";
import { Identifier } from "./identifier";
import { BlockStatement } from "./block-statement";
import { Expression } from "../ast/ast";

export class FunctionLiteral implements Expression {
  token: Token;
  parameters: Identifier[];
  body: BlockStatement;

  constructor(token: Token, parameters: Identifier[], body: BlockStatement) {
    this.token = token;
    this.parameters = parameters;
    this.body = body;
  }

  expressionNode(): void {}

  tokenLiteral(): string {
    return this.token.literal;
  }

  string(): string {
    let out = "";
    const params = this.parameters.map((p) => p.string()).join(", ");
    out += this.tokenLiteral();
    out += "(";
    out += params;
    out += ") ";
    out += this.body.string();
    return out;
  }
}
