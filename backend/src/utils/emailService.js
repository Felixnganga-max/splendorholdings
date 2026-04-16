const nodemailer = require("nodemailer");

// ── Transporter ────────────────────────────────────────────────────────────────
// Supports Gmail (default), SMTP, or any nodemailer-compatible service.
// Set EMAIL_SERVICE=gmail in .env for Gmail OAuth App Passwords.
const createTransporter = () => {
  const service = process.env.EMAIL_SERVICE || "gmail";

  if (service === "gmail") {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // e.g. sally@splendorholdings.com
        pass: process.env.EMAIL_APP_PASS, // Gmail App Password (not your main password)
      },
    });
  }

  // Generic SMTP fallback (SendGrid, Mailgun, etc.)
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const transporter = createTransporter();

// ── Shared brand colours ───────────────────────────────────────────────────────
const BRAND = {
  gold: "#c2884a",
  purple: "#7B2D8B",
  dark: "#1a0d00",
  light: "#fdf6ee",
  muted: "#9a7c5a",
};

// ── Base HTML wrapper ──────────────────────────────────────────────────────────
const htmlWrapper = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Splendor Holdings</title>
</head>
<body style="margin:0;padding:0;background:#f5efe8;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5efe8;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1c0e02 0%,#2e1800 100%);border-radius:18px 18px 0 0;padding:36px 40px;text-align:center;">
              <div style="display:inline-block;background:rgba(194,136,74,0.15);border:1px solid rgba(194,136,74,0.3);border-radius:12px;padding:6px 18px;margin-bottom:16px;">
                <span style="color:#fde68a;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;font-weight:600;">Splendor Holdings</span>
              </div>
              <h1 style="margin:0;color:#fff;font-size:26px;font-weight:700;line-height:1.2;">
                ${content.headline}
              </h1>
              ${content.subheadline ? `<p style="margin:10px 0 0;color:rgba(253,230,138,0.75);font-size:14px;font-style:italic;">${content.subheadline}</p>` : ""}
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#fff;padding:36px 40px;">
              ${content.body}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#fdf6ee;border-radius:0 0 18px 18px;padding:24px 40px;border-top:1px solid #f0e5d8;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin:0 0 4px;color:#c2884a;font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;">Splendor Holdings</p>
                    <p style="margin:0;color:#b09070;font-size:11px;line-height:1.6;">
                      Senteu Plaza, Kilimani, Nairobi &nbsp;|&nbsp; Simba Lane, Nyali, Mombasa<br/>
                      <a href="tel:+254725504985" style="color:#c2884a;text-decoration:none;">+254 725 504 985</a>
                      &nbsp;|&nbsp;
                      <a href="mailto:sally@splendorholdings.com" style="color:#c2884a;text-decoration:none;">sally@splendorholdings.com</a>
                    </p>
                  </td>
                  <td align="right" valign="top">
                    <p style="margin:0;color:#c8b09a;font-size:10px;">Mon–Sat 8AM–6PM</p>
                  </td>
                </tr>
              </table>
              <p style="margin:16px 0 0;color:#c8b09a;font-size:10px;line-height:1.6;">
                You received this email because an inquiry was submitted through splendorholdings.com. 
                If this wasn't you, please ignore this message.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// ── Template: Customer auto-acknowledgement ────────────────────────────────────
