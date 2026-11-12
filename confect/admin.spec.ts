import { FunctionSpec, GroupSpec } from "@confect/core";
import * as Schema from "effect/Schema";
import { InvalidRequest, NotFound } from "../shared/domain/errors";
import { LoanStatus } from "../shared/domain/LoanStatus";
import { Id } from "./_generated/id";
import { AdminListing, AdminLoan, AdminUser, AutomationHealth } from "./adminViews";
import RequireRole from "./middleware/RequireRole.spec";
import RequireUser from "./middleware/RequireUser.spec";

/** Moderation. Every function requires the admin role, checked server-side. */
export default GroupSpec.make()
  .middleware(RequireUser)
  .middleware(RequireRole, { admin: true })
  .addFunction(
    FunctionSpec.publicPaginatedQuery({
      name: "loans",
      args: () => ({ status: Schema.optionalKey(LoanStatus) }),
      item: () => AdminLoan,
    }),
  )
  .addFunction(
    FunctionSpec.publicQuery({
      name: "users",
      returns: () => Schema.Array(AdminUser),
    }),
  )
  .addFunction(
    FunctionSpec.publicQuery({
      name: "listings",
      returns: () => Schema.Array(AdminListing),
    }),
  )
  .addFunction(
    FunctionSpec.publicMutation({
      name: "removeListing",
      args: () => ({ toolId: Id("tools") }),
      returns: () => Schema.Null,
      error: () => Schema.Union([NotFound, InvalidRequest]),
    }),
  )
  .addFunction(
    FunctionSpec.publicMutation({
      name: "setTrustedLender",
      args: () => ({ userId: Id("users"), trusted: Schema.Boolean }),
      returns: () => Schema.Null,
      error: () => Schema.Union([NotFound, InvalidRequest]),
    }),
  )
  .addFunction(
    FunctionSpec.publicQuery({ name: "automation", returns: () => AutomationHealth }),
  )
  .addFunction(
    FunctionSpec.publicMutation({
      name: "redriveNotifications",
      returns: () => Schema.Finite,
    }),
  );
