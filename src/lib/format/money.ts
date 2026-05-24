const moneyFormatter = new Intl.NumberFormat("th-TH", {
  currency: "THB",
  maximumFractionDigits: 0,
  style: "currency",
});

export function formatMoney(amount: number) {
  return moneyFormatter.format(amount);
}
