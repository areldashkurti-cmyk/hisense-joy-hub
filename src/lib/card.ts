// Card display utilities. Full PAN and CVV are never stored — only the last 4 digits.
export const maskCardNumber = (last4: string) =>
  `•••• •••• •••• ${(last4 ?? "").padStart(4, "•")}`;

export const generateLast4 = () =>
  String(Math.floor(Math.random() * 10000)).padStart(4, "0");

export const generateExpiry = () => {
  const now = new Date();
  return {
    month: Math.floor(Math.random() * 12) + 1,
    year: now.getFullYear() + 4,
  };
};
