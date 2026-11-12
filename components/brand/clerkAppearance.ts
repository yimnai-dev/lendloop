/** Clerk's hosted components, themed to match the app (they render outside our CSS). */
export const clerkAppearance = {
  variables: {
    colorPrimary: "#1b1916",
    colorBackground: "#fbf9f5",
    colorForeground: "#1b1916",
    colorMutedForeground: "#7d766c",
    colorInput: "#fdfcf9",
    borderRadius: "0.5rem",
    fontFamily: "var(--font-sans)",
  },
  elements: {
    card: "shadow-none border border-border",
    headerTitle: "font-heading font-normal text-3xl",
    formButtonPrimary: "rounded-full",
    avatarBox: "ring-1 ring-border",
  },
} as const;
