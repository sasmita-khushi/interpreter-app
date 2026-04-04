import { Lexer } from "../lexer/lexer";
import { Parser } from "../parser/parser";
import { Eval } from "./evaluator";

import { describe, expect, test } from "bun:test";
import { Integer } from "../object/integer";
import { Boolean as MonkeyBoolean } from "../object/booelan";

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
