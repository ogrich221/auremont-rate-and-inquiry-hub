import { z } from "zod";
export const contactSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  topic: z.enum(["General inquiry", "Personal banking", "Business banking", "Security concern"]),
  message: z.string().trim().min(10, "Please enter at least 10 characters.").max(2000),
  website: z.string().max(0).default(""),
});
export const rateSchema = z.object({
  title: z.string().min(1).max(80),
  value: z.string().regex(/^\d{1,2}(\.\d{1,2})?$/),
  unit: z.enum(["% APY", "% APR"]),
  description: z.string().max(200),
  path: z.enum(["/personal-banking", "/loans", "/cards"]),
  term: z.string().max(100).optional(),
});
export const ratesSchema = z.array(rateSchema).length(4);
export const statsSchema = z
  .array(z.object({ value: z.string().min(1).max(40), label: z.string().min(1).max(80) }))
  .length(4);
export const contactsSchema = z.object({
  email: z.union([z.literal(""), z.string().email()]),
  phone: z.string().max(50),
  hours: z.string().max(100),
});
export type Rate = z.infer<typeof rateSchema>;
export type SiteData = {
  rates: Rate[];
  stats: z.infer<typeof statsSchema>;
  contacts: z.infer<typeof contactsSchema>;
};
export const DEMO_ONLY = true;
export const canPerformFinancialOperation = () => false;
export const navigation = [
  ["Home", "/"],
  ["About Us", "/about"],
  ["Personal Banking", "/personal-banking"],
  ["Business Banking", "/business-banking"],
  ["Loans & Credit", "/loans"],
  ["Cards", "/cards"],
  ["Contact", "/contact"],
] as const;
export const services = [
  {
    name: "Personal Banking",
    path: "/personal-banking",
    icon: "personal",
    description: "Everyday banking, thoughtfully designed. Accounts that work around your life.",
  },
  {
    name: "Business Banking",
    path: "/business-banking",
    icon: "business",
    description: "The right foundation for your ambitions. Solutions that grow with your business.",
  },
  {
    name: "Loans & Credit",
    path: "/loans",
    icon: "loans",
    description: "For the milestones that matter. Explore a clearer path to your next big step.",
  },
  {
    name: "Debit & Credit Cards",
    path: "/cards",
    icon: "cards",
    description: "A world of possibilities in your pocket. Payments made simple.",
  },
  {
    name: "Wealth Management",
    path: "/wealth-management",
    icon: "wealth",
    description: "A long-term perspective on your future. Make a plan for what comes next.",
  },
  {
    name: "Digital Banking",
    path: "/digital-banking",
    icon: "digital",
    description: "Your banking, wherever life takes you. A connected experience on your terms.",
  },
] as const;
export function pageHead(title: string, description: string) {
  return {
    meta: [
      { title: `${title} | Auremont Trust Bank` },
      { name: "description", content: description },
      { property: "og:title", content: `${title} | Auremont Trust Bank` },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  };
}
