import { Token } from "@/lexer/token";
import { Expression } from "./ast";

export class CallExpression {
  token: Token; // The '(' token
  func: Expression; // Identifier or FunctionLiteral
  args: Expression[];

  constructor(token: Token, func: Expression, args: Expression[] = []) {
    this.token = token;
    this.func = func;
    this.args = args;
  }

  expressionNode(): void {}

  tokenLiteral(): string {
    return this.token.literal;
  }

  string(): string {
    const argsStr = this.args.map((arg) => arg.string()).join(", ");
    return `${this.func.string()}(${argsStr})`;
  }
}
