export type ObjectType = string;

export interface Object {
  Type(): ObjectType;
  Inspect(): string;
}
