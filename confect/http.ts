import { HttpRouter as ConfectHttpRouter } from "@confect/server";
import * as Layer from "effect/Layer";
import * as HttpRouter from "effect/http/HttpRouter";
import * as HttpServerResponse from "effect/http/HttpServerResponse";
import { automationRoutes } from "./http/automation";
import { clerkWebhookRoute } from "./http/clerkWebhook";

export default ConfectHttpRouter.make(
  Layer.mergeAll(
    clerkWebhookRoute,
    automationRoutes,
    HttpRouter.add("GET", "/health", HttpServerResponse.text("OK")),
  ),
);
