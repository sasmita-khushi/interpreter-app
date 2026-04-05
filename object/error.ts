export type ObjectType = "ERROR";

export const ERROR_OBJ: ObjectType = "ERROR";

export interface MonkeyObject {
  Type(): ObjectType;
  Inspect(): string;
}

// Error class
export class ErrorObj implements MonkeyObject {
  message: string;

  constructor(message: string) {
    this.message = message;
  }

  Type(): ObjectType {
    return ERROR_OBJ;
  }

  Inspect(): string {
    return "ERROR: " + this.message;
  }
}
