import { callConvex, code, connect, respond, sendEmail, type Node } from "./nodes";

/** Stable ids so re-imports update in place and `errorWorkflow` can point at one. */
export const WORKFLOW_IDS = {
  notify: "LendLoopNotify01",
  overdue: "LendLoopOverdue1",
  errors: "LendLoopErrors01",
} as const;

const settings = (errorWorkflow: boolean) => ({
  executionOrder: "v1",
  saveDataErrorExecution: "all",
  saveDataSuccessExecution: "none",
  ...(errorWorkflow ? { errorWorkflow: WORKFLOW_IDS.errors } : {}),
});

const workflow = (
  id: string,
  name: string,
  nodes: ReadonlyArray<Node>,
  edges: ReadonlyArray<readonly [string, string, number?]>,
  withErrorWorkflow = true,
) => ({
  id,
  name,
  active: false,
  nodes,
  connections: connect(edges),
  settings: settings(withErrorWorkflow),
  pinData: {},
  tags: [],
});

const notify = workflow(
  WORKFLOW_IDS.notify,
  "LendLoop · Loan notifications",
  [
    {
      id: "notify-webhook",
      name: "Loan event",
      type: "n8n-nodes-base.webhook",
      typeVersion: 2,
      position: [0, 0],
      webhookId: "9d7f3c1e-2b8a-4c55-9e0f-1a2b3c4d5e6f",
      parameters: {
        httpMethod: "POST",
        path: "lendloop-notify",
        responseMode: "responseNode",
        options: { rawBody: true },
      },
    },
    code({
      id: "notify-verify",
      name: "Verify signature",
      at: [220, 0],
      file: "verifyNotification.js",
    }),
    {
      id: "notify-if",
      name: "Signed by Convex?",
      type: "n8n-nodes-base.if",
      typeVersion: 2.2,
      position: [440, 0],
      parameters: {
        conditions: {
          options: {
            caseSensitive: true,
            leftValue: "",
            typeValidation: "strict",
            version: 2,
          },
          conditions: [
            {
              id: "valid",
              leftValue: "={{ $json.valid }}",
              rightValue: true,
              operator: { type: "boolean", operation: "true", singleValue: true },
            },
          ],
          combinator: "and",
        },
        options: {},
      },
    },
    code({
      id: "notify-build",
      name: "Build email",
      at: [660, -100],
      file: "buildNotificationEmail.js",
    }),
    sendEmail({
      id: "notify-send",
      name: "Send email",
      at: [880, -100],
      idempotencyKey: "={{ $json.idempotencyKey }}",
    }),
    respond({
      id: "notify-ok",
      name: "Accepted",
      at: [1100, -180],
      status: 200,
      body: '={{ { "sent": true } }}',
    }),
    // 502 makes the Convex outbox retry later; the Idempotency-Key stops duplicates.
    respond({
      id: "notify-failed",
      name: "Send failed",
      at: [1100, -20],
      status: 502,
      body: '={{ { "sent": false } }}',
    }),
    respond({
      id: "notify-reject",
      name: "Unauthorized",
      at: [660, 100],
      status: 401,
      body: '={{ { "error": "unauthorized" } }}',
    }),
  ],
  [
    ["Loan event", "Verify signature"],
    ["Verify signature", "Signed by Convex?"],
    ["Signed by Convex?", "Build email", 0],
    ["Signed by Convex?", "Unauthorized", 1],
    ["Build email", "Send email"],
    ["Send email", "Accepted", 0],
    ["Send email", "Send failed", 1],
  ],
);

const overdue = workflow(
  WORKFLOW_IDS.overdue,
  "LendLoop · Daily overdue reminders",
  [
    {
      id: "overdue-schedule",
      name: "Every day at 09:00",
      type: "n8n-nodes-base.scheduleTrigger",
      typeVersion: 1.2,
      position: [0, 0],
      parameters: {
        rule: { interval: [{ field: "cronExpression", expression: "0 9 * * *" }] },
      },
    },
    {
      // Lets an operator (or `n8n execute`) run the job on demand.
      id: "overdue-manual",
      name: "Run now",
      type: "n8n-nodes-base.manualTrigger",
      typeVersion: 1,
      position: [0, 160],
      parameters: {},
    },
    code({
      id: "overdue-sign",
      name: "Sign request",
      at: [220, 0],
      file: "signOverdueRequest.js",
    }),
    callConvex({
      id: "overdue-fetch",
      name: "Fetch overdue loans",
      at: [440, 0],
      method: "GET",
    }),
    code({
      id: "overdue-split",
      name: "Split reminders",
      at: [660, 0],
      file: "splitReminders.js",
    }),
    sendEmail({
      id: "overdue-send",
      name: "Send reminder",
      at: [880, 0],
      idempotencyKey: "={{ $json.reminderKey }}",
    }),
    code({
      id: "overdue-sent",
      name: "Sign sent",
      at: [1100, -100],
      file: "signWriteBack.js",
      perItem: true,
      replace: { __STATUS__: "sent" },
    }),
    code({
      id: "overdue-failed",
      name: "Sign failed",
      at: [1100, 100],
      file: "signWriteBack.js",
      perItem: true,
      replace: { __STATUS__: "failed" },
    }),
    callConvex({
      id: "overdue-record",
      name: "Record result",
      at: [1320, 0],
      method: "POST",
    }),
  ],
  [
    ["Every day at 09:00", "Sign request"],
    ["Run now", "Sign request"],
    ["Sign request", "Fetch overdue loans"],
    ["Fetch overdue loans", "Split reminders"],
    ["Split reminders", "Send reminder"],
    ["Send reminder", "Sign sent", 0],
    ["Send reminder", "Sign failed", 1],
    ["Sign sent", "Record result"],
    ["Sign failed", "Record result"],
  ],
);

const errors = workflow(
  WORKFLOW_IDS.errors,
  "LendLoop · Error handler",
  [
    {
      id: "errors-trigger",
      name: "Workflow failed",
      type: "n8n-nodes-base.errorTrigger",
      typeVersion: 1,
      position: [0, 0],
      parameters: {},
    },
    code({
      id: "errors-sign",
      name: "Sign report",
      at: [220, 0],
      file: "signWorkflowError.js",
    }),
    callConvex({
      id: "errors-record",
      name: "Record in Convex",
      at: [440, 0],
      method: "POST",
    }),
  ],
  [
    ["Workflow failed", "Sign report"],
    ["Sign report", "Record in Convex"],
  ],
  false,
);

export const WORKFLOWS = {
  "notify.json": notify,
  "overdue.json": overdue,
  "errors.json": errors,
};
