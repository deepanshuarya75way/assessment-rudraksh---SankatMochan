import nodemailer from "nodemailer";

/**
 * Send an email via Nodemailer
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} [options.text] - Plain text content fallback
 */
export  const sendEmail = async ({ to, subject, html, text }) => {
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const rawPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "465", 10);

  const isPlaceholderUser = !user || user.includes("your_email");
  const isPlaceholderPass = !rawPass || rawPass.includes("your_gmail_app_password");

  if (isPlaceholderUser || isPlaceholderPass) {
    console.log(`\n==================================================`);
    console.log(`[EMAIL NOTICE] Real SMTP credentials not fully configured in server/.env.`);
    console.log(`[TARGET EMAIL]: ${to}`);
    console.log(`==================================================\n`);
    return { devFallback: true };
  }

  // Clean values
  const cleanUser = user.trim();
  const pass = rawPass.trim().replace(/\s+/g, "");
  const from = process.env.EMAIL_FROM || `"Sankat Mochan Support" <${cleanUser}>`;

  console.log(`[EMAIL DISPATCH] Attempting real delivery to ${to} via ${cleanUser}...`);

  let transporter;
  if (host.includes("gmail") || cleanUser.endsWith("@gmail.com")) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: cleanUser,
        pass,
      },
    });
  } else {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user: cleanUser,
        pass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  const mailOptions = {
    from,
    to,
    subject,
    text: text || "Your OTP Code for Sankat Mochan",
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL SUCCESS] Delivered to ${to} (MessageId: ${info.messageId})`);
    return info;
  } catch (err) {
    console.error(`[EMAIL SMTP ERROR] ${err.message}`);
    console.log(`[FALLBACK LOG] Check server terminal output for OTP code.`);
    return { devFallback: true, error: err.message };
  }
};

/**
 * Generate responsive HTML template for OTP verification
 * @param {string} otp - 6-digit OTP code
 * @param {string} title - Action title (e.g. "Password Reset", "Account Verification")
 */
export const getOtpHtmlTemplate = (otp, title = "Verification Code") => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - Sankat Mochan</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #f8fafc;">
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0f172a; padding: 40px 10px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #1e293b; border-radius: 16px; border: 1px solid #334155; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5);">
            <!-- Header -->
            <tr>
              <td style="padding: 30px 40px 20px; text-align: center; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-bottom: 1px solid #334155;">
                <div style="display: inline-block; width: 48px; height: 48px; background-color: #ef4444; border-radius: 12px; line-height: 48px; font-weight: bold; font-size: 24px; color: #ffffff;">
                  🚨
                </div>
                <h1 style="margin: 15px 0 0; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                  Sankat Mochan
                </h1>
                <p style="margin: 4px 0 0; font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                  Emergency & Lifesaving Network
                </p>
              </td>
            </tr>
            
            <!-- Body -->
            <tr>
              <td style="padding: 30px 40px;">
                <h2 style="margin: 0 0 12px; font-size: 18px; font-weight: 700; color: #f8fafc;">
                  ${title}
                </h2>
                <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #cbd5e1;">
                  Use the 6-digit One-Time Password (OTP) below to authorize your request. This code is confidential and will expire in <strong>15 minutes</strong>.
                </p>
                
                <!-- OTP Box -->
                <div style="background-color: #0f172a; border: 1px solid #ef4444; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
                  <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #ef4444;">
                    ${otp}
                  </span>
                </div>

                <p style="margin: 0 0 16px; font-size: 13px; color: #94a3b8; line-height: 1.5;">
                  If you did not request this OTP, please ignore this email or contact support immediately if you suspect unauthorized access.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding: 20px 40px; background-color: #0f172a; border-top: 1px solid #334155; text-align: center;">
                <p style="margin: 0; font-size: 12px; color: #64748b;">
                  © 2026 Sankat Mochan Lifesaving Network. All rights reserved.
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
};
