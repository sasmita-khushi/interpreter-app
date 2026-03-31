import { Token, TokenType } from "../lexer/token";

// Check if a character is a letter (used for identifiers and keywords)
export function isLetter(ch: string): boolean {
  return /[a-zA-Z_]/.test(ch);
}

export function newToken(tokenType: TokenType, ch: string): Token {
  return {
    type: tokenType,
    literal: ch,
  };
}
