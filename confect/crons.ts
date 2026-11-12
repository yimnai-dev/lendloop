import { CronJob, CronJobs } from "@confect/server";
import * as Duration from "effect/Duration";
import refs from "./_generated/refs";

export default CronJobs.make().add(
  CronJob.make(
    "sweep stuck outbox events",
    Duration.minutes(5),
    refs.internal.outbox.sweep,
  ),
);
