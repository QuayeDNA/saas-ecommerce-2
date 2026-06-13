const APP_DOMAIN = "caskmafdatahub.shop";

export function getPaystackEmail(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return `customer@${APP_DOMAIN}`;
  return `${digits}@${APP_DOMAIN}`;
}
