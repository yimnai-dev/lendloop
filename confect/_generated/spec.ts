import { GroupSpec, Spec } from "@confect/core";
import admin from "../admin.spec";
import automation from "../automation.spec";
import catalog from "../catalog.spec";
import loans from "../loans.spec";
import outbox from "../outbox.spec";
import seed from "../seed.spec";
import tools from "../tools.spec";
import users from "../users.spec";

const spec: Spec.Spec<{
  readonly admin: GroupSpec.NamedAt<typeof admin, "admin">;
  readonly automation: GroupSpec.NamedAt<typeof automation, "automation">;
  readonly catalog: GroupSpec.NamedAt<typeof catalog, "catalog">;
  readonly loans: GroupSpec.NamedAt<typeof loans, "loans">;
  readonly outbox: GroupSpec.NamedAt<typeof outbox, "outbox">;
  readonly seed: GroupSpec.NamedAt<typeof seed, "seed">;
  readonly tools: GroupSpec.NamedAt<typeof tools, "tools">;
  readonly users: GroupSpec.NamedAt<typeof users, "users">;
}> = Spec.fromGroups({
  ["admin"]: admin,
  ["automation"]: automation,
  ["catalog"]: catalog,
  ["loans"]: loans,
  ["outbox"]: outbox,
  ["seed"]: seed,
  ["tools"]: tools,
  ["users"]: users,
}) as typeof spec;

export default spec;
