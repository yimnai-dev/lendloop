import { readFileSync } from "node:fs";

/**
 * Tiny typed builders for the handful of n8n node shapes LendLoop uses.
 * The JavaScript for Code nodes lives in `n8n/code/*.js` so it can be read
 * and reviewed as code instead of as an escaped JSON string.
 */
export type Node = {
  readonly id: string;
  readonly name: string;
  readonly type: string;
  readonly typeVersion: number;
  readonly position: readonly [number, number];
  readonly parameters: Readonly<Record<string, unknown>>;
  readonly webhookId?: string;
  readonly credentials?: Readonly<Record<string, { id: string; name: string }>>;
  readonly retryOnFail?: boolean;
  readonly maxTries?: number;
  readonly waitBetweenTries?: number;
  readonly onError?: "continueErrorOutput";
};

type Base = {
  readonly id: string;
  readonly name: string;
  readonly at: readonly [number, number];
};

const codeDir = new URL("../../n8n/code/", import.meta.url);
export const readCode = (file: string) => readFileSync(new URL(file, codeDir), "utf8");

export const code = (
  base: Base & {
    readonly file: string;
    readonly perItem?: boolean;
    readonly replace?: Record<string, string>;
  },
): Node => ({
  id: base.id,
  name: base.name,
  type: "n8n-nodes-base.code",
  typeVersion: 2,
  position: base.at,
  parameters: {
    ...(base.perItem === true ? { mode: "runOnceForEachItem" } : {}),
    jsCode: Object.entries(base.replace ?? {}).reduce(
      (source, [from, to]) => source.replaceAll(from, to),
      readCode(base.file),
    ),
  },
});

/** Retries are on every outbound call: 3 tries, 2 s apart. */
const RETRY = { retryOnFail: true, maxTries: 3, waitBetweenTries: 2000 } as const;

export const RESEND_CREDENTIAL = {
  httpHeaderAuth: { id: "lendloopResendApi", name: "Resend API" },
};

/** POST an email to Resend; failures go to the second (error) output. */
export const sendEmail = (base: Base & { readonly idempotencyKey: string }): Node => ({
  id: base.id,
  name: base.name,
  type: "n8n-nodes-base.httpRequest",
  typeVersion: 4.2,
  position: base.at,
  parameters: {
    method: "POST",
    url: "={{ $env.RESEND_BASE_URL }}/emails",
    authentication: "genericCredentialType",
    genericAuthType: "httpHeaderAuth",
    sendHeaders: true,
    headerParameters: {
      parameters: [{ name: "Idempotency-Key", value: base.idempotencyKey }],
    },
    sendBody: true,
    specifyBody: "json",
    jsonBody: "={{ JSON.stringify($json.email) }}",
    options: { timeout: 15000 },
  },
  credentials: RESEND_CREDENTIAL,
  ...RETRY,
  onError: "continueErrorOutput",
});

/** Calls a signed Convex automation endpoint using `path`, `signature` (and `body`) from the item. */
export const callConvex = (base: Base & { readonly method: "GET" | "POST" }): Node => ({
  id: base.id,
  name: base.name,
  type: "n8n-nodes-base.httpRequest",
  typeVersion: 4.2,
  position: base.at,
  parameters: {
    method: base.method,
    url: "={{ $env.CONVEX_SITE_URL }}{{ $json.path }}",
    sendHeaders: true,
    headerParameters: {
      parameters: [{ name: "x-lendloop-signature", value: "={{ $json.signature }}" }],
    },
    ...(base.method === "POST"
      ? {
          sendBody: true,
          contentType: "raw",
          rawContentType: "application/json",
          body: "={{ $json.body }}",
        }
      : {}),
    options: { timeout: 15000 },
  },
  ...RETRY,
});

export const respond = (
  base: Base & { readonly status: number; readonly body: string },
): Node => ({
  id: base.id,
  name: base.name,
  type: "n8n-nodes-base.respondToWebhook",
  typeVersion: 1.1,
  position: base.at,
  parameters: {
    respondWith: "json",
    responseBody: base.body,
    options: { responseCode: base.status },
  },
});

/** Edges as `[from, to, fromOutput?]`; n8n wants them grouped by source and output. */
export const connect = (edges: ReadonlyArray<readonly [string, string, number?]>) => {
  const connections: Record<
    string,
    { main: Array<Array<{ node: string; type: "main"; index: 0 }>> }
  > = {};
  for (const [from, to, output = 0] of edges) {
    const main = (connections[from] ??= { main: [] }).main;
    while (main.length <= output) main.push([]);
    main[output]?.push({ node: to, type: "main", index: 0 });
  }
  return connections;
};
