import { AstNode, IntegerLiteral, Statement } from "../ast/ast";
import { Program } from "../ast/program";
import { ExpressionStatement } from "../ast/expression-statement";
import { infixExpression } from "../ast/infix-expression";
import { BooleanLiteral } from "../ast/boolean-literal";
import { BlockStatement } from "@/ast/block-statement";
import { IfExpression } from "@/ast/if-expression";

import { Object as MonkeyObject } from "../object/object";
import { Integer } from "../object/integer";
import { Boolean } from "../object/booelan";
import { PrefixExpression } from "@/ast/prefix-expression";
import { NULL } from "../object/null";
import { ReturnStatement } from "@/ast/return-statement";
import { ReturnValue } from "@/object/return";

export const TRUE = new Boolean(true);
export const FALSE = new Boolean(false);

function nativeBoolToBooleanObject(input: boolean): Boolean {
  return input ? TRUE : FALSE;
}

//The Eval function starts evaluation from the AST node.
// Eval uses recursion to evaluate small pieces first, then combines them into final result
export function Eval(node: AstNode): MonkeyObject | null {
  if (node instanceof Program) {
    return evalProgram(node);
  }
  if (node instanceof BlockStatement) {
    return evalBlockStatement(node);
  }

  if (node instanceof ExpressionStatement) {
    return node.expression ? Eval(node.expression) : null;
  }

  if (node instanceof IntegerLiteral) {
    return new Integer(node.value);
  }

  if (node instanceof BooleanLiteral) {
    return nativeBoolToBooleanObject(node.value);
  }

  if (node instanceof infixExpression) {
    const left = node.left ? Eval(node.left) : null;
    const right = node.right ? Eval(node.right) : null;

    return evalInfixExpression(node.operator, left, right);
  }
  if (node instanceof PrefixExpression) {
    const right = node.right ? Eval(node.right) : null;
    return evalPrefixExpression(node.operator, right);
  }

  if (node instanceof BlockStatement) {
    return evalStatements(node.statements);
  }

  if (node instanceof IfExpression) {
    return evalIfExpression(node);
  }

  if (node instanceof ReturnStatement) {
    if (!node.returnValue) {
      return null; // or handle error
    }

    const val = Eval(node.returnValue);
    if (val === null) return null;

    return new ReturnValue(val);
  }
  console.log("Unhandled node:", node);
  return null;
}

function evalStatements(statements: Statement[]): MonkeyObject | null {
  let result: MonkeyObject | null = null;

  for (const statement of statements) {
    const evaluated = Eval(statement);
    if (evaluated !== null) {
      result = evaluated;
    }
    if (result instanceof ReturnValue) {
      return result.value; // unwrap and return
    }
  }

  return result;
}

function evalIntegerInfixExpression(
  operator: string,
  left: Integer,
  right: Integer,
): MonkeyObject | null {
  switch (operator) {
    case "+":
      return new Integer(left.value + right.value);
    case "-":
      return new Integer(left.value - right.value);
    case "*":
      return new Integer(left.value * right.value);
    case "/":
      return new Integer(left.value / right.value);
    case "<":
      return nativeBoolToBooleanObject(left.value < right.value);
    case ">":
      return nativeBoolToBooleanObject(left.value > right.value);
    case "==":
      return nativeBoolToBooleanObject(left.value === right.value);
    case "!=":
      return nativeBoolToBooleanObject(left.value !== right.value);
    default:
      return null;
  }
}

function evalInfixExpression(
  operator: string,
  left: MonkeyObject | null,
  right: MonkeyObject | null,
): MonkeyObject | null {
  if (left instanceof Integer && right instanceof Integer) {
    return evalIntegerInfixExpression(operator, left, right);
  }

  if (operator === "==") {
    return nativeBoolToBooleanObject(left === right);
  }

  if (operator === "!=") {
    return nativeBoolToBooleanObject(left !== right);
  }

  return null;
}

function evalPrefixExpression(
  operator: string,
  right: MonkeyObject | null,
): MonkeyObject | null {
  switch (operator) {
    case "!":
      return evalBangOperatorExpression(right);
    case "-":
      return evalMinusPrefixOperatorExpression(right);
    default:
      return null;
  }
}

function evalBangOperatorExpression(right: MonkeyObject | null): MonkeyObject {
  if (right === TRUE) {
    return FALSE;
  } else if (right === FALSE) {
    return TRUE;
  } else {
    return FALSE;
  }
}

function evalMinusPrefixOperatorExpression(
  right: MonkeyObject | null,
): MonkeyObject | null {
  // check if null or not integer
  if (!right || right.Type() !== "INTEGER") {
    return null;
  }

  // type casting
  const value = (right as Integer).value;

  // return new Integer with negative value
  return new Integer(-value);
}

function evalIfExpression(ie: IfExpression): MonkeyObject {
  const condition = Eval(ie.condition);

  if (isTruthy(condition)) {
    return Eval(ie.consequence)!;
  } else if (ie.alternative) {
    return Eval(ie.alternative)!;
  } else {
    return NULL;
  }
}
function isTruthy(obj: MonkeyObject | null): boolean {
  if (obj === null) return false;
  if (obj === TRUE) return true;
  if (obj === FALSE) return false;

  return true;
}

function evalProgram(program: Program): MonkeyObject | null {
  let result: MonkeyObject | null = null;

  for (const statement of program.statements) {
    result = Eval(statement);

    // ✅ unwrap ONLY here
    if (result instanceof ReturnValue) {
      return result.value;
    }
  }

  return result;
}
function evalBlockStatement(block: BlockStatement): MonkeyObject | null {
  let result: MonkeyObject | null = null;

  for (const statement of block.statements) {
    result = Eval(statement);

    // 🚨 IMPORTANT: don't unwrap
    if (result instanceof ReturnValue) {
      return result;
    }
  }

  return result;
}
