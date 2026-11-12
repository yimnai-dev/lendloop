import { ConvexFunctionDefinitions, RegisteredConvexFunction, type RegisteredFunctions } from "@confect/server";
import databaseSchema from "../schema";
import groupLayer from "../../outbox.impl";

const forward = <Ctx, Args, Returns>(handler: (ctx: Ctx, args: Args) => Promise<Returns>) => (ctx: Ctx, args: Args) => handler(ctx, args);

const definitions = ConvexFunctionDefinitions.buildForGroup<typeof import("../../outbox.spec")["default"]>(databaseSchema, groupLayer);

export default {
["load"]: RegisteredConvexFunction.register({ ...definitions["load"], handler: forward(definitions["load"].handler) }),
["dispatch"]: RegisteredConvexFunction.register({ ...definitions["dispatch"], handler: forward(definitions["dispatch"].handler) }),
["recordSuccess"]: RegisteredConvexFunction.register({ ...definitions["recordSuccess"], handler: forward(definitions["recordSuccess"].handler) }),
["recordFailure"]: RegisteredConvexFunction.register({ ...definitions["recordFailure"], handler: forward(definitions["recordFailure"].handler) }),
["sweep"]: RegisteredConvexFunction.register({ ...definitions["sweep"], handler: forward(definitions["sweep"].handler) }),
["redrive"]: RegisteredConvexFunction.register({ ...definitions["redrive"], handler: forward(definitions["redrive"].handler) }),
} as RegisteredFunctions.RegisteredFunctionsForGroupSpec<typeof import("../../outbox.spec")["default"]>;
