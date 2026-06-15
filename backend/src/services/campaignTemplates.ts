export const campaignTemplates = {
  birthday: {
    title: "Birthday Greeting",
    message: "Happy birthday, {{customerName}}! {{shopName}} wishes you a wonderful day."
  },
  anniversary: {
    title: "Anniversary Greeting",
    message: "Happy anniversary, {{customerName}}! Warm wishes from {{shopName}}."
  },
  festival: {
    title: "Festival / Special Day Greeting",
    message: "Hi {{customerName}}, {{shopName}} wishes you a joyful celebration."
  },
  winback: {
    title: "Win-back Message",
    message: "Hi {{customerName}}, we have missed you at {{shopName}}. Visit us again soon."
  }
} as const;

export function renderTemplate(message: string, shopName: string, customerName: string) {
  return message.replaceAll("{{shopName}}", shopName).replaceAll("{{customerName}}", customerName);
}
