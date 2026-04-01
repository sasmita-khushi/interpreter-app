import { describe, expect, test } from "bun:test";
import { Lexer } from "../lexer/lexer";
//import { TokenType } from "../lexer/token";
import { Parser } from "./parser";
import { LetStatement } from "../ast/let-statement";
import { Identifier } from "@/ast/identifier";
import { ExpressionStatement } from "@/ast/expression-statement";
import { IntegerLiteral } from "@/ast/ast";
import { PrefixExpression } from "../ast/prefix-expression";
import { infixExpression } from "../ast/infix-expression";
import { BooleanLiteral } from "../ast/boolean-literal";

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

  const returnStmt = program?.statements[0] as any;
  expect(returnStmt.returnValue.value).toBe(5);
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

test("Test Integer Literal Expression", () => {
  const input = `5;`;

  let lexer = Lexer.new(input);
  const parser = Parser.new(lexer);
  const program = parser.parseProgram();

  expect(program).toBeDefined();

  expect(program?.statements).toHaveLength(1);

  const stmt = program.statements[0];

  // check ExpressionStatement

  expect(stmt).toBeInstanceOf(ExpressionStatement);
  const expressionStmt = stmt as ExpressionStatement;

  // check IntegerLiteral
  expect(expressionStmt.expression).toBeInstanceOf(IntegerLiteral);
  const literal = expressionStmt.expression as IntegerLiteral;

  // check value
  expect(literal.value).toBe(5);

  // check token literal
  expect(literal.tokenLiteral()).toBe("5");
});

test("test parsing prefix operator", () => {
  let prefixTests = [
    { input: "!5;", operator: "!", integerValue: 5 },
    { input: "-15;", operator: "-", integerValue: 15 },
  ];

  for (const tt of prefixTests) {
    let lexer = Lexer.new(tt.input);
    const parser = Parser.new(lexer);
    const program = parser.parseProgram();

    expect(program).toBeDefined();
    // Step 1: Check number of statements
    expect(program.statements.length).toBe(1);

    // Step 2: Check it's ExpressionStatement
    const stmt = program.statements[0] as ExpressionStatement;

    // Step 3: Check it's PrefixExpression
    const exp = stmt.expression as PrefixExpression;

    // Step 4: Check operator
    expect(exp.operator).toBe(tt.operator);
    expect((exp.right as IntegerLiteral).value).toBe(tt.integerValue);
  }
});

test("paring infix operator", () => {
  const infixTests = [
    { input: "5 + 5;", leftValue: 5, operator: "+", rightValue: 5 },
    { input: "5 - 5;", leftValue: 5, operator: "-", rightValue: 5 },
    { input: "5 * 5;", leftValue: 5, operator: "*", rightValue: 5 },
    { input: "5 / 5;", leftValue: 5, operator: "/", rightValue: 5 },
    { input: "5 > 5;", leftValue: 5, operator: ">", rightValue: 5 },
    { input: "5 < 5;", leftValue: 5, operator: "<", rightValue: 5 },
    { input: "5 == 5;", leftValue: 5, operator: "==", rightValue: 5 },
    { input: "5 != 5;", leftValue: 5, operator: "!=", rightValue: 5 },
  ];

  infixTests.forEach((tt) => {
    let lexer = Lexer.new(tt.input);
    const parser = Parser.new(lexer);
    const program = parser.parseProgram();

    expect(program).toBeDefined();
    expect(program.statements.length).toBe(1);

    const stmt = program.statements[0] as ExpressionStatement;

    const exp = stmt.expression as infixExpression;

    expect((exp.left as IntegerLiteral).value).toBe(tt.leftValue);
    expect(exp.operator).toBe(tt.operator);
    expect((exp.right as IntegerLiteral).value).toBe(tt.rightValue);
  });
});

test("Operator Precedence Parsing", () => {
  const tests: { input: string; expected: string }[] = [
    { input: "-a * b", expected: "((-a) * b)" },
    { input: "!-a", expected: "(!(-a))" },
    { input: "a + b + c", expected: "((a + b) + c)" },
    { input: "a + b - c", expected: "((a + b) - c)" },
    { input: "a * b * c", expected: "((a * b) * c)" },
    { input: "a * b / c", expected: "((a * b) / c)" },
    { input: "a + b / c", expected: "(a + (b / c))" },
    {
      input: "a + b * c + d / e - f",
      expected: "(((a + (b * c)) + (d / e)) - f)",
    },
    {
      input: "3 + 4; -5 * 5",
      expected: "(3 + 4)((-5) * 5)",
    },
    {
      input: "5 > 4 == 3 < 4",
      expected: "((5 > 4) == (3 < 4))",
    },
    {
      input: "5 < 4 != 3 > 4",
      expected: "((5 < 4) != (3 > 4))",
    },
    {
      input: "3 + 4 * 5 == 3 * 1 + 4 * 5",
      expected: "((3 + (4 * 5)) == ((3 * 1) + (4 * 5)))",
    },
  ];

  tests.forEach((tt) => {
    const lexer = Lexer.new(tt.input);
    const parser = Parser.new(lexer);
    const program = parser.parseProgram();

    checkParserErrors(parser);

    const actual = program.string();

    expect(actual).toBe(tt.expected);
  });
});

