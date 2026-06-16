export const PAYMENT_METHODS = [
  { value: "CARD", label: "신용카드 / 체크카드" },
  { value: "TRANSFER", label: "계좌이체" },
] as const;

export const PAYMENT_METHOD_LABEL: Record<string, string> = Object.fromEntries(
  PAYMENT_METHODS.map((m) => [m.value, m.label])
);
