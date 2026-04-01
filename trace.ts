let traceLevel = 0;

export function trace(msg: string): string {
  const indent = "  ".repeat(traceLevel);
  console.log(`${indent}BEGIN ${msg}`);
  traceLevel++;
  return msg;
}

export function untrace(msg: string): void {
  traceLevel--;
  const indent = "  ".repeat(traceLevel);
  console.log(`${indent}END ${msg}`);
}
