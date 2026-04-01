import { Token } from "@/lexer/token";

export interface AstNode {
  tokenLiteral(): string;
  string(): string; //“The string() method converts an AST node (and all its child nodes) back into a human-readable source code string. It’s mainly used for testing, debugging, and seeing what the parsed program looks like in normal code form.”
}

//Instruction
export interface Statement extends AstNode {
  statementNode(): void;
}

//Value
export interface Expression extends AstNode {
  expressionNode(): void;
}

//Number
//IntegerLiteral is an AST node that represents numeric values,
//storing both the original token and its parsed numeric value.

export class IntegerLiteral implements Expression {
  token: Token; // the original token (e.g. INT token with "5")
  value: number; // actual numeric value (e.g. 5)

  constructor(token: Token, value: number) {
    this.token = token;
    this.value = value;
  }

  // returns the literal string from token
  tokenLiteral(): string {
    return this.token.literal;
  }

  public expressionNode(): void {}

  public string(): string {
    return this.token.literal;
  }
  public static new(token: Token, value: number): IntegerLiteral {
    return new IntegerLiteral(token, value);
  }
}
