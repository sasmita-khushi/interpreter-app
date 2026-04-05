import readline from "readline";
import { Eval } from "../evaluator/evaluator";
import { Environment } from "../object/environment";
import { Parser } from "../parser/parser"; // assuming you have a parser
import { Lexer } from "../lexer/lexer"; // assuming you have a lexer

export function start() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: ">> ",
  });

  const env = new Environment();

  rl.prompt();

  rl.on("line", (line: string) => {
    try {
      const lexer = new Lexer(line);
      const parser = new Parser(lexer);
      const program = parser.parseProgram();
      const evaluated = Eval(program, env);

      if (evaluated !== null && evaluated !== undefined) {
        console.log(evaluated.Inspect());
      }
    } catch (err) {
      console.error("Error:", err);
    }

    rl.prompt();
  }).on("close", () => {
    console.log("Exiting...");
    process.exit(0);
  });
}
