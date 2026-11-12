import { ConvexFunctionDefinitions, RegisteredConvexFunction, type RegisteredFunctions } from "@confect/server";
import databaseSchema from "../schema";
import groupLayer from "../../automation.impl";

const forward = <Ctx, Args, Returns>(handler: (ctx: Ctx, args: Args) => Promise<Returns>) => (ctx: Ctx, args: Args) => handler(ctx, args);

const definitions = ConvexFunctionDefinitions.buildForGroup<typeof import("../../automation.spec")["default"]>(databaseSchema, groupLayer);

export default {
["overdueLoans"]: RegisteredConvexFunction.register({ ...definitions["overdueLoans"], handler: forward(definitions["overdueLoans"].handler) }),
["recordReminder"]: RegisteredConvexFunction.register({ ...definitions["recordReminder"], handler: forward(definitions["recordReminder"].handler) }),
["recordWorkflowError"]: RegisteredConvexFunction.register({ ...definitions["recordWorkflowError"], handler: forward(definitions["recordWorkflowError"].handler) }),
} as RegisteredFunctions.RegisteredFunctionsForGroupSpec<typeof import("../../automation.spec")["default"]>;
