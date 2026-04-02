import { Expression, IntegerLiteral } from "@/ast/ast";
import { Program } from "@/ast/program";
import { Identifier } from "@/ast/identifier";
import { ExpressionStatement } from "@/ast/expression-statement";
import { LetStatement } from "@/ast/let-statement";
import { ReturnStatement } from "@/ast/return-statement";
import { Lexer } from "@/lexer/lexer";
import { Token, TokenType } from "@/lexer/token";
import { PrefixExpression } from "../ast/prefix-expression";
import { infixExpression } from "../ast/infix-expression";
import { trace, untrace } from "../trace";
import { BooleanLiteral } from "../ast/boolean-literal";
import { IfExpression } from "@/ast/if-expression";
import { BlockStatement } from "../ast/block-statement";

enum Precedence {
  LOWEST = 1,
  EQUALS = 2, // == or !=
  LESSGREATER = 3, // > or <
  SUM = 4, // + or -
  PRODUCT = 5, // * or /
  PREFIX = 6, // ! or -a
  CALL = 7, // function calls
}

const precendences = new Map<TokenType, Precedence>([
  [TokenType.EQ, Precedence.EQUALS],
  [TokenType.NOT_EQ, Precedence.EQUALS],
  [TokenType.LT, Precedence.LESSGREATER],
  [TokenType.GT, Precedence.LESSGREATER],
  [TokenType.PLUS, Precedence.SUM],
  [TokenType.MINUS, Precedence.SUM],
  [TokenType.SLASH, Precedence.PRODUCT],
  [TokenType.ASTERISK, Precedence.PRODUCT],
]);

type PrefixParseFn = () => Expression | null;
type InfixParseFn = (left: Expression) => Expression | null;

export class Parser {
  private lexer: Lexer; //gives token
  private curToken?: Token; //current token
  private peekToken?: Token; //next token
  private errors: string[] = []; //store parsing errors
  private prefixParseFns: Map<TokenType, PrefixParseFn> = new Map();
  private infixParseFns: Map<TokenType, InfixParseFn> = new Map();

  constructor(lexer: Lexer) {
    this.lexer = lexer;
    this.nextToken();
    this.nextToken();
    this.registerPrefix(TokenType.IDENT, () => this.parseIdentifier());
    this.registerPrefix(TokenType.INT, () => this.parseIntegerLiteral());
    this.registerPrefix(TokenType.BANG, () => this.parsePrefixExpression());
    this.registerPrefix(TokenType.MINUS, () => this.parsePrefixExpression());
    this.registerPrefix(
      TokenType.LPAREN,
      this.parseGroupedExpression.bind(this),
    );
    this.registerPrefix(TokenType.IF, () => this.parseIfExpression());
    this.registerInfix(TokenType.PLUS, (left) =>
      this.parseInfixExpression(left),
    );
    this.registerInfix(TokenType.MINUS, (left) =>
      this.parseInfixExpression(left),
    );
    this.registerInfix(TokenType.SLASH, (left) =>
      this.parseInfixExpression(left),
    );
    this.registerInfix(TokenType.ASTERISK, (left) =>
      this.parseInfixExpression(left),
    );
    this.registerInfix(TokenType.EQ, (left) => this.parseInfixExpression(left));
    this.registerInfix(TokenType.NOT_EQ, (left) =>
      this.parseInfixExpression(left),
    );
    this.registerInfix(TokenType.LT, (left) => this.parseInfixExpression(left));
    this.registerInfix(TokenType.GT, (left) => this.parseInfixExpression(left));
    this.registerPrefix(TokenType.TRUE, () => this.parseBoolean());
    this.registerPrefix(TokenType.FALSE, () => this.parseBoolean());
  }

  private nextToken() {
    this.curToken = this.peekToken;
    this.peekToken = this.lexer.nextToken();
  }

  public static new(lexer: Lexer): Parser {
    return new Parser(lexer);
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
    const t = trace("parseLetStatement");
    try {
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
    } finally {
      untrace(t);
    }
  }

  //parse return statement

  private parseReturnStatement(): ReturnStatement {
    const stmt = new ReturnStatement(this.curToken!);

    this.nextToken();

    // Parse the expression after 'return'
    const returnValue = this.parseExpression(Precedence.LOWEST);
    stmt.returnValue = returnValue ?? undefined;

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
    const t = trace("parseStatement");
    try {
      switch (this.curToken?.type) {
        case TokenType.LET:
          return this.parseLetStatement();
        case TokenType.RETURN:
          return this.parseReturnStatement();
        default:
          return this.parseExpressionStatement();
      }
    } finally {
      untrace(t);
    }
  }

  //parse expression statement

  private parseExpressionStatement(): ExpressionStatement | undefined {
    // const expr = this.parseExpression(Precedence.LOWEST);

    // if (!expr) {
    //   return undefined;
    // }
    const t = trace("parseExpressionStatement");
    try {
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
    } finally {
      untrace(t);
    }
  }

  // 🔤 parseIdentifier

