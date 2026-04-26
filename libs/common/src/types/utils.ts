export type Nullable<T, k extends keyof T> = {
  [P in keyof T]: P extends k ? T[P] | null : T[P];
};

export type StringMapper<T extends Record<string, unknown>, keys extends keyof T> = {
  [Key in keyof T]: Key extends keys ? T[Key] : string;
};
