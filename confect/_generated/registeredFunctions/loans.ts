import { ConvexFunctionDefinitions, RegisteredConvexFunction, type RegisteredFunctions } from "@confect/server";
import databaseSchema from "../schema";
import groupLayer from "../../loans.impl";

const forward = <Ctx, Args, Returns>(handler: (ctx: Ctx, args: Args) => Promise<Returns>) => (ctx: Ctx, args: Args) => handler(ctx, args);

const definitions = ConvexFunctionDefinitions.buildForGroup<typeof import("../../loans.spec")["default"]>(databaseSchema, groupLayer);

export default {
["request"]: RegisteredConvexFunction.register({ ...definitions["request"], handler: forward(definitions["request"].handler) }),
["approve"]: RegisteredConvexFunction.register({ ...definitions["approve"], handler: forward(definitions["approve"].handler) }),
["decline"]: RegisteredConvexFunction.register({ ...definitions["decline"], handler: forward(definitions["decline"].handler) }),
["cancel"]: RegisteredConvexFunction.register({ ...definitions["cancel"], handler: forward(definitions["cancel"].handler) }),
["markReturned"]: RegisteredConvexFunction.register({ ...definitions["markReturned"], handler: forward(definitions["markReturned"].handler) }),
["myRequests"]: RegisteredConvexFunction.register({ ...definitions["myRequests"], handler: forward(definitions["myRequests"].handler) }),
["incoming"]: RegisteredConvexFunction.register({ ...definitions["incoming"], handler: forward(definitions["incoming"].handler) }),
} as RegisteredFunctions.RegisteredFunctionsForGroupSpec<typeof import("../../loans.spec")["default"]>;
