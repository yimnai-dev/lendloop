import * as Clock from "effect/Clock";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as HttpRouter from "effect/http/HttpRouter";
import { todayIn } from "../../shared/domain/IsoDate";
import {
  AUTOMATION_PATHS,
  ReminderResult,
  WorkflowError,
} from "../../shared/integration/automation";
import refs from "../_generated/refs";
import { MutationRunner, QueryRunner } from "../_generated/services";
import { decodeBody, jsonResponse, signedRoute, verifiedBody } from "./signed";

const overdueLoans = signedRoute(
  Effect.gen(function* () {
    yield* verifiedBody;
    const timeZone = yield* Config.String("APP_TZ").pipe(
      Config.withDefault("UTC"),
      Effect.orDie,
    );
    const today = todayIn(timeZone, yield* Clock.currentTimeMillis);
    const { runQuery } = yield* QueryRunner;
    return jsonResponse(
      yield* runQuery(refs.internal.automation.overdueLoans, { today }).pipe(
        Effect.orDie,
      ),
    );
  }),
);

const reminders = signedRoute(
  Effect.gen(function* () {
    const result = yield* decodeBody(ReminderResult, yield* verifiedBody);
    const { runMutation } = yield* MutationRunner;
    return jsonResponse(
      yield* runMutation(refs.internal.automation.recordReminder, result).pipe(
        Effect.orDie,
      ),
    );
  }),
);

const errors = signedRoute(
  Effect.gen(function* () {
    const error = yield* decodeBody(WorkflowError, yield* verifiedBody);
    const { runMutation } = yield* MutationRunner;
    return jsonResponse(
      yield* runMutation(refs.internal.automation.recordWorkflowError, error).pipe(
        Effect.orDie,
      ),
    );
  }),
);

export const automationRoutes = Layer.mergeAll(
  HttpRouter.add("GET", AUTOMATION_PATHS.overdueLoans, overdueLoans),
  HttpRouter.add("POST", AUTOMATION_PATHS.reminders, reminders),
  HttpRouter.add("POST", AUTOMATION_PATHS.errors, errors),
);
