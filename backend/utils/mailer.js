const nodemailer = require("nodemailer");

let cachedTransporter = null;

const getMailerConfig = () => ({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true",
  user: process.env.SMTP_USER,
  pass: process.env.SMTP_PASS,
  from: process.env.MAIL_FROM || process.env.SMTP_USER || "Needo <no-reply@needo.local>",
  tlsRejectUnauthorized: process.env.SMTP_TLS_REJECT_UNAUTHORIZED !== "false",
  tlsServerName: process.env.SMTP_TLS_SERVERNAME || undefined,
});

const isMailConfigured = () => {
  const config = getMailerConfig();
  return Boolean(config.host && config.user && config.pass);
};

const getTransporter = () => {
  if (cachedTransporter) return cachedTransporter;

  const config = getMailerConfig();
  cachedTransporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
    tls: {
      rejectUnauthorized: config.tlsRejectUnauthorized,
      servername: config.tlsServerName,
    },
  });

  return cachedTransporter;
};

const sendMail = async ({ to, subject, html, text }) => {
  if (!to) return { skipped: true, reason: "missing_recipient" };
  if (!isMailConfigured()) {
    console.warn(`Email skipped for ${to}: SMTP config is missing`);
    return { skipped: true, reason: "missing_config" };
  }

  const config = getMailerConfig();
  await getTransporter().sendMail({
    from: config.from,
    to,
    subject,
    text,
    html,
  });

  return { sent: true };
};

module.exports = {
  isMailConfigured,
  sendMail,
};