const buildCustomerAckHtml = ({ name, message, inquiryType, property }) => {
  const propertyBlock = property
    ? `
      <div style="background:#fdf6ee;border-left:3px solid #c2884a;border-radius:0 12px 12px 0;padding:16px 20px;margin:20px 0;">
        <p style="margin:0 0 4px;color:#c2884a;font-size:10px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;">Property of Interest</p>
        <p style="margin:0;color:#1a0d00;font-size:14px;font-weight:600;">${property.name}</p>
        ${property.location ? `<p style="margin:4px 0 0;color:#9a7c5a;font-size:12px;">${property.location}</p>` : ""}
      </div>`
    : "";

  const body = `
    <p style="margin:0 0 20px;color:#3d2010;font-size:15px;line-height:1.8;">
      Dear <strong style="color:#1a0d00;">${name}</strong>,
    </p>
    <p style="margin:0 0 16px;color:#6b5040;font-size:14px;line-height:1.8;">
      Thank you for reaching out to Splendor Holdings. We have received your inquiry and a 
      member of our team will be in touch with you within <strong style="color:#7B2D8B;">2 business hours</strong>.
    </p>

    ${propertyBlock}

    <div style="background:#fdf6ee;border-radius:12px;padding:20px;margin:20px 0;">
      <p style="margin:0 0 8px;color:#c2884a;font-size:10px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;">Your Message</p>
      <p style="margin:0;color:#6b5040;font-size:13px;line-height:1.8;font-style:italic;">"${message}"</p>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr>
        <td style="background:rgba(194,136,74,0.08);border-radius:10px;padding:14px 18px;">
          <p style="margin:0 0 8px;color:#b45309;font-size:10px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;">What Happens Next</p>
          ${[
            "A dedicated specialist reviews your inquiry",
            "We prepare a personalised response for you",
            "You hear from us within 2 business hours",
          ]
            .map(
              (item) => `
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
              <span style="color:#c2884a;font-size:14px;">›</span>
              <span style="color:#6b5040;font-size:13px;">${item}</span>
            </div>`,
            )
            .join("")}
        </td>
      </tr>
    </table>

    <p style="margin:24px 0 0;color:#6b5040;font-size:13px;line-height:1.8;">
      Need to speak with us sooner? Call or WhatsApp Sally directly on 
      <a href="tel:+254725504985" style="color:#c2884a;font-weight:600;text-decoration:none;">+254 725 504 985</a>
    </p>
  `;

  return htmlWrapper({
    headline: "We've Received Your Inquiry",
    subheadline: `Regarding: ${inquiryType || "General Enquiry"}`,
    body,
  });
};

