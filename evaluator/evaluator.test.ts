import { Lexer } from "../lexer/lexer";
import { Parser } from "../parser/parser";
import { Eval } from "./evaluator";
import { Integer } from "../object/object";
import { describe, expect, test } from "bun:test";

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
