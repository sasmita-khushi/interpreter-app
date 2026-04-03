import * as readline from "readline";
import { Lexer } from "@/lexer/lexer";
import { Parser } from "@/parser/parser";

const PROMPT = ">> ";

export function start(
  input: NodeJS.ReadableStream,
  output: NodeJS.WritableStream,
) {
  const rl = readline.createInterface({
    input,
    output,
    terminal: false,
  });

  function ask() {
    output.write(PROMPT);

    rl.once("line", (line: string) => {
      const lexer = new Lexer(line);
      const parser = new Parser(lexer);
      const program = parser.parseProgram();

      if (parser.getErrors().length !== 0) {
        printParserErrors(output, parser.getErrors());
        ask();
        return;
      }

      output.write(program.toString());
      output.write("\n");

      ask(); // loop again
    });

    rl.once("close", () => {
      process.exit(0);
    });
  }

  ask();
}

function printParserErrors(out: NodeJS.WritableStream, errors: string[]) {
  for (const msg of errors) {
    out.write("\t" + msg + "\n");
  }
}
