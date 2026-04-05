type MonkeyObject = any;

export class Environment {
  store: Map<string, MonkeyObject>;
  outer: Environment | null;

  constructor(outer: Environment | null = null) {
    this.store = new Map();
    this.outer = outer;
  }

  get(name: string): [MonkeyObject | null, boolean] {
    if (this.store.has(name)) {
      return [this.store.get(name)!, true];
    }

    if (this.outer !== null) {
      return this.outer.get(name);
    }

    return [null, false];
  }

  set(name: string, val: MonkeyObject): MonkeyObject {
    this.store.set(name, val);
    return val;
  }
}

export function newEnvironment(): Environment {
  return new Environment();
}
export function newEnclosedEnvironment(outer: Environment): Environment {
  return new Environment(outer);
}
