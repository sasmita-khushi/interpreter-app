import { AstNode, Expression, IntegerLiteral } from "../ast/ast";
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
import { ErrorObj } from "@/object/error";
import { LetStatement } from "@/ast/let-statement";
import { Environment, newEnclosedEnvironment } from "@/object/environment";
import { Identifier } from "@/ast/identifier";
import { FunctionObject } from "@/object/function";
import { FunctionLiteral } from "@/ast/function-literal";
import { CallExpression } from "@/ast/call-expression";

export const TRUE = new Boolean(true);
export const FALSE = new Boolean(false);

function nativeBoolToBooleanObject(input: boolean): Boolean {
  return input ? TRUE : FALSE;
}

//The Eval function starts evaluation from the AST node.
// Eval uses recursion to evaluate small pieces first, then combines them into final result
export function Eval(node: AstNode, env: Environment): MonkeyObject | null {
  if (node instanceof Program) {
    return evalProgram(node, env);
  }
  if (node instanceof BlockStatement) {
    return evalBlockStatement(node, env);
  }

  if (node instanceof ExpressionStatement) {
    return node.expression ? Eval(node.expression, env) : null;
  }

  if (node instanceof IntegerLiteral) {
    return new Integer(node.value);
  }

  if (node instanceof BooleanLiteral) {
    return nativeBoolToBooleanObject(node.value);
  }

  if (node instanceof infixExpression) {
    const left = node.left ? Eval(node.left, env) : null;
    const right = node.right ? Eval(node.right, env) : null;

    if (isError(left)) {
      return left;
    }
    if (isError(right)) {
      return right;
    }
    return evalInfixExpression(node.operator, left, right);
  }
  if (node instanceof PrefixExpression) {
    const right = node.right ? Eval(node.right, env) : null;

    if (isError(right)) {
      return right;
    }
    return evalPrefixExpression(node.operator, right);
  }

  if (node instanceof IfExpression) {
    return evalIfExpression(node, env);
  }

  if (node instanceof ReturnStatement) {
    if (!node.returnValue) {
      return null;
    }

    const val = Eval(node.returnValue, env);
    if (isError(val)) {
      return val;
    }
    if (val === null) {
      return null;
    }

    return new ReturnValue(val);
  }

  if (node instanceof LetStatement) {
    const val = Eval(node.value, env);
    if (isError(val)) {
      return val;
    }
    env.set(node.name.value, val ?? NULL);
    return null;
  }

  if (node instanceof FunctionLiteral) {
    let param = node.parameters;
    let body = node.body;
    return new FunctionObject(param, body, env);
  }
  if (node instanceof Identifier) {
    return evalIdentifier(node, env);
  }

  if (node instanceof CallExpression) {
    const fn = Eval(node.func, env);
    if (isError(fn)) {
      return fn;
    }
    if (fn === null) {
      return newError("function evaluated to null");
    }

    const args = evalExpressions(node.args, env);
    if (args.length === 1 && isError(args[0])) {
      return args[0];
    }

    return applyFunction(fn, args);
  }

  console.log("Unhandled node:", node);
  return null;
}

function applyFunction(
  fn: MonkeyObject,
  args: MonkeyObject[],
): MonkeyObject | null {
  if (fn.Type() !== "FUNCTION") {
    return newError(`not a function: ${fn.Type()}`);
  }

  const functionObj = fn as FunctionObject;

  const extendedEnv = extendFunctionEnv(functionObj, args);
  const evaluated = Eval(functionObj.body, extendedEnv);

  return unwrapReturnValue(evaluated);
}

function extendFunctionEnv(
  fn: FunctionObject,
  args: MonkeyObject[],
): Environment {
  const env = newEnclosedEnvironment(fn.env);

  fn.parameters.forEach((param, index) => {
    env.set(param.value, args[index]);
  });

  return env;
}
function unwrapReturnValue(obj: MonkeyObject | null): MonkeyObject | null {
  if (obj === null) {
    return NULL;
  }
  if (obj.Type() === "RETURN_VALUE") {
    return (obj as ReturnValue).value;
  }
  return obj;
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
      return newError(
        `unknown operator: ${left.Type()} ${operator} ${right.Type()}`,
      );
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

  if (left?.Type() !== right?.Type()) {
    return newError(
      `type mismatch: ${left ? left.Type() : "null"} ${operator} ${
        right ? right.Type() : "null"
      }`,
    );
  }

  if (operator === "==") {
    return nativeBoolToBooleanObject(left === right);
  }

  if (operator === "!=") {
    return nativeBoolToBooleanObject(left !== right);
  }

  return newError(
    `unknown operator: ${left ? left.Type() : "null"} ${operator} ${
      right ? right.Type() : "null"
    }`,
  );
}
function evalExpressions(exps: Expression[], env: Environment): MonkeyObject[] {
  const result: MonkeyObject[] = [];

  for (const e of exps) {
    const evaluated = Eval(e, env);

    if (evaluated === null) {
      return [newError("expression evaluated to null")];
    }

    if (isError(evaluated)) {
      return [evaluated];
    }

    result.push(evaluated);
  }

  return result;
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
      return newError(
        `unknown operator: ${operator}${right ? " " + right.Type() : ""}`,
      );
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
  if (!right || right.Type() !== "INTEGER") {
    return newError(`unknown operator: -${right ? right.Type() : "null"}`);
  }

  const value = (right as Integer).value;

  return new Integer(-value);
}

function evalIfExpression(
  ie: IfExpression,
  env: Environment,
): MonkeyObject | null {
  const condition = Eval(ie.condition, env);
  if (isError(condition)) {
    return condition;
  }

  if (isTruthy(condition)) {
    return Eval(ie.consequence, env)!;
  } else if (ie.alternative) {
    return Eval(ie.alternative, env)!;
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

function evalProgram(program: Program, env: Environment): MonkeyObject | null {
  let result: MonkeyObject | null = null;

  for (const statement of program.statements) {
    result = Eval(statement, env);

    // ✅ unwrap ONLY here
    if (result instanceof ReturnValue) {
      return result.value;
    }
    if (result instanceof ErrorObj) {
      return result;
    }
  }

  return result;
}

function evalBlockStatement(
  block: BlockStatement,
  env: Environment,
): MonkeyObject | null {
  let result: MonkeyObject | null = null;

  for (const statement of block.statements) {
    result = Eval(statement, env);

    // 🚨 IMPORTANT: don't unwrap
    if (result instanceof ReturnValue || result instanceof ErrorObj) {
      return result;
    }
  }

  return result;
}

function newError(message: string): ErrorObj {
  return new ErrorObj(message);
}

export function isError(obj: MonkeyObject | null): obj is ErrorObj {
  if (obj !== null) {
    return obj.Type() === "ERROR";
  }
  return false;
}

function evalIdentifier(node: Identifier, env: Environment): MonkeyObject {
  const [val, ok] = env.get(node.value);

  if (!ok) {
    return newError(`identifier not found: ${node.value}`);
  }

  return val!;
}
