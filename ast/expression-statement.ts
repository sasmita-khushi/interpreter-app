import { Expression, Statement } from "./ast";
import { Token } from "@/lexer/token";

//ExpressionStatement = a bridge between expressions and statements
export class ExpressionStatement implements Statement {
  private token: Token; // the first token of the expression
  expression?: Expression;

  public statementNode(): void {} //to distinguish between statements and expressions (empty method)

  public tokenLiteral(): string {
    return this.token.literal;
  }

  public string(): string {
    return this.expression?.string() || "";
  }

  public static new(token: Token): ExpressionStatement {
    return new ExpressionStatement(token);
  }

  constructor(token: Token) {
    this.token = token;
  }
}
