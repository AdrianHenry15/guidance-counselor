export const siteConfig = {
  name: "Guidance Counselor",
  shortName: "Guidance",
  description:
    "Turn completed coursework into a clear, generalized academic plan.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  supportEmail: "support@guidancecounselor.app",
  social: {
    x: "",
    linkedin: "",
  },
} as const
