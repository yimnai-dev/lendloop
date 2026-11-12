import { ConvexFunctionDefinitions, RegisteredConvexFunction, type RegisteredFunctions } from "@confect/server";
import databaseSchema from "../schema";
import groupLayer from "../../tools.impl";

const forward = <Ctx, Args, Returns>(handler: (ctx: Ctx, args: Args) => Promise<Returns>) => (ctx: Ctx, args: Args) => handler(ctx, args);

const definitions = ConvexFunctionDefinitions.buildForGroup<typeof import("../../tools.spec")["default"]>(databaseSchema, groupLayer);

export default {
["browse"]: RegisteredConvexFunction.register({ ...definitions["browse"], handler: forward(definitions["browse"].handler) }),
["get"]: RegisteredConvexFunction.register({ ...definitions["get"], handler: forward(definitions["get"].handler) }),
["myListings"]: RegisteredConvexFunction.register({ ...definitions["myListings"], handler: forward(definitions["myListings"].handler) }),
["generateUploadUrl"]: RegisteredConvexFunction.register({ ...definitions["generateUploadUrl"], handler: forward(definitions["generateUploadUrl"].handler) }),
["create"]: RegisteredConvexFunction.register({ ...definitions["create"], handler: forward(definitions["create"].handler) }),
["update"]: RegisteredConvexFunction.register({ ...definitions["update"], handler: forward(definitions["update"].handler) }),
["archive"]: RegisteredConvexFunction.register({ ...definitions["archive"], handler: forward(definitions["archive"].handler) }),
} as RegisteredFunctions.RegisteredFunctionsForGroupSpec<typeof import("../../tools.spec")["default"]>;