// ── Template: Internal admin notification ──────────────────────────────────────
const buildAdminNotificationHtml = ({
  name,
  email,
  phone,
  message,
  inquiryType,
  property,
  inquiryId,
}) => {
  const propertyBlock = property
    ? `<tr>
        <td style="padding:6px 0;color:#9a7c5a;font-size:13px;width:120px;">Property</td>
        <td style="padding:6px 0;color:#1a0d00;font-size:13px;font-weight:600;">${property.name}${property.location ? ` — ${property.location}` : ""}</td>
      </tr>`
    : "";

  const body = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
      <span style="background:#f3e8ff;color:#7B2D8B;font-size:11px;font-weight:600;padding:4px 12px;border-radius:99px;letter-spacing:0.04em;">NEW INQUIRY</span>
      <span style="color:#b09070;font-size:11px;">${new Date().toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short" })}</span>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      <tr>
        <td style="padding:6px 0;color:#9a7c5a;font-size:13px;width:120px;">Name</td>
        <td style="padding:6px 0;color:#1a0d00;font-size:13px;font-weight:600;">${name}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:#9a7c5a;font-size:13px;">Email</td>
        <td style="padding:6px 0;font-size:13px;"><a href="mailto:${email}" style="color:#c2884a;text-decoration:none;">${email}</a></td>
      </tr>
      ${
        phone
          ? `<tr>
        <td style="padding:6px 0;color:#9a7c5a;font-size:13px;">Phone</td>
        <td style="padding:6px 0;font-size:13px;"><a href="tel:${phone}" style="color:#c2884a;text-decoration:none;">${phone}</a></td>
      </tr>`
          : ""
      }
      <tr>
        <td style="padding:6px 0;color:#9a7c5a;font-size:13px;">Type</td>
        <td style="padding:6px 0;color:#1a0d00;font-size:13px;">${inquiryType || "General Enquiry"}</td>
      </tr>
      ${propertyBlock}
    </table>

    <div style="background:#fdf6ee;border-radius:12px;padding:20px;margin:16px 0;">
      <p style="margin:0 0 8px;color:#c2884a;font-size:10px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;">Message</p>
      <p style="margin:0;color:#3d2010;font-size:14px;line-height:1.8;">${message}</p>
    </div>

    <p style="margin:0;color:#9a7c5a;font-size:11px;">Inquiry ID: ${inquiryId}</p>
  `;

  return htmlWrapper({
    headline: `New Inquiry from ${name}`,
    subheadline: "Splendor Holdings Dashboard",
    body,
  });
};

// ── Template: Staff reply to customer ─────────────────────────────────────────
const buildReplyHtml = ({ customerName, replyBody, staffName, property }) => {
  const propertyBlock = property
    ? `<p style="margin:0 0 16px;color:#9a7c5a;font-size:13px;">Re: <strong style="color:#7B2D8B;">${property.name}</strong>${property.location ? ` — ${property.location}` : ""}</p>`
    : "";

  const body = `
    <p style="margin:0 0 20px;color:#3d2010;font-size:15px;line-height:1.8;">
      Dear <strong style="color:#1a0d00;">${customerName}</strong>,
    </p>
    ${propertyBlock}
    <div style="background:#fdf6ee;border-left:3px solid #7B2D8B;border-radius:0 12px 12px 0;padding:20px 24px;margin:0 0 24px;">
      <p style="margin:0;color:#3d2010;font-size:14px;line-height:1.85;white-space:pre-line;">${replyBody}</p>
    </div>
    <p style="margin:0;color:#6b5040;font-size:13px;line-height:1.8;">
      Warm regards,<br/>
      <strong style="color:#1a0d00;">${staffName}</strong><br/>
      <span style="color:#c2884a;">Splendor Holdings</span>
    </p>
    <p style="margin:20px 0 0;color:#9a7c5a;font-size:13px;line-height:1.8;">
      Have questions? Call or WhatsApp us on 
      <a href="tel:+254725504985" style="color:#c2884a;text-decoration:none;">+254 725 504 985</a>
    </p>
  `;

  return htmlWrapper({
    headline: "A Reply to Your Inquiry",
    body,
  });
};

// ── Send helpers ───────────────────────────────────────────────────────────────

/**
 * Send customer auto-acknowledgement immediately on inquiry creation.
 */
const sendCustomerAck = async ({
  name,
  email,
  message,
  inquiryType,
  property,
}) => {
  const html = buildCustomerAckHtml({ name, message, inquiryType, property });
  await transporter.sendMail({
    from: `"Splendor Holdings" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `We've received your inquiry — Splendor Holdings`,
    html,
    text: `Dear ${name},\n\nThank you for contacting Splendor Holdings. We have received your message and will respond within 2 business hours.\n\nYour message:\n${message}\n\nFor urgent matters call: +254 725 504 985\n\nWarm regards,\nSplendor Holdings`,
  });
};

/**
 * Notify admin/Sally that a new inquiry has arrived.
 */
const sendAdminNotification = async ({
  name,
  email,
  phone,
  message,
  inquiryType,
  property,
  inquiryId,
}) => {
  const adminEmail =
    process.env.ADMIN_NOTIFICATION_EMAIL || process.env.EMAIL_USER;
  const html = buildAdminNotificationHtml({
    name,
    email,
    phone,
    message,
    inquiryType,
    property,
    inquiryId,
  });
  await transporter.sendMail({
    from: `"Splendor Dashboard" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject: `[New Inquiry] ${name} — ${inquiryType || "General Enquiry"}`,
    html,
    text: `New inquiry from ${name} (${email})\nType: ${inquiryType}\nMessage: ${message}`,
    replyTo: email, // Replying in email client goes directly to the customer
  });
};

/**
 * Send staff reply to customer.
 */
const sendReplyToCustomer = async ({
  customerName,
  customerEmail,
  replyBody,
  staffName,
  property,
}) => {
  const html = buildReplyHtml({ customerName, replyBody, staffName, property });
  await transporter.sendMail({
    from: `"${staffName} — Splendor Holdings" <${process.env.EMAIL_USER}>`,
    to: customerEmail,
    subject: `Re: Your inquiry — Splendor Holdings`,
    html,
    text: `Dear ${customerName},\n\n${replyBody}\n\nWarm regards,\n${staffName}\nSplendor Holdings`,
  });
};

module.exports = {
  sendCustomerAck,
  sendAdminNotification,
  sendReplyToCustomer,
};
