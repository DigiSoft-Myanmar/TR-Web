export function getPercentage(currentCount: number, prevCount: number) {
  if (prevCount === 0) {
    return 100;
  }
  let percentChange = ((prevCount - currentCount) * 100) / prevCount;
  return parseFloat(percentChange.toFixed(2));
}
