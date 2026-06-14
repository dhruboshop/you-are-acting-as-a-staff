export const campaignTemplates = {
  durga_puja: {
    title: "Durga Puja Greetings",
    message: "Shubho Durga Puja from {{shopName}}! Thank you for being part of our family."
  },
  diwali: {
    title: "Diwali Greetings",
    message: "Happy Diwali from {{shopName}}! Wishing you light, joy, and prosperity."
  },
  eid: {
    title: "Eid Greetings",
    message: "Eid Mubarak from {{shopName}}! Thank you for shopping with us."
  },
  christmas: {
    title: "Christmas Greetings",
    message: "Merry Christmas from {{shopName}}! Wishing you a joyful festive season."
  },
  new_year: {
    title: "New Year Greetings",
    message: "Happy New Year from {{shopName}}! We look forward to serving you again."
  }
} as const;

export function renderTemplate(message: string, shopName: string, customerName: string) {
  return message.replaceAll("{{shopName}}", shopName).replaceAll("{{customerName}}", customerName);
}
