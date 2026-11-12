import { GroupSpec, Spec } from "@confect/core";
import users from "../users.spec";

const spec: Spec.Spec<{
  readonly users: GroupSpec.NamedAt<typeof users, "users">;
}> = Spec.fromGroups({
  ["users"]: users,
}) as typeof spec;

export default spec;
