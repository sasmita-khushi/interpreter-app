import { isLetter, newToken } from "@/helper/helper";
import { Token, TokenType, lookUpIdent } from "./token";

export class Lexer {
  private input: string;
  private position: number; // current position
  private readPosition: number; // next position
  private ch: string; // current character

  constructor(input: string) {
    this.input = input;
    this.position = 0;
    this.readPosition = 0;
    this.ch = "";

    this.readChar(); // initialize first character
  }

  // Factory method to create a new Lexer instance
  public static new(input: string): Lexer {
    const lexer = new Lexer(input);

    return lexer;
  }

  // Read next character
  private readChar(): void {
    if (this.readPosition >= this.input.length) {
      this.ch = "\0"; // EOF
    } else {
      this.ch = this.input[this.readPosition];
    }

    this.position = this.readPosition;
    this.readPosition++;
  }

  // Read identifier (variable names, keywords)
  private readIdentifier(): string {
    const position = this.position;

    while (isLetter(this.ch)) {
      this.readChar();
    }

    return this.input.slice(position, this.position);
  }

  // Skip whitespace characters
  private skipWhitespace(): void {
    while (
      this.ch === " " ||
      this.ch === "\t" ||
      this.ch === "\n" ||
      this.ch === "\r"
    ) {
      this.readChar();
    }
  }

  //Check if character is a digit
  private isDigit(ch: string): boolean {
    return /[0-9]/.test(ch);
  }

  // Read number literals
  private readNumber(): string {
    const position = this.position;

    while (this.isDigit(this.ch)) {
      this.readChar();
    }

    return this.input.slice(position, this.position);
  }

  // Look ahead next character without moving position
  private peekChar(): string {
    if (this.readPosition >= this.input.length) {
      return "\0";
    } else {
      return this.input[this.readPosition];
    }
  }

  // Return next token
  public nextToken(): Token {
    let tok: Token;

    this.skipWhitespace();
    switch (this.ch) {
      case "=":
        tok = newToken(TokenType.ASSIGN, this.ch);
        if (this.peekChar() === "=") {
          this.readChar();
          tok = newToken(TokenType.EQ, "==");
        } else {
          tok = newToken(TokenType.ASSIGN, this.ch);
        }
        break;
      case "+":
        tok = newToken(TokenType.PLUS, this.ch);
        break;
      case "(":
        tok = newToken(TokenType.LPAREN, this.ch);
        break;
      case ")":
        tok = newToken(TokenType.RPAREN, this.ch);
        break;
      case "{":
        tok = newToken(TokenType.LBRACE, this.ch);
        break;
      case "}":
        tok = newToken(TokenType.RBRACE, this.ch);
        break;
      case ",":
        tok = newToken(TokenType.COMMA, this.ch);
        break;
      case ";":
        tok = newToken(TokenType.SEMICOLON, this.ch);
        break;
      case "-":
        tok = newToken(TokenType.MINUS, this.ch);
        break;
      case "!":
        tok = newToken(TokenType.BANG, this.ch);
        if (this.peekChar() === "=") {
          this.readChar();
          tok = newToken(TokenType.NOT_EQ, "!=");
        } else {
          tok = newToken(TokenType.BANG, this.ch);
        }
        break;
      case "*":
        tok = newToken(TokenType.ASTERISK, this.ch);
        break;
      case "/":
        tok = newToken(TokenType.SLASH, this.ch);
        break;
      case "<":
        tok = newToken(TokenType.LT, this.ch);
        break;
      case ">":
        tok = newToken(TokenType.GT, this.ch);
        break;

      case "\0":
        tok = newToken(TokenType.EOF, "");
        break;
      default:
        if (isLetter(this.ch)) {
          const literal = this.readIdentifier();
          const type = lookUpIdent(literal);
          return newToken(type, literal);
        } else if (this.isDigit(this.ch)) {
          const literal = this.readNumber();
          return newToken(TokenType.INT, literal);
        } else {
          tok = newToken(TokenType.ILLEGAL, this.ch);
          break;
        }
    }

    this.readChar(); // move forward
    return tok;
  }
}
