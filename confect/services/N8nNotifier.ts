import * as Clock from "effect/Clock";
import * as Mac from "effect/crypto/Mac";
import * as Config from "effect/Config";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as FetchHttpClient from "effect/http/FetchHttpClient";
import * as HttpClient from "effect/http/HttpClient";
import * as HttpClientRequest from "effect/http/HttpClientRequest";
import * as Layer from "effect/Layer";
import * as Schedule from "effect/Schedule";
import * as Schema from "effect/Schema";
import { NotificationPayload } from "../../shared/integration/events";
import { MacLive, SIGNATURE_HEADER, sign } from "../../shared/integration/signature";

export class N8nDeliveryError extends Schema.TaggedError<N8nDeliveryError>()(
  "N8nDeliveryError",
  { message: Schema.String },
) {}

const encodePayload = Schema.encodeSync(Schema.fromJsonString(NotificationPayload));

/** Delivers signed notification events to the n8n webhook. */
export class N8nNotifier extends Context.Service<
  N8nNotifier,
  {
    readonly notify: (
      payload: NotificationPayload,
    ) => Effect.Effect<void, N8nDeliveryError>;
  }
>()("lendloop/confect/services/N8nNotifier") {
  static readonly layer = Layer.effect(
    N8nNotifier,
    Effect.gen(function* () {
      const mac = yield* Mac.Mac;
      const client = (yield* HttpClient.HttpClient).pipe(
        HttpClient.filterStatusOk,
        // Network errors, 5xx and 429 only; a 401 won't fix itself in 2 seconds.
        HttpClient.retryTransient({
          schedule: Schedule.exponential("500 millis").pipe(Schedule.jittered),
          times: 3,
        }),
      );

      const notify = Effect.fn("N8nNotifier.notify")(
        function* (payload: NotificationPayload) {
          // Read per call so a misconfiguration is recorded as a failed delivery.
          const url = yield* Config.String("N8N_NOTIFY_WEBHOOK_URL");
          const secret = yield* Config.Redacted("CONVEX_TO_N8N_SECRET");
          const body = encodePayload(payload);
          const nowSeconds = Math.floor((yield* Clock.currentTimeMillis) / 1000);
          const signature = yield* sign(
            secret,
            { method: "POST", path: new URL(url).pathname, body },
            nowSeconds,
          ).pipe(Effect.provideService(Mac.Mac, mac));

          yield* HttpClientRequest.post(url).pipe(
            HttpClientRequest.setHeaders({
              [SIGNATURE_HEADER]: signature,
              "x-lendloop-event-id": payload.eventId,
            }),
            HttpClientRequest.bodyText(body, "application/json"),
            client.execute,
            Effect.timeout("15 seconds"),
          );
        },
        Effect.mapError((error) => new N8nDeliveryError({ message: describe(error) })),
      );

      return N8nNotifier.of({ notify });
    }),
  ).pipe(Layer.provide([FetchHttpClient.layer, MacLive]));
}

const describe = (error: unknown): string => {
  if (error instanceof Error) return `${error.name}: ${error.message}`.slice(0, 500);
  return String(error).slice(0, 500);
};
