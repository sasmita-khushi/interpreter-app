import { Token } from "@/lexer/token";
import { Expression } from "./ast";
import { BlockStatement } from "./block-statement";

export class IfExpression implements Expression {
  token: Token; // 'if'
  condition: Expression;
  consequence: BlockStatement;
  alternative?: BlockStatement;

  constructor(
    token: Token,
    condition: Expression,
    consequence: BlockStatement,
    alternative?: BlockStatement,
  ) {
    this.token = token;
    this.condition = condition;
    this.consequence = consequence;
    this.alternative = alternative;
  }

  expressionNode(): void {}

  tokenLiteral(): string {
    return this.token.literal;
  }

  string(): string {
    let out = "";

    out += "if";
    out += this.condition.toString();
    out += " ";
    out += this.consequence.toString();

    if (this.alternative) {
      out += "else ";
      out += this.alternative.toString();
    }

    return out;
  }
}
