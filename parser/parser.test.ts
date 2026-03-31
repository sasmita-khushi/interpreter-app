import { expect, test } from "bun:test";
import { Lexer } from "../lexer/lexer";
//import { TokenType } from "../lexer/token";
import { Parser } from "./parser";
import { LetStatement } from "../ast/let-statement";
import { Identifier } from "@/ast/identifier";
import { ExpressionStatement } from "@/ast/expression-statement";

test("should return let statement", () => {
  const input = `let x=5;
    let y=10;
    let fooBar=838383;`;

  let lexer = Lexer.new(input);
  const parser = Parser.new(lexer);
  const program = parser.parseProgram();

  expect(program).toBeDefined();
  expect(program?.statements).toHaveLength(3);

  // const tests = ["x", "y", "fooBar"];

  expect(program?.statements[0]).toBeInstanceOf(LetStatement);
  expect(program?.statements[0].tokenLiteral()).toBe("let");
});

test("should parse identifier correctly", () => {
  const input = `let x = 5;`;

  let lexer = Lexer.new(input);
  const parser = Parser.new(lexer);
  const program = parser.parseProgram();

  expect(program).toBeDefined();
  expect(program?.statements).toHaveLength(1);
  const stmt = program.statements[0] as any;

  expect(stmt.name.value).toBe("x");
});

test("should fail if '=' is missing", () => {
  const input = "let x 5;";

  const lexer = Lexer.new(input);
  const parser = Parser.new(lexer);

  parser.parseProgram();

  const errors = parser.getErrors();

  expect(errors.length).toBeGreaterThan(0);
});

test("should parse full let statement correctly", () => {
  const input = "let x = 5;";

  const lexer = Lexer.new(input);
  const parser = Parser.new(lexer);

  const program = parser.parseProgram();

  const stmt = program.statements[0] as any;

  expect(stmt.name.value).toBe("x");
  expect(stmt.value.value).toBe(5);
});

test("should parse return statement", () => {
  const input = `return 5;
    return 10;
    return 993322;`;

  let lexer = Lexer.new(input);
  const parser = Parser.new(lexer);
  const program = parser.parseProgram();

  expect(program).toBeDefined();
  expect(program?.statements).toHaveLength(3);

  expect(program?.statements[0].tokenLiteral()).toBe("return");
});

test("Test Identifier Expression", () => {
  const input = `foobar;`;

  let lexer = Lexer.new(input);
  const parser = Parser.new(lexer);
  const program = parser.parseProgram();

  expect(program).toBeDefined();

  expect(program?.statements).toHaveLength(1);

  const stmt = program.statements[0];
  expect(stmt).toBeInstanceOf(ExpressionStatement);

  const ident = (stmt as ExpressionStatement).expression;
  expect(ident).toBeInstanceOf(Identifier);

  const id = ident as Identifier;
  expect(id.value).toBe("foobar");
  expect(id.tokenLiteral()).toBe("foobar");
});
