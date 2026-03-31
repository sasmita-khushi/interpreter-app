import { Lexer } from "./lexer/lexer";

let lexer = new Lexer("(=");

const t = lexer.nextToken();

console.log(t);

console.log(lexer.nextToken());
