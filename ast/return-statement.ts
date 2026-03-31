import { Token } from "@/lexer/token";
import { Statement, Expression } from "./ast";

export class ReturnStatement implements Statement {
  token: Token; // the 'return' token
  returnValue?: Expression; // expression after return

  constructor(token: Token) {
    this.token = token;
  }

  statementNode(): void {
    // empty method (just to satisfy interface)
  }

  tokenLiteral(): string {
    return this.token.literal;
  }

  string(): string {
    return this.returnValue?.string() ?? this.token.literal;
  }
}
