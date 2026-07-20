import nodemailer from "nodemailer";

export function getAppBaseUrl() {
  const base = process.env.APP_BASE_URL;
  // Dev-friendly default to avoid breaking signup locally.
  if (!base) return "http://localhost:3000";
  return base.replace(/\/+$/, "");
}

interface EmailOptions {
  from?: string;
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  return await transporter.sendMail({
    from: options.from || process.env.EMAIL_USER || "AI Memory Engine",
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  });
}
