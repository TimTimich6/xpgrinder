export const getTime = (): string => {
  const date: Date = new Date();
  const dateStr: string = date.toTimeString();
  const time = "<" + dateStr.slice(0, 8) + ">";
  return time;
};
// console.log(getTime());
