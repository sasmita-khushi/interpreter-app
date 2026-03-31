import { Statement, Expression } from "./ast";
import { Token } from "@/lexer/token";
import { Identifier } from "./identifier";

export class LetStatement implements Statement {
  token: Token; // 'let'
  name!: Identifier;
  value!: Expression;

  static new(token: Token) {
    return new LetStatement(token);
  }

  constructor(token: Token) {
    this.token = token;
  }

  statementNode() {}

  tokenLiteral() {
    return this.token.literal;
  }

  string(): string {
    let out = "";
    out += this.tokenLiteral() + " "; // "let "
    out += this.name.string(); // "myVar"
    out += " = ";
    if (this.value != null) {
      out += this.value.string(); // "anotherVar"
    }
    out += ";";
    return out;
  }
}
