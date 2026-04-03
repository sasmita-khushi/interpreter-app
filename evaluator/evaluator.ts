import { AstNode, IntegerLiteral, Statement } from "../ast/ast";
import { Program } from "../ast/program";
import { ExpressionStatement } from "../ast/expression-statement";
import { infixExpression } from "../ast/infix-expression";
import { BooleanLiteral } from "../ast/boolean-literal";

import { Object as MonkeyObject } from "../object/object";
import { Integer } from "../object/integer";
import { Boolean } from "../object/booelan";

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
    const left = Eval(node.left);
    const right = Eval(node.right);

    if (left instanceof Integer && right instanceof Integer) {
      return evalIntegerInfixExpression(node.operator, left, right);
    }
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
): Integer | null {
  switch (operator) {
    case "+":
      return new Integer(left.value + right.value);
    case "-":
      return new Integer(left.value - right.value);
    case "*":
      return new Integer(left.value * right.value);
    case "/":
      return new Integer(left.value / right.value);
    default:
      return null;
  }
}
