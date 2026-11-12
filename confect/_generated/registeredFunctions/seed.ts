import { ConvexFunctionDefinitions, RegisteredConvexFunction, type RegisteredFunctions } from "@confect/server";
import databaseSchema from "../schema";
import groupLayer from "../../seed.impl";

const forward = <Ctx, Args, Returns>(handler: (ctx: Ctx, args: Args) => Promise<Returns>) => (ctx: Ctx, args: Args) => handler(ctx, args);

const definitions = ConvexFunctionDefinitions.buildForGroup<typeof import("../../seed.spec")["default"]>(databaseSchema, groupLayer);

export default {
["backfillOwnerTrust"]: RegisteredConvexFunction.register({ ...definitions["backfillOwnerTrust"], handler: forward(definitions["backfillOwnerTrust"].handler) }),
["demo"]: RegisteredConvexFunction.register({ ...definitions["demo"], handler: forward(definitions["demo"].handler) }),
} as RegisteredFunctions.RegisteredFunctionsForGroupSpec<typeof import("../../seed.spec")["default"]>;
