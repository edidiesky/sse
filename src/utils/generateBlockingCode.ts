export const generateBlockingCode = (rows: number) => {
  let res = 0;
  for (let i = 0; i < 1000 * rows; i++) {
    res += Math.sqrt(i);
  }
  return res;
};