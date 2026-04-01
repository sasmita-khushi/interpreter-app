import { Token } from "@/lexer/token";

export class BooleanLiteral {
  private token: Token;
  value: boolean;

  constructor(token: Token, value: boolean) {
    this.token = token;
    this.value = value;
  }

  expressionNode(): void {}

  tokenLiteral(): string {
    return this.token.literal;
  }

  string(): string {
    return this.token.literal;
  }

  static new(token: Token, value: boolean): BooleanLiteral {
    return new BooleanLiteral(token, value);
  }
}
