import { Lexer } from "../lexer/lexer";
import { Parser } from "../parser/parser";
import { Eval } from "./evaluator";

import { describe, expect, test } from "bun:test";
import { Integer } from "../object/integer";
import { Boolean as MonkeyBoolean } from "../object/booelan";
import { NULL } from "@/object/null";
import { ErrorObj } from "@/object/error";
import { Environment } from "@/object/environment";
import { FunctionObject } from "../object/function";

describe("TestEvalIntegerExpression", () => {
  const tests: { input: string; expected: number }[] = [
    { input: "5", expected: 5 },
    { input: "10", expected: 10 },
  ];

  tests.forEach((tt) => {
    const l = new Lexer(tt.input);
    const p = new Parser(l);
    const program = p.parseProgram();
    const env = new Environment();

    const evaluated = Eval(program, env);

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

    const env = new Environment();
    const evaluated = Eval(program, env);

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

    const env = new Environment();
    const evaluated = Eval(program, env);
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

    const env = new Environment();
    const evaluated = Eval(program, env);

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

    const env = new Environment();
    const evaluated = Eval(program, env);
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
    const env = new Environment();
    const evaluated = Eval(program, env);
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
    const env = new Environment();

    const evaluated = Eval(program, env);

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
    const env = new Environment();

    const evaluated = Eval(program, env);

    expect(evaluated).toBeInstanceOf(Integer);
    expect((evaluated as Integer).value).toBe(expected);
  });
});

test("test error handling", () => {
  const tests: { input: string; expectedMessage: string }[] = [
    {
      input: "5 + true;",
      expectedMessage: "type mismatch: INTEGER + BOOLEAN",
    },
    {
      input: "5 + true; 5;",
      expectedMessage: "type mismatch: INTEGER + BOOLEAN",
    },
    {
      input: "-true",
      expectedMessage: "unknown operator: -BOOLEAN",
    },
    {
      input: "true + false;",
      expectedMessage: "unknown operator: BOOLEAN + BOOLEAN",
    },
    {
      input: "5; true + false; 5",
      expectedMessage: "unknown operator: BOOLEAN + BOOLEAN",
    },
    {
      input: "if (10 > 1) { true + false; }",
      expectedMessage: "unknown operator: BOOLEAN + BOOLEAN",
    },
    {
      input: `if (10 > 1) { if (10 > 1) { return true + false; } return 1; }`,
      expectedMessage: "unknown operator: BOOLEAN + BOOLEAN",
    },
  ];

  tests.forEach(({ input, expectedMessage }) => {
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();
    const env = new Environment();

    const evaluated = Eval(program, env);

    expect(evaluated).toBeInstanceOf(ErrorObj);
    const errorObj = evaluated as ErrorObj;
    expect(errorObj.message).toBe(expectedMessage);
  });
});

describe("Error Handling", () => {
  test("should return error for unknown identifier", () => {
    const input = "foobar";
    const expectedMessage = "identifier not found: foobar";

    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();

    const env = new Environment();
    const evaluated = Eval(program, env);

    expect(evaluated).toBeInstanceOf(ErrorObj);

    const errObj = evaluated as ErrorObj;

    expect(errObj.message).toBe(expectedMessage);
  });
});

test("test let Statement", () => {
  const tests: { input: string; expected: number }[] = [
    { input: "let a = 5; a;", expected: 5 },
    { input: "let a = 5 * 5; a;", expected: 25 },
    { input: "let a = 5; let b = a; b;", expected: 5 },
    { input: "let a = 5; let b = a; let c = a + b + 5; c;", expected: 15 },
  ];

  tests.forEach(({ input, expected }) => {
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();

    const env = new Environment();
    const evaluated = Eval(program, env);

    expect(evaluated).toBeInstanceOf(Integer);
    const result = evaluated as Integer;
    expect(result.value).toBe(expected);
  });
});

describe("FunctionObject", () => {
  test("should evaluate function object correctly", () => {
    const input = "fn(x) { x + 2; };";
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();

    const env = new Environment();

    const evaluated = Eval(program, env);

    expect(evaluated?.Type()).toBe("FUNCTION");

    const fn = evaluated as FunctionObject;

    expect(fn.parameters.length).toBe(1);
    expect(fn.parameters[0].string()).toBe("x");

    const expectedBody = "(x + 2)";
    expect(fn.body.string()).toBe(expectedBody);
  });
});

test("test function application", () => {
  const tests: { input: string; expected: number }[] = [
    { input: "let identity = fn(x) { x; }; identity(5);", expected: 5 },
    {
      input: "let identity = fn(x) { return x; }; identity(5);",
      expected: 5,
    },
    {
      input: "let double = fn(x) { x * 2; }; double(5);",
      expected: 10,
    },
    {
      input: "let add = fn(x, y) { x + y; }; add(5, 5);",
      expected: 10,
    },
    {
      input: "let add = fn(x, y) { x + y; }; add(5 + 5, add(5, 5));",
      expected: 20,
    },
  ];

  tests.forEach(({ input, expected }) => {
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();

    const env = new Environment();
    const evaluated = Eval(program, env);

    expect(evaluated).toBeInstanceOf(Integer);
    const result = evaluated as Integer;
    expect(result.value).toBe(expected);
  });
});

test("closures", () => {
  const input = `
    let newAdder = fn(x) {
      fn(y) { x + y };
    };
    let addTwo = newAdder(2);
    addTwo(2);
  `;

  const lexer = new Lexer(input);
  const parser = new Parser(lexer);
  const program = parser.parseProgram();

  const env = new Environment();

  const evaluated = Eval(program, env);

  // Check it's an integer
  expect(evaluated).toBeInstanceOf(Integer);

  // Check value
  expect((evaluated as unknown as Integer).value).toBe(4);
});
