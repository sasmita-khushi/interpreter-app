import { Object, ObjectType } from "./object";

export class Null implements Object {
  Type(): ObjectType {
    return "NULL";
  }

  Inspect(): string {
    return "null";
  }
}

export const NULL = new Null();
