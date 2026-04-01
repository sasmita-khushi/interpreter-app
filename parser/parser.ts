import { Expression, IntegerLiteral } from "@/ast/ast";
import { Program } from "@/ast/program";
import { Identifier } from "@/ast/identifier";
import { ExpressionStatement } from "@/ast/expression-statement";
import { LetStatement } from "@/ast/let-statement";
import { ReturnStatement } from "@/ast/return-statement";
import { Lexer } from "@/lexer/lexer";
import { Token, TokenType } from "@/lexer/token";
import { PrefixExpression } from "../ast/prefix-expression";

enum Precedence {
  LOWEST = 1,
  EQUALS = 2,
  LESSGREATER = 3,
  SUM = 4,
  PRODUCT = 5,
  PREFIX = 6,
  CALL = 7,
}

type PrefixParseFn = () => Expression | null;
type InfixParseFn = (left: Expression) => Expression;

export class Parser {
  private lexer: Lexer; //gives token
  private curToken?: Token; //current token
  private peekToken?: Token; //next token
  private errors: string[] = []; //store parsing errors
  private prefixParseFns: Map<TokenType, PrefixParseFn> = new Map();
  private infixParseFns: Map<TokenType, InfixParseFn> = new Map();

  constructor(lexer: Lexer) {
    this.lexer = lexer;
  }

  private nextToken() {
    this.curToken = this.peekToken;
    this.peekToken = this.lexer.nextToken();
  }

  public static new(lexer: Lexer): Parser {
    const parser = new Parser(lexer);
    parser.nextToken();
    parser.nextToken();
    parser.registerPrefix(TokenType.IDENT, () => parser.parseIdentifier());
    parser.registerPrefix(TokenType.INT, () => parser.parseIntegerLiteral());
    parser.registerPrefix(TokenType.BANG, () => parser.parsePrefixExpression());
    parser.registerPrefix(TokenType.MINUS, () =>
      parser.parsePrefixExpression(),
    );
    return parser;
  }

  curTokenIs(type: TokenType): boolean {
    return this.curToken?.type === type;
  }

  peekTokenIs(type: TokenType): boolean {
    return this.peekToken?.type === type;
  }

  public getErrors(): string[] {
    return this.errors;
  }

  // 🔥 parseProgram

  public parseProgram(): Program {
    const program = Program.new();

    while (this.curToken?.type !== TokenType.EOF) {
      const stmt = this.parseStatement();

      if (stmt) {
        program.statements.push(stmt);
      }

      this.nextToken();
    }

    return program;
  }

  // 🔥 parseLetStatement

  private parseLetStatement(): LetStatement | null {
    const stmt = LetStatement.new(this.curToken!);

    // move to identifier
    this.nextToken();

    if (!this.curToken) return null;

    stmt.name = this.parseIdentifier();

    // expect =
    if (!this.expectPeek(TokenType.ASSIGN)) {
      return null;
    }

    // move to expression
    this.nextToken();

    const expression = this.parseExpression(Precedence.LOWEST);
    if (!expression) {
      return null;
    }
    stmt.value = expression;

    // optional ;
    if (this.peekToken?.type === TokenType.SEMICOLON) {
      this.nextToken();
    }

    return stmt;
  }

  //parse return statement

  private parseReturnStatement(): ReturnStatement {
    const stmt = new ReturnStatement(this.curToken!);

    this.nextToken();

    // TODO: We're skipping the expressions until we encounter a semicolon
    while (
      !this.curTokenIs(TokenType.SEMICOLON) &&
      !this.curTokenIs(TokenType.EOF)
    ) {
      this.nextToken();
    }
    return stmt;
  }

  // 🔥 Parse Statement
  private parseStatement() {
    switch (this.curToken?.type) {
      case TokenType.LET:
        return this.parseLetStatement();
      case TokenType.RETURN:
        return this.parseReturnStatement();
      default:
        return this.parseExpressionStatement();
    }
  }

  //parse expression statement

  private parseExpressionStatement(): ExpressionStatement | undefined {
    // const expr = this.parseExpression(Precedence.LOWEST);

    // if (!expr) {
    //   return undefined;
    // }

    const stmt = ExpressionStatement.new(this.curToken!);
    const expr = this.parseExpression(Precedence.LOWEST);
    if (!expr) {
      return undefined;
    }
    stmt.expression = expr;

    if (this.peekTokenIs(TokenType.SEMICOLON)) {
      this.nextToken();
    }

    return stmt;
  }
  // 🔤 parseIdentifier

  private parseIdentifier(): Identifier {
    return new Identifier(this.curToken!, this.curToken!.literal);
  }

  // 🔢 parseIntegerLiteral

  parseIntegerLiteral(): Expression {
    const lit = IntegerLiteral.new(this.curToken!, 0);
    const value = parseInt(this.curToken!.literal, 10);

    if (isNaN(value)) {
      const msg = `could not parse "${this.curToken!.literal}" as integer`;
      this.errors.push(msg);
      return lit;
    }

    lit.value = value;

    return lit;
  }

  // 🔢 parseExpression (basic)
  private parseExpression(precedence: number): Expression | null {
    const prefix = this.prefixParseFns.get(this.curToken!.type);
    if (!prefix) {
      this.noPrefixParserFnError(this.curToken!.type);
      return null;
    }
    const leftExp = prefix();
    return leftExp;
  }

  // 🧠 Helper functions
  private expectPeek(type: TokenType): boolean {
    if (this.peekToken?.type === type) {
      this.nextToken();
      return true;
    } else {
      this.peekError(type);
      return false;
    }
  }
  private peekError(type: TokenType) {
    const msg = `expected next token to be ${type}, got ${this.peekToken?.type} instead`;
    this.errors.push(msg);
  }

  private registerPrefix(type: TokenType, fn: PrefixParseFn) {
    this.prefixParseFns.set(type, fn);
  }
  private registerInfix(type: TokenType, fn: InfixParseFn) {
    this.infixParseFns.set(type, fn);
  }

  parsePrefixExpression(): Expression | null {
    const expression = PrefixExpression.new(
      this.curToken!,

      this.curToken!.literal,
    );
    this.nextToken();

    const right = this.parseExpression(Precedence.PREFIX);
    if (!right) {
      return null;
    }
    expression.right = right;

    return expression;
  }

  private noPrefixParserFnError(t: TokenType) {
    const msg = `no prefix parse function for ${t} found`;
    this.errors.push(msg);
    return null;
  }
}
