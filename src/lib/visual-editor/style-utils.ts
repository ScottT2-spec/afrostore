type NestedRecord = Record<string, any>;

const isPlainObject = (value: unknown): value is NestedRecord => {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
};

export const updateNestedValueAtPath = <T extends NestedRecord>(root: T | undefined, path: string, value: any): T => {
  const keys = path.split(".");
  const cloneRoot: NestedRecord = isPlainObject(root) ? { ...root } : {};

  let current: NestedRecord = cloneRoot;
  let sourceCursor: NestedRecord | undefined = isPlainObject(root) ? root : undefined;

  for (let i = 0; i < keys.length - 1; i += 1) {
    const key = keys[i];
    const sourceNext = sourceCursor && isPlainObject(sourceCursor[key]) ? sourceCursor[key] : undefined;
    const nextValue = isPlainObject(sourceNext) ? { ...sourceNext } : {};
    current[key] = nextValue;
    current = nextValue;
    sourceCursor = sourceNext;
  }

  current[keys[keys.length - 1]] = value;
  return cloneRoot as T;
};
