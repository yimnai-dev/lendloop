/** Clerk's hosted components, themed to match the app (they render outside our CSS). */
export const clerkAppearance = {
  variables: {
    colorPrimary: "#17694a",
    colorBackground: "#ffffff",
    colorForeground: "#231c14",
    borderRadius: "0.75rem",
    fontFamily: "var(--font-sans)",
  },
  elements: {
    card: "shadow-lg border border-border",
    headerTitle: "font-heading",
  },
} as const;
