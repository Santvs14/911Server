export const CountPagination = (options: { pagination: number }) => {
  const { pagination } = options;

  if (pagination - Math.floor(pagination) === 0) {
    return Math.trunc(pagination);
  }

  return Math.trunc(pagination + 1);
};

export const isEmpty = (value: number | null | undefined) =>
  value !== undefined && value !== null && !isNaN(value);
