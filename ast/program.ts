import { AstNode, Statement } from "@/ast/ast";

export class Program implements AstNode {
  statements: Statement[];

  private constructor(statements: Statement[] = []) {
    this.statements = statements;
  }

  public static new(): Program {
    return new Program([]);
  }

  public tokenLiteral(): string {
    if (this.statements.length > 0) {
      return this.statements[0].tokenLiteral();
    } else {
      return "";
    }
  }

  public string(): string {
    return this.statements.map((stmt) => stmt.string()).join("");
  }
}
