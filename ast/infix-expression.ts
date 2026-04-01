import { Token } from "@/lexer/token";
import { Expression } from "../ast/ast";

export class infixExpression implements Expression {
  token: Token;
  left: Expression;
  operator: string;
  right: Expression;

  constructor(token: Token, left: Expression, operator: string) {
    this.token = token;
    this.left = left;
    this.operator = operator;
    this.right = null as any; // will be set later when parsing the right-hand side
  }

  expressionNode(): void {}

  tokenLiteral(): string {
    return this.token.literal;
  }

  string(): string {
    return `(${this.left.string()} ${this.operator} ${this.right.string()})`;
  }

  static new(
    token: Token,
    left: Expression,
    operator: string,
  ): infixExpression {
    return new infixExpression(token, left, operator);
  }
}
