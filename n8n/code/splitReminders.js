// One item per reminder, with the email Resend should send.
// Env: EMAIL_FROM, APP_URL.
const { reminders } = $input.first().json;
const link = `${$env.APP_URL ?? "http://localhost:3000"}/requests`;

return reminders.map((reminder) => ({
  json: {
    reminderKey: reminder.reminderKey,
    email: {
      from: $env.EMAIL_FROM,
      to: [reminder.recipient.email],
      subject: `Reminder: please return the ${reminder.tool.name}`,
      text:
        `Hi ${reminder.recipient.firstName},\n\n` +
        `The ${reminder.tool.name} was due back on ${reminder.loan.endDate} ` +
        `(${reminder.daysOverdue} day${reminder.daysOverdue === 1 ? "" : "s"} ago). ` +
        `Please arrange the return with the lender.\n\n${link}\n\n— LendLoop`,
    },
  },
}));
