import * as readline from "readline";
import { Lexer } from "../lexer/lexer";
import { Parser } from "../parser/parser";
import { Eval } from "../evaluator/evaluator";
import { infixExpression } from "@/ast/infix-expression";

const PROMPT = ">> ";

export function start() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: PROMPT,
  });

  rl.prompt();

  rl.on("line", (line: string) => {
    const l = new Lexer(line);
    const p = new Parser(l);
    const program = p.parseProgram();

    // check parser errors
    if (p.getErrors().length !== 0) {
      printParserErrors(p.getErrors());
      rl.prompt();
      return;
    }

    const evaluated = Eval(program);

    if (evaluated !== null) {
      console.log(evaluated.Inspect());
    }

    rl.prompt();
  });
}

// helper function
function printParserErrors(errors: string[]) {
  console.log("Parser errors:");
  for (const msg of errors) {
    console.log("\t" + msg);
  }
}
// import readline from "readline";
// import { Lexer } from "../lexer/lexer";
// import { TokenType } from "../lexer/token";

// const PROMPT = ">> ";

// export function start() {
//   const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout,
//     prompt: PROMPT,
//   });

//   rl.prompt();

//   rl.on("line", (line) => {
//     const l = new Lexer(line);

//     let tok = l.nextToken();

//     while (tok.type !== TokenType.EOF) {
//       console.log(tok);
//       tok = l.nextToken();
//     }

//     rl.prompt();
//   }).on("close", () => {
//     process.exit(0);
//   });
// }
