import { Lexer } from "../lexer/lexer";
import { Parser } from "../parser/parser";
import { Eval } from "./evaluator";

import { describe, expect, test } from "bun:test";
import { Integer } from "../object/integer";
import { Boolean as MonkeyBoolean } from "../object/booelan";
import { NULL } from "@/object/null";

describe("TestEvalIntegerExpression", () => {
  const tests: { input: string; expected: number }[] = [
    { input: "5", expected: 5 },
    { input: "10", expected: 10 },
  ];

  tests.forEach((tt) => {
    const l = new Lexer(tt.input);
    const p = new Parser(l);
    const program = p.parseProgram();

    const evaluated = Eval(program);

    // check type
    expect(evaluated).toBeInstanceOf(Integer);

    // check value
    const result = evaluated as Integer;
    expect(result.value).toBe(tt.expected);
  });
});

test("test boolean expression", () => {
  const tests: { input: string; expected: boolean }[] = [
    { input: "true", expected: true },
    { input: "false", expected: false },
  ];

  tests.forEach((tt) => {
    const l = new Lexer(tt.input);
    const p = new Parser(l);
    const program = p.parseProgram();

    const evaluated = Eval(program);

    // check type
    expect(evaluated).toBeInstanceOf(MonkeyBoolean);

    // check value

    const result = evaluated as MonkeyBoolean;
    expect(result.value).toBe(tt.expected);
  });
});

test("test bang Operator", () => {
  const tests: { input: string; expected: boolean }[] = [
    { input: "!true", expected: false },
    { input: "!false", expected: true },
    { input: "!5", expected: false },
    { input: "!!true", expected: true },
    { input: "!!false", expected: false },
    { input: "!!5", expected: true },
  ];

  tests.forEach((tt) => {
    const lexer = new Lexer(tt.input);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();

    const evaluated = Eval(program);
    expect(evaluated).toBeInstanceOf(MonkeyBoolean);
    const result = evaluated as MonkeyBoolean;
    expect(result.value).toBe(tt.expected);
  });
});

test("Test Eval Integer Expression", () => {
  const tests: { input: string; expected: number }[] = [
    { input: "5", expected: 5 },
    { input: "10", expected: 10 },
    { input: "-5", expected: -5 },
    { input: "-10", expected: -10 },
    { input: "5 + 5 + 5 + 5 - 10", expected: 10 },
    { input: "2 * 2 * 2 * 2 * 2", expected: 32 },
    { input: "-50 + 100 + -50", expected: 0 },
    { input: "5 * 2 + 10", expected: 20 },
    { input: "5 + 2 * 10", expected: 25 },
    { input: "20 + 2 * -10", expected: 0 },
    { input: "50 / 2 * 2 + 10", expected: 60 },
    { input: "2 * (5 + 10)", expected: 30 },
    { input: "3 * 3 * 3 + 10", expected: 37 },
    { input: "3 * (3 * 3) + 10", expected: 37 },
    { input: "(5 + 10 * 2 + 15 /3) *2 + -10", expected: 50 },
  ];

  tests.forEach((tt) => {
    let lexer = new Lexer(tt.input);

    let parser = new Parser(lexer);
    let program = parser.parseProgram();

    const evaluated = Eval(program);

    expect(evaluated).toBeInstanceOf(Integer);
    const result = evaluated as Integer;
    expect(result.value).toBe(tt.expected);
  });
});

test("test eval boolean expression", () => {
  const tests: { input: string; expected: boolean }[] = [
    { input: "true", expected: true },
    { input: "false", expected: false },
    { input: "1 < 2", expected: true },
    { input: "1 > 2", expected: false },
    { input: "1 < 1", expected: false },
    { input: "1 > 1", expected: false },
    { input: "1 == 1", expected: true },
    { input: "1 != 1", expected: false },
    { input: "1 == 2", expected: false },
    { input: "1 != 2", expected: true },
  ];
  tests.forEach((tt) => {
    let lexer = new Lexer(tt.input);
    let parser = new Parser(lexer);
    let program = parser.parseProgram();
    const evaluated = Eval(program);
    expect(evaluated).toBeInstanceOf(MonkeyBoolean);
    const result = evaluated as MonkeyBoolean;
    expect(result.value).toBe(tt.expected);
  });
});

test("test eval Boolean expression 2 ", () => {
  const tests: { input: string; expected: boolean }[] = [
    { input: "true == true", expected: true },
    { input: "false == false", expected: true },
    { input: "true == false", expected: false },
    { input: "true != false", expected: true },
    { input: "false != true", expected: true },
    { input: "(1 < 2) == true", expected: true },
    { input: "(1 < 2) == false", expected: false },
    { input: "(1 > 2) == true", expected: false },
    { input: "(1 > 2) == false", expected: true },
  ];
  tests.forEach((tt) => {
    let lexer = new Lexer(tt.input);
    let parser = new Parser(lexer);
    let program = parser.parseProgram();
    const evaluated = Eval(program);
    expect(evaluated).toBeInstanceOf(MonkeyBoolean);
    const result = evaluated as MonkeyBoolean;
    expect(result.value).toBe(tt.expected);
  });
});

test("test if else expression", () => {
  let tests: { input: string; expected: number | null }[] = [
    { input: "if (true) { 10 }", expected: 10 },
    { input: "if (false) { 10 }", expected: null },
    { input: "if (1) { 10 }", expected: 10 },
    { input: "if (1 < 2) { 10 }", expected: 10 },
    { input: "if (1 > 2) { 10 }", expected: null },
    { input: "if (1 > 2) { 10 } else { 20 }", expected: 20 },
    { input: "if (1 < 2) { 10 } else { 20 }", expected: 10 },
  ];

  tests.forEach(({ input, expected }) => {
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();

    const evaluated = Eval(program);

    if (expected !== null) {
      // check Integer
      expect(evaluated).toBeInstanceOf(Integer);
      expect((evaluated as Integer).value).toBe(expected);
    } else {
      // check NULL
      expect(evaluated).toBe(NULL);
    }
  });
});

test("return statement", () => {
  const tests: { input: string; expected: number }[] = [
    { input: "return 10;", expected: 10 },
    { input: "return 10; 9;", expected: 10 },
    { input: "return 2 * 5; 9;", expected: 10 },
    { input: "9; return 2 * 5; return 10;", expected: 10 },
    {
      input: "if (10 > 1) { if (10 > 1) { return 10; } return 1; }",
      expected: 10,
    },
  ];

  tests.forEach(({ input, expected }) => {
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();

    const evaluated = Eval(program);

    expect(evaluated).toBeInstanceOf(Integer);
    expect((evaluated as Integer).value).toBe(expected);
  });
});
