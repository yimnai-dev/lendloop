import { GroupSpec, Spec } from "@confect/core";
import catalog from "../catalog.spec";
import loans from "../loans.spec";
import outbox from "../outbox.spec";
import tools from "../tools.spec";
import users from "../users.spec";

const spec: Spec.Spec<{
  readonly catalog: GroupSpec.NamedAt<typeof catalog, "catalog">;
  readonly loans: GroupSpec.NamedAt<typeof loans, "loans">;
  readonly outbox: GroupSpec.NamedAt<typeof outbox, "outbox">;
  readonly tools: GroupSpec.NamedAt<typeof tools, "tools">;
  readonly users: GroupSpec.NamedAt<typeof users, "users">;
}> = Spec.fromGroups({
  ["catalog"]: catalog,
  ["loans"]: loans,
  ["outbox"]: outbox,
  ["tools"]: tools,
  ["users"]: users,
}) as typeof spec;

export default spec;
