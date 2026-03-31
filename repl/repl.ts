import readline from "readline";
import { Lexer } from "../lexer/lexer";
import { TokenType } from "../lexer/token";

const PROMPT = ">> ";

export function start() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: PROMPT,
  });

  rl.prompt();

  rl.on("line", (line) => {
    const l = new Lexer(line);

    let tok = l.nextToken();

    while (tok.type !== TokenType.EOF) {
      console.log(tok);
      tok = l.nextToken();
    }

    rl.prompt();
  }).on("close", () => {
    process.exit(0);
  });
}
