import { Token } from "@/lexer/token";
import { Statement } from "./ast";

export class BlockStatement implements Statement {
  token: Token; // '{'
  statements: Statement[];

  constructor(token: Token, statements: Statement[] = []) {
    this.token = token;
    this.statements = statements;
  }

  statementNode(): void {}

  tokenLiteral(): string {
    return this.token.literal;
  }

  string(): string {
    let out = "";

    for (const stmt of this.statements) {
      out += stmt.string();
    }

    return out;
  }
}
