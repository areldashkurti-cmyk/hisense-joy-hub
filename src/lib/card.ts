// Mock card generation utilities. NEVER use for real payment data.
export const generateMockCardNumber = () => {
  // Always starts with 4 (mock Visa) for visual familiarity.
  let n = "4";
  for (let i = 0; i < 15; i++) n += Math.floor(Math.random() * 10).toString();
  return n;
};

export const formatCardNumber = (n: string) =>
  n.replace(/(.{4})/g, "$1 ").trim();

export const maskCardNumber = (n: string) => {
  if (!n || n.length < 4) return "•••• •••• •••• ••••";
  const last4 = n.slice(-4);
  return `•••• •••• •••• ${last4}`;
};

export const generateExpiry = () => {
  const now = new Date();
  return {
    month: Math.floor(Math.random() * 12) + 1,
    year: now.getFullYear() + 4,
  };
};

export const generateCvv = () =>
  String(Math.floor(Math.random() * 900) + 100);
