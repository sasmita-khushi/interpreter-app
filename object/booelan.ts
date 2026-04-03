import { Object, ObjectType } from "./object";

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
