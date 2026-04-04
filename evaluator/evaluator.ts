import { AstNode, IntegerLiteral, Statement } from "../ast/ast";
import { Program } from "../ast/program";
import { ExpressionStatement } from "../ast/expression-statement";
import { infixExpression } from "../ast/infix-expression";
import { BooleanLiteral } from "../ast/boolean-literal";

import { Object as MonkeyObject } from "../object/object";
import { Integer } from "../object/integer";
import { Boolean } from "../object/booelan";
import { PrefixExpression } from "@/ast/prefix-expression";

export const TRUE = new Boolean(true);
export const FALSE = new Boolean(false);

function nativeBoolToBooleanObject(input: boolean): Boolean {
  return input ? TRUE : FALSE;
}

//The Eval function starts evaluation from the AST node.
// Eval uses recursion to evaluate small pieces first, then combines them into final result
export function Eval(node: AstNode): MonkeyObject | null {
  if (node instanceof Program) {
    return evalStatements(node.statements);
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
