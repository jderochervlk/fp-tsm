type Some<T> = {
  _tag: "Some";
  value: T;
};

type None = {
  _tag: "None";
};

export type Option<T> = Some<T> | None;
