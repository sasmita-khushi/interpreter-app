export type ObjectType = string;

export interface Object {
  Type(): ObjectType;
  Inspect(): string;
}

export class Integer implements Object {
  value: number;

  constructor(value: number) {
    this.value = value;
  }

  Type(): ObjectType {
    return "INTEGER";
  }

  Inspect(): string {
    return this.value.toString();
  }
}

export class Boolean implements Object {
  value: boolean;

  constructor(value: boolean) {
    this.value = value;
  }

  Type(): ObjectType {
    return "BOOLEAN";
  }

  Inspect(): string {
    return this.value.toString();
  }
}

export class Null implements Object {
  Type(): ObjectType {
    return "NULL";
  }

  Inspect(): string {
    return "null";
  }
}
