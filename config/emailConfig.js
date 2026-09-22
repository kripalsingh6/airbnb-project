import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
let resendClient = null;

if (resendApiKey && resendApiKey !== "re_your_resend_api_key_here") {
  resendClient = new Resend(resendApiKey);
}

/**
 * Sends a luxury welcome email to newly registered users via Resend.
 * Non-blocking and fails gracefully if credentials are missing or network fails.
 */
export async function sendWelcomeEmail({ to, name, username }) {
  if (!to || to.includes("@google.oauth")) {
    return { skipped: true, reason: "No valid recipient email address." };
  }

  // Reload client if key was added after server start
  const currentKey = process.env.RESEND_API_KEY;
  if (!resendClient && currentKey && currentKey !== "re_your_resend_api_key_here") {
    resendClient = new Resend(currentKey);
  }

  if (!resendClient) {
    console.warn(
      `[Resend Email] Notice: RESEND_API_KEY not configured in .env. Skipping welcome email to ${to}.`
    );
    return { skipped: true, reason: "RESEND_API_KEY is not configured in .env" };
  }

  const displayName = name || username || "Explorer";
  const fromEmail = process.env.RESEND_FROM_EMAIL || "Wanderlust <onboarding@resend.dev>";
  const appUrl = process.env.APP_URL || "http://localhost:8080";

  try {
    const { data, error } = await resendClient.emails.send({
      from: fromEmail,
      to: [to],
      subject: `Welcome to Wanderlust, ${displayName}! ✈️`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Wanderlust</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f7f7f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #222222;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f7f7f9; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06); border: 1px solid #eaeaea;">
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #ff385c 0%, #bd1e59 100%); padding: 36px 32px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">Wanderlust</h1>
              <p style="color: rgba(255, 255, 255, 0.92); margin: 8px 0 0; font-size: 15px; font-weight: 500;">Your luxury travel and hosting community</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 36px 32px;">
              <h2 style="margin: 0 0 16px; font-size: 22px; font-weight: 700; color: #111111;">Hello ${displayName}! 👋</h2>
              <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.6; color: #484848;">
                Welcome to <strong>Wanderlust</strong>! We're thrilled to have you join our global community of travelers, explorers, and stay creators.
              </p>

              <!-- Account Info Box -->
              <div style="background-color: #fcf8f8; border-left: 4px solid #ff385c; padding: 16px 20px; border-radius: 8px; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #333333;">
                  <strong>Your Account Details:</strong><br>
                  &bull; Username: <strong>${username}</strong><br>
                  &bull; Registered Email: <strong>${to}</strong>
                </p>
              </div>

              <h3 style="margin: 24px 0 12px; font-size: 16px; font-weight: 700; color: #222222;">Here’s what you can explore:</h3>
              <ul style="margin: 0 0 28px; padding-left: 20px; font-size: 14px; line-height: 1.8; color: #484848;">
                <li><strong>Discover Unique Stays:</strong> Browse villas, beach houses, and cozy cabins worldwide.</li>
                <li><strong>Curate Your Wishlists:</strong> Click the heart icon on any listing to build your dream trip collections.</li>
                <li><strong>Seamless Reservations:</strong> Instant bookings with transparent pricing and full date picker controls.</li>
                <li><strong>Host Your Space:</strong> Share your home with travelers and earn on your schedule.</li>
              </ul>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 32px 0 16px;">
                <a href="${appUrl}/listings" style="display: inline-block; background-color: #ff385c; color: #ffffff; text-decoration: none; padding: 14px 32px; font-size: 15px; font-weight: 700; border-radius: 10px; box-shadow: 0 4px 12px rgba(255, 56, 92, 0.35);">
                  Explore Stays Now
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #fafafa; border-top: 1px solid #eaeaea; padding: 24px 32px; text-align: center; font-size: 12px; color: #888888;">
              <p style="margin: 0 0 6px;">&copy; Wanderlust Private Limited. All rights reserved.</p>
              <p style="margin: 0; line-height: 1.4;">
                You received this email because you signed up for an account on Wanderlust.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    });

    if (error) {
      console.error("[Resend Email] Delivery error:", error);
      return { success: false, error };
    }

    console.log(`[Resend Email] Welcome greeting successfully sent to ${to} (ID: ${data?.id})`);
    return { success: true, data };
  } catch (err) {
    console.error("[Resend Email] Unexpected error:", err);
    return { success: false, error: err.message };
  }
}

export default { sendWelcomeEmail };
