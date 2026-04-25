export const parseBoolean = (value: string | undefined, defaultValue: boolean): boolean => {
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === 'true';
};

export const parseNumber = (value: string | undefined, defaultValue: number): number => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? defaultValue : parsed;
};
