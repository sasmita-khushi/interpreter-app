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
