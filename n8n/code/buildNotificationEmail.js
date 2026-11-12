// Turns the minimal notification payload into a Resend email.
// Env: EMAIL_FROM, APP_URL.
const { payload } = $input.first().json;
const { recipient, tool, loan, type, eventId } = payload;
// ISO calendar dates → "Nov 13 – 15" (UTC, since the dates carry no zone).
const short = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", timeZone: "UTC" });
const dates = short.formatRange(new Date(`${loan.startDate}T00:00:00Z`), new Date(`${loan.endDate}T00:00:00Z`));

const COPY = {
  request_created: [`New request for your ${tool.name}`, `A neighbor asked to borrow your ${tool.name} for ${dates}.`],
  request_approved: [`Approved: ${tool.name}`, `Your request to borrow the ${tool.name} for ${dates} was approved. You'll find the lender's email in LendLoop.`],
  request_declined: [`Request declined: ${tool.name}`, `Your request to borrow the ${tool.name} for ${dates} was declined.`],
  request_cancelled: [`Request cancelled: ${tool.name}`, `The request to borrow the ${tool.name} for ${dates} was cancelled.`],
  loan_returned: [`Returned: ${tool.name}`, `The loan of the ${tool.name} (${dates}) is marked returned. Thanks for being a good neighbor!`],
};
const [subject, line] = COPY[type] ?? [`LendLoop update: ${tool.name}`, `There's an update on ${tool.name}.`];
const link = `${$env.APP_URL ?? "http://localhost:3000"}/requests`;

return [
  {
    json: {
      idempotencyKey: eventId,
      email: {
        from: $env.EMAIL_FROM,
        to: [recipient.email],
        subject,
        text: `Hi ${recipient.firstName},\n\n${line}\n\n${link}\n\n— LendLoop`,
      },
    },
  },
];
