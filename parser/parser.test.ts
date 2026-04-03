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
import { Program } from "@/ast/program";
import { IfExpression } from "@/ast/if-expression";
import { BlockStatement } from "../ast/block-statement";
import { FunctionLiteral } from "../ast/function-literal";
import { CallExpression } from "@/ast/call-expression";

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

describe("Operator Precedence Parsing", () => {
  const tests: { input: string; expected: string }[] = [
    { input: "1 + (2 + 3) + 4", expected: "((1 + (2 + 3)) + 4)" },
    { input: "(5 + 5) * 2", expected: "((5 + 5) * 2)" },
    { input: "2 / (5 + 5)", expected: "(2 / (5 + 5))" },
    { input: "-(5 + 5)", expected: "(-(5 + 5))" },
    { input: "!(true == true)", expected: "(!(true == true))" },
  ];

  tests.forEach(({ input, expected }) => {
    test(`parses '${input}' correctly`, () => {
      const lexer = new Lexer(input);
      const parser = new Parser(lexer);
      const program: Program = parser.parseProgram();

      // Convert the AST back to string to check precedence
      const actual = program.string();

      expect(actual).toBe(expected);
    });
  });
});

test("Test If Expression (no helpers)", () => {
  const input = "if (x < y) { x }";

  const lexer = new Lexer(input);
  const parser = new Parser(lexer);
  const program = parser.parseProgram();

  expect(parser.getErrors().length).toBe(0);

  expect(program.statements.length).toBe(1);

  // ✅ statement type
  const stmt = program.statements[0];
  expect(stmt).toBeInstanceOf(ExpressionStatement);

  const expStmt = stmt as ExpressionStatement;

  // ✅ expression should be IfExpression
  expect(expStmt.expression).toBeInstanceOf(IfExpression);

  const ifExp = expStmt.expression as IfExpression;

  // 🔥 CONDITION: x < y
  expect(ifExp.condition).toBeInstanceOf(infixExpression);

  const condition = ifExp.condition as infixExpression;

  // left: x
  expect(condition.left).toBeInstanceOf(Identifier);
  expect((condition.left as Identifier).value).toBe("x");

  // operator: <
  expect(condition.operator).toBe("<");

  // right: y
  expect(condition.right).toBeInstanceOf(Identifier);
  expect((condition.right as Identifier).value).toBe("y");

  // 🔥 CONSEQUENCE
  expect(ifExp.consequence.statements.length).toBe(1);

  const consequenceStmt = ifExp.consequence.statements[0];
  expect(consequenceStmt).toBeInstanceOf(ExpressionStatement);

  const consExp = (consequenceStmt as ExpressionStatement).expression;

  expect(consExp).toBeInstanceOf(Identifier);
  expect((consExp as Identifier).value).toBe("x");

  // 🔥 NO ELSE
  expect(ifExp.alternative).toBeUndefined();
});

test("parses if-else expression correctly", () => {
  const input = "if (x < y) { x } else { y }";

  const lexer = Lexer.new(input);
  const parser = new Parser(lexer);
  const program = parser.parseProgram();

  // program should have 1 statement
  expect(program.statements.length).toBe(1);

  const stmt = program.statements[0] as ExpressionStatement;
  expect(stmt).toBeInstanceOf(ExpressionStatement);

  const exp = stmt.expression as IfExpression;
  expect(exp).toBeInstanceOf(IfExpression);

  // 🔹 Check condition: (x < y)
  const condition = exp.condition as infixExpression;
  expect(condition.operator).toBe("<");

  const left = condition.left as Identifier;
  expect(left.value).toBe("x");

  const right = condition.right as Identifier;
  expect(right.value).toBe("y");

  // 🔹 Check consequence: { x }
  const consequence = exp.consequence as BlockStatement;
  expect(consequence.statements.length).toBe(1);

  const consStmt = consequence.statements[0] as ExpressionStatement;
  const consExp = consStmt.expression as Identifier;
  expect(consExp.value).toBe("x");

  // 🔹 Check alternative: { y }
  const alternative = exp.alternative as BlockStatement;
  expect(alternative).toBeDefined();
  expect(alternative.statements.length).toBe(1);

  const altStmt = alternative.statements[0] as ExpressionStatement;
  const altExp = altStmt.expression as Identifier;
  expect(altExp.value).toBe("y");
});

