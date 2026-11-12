import { ConvexFunctionDefinitions, RegisteredConvexFunction, type RegisteredFunctions } from "@confect/server";
import databaseSchema from "../schema";
import groupLayer from "../../admin.impl";

const forward = <Ctx, Args, Returns>(handler: (ctx: Ctx, args: Args) => Promise<Returns>) => (ctx: Ctx, args: Args) => handler(ctx, args);

const definitions = ConvexFunctionDefinitions.buildForGroup<typeof import("../../admin.spec")["default"]>(databaseSchema, groupLayer);

export default {
["loans"]: RegisteredConvexFunction.register({ ...definitions["loans"], handler: forward(definitions["loans"].handler) }),
["users"]: RegisteredConvexFunction.register({ ...definitions["users"], handler: forward(definitions["users"].handler) }),
["listings"]: RegisteredConvexFunction.register({ ...definitions["listings"], handler: forward(definitions["listings"].handler) }),
["removeListing"]: RegisteredConvexFunction.register({ ...definitions["removeListing"], handler: forward(definitions["removeListing"].handler) }),
["setTrustedLender"]: RegisteredConvexFunction.register({ ...definitions["setTrustedLender"], handler: forward(definitions["setTrustedLender"].handler) }),
["automation"]: RegisteredConvexFunction.register({ ...definitions["automation"], handler: forward(definitions["automation"].handler) }),
["redriveNotifications"]: RegisteredConvexFunction.register({ ...definitions["redriveNotifications"], handler: forward(definitions["redriveNotifications"].handler) }),
} as RegisteredFunctions.RegisteredFunctionsForGroupSpec<typeof import("../../admin.spec")["default"]>;