function checkParserErrors(parser: Parser) {
  const errors = parser.getErrors();

  if (!errors || errors.length === 0) return;

  console.error("Parser has errors:");

  errors.forEach((err) => {
    console.error(" - " + err);
  });

  throw new Error("Parser errors found. Fix them first.");
}

describe("Operator Precedence Parsing 2", () => {
  const tests: { input: string; expected: string }[] = [
    { input: "true", expected: "true" },
    { input: "false", expected: "false" },
    { input: "3 > 5 == false", expected: "((3 > 5) == false)" },
    { input: "3 < 5 == true", expected: "((3 < 5) == true)" },
  ];

  tests.forEach((tt) => {
    test(`parses "${tt.input}" correctly`, () => {
      const lexer = Lexer.new(tt.input);
      const parser = Parser.new(lexer);
      const program = parser.parseProgram();

      const actual = program.string();
      expect(actual).toBe(tt.expected);
    });
  });
});

test(" test boolean expression", () => {
  const tests = [
    { input: "true;", expected: "true" },
    { input: "false;", expected: "false" },
  ];

  tests.forEach((tt) => {
    const lexer = Lexer.new(tt.input);
    const parser = Parser.new(lexer);
    const program = parser.parseProgram();

    checkParserErrors(parser);

    const stmt = program.statements[0] as ExpressionStatement;

    expect(stmt.expression).toBeInstanceOf(BooleanLiteral);

    const boolExp = stmt.expression as BooleanLiteral;

    expect(boolExp.string()).toBe(tt.expected);
  });
});

describe("Boolean Literal Parsing", () => {
  test("parses 'true' correctly", () => {
    const input = "true;";
    let lexer = Lexer.new(input);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();

    const exp = (program.statements[0] as ExpressionStatement)
      .expression as BooleanLiteral;

    // Directly check the type
    expect(exp).toBeInstanceOf(BooleanLiteral);

    // Check the value
    expect(exp.string()).toBe("true");

    // Check the token literal
    expect(exp.tokenLiteral()).toBe("true");
  });

  test("parses 'false' correctly", () => {
    const input = "false;";
    let lexer = Lexer.new(input);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();

    const exp = (program.statements[0] as ExpressionStatement)
      .expression as BooleanLiteral;

    // Directly check the type
    expect(exp).toBeInstanceOf(BooleanLiteral);

    // Check the value
    expect(exp.string()).toBe("false");

    // Check the token literal
    expect(exp.tokenLiteral()).toBe("false");
  });
});

describe("Parsing infix expressions", () => {
  const infixTests = [
    {
      input: "true == true",
      leftValue: true,
      operator: "==",
      rightValue: true,
    },
    {
      input: "true != false",
      leftValue: true,
      operator: "!=",
      rightValue: false,
    },
    {
      input: "false == false",
      leftValue: false,
      operator: "==",
      rightValue: false,
    },
  ];

  infixTests.forEach((tt) => {
    test(`parses ${tt.input}`, () => {
      const lexer = new Lexer(tt.input);
      const parser = new Parser(lexer);
      const program = parser.parseProgram();

      expect(program.statements.length).toBe(1);

      const stmt = program.statements[0] as ExpressionStatement;
      const exp = stmt.expression as infixExpression;

      // Direct inline checks for left value
      const left = exp.left as BooleanLiteral;
      expect(left).toBeInstanceOf(BooleanLiteral);
      expect(left.value).toBe(tt.leftValue);

      // Operator check
      expect(exp.operator).toBe(tt.operator);

      // Direct inline checks for right value
      const right = exp.right as BooleanLiteral;
      expect(right).toBeInstanceOf(BooleanLiteral);
      expect(right.value).toBe(tt.rightValue);
    });
  });
});

describe("Parsing prefix expressions", () => {
  const prefixTests = [
    {
      input: "!true",
      operator: "!",
      rightValue: true,
    },
    {
      input: "!false",
      operator: "!",
      rightValue: false,
    },
  ];

  prefixTests.forEach((tt) => {
    test(`parses ${tt.input}`, () => {
      const lexer = new Lexer(tt.input);
      const parser = new Parser(lexer);
      const program = parser.parseProgram();

      expect(program.statements.length).toBe(1);

      const stmt = program.statements[0] as ExpressionStatement;
      const exp = stmt.expression as PrefixExpression;

      // Operator check
      expect(exp.operator).toBe(tt.operator);

      // Direct inline checks for right value
      const right = exp.right as BooleanLiteral;
      expect(right).toBeInstanceOf(BooleanLiteral);
      expect(right.value).toBe(tt.rightValue);
    });
  });
});