  private parseIdentifier(): Identifier {
    const t = trace("parseIdentifier");
    try {
      if (!this.curToken) {
        throw new Error("current token is undefined");
      }
      return new Identifier(this.curToken, this.curToken.literal);
    } finally {
      untrace(t);
    }
  }

  // 🔢 parseIntegerLiteral

  parseIntegerLiteral(): Expression {
    const t = trace("parseIntegerLiteral");
    try {
      const lit = IntegerLiteral.new(this.curToken!, 0);
      const value = parseInt(this.curToken!.literal, 10);

      if (isNaN(value)) {
        const msg = `could not parse "${this.curToken!.literal}" as integer`;
        this.errors.push(msg);
        return lit;
      }

      lit.value = value;

      return lit;
    } finally {
      untrace(t);
    }
  }

  // 🔢 parseExpression (basic)
  private parseExpression(precedence: number): Expression | null {
    const t = trace("parseExpression");
    try {
      if (!this.curToken) {
        this.errors.push("current token is undefined");
        return null;
      }

      const prefix = this.prefixParseFns.get(this.curToken!.type); //👉 This line decides:“Which function should parse this token?

      if (!prefix) {
        this.noPrefixParserFnError(this.curToken!.type);
        return null;
      }
      let leftExp = prefix();
      while (
        !this.peekTokenIs(TokenType.SEMICOLON) &&
        precedence < this.peekPrecedence()
      ) {
        const infix = this.infixParseFns.get(this.peekToken!.type);
        if (!infix) {
          return leftExp;
        }

        this.nextToken();
        leftExp = infix(leftExp!);
      }
      return leftExp;
    } finally {
      untrace(t);
    }
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

  // 1. See operator
  //2. Move to next token
  //3. Parse the whole right expression
  //4. Attach it to operator
  private parsePrefixExpression(): Expression | null {
    const t = trace("parsePrefixExpression");
    try {
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
    } finally {
      untrace(t);
    }
  }

  private noPrefixParserFnError(t: TokenType) {
    const msg = `no prefix parse function for ${t} found`;
    this.errors.push(msg);
    return null;
  }

  //Gets precedence of next operator
  private peekPrecedence(): Precedence {
    return precendences.get(this.peekToken!.type) || Precedence.LOWEST;
  }

  //Gets precedence of current operator
  private curPrecedence(): Precedence {
    return precendences.get(this.curToken!.type) || Precedence.LOWEST;
  }

  // private parseInfixExpression(left: Expression): Expression | null {
  //   const expression = infixExpression.new(
  //     this.curToken!,
  //     left,
  //     this.curToken!.literal,
  //   );

  //   const precedence = this.curPrecedence();
  //   this.nextToken();
  //   const right = this.parseExpression(precedence);
  //   if (!right) {
  //     return null;
  //   }
  //   expression.right = right;

  //   return expression;
  // }

  private parseInfixExpression(left: Expression): Expression {
    const t = trace("parseInfixExpression");
    try {
      const expression = infixExpression.new(
        this.curToken!,
        left,
        this.curToken!.literal,
      );

      const precedence = this.curPrecedence();
      this.nextToken();

      const right = this.parseExpression(precedence);

      if (!right) {
        throw new Error("parseExpression returned null");
      }

      expression.right = right;

      return expression;
    } finally {
      untrace(t);
    }
  }

  private parseBoolean(): Expression {
    return BooleanLiteral.new(
      this.curToken!,
      this.curToken!.type === TokenType.TRUE,
    );
  }

  parseGroupedExpression(): Expression | null {
    this.nextToken(); // skip '('
    const exp = this.parseExpression(Precedence.LOWEST);
    if (!this.expectPeek(TokenType.RPAREN)) {
      return null;
    }
    return exp;
  }

  parseBlockStatement(): BlockStatement {
    const block = new BlockStatement(this.curToken!);

    block.statements = [];

    // move to first statement inside '{'
    this.nextToken();

    while (
      !this.curTokenIs(TokenType.RBRACE) &&
      !this.curTokenIs(TokenType.EOF)
    ) {
      const stmt = this.parseStatement();

      if (stmt) {
        block.statements.push(stmt);
      }

      this.nextToken();
    }

    return block;
  }

  parseIfExpression(): Expression | null {
    // expect '('
    if (!this.expectPeek(TokenType.LPAREN)) {
      return null;
    }

    this.nextToken();

    // parse condition
    const condition = this.parseExpression(Precedence.LOWEST);
    if (!condition) {
      return null;
    }

    // expect ')'
    if (!this.expectPeek(TokenType.RPAREN)) {
      return null;
    }

    // expect '{'
    if (!this.expectPeek(TokenType.LBRACE)) {
      return null;
    }

    // parse consequence block
    const consequence = this.parseBlockStatement();

    // 🔹 handle else
    let alternative: BlockStatement | undefined;
    if (this.peekTokenIs(TokenType.ELSE)) {
      this.nextToken();

      if (!this.expectPeek(TokenType.LBRACE)) {
        return null;
      }

      alternative = this.parseBlockStatement();
    }

    const expression = new IfExpression(
      this.curToken!,
      condition,
      consequence,
      alternative,
    );

    return expression;
  }
}
