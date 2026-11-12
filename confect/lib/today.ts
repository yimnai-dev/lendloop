import * as Clock from "effect/Clock";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import { todayIn } from "../../shared/domain/IsoDate";

/** The neighborhood's time zone (APP_TZ, default UTC) decides what "today" means. */
export const appToday = Effect.gen(function* () {
  const timeZone = yield* Config.String("APP_TZ").pipe(Config.withDefault("UTC"));
  return todayIn(timeZone, yield* Clock.currentTimeMillis);
}).pipe(Effect.orDie);
