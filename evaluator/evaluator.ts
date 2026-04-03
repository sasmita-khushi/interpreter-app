import { AstNode, IntegerLiteral, Statement } from "../ast/ast";
import { Object, Integer } from "../object/object";
import { Program } from "../ast/program";
import { ExpressionStatement } from "../ast/expression-statement";

// Eval function
export function Eval(node: AstNode): Object | null {
  if (node instanceof Program) {
    return evalStatements(node.statements);
  }

  if (node instanceof ExpressionStatement) {
    const expression = node.expression;
    return expression !== undefined ? Eval(expression) : null;
  }

  if (node instanceof IntegerLiteral) {
    return new Integer(node.value);
  }

  console.log("Unhandled node:", node);
  return null;
}

// evalStatements function
function evalStatements(statements: Statement[]): Object | null {
  let result: Object | null = null;

  for (const statement of statements) {
    const evaluated = Eval(statement);

    if (evaluated !== null) {
      result = evaluated;
    }
  }

  return result;
}
