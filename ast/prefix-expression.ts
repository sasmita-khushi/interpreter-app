import { Token } from "@/lexer/token";
import { Expression } from "../ast/ast";

export class PrefixExpression implements Expression {
  token: Token; // The prefix token, e.g. !
  operator: string;
  right?: Expression;

  constructor(token: Token, operator: string) {
    this.token = token;
    this.operator = operator;
  }

  // Just to distinguish
  expressionNode(): void {}

  tokenLiteral(): string {
    return this.token.literal;
  }

  // It converts your AST node back into a readable string
  string(): string {
    return `(${this.operator}${this.right?.string() ?? ""})`;
  }

  static new(token: Token, operator: string): PrefixExpression {
    return new PrefixExpression(token, operator);
  }
}
