/**
 * Convex trusts Clerk-issued JWTs from the `convex` template. The issuer is
 * the Clerk Frontend API URL, set per deployment.
 */
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN ?? "",
      applicationID: "convex",
    },
  ],
};
