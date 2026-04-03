import { Object, ObjectType } from "./object";
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
