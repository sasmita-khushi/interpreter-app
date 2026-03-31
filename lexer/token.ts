import { newToken } from "@/helper/helper";

export enum TokenType {
  IDENT = "IDENT",
  INT = "INT",

  ASSIGN = "=",
  PLUS = "+",
  MINUS = "-",
  BANG = "!",
  ASTERISK = "*",
  SLASH = "/",

  LT = "<",
  GT = ">",

  COMMA = ",",
  SEMICOLON = ";",

  LPAREN = "(",
  RPAREN = ")",
  LBRACE = "{",
  RBRACE = "}",

  TRUE = "TRUE",
  FALSE = "FALSE",
  IF = "IF",
  ELSE = "ELSE",
  RETURN = "RETURN",

  FUNCTION = "FUNCTION",
  LET = "let",

  EQ = "==",
  NOT_EQ = "!=",

  ILLEGAL = "ILLEGAL",
  EOF = "EOF",
}

// Define keywords and their corresponding token types
const keyWords = {
  fn: newToken(TokenType.FUNCTION, "fn"),
  let: newToken(TokenType.LET, "let"),
  true: newToken(TokenType.TRUE, "true"),
  false: newToken(TokenType.FALSE, "false"),
  if: newToken(TokenType.IF, "if"),
  else: newToken(TokenType.ELSE, "else"),
  return: newToken(TokenType.RETURN, "return"),
};

export type Token = {
  type: TokenType;
  literal: string;
};

// Look up identifier to check if it's a keyword or a user-defined identifier
export function lookUpIdent(ident: string): TokenType {
  const keyWord = keyWords[ident as keyof typeof keyWords];
  if (keyWord) {
    return keyWord.type;
  }
  return TokenType.IDENT;
}
