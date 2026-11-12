import { FunctionSpec, GroupSpec } from "@confect/core";
import * as Schema from "effect/Schema";
import { Category } from "../shared/domain/Category";
import {
  Forbidden,
  InvalidRequest,
  NotFound,
  RateLimited,
} from "../shared/domain/errors";
import { ToolFields } from "../shared/domain/Tool";
import { Id } from "./_generated/id";
import RequireUser from "./middleware/RequireUser.spec";
import { MyListing, ToolDetail, ToolCard } from "./views";

const toolId = Id("tools");
const photoIds = Schema.Array(Id("_storage"));

/** Signed-in tool browsing and owner listing management. */
export default GroupSpec.make()
  .middleware(RequireUser)
  .addFunction(
    FunctionSpec.publicPaginatedQuery({
      name: "browse",
      args: () => ({
        category: Schema.optionalKey(Category),
        trustedOnly: Schema.Boolean,
      }),
      item: () => ToolCard,
    }),
  )
  .addFunction(
    FunctionSpec.publicQuery({
      name: "get",
      args: () => ({ toolId }),
      returns: () => ToolDetail,
      error: () => NotFound,
    }),
  )
  .addFunction(
    FunctionSpec.publicQuery({
      name: "myListings",
      returns: () => Schema.Array(MyListing),
    }),
  )
  .addFunction(
    FunctionSpec.publicMutation({
      name: "generateUploadUrl",
      returns: () => Schema.String,
    }),
  )
  .addFunction(
    FunctionSpec.publicMutation({
      name: "create",
      args: () => ({ ...ToolFields.fields, photoIds }),
      returns: () => toolId,
      error: () => Schema.Union([InvalidRequest, RateLimited]),
    }),
  )
  .addFunction(
    FunctionSpec.publicMutation({
      name: "update",
      args: () => ({ toolId, ...ToolFields.fields, photoIds }),
      returns: () => Schema.Null,
      error: () => Schema.Union([NotFound, Forbidden, InvalidRequest]),
    }),
  )
  .addFunction(
    FunctionSpec.publicMutation({
      name: "archive",
      args: () => ({ toolId }),
      returns: () => Schema.Null,
      error: () => Schema.Union([NotFound, Forbidden, InvalidRequest]),
    }),
  );
