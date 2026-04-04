import { Object as MonkeyObject, ObjectType } from "./object";

// constant
export const RETURN_VALUE_OBJ: ObjectType = "RETURN_VALUE";

// ReturnValue class
export class ReturnValue implements MonkeyObject {
  value: MonkeyObject;

  constructor(value: MonkeyObject) {
    this.value = value;
  }

  Type(): ObjectType {
    return RETURN_VALUE_OBJ;
  }

  Inspect(): string {
    return this.value.Inspect();
  }
}
