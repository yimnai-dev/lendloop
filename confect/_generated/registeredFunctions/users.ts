import { ConvexFunctionDefinitions, RegisteredConvexFunction, type RegisteredFunctions } from "@confect/server";
import databaseSchema from "../schema";
import groupLayer from "../../users.impl";

const forward = <Ctx, Args, Returns>(handler: (ctx: Ctx, args: Args) => Promise<Returns>) => (ctx: Ctx, args: Args) => handler(ctx, args);

const definitions = ConvexFunctionDefinitions.buildForGroup<typeof import("../../users.spec")["default"]>(databaseSchema, groupLayer);

export default {
["viewer"]: RegisteredConvexFunction.register({ ...definitions["viewer"], handler: forward(definitions["viewer"].handler) }),
["provision"]: RegisteredConvexFunction.register({ ...definitions["provision"], handler: forward(definitions["provision"].handler) }),
["upsertFromClerk"]: RegisteredConvexFunction.register({ ...definitions["upsertFromClerk"], handler: forward(definitions["upsertFromClerk"].handler) }),
["anonymize"]: RegisteredConvexFunction.register({ ...definitions["anonymize"], handler: forward(definitions["anonymize"].handler) }),
} as RegisteredFunctions.RegisteredFunctionsForGroupSpec<typeof import("../../users.spec")["default"]>;
