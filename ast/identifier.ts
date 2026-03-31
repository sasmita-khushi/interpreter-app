import { Token } from "@/lexer/token";
import { Expression } from "./ast";

export class Identifier implements Expression {
  token: Token;
  value: string;

  constructor(token: Token, value: string) {
    this.token = token;
    this.value = value;
  }

  public static new(token: Token, value: string): Identifier {
    return new Identifier(token, value);
  }

  public expressionNode(): void {}
  public tokenLiteral(): string {
    return this.token.literal;
  }
  public string(): string {
    return this.value;
  }
}