describe("Function Literal Parsing", () => {
  test("should parse function literal correctly", () => {
    const input = `fn(x, y) { x + y; }`;

    const l = new Lexer(input);
    const p = new Parser(l);
    const program = p.parseProgram();

    // check parser errors
    expect(p.getErrors().length).toBe(0);

    // program should have 1 statement
    expect(program.statements.length).toBe(1);

    const stmt = program.statements[0];
    expect(stmt instanceof ExpressionStatement).toBe(true);

    const functionLiteral = (stmt as ExpressionStatement).expression;
    expect(functionLiteral instanceof FunctionLiteral).toBe(true);

    const fn = functionLiteral as FunctionLiteral;

    // parameters length
    expect(fn.parameters.length).toBe(2);

    // parameter 1: x
    expect(fn.parameters[0] instanceof Identifier).toBe(true);
    expect((fn.parameters[0] as Identifier).value).toBe("x");

    // parameter 2: y
    expect(fn.parameters[1] instanceof Identifier).toBe(true);
    expect((fn.parameters[1] as Identifier).value).toBe("y");

    // function body should have 1 statement
    expect(fn.body.statements.length).toBe(1);

    const bodyStmt = fn.body.statements[0];
    expect(bodyStmt instanceof ExpressionStatement).toBe(true);

    const expr = (bodyStmt as ExpressionStatement).expression;
    expect(expr instanceof infixExpression).toBe(true);

    const infix = expr as infixExpression;

    // left: x
    expect(infix.left instanceof Identifier).toBe(true);
    expect((infix.left as Identifier).value).toBe("x");

    // operator: +
    expect(infix.operator).toBe("+");

    // right: y
    expect(infix.right instanceof Identifier).toBe(true);
    expect((infix.right as Identifier).value).toBe("y");
  });
});

describe("Function Parameter Parsing", () => {
  const tests = [
    {
      input: "fn() {};",
      expectedParams: [],
    },
    {
      input: "fn(x) {};",
      expectedParams: ["x"],
    },
    {
      input: "fn(x, y, z) {};",
      expectedParams: ["x", "y", "z"],
    },
  ];

  tests.forEach((tt) => {
    test(`should parse parameters correctly for: ${tt.input}`, () => {
      const lexer = new Lexer(tt.input);
      const parser = new Parser(lexer);
      const program = parser.parseProgram();

      // check parser errors
      expect(parser.getErrors().length).toBe(0);

      const stmt = program.statements[0] as ExpressionStatement;
      const func = stmt.expression as FunctionLiteral;

      // check number of parameters
      expect(func.parameters.length).toBe(tt.expectedParams.length);

      // check each parameter
      for (let i = 0; i < tt.expectedParams.length; i++) {
        const ident = func.parameters[i];

        expect(ident.value).toBe(tt.expectedParams[i]);
        expect(ident.tokenLiteral()).toBe(tt.expectedParams[i]);
      }
    });
  });
});

test("Call Expression Parsing (no helpers)", () => {
  const input = "add(1, 2 * 3, 4 + 5);";

  const lexer = new Lexer(input);
  const parser = new Parser(lexer);
  const program = parser.parseProgram();

  // check parser errors
  expect(parser.getErrors().length).toBe(0);

  // program should have 1 statement
  expect(program.statements.length).toBe(1);

  const stmt = program.statements[0] as ExpressionStatement;

  // expression should be CallExpression
  const exp = stmt.expression as CallExpression;

  // function: add
  expect(exp.func).toBeInstanceOf(Identifier);
  const func = exp.func as Identifier;
  expect(func.value).toBe("add");

  // arguments length
  expect(exp.args.length).toBe(3);

  // -------- Argument 1: 1 --------
  const arg1 = exp.args[0];
  expect(arg1).toBeInstanceOf(IntegerLiteral);
  expect((arg1 as IntegerLiteral).value).toBe(1);

  // -------- Argument 2: 2 * 3 --------
  const arg2 = exp.args[1];
  expect(arg2).toBeInstanceOf(infixExpression);

  const infix1 = arg2 as infixExpression;
  expect(infix1.operator).toBe("*");

  expect(infix1.left).toBeInstanceOf(IntegerLiteral);
  expect((infix1.left as IntegerLiteral).value).toBe(2);

  expect(infix1.right).toBeInstanceOf(IntegerLiteral);
  expect((infix1.right as IntegerLiteral).value).toBe(3);

  // -------- Argument 3: 4 + 5 --------
  const arg3 = exp.args[2];
  expect(arg3).toBeInstanceOf(infixExpression);

  const infix2 = arg3 as infixExpression;
  expect(infix2.operator).toBe("+");

  expect(infix2.left).toBeInstanceOf(IntegerLiteral);
  expect((infix2.left as IntegerLiteral).value).toBe(4);

  expect(infix2.right).toBeInstanceOf(IntegerLiteral);
  expect((infix2.right as IntegerLiteral).value).toBe(5);
});

describe("Operator Precedence Parsing", () => {
  const tests: { input: string; expected: string }[] = [
    {
      input: "a + add(b * c) + d",
      expected: "((a + add((b * c))) + d)",
    },
    {
      input: "add(a, b, 1, 2 * 3, 4 + 5, add(6, 7 * 8))",
      expected: "add(a, b, 1, (2 * 3), (4 + 5), add(6, (7 * 8)))",
    },
    {
      input: "add(a + b + c * d / f + g)",
      expected: "add((((a + b) + ((c * d) / f)) + g))",
    },
  ];

  tests.forEach(({ input, expected }) => {
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    const program = parser.parseProgram();

    // check parser errors
    expect(parser.getErrors().length).toBe(0);

    const actual = program.string();
    expect(actual).toBe(expected);
  });
});
