import { Program } from "./program";
import { LetStatement } from "./let-statement";
import { Identifier } from "./identifier";
import { TokenType } from "@/lexer/token";
import { test, expect, describe } from "bun:test";

test(" testing AST string()", () => {
  const program = Program.new();
  const letStatement = LetStatement.new({
    type: TokenType.LET,
    literal: "let",
  });
  letStatement.name = Identifier.new(
    { type: TokenType.IDENT, literal: "myVar" },
    "myVar",
  );
  letStatement.value = Identifier.new(
    { type: TokenType.IDENT, literal: "anotherVar" },
    "anotherVar",
  );
  program.statements.push(letStatement);
  expect(program.string()).toBe("let myVar = anotherVar;");
});
