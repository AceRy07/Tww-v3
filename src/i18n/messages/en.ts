import type { Dictionary } from "@/i18n/types";

export const en: Dictionary = {
  nav: {
    brand: "The West Wing",
    catalog: "Catalog",
    contact: "Contact",
    viewCollection: "View Collection",
    themeToggle: "Toggle theme",
    languageToggle: "Switch language",
    english: "English",
    turkish: "Turkish",
    openMenu: "Toggle menu",
  },
  footer: {
    description:
      "Modern furniture crafted from 12mm compact laminate, built for lasting beauty and everyday durability.",
    rights: "All rights reserved.",
    crafted: "Handcrafted in Turkey",
  },
  inquiry: {
    sentTitle: "Inquiry Sent!",
    sentBody: "We received your request for",
    sendAnother: "Send another inquiry",
    labels: {
      name: "Full Name",
      email: "Email Address",
      dimensions: "Requested Dimensions",
      optional: "optional",
      message: "Message",
    },
    placeholders: {
      name: "Jane Smith",
      email: "jane@example.com",
      dimensions: "e.g. 180x80x75 cm",
      message: "Tell us about your project, space, or any customization you need.",
    },
    actions: {
      sending: "Sending...",
      send: "Send Inquiry",
    },
    errors: {
      nameShort: "Name must be at least 2 characters",
      invalidEmail: "Please enter a valid email address",
      messageShort: "Message must be at least 10 characters",
      failed: "Failed to send inquiry",
      unknown: "Something went wrong",
    },
  },
};
