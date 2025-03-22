export function round(number, places = 1) {
  const multiplier = Math.pow(10, places);
  return Math.round(number * multiplier) / multiplier;
}
