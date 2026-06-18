import { env } from "@x-workflow/env/server";
import { Resend } from "resend";

let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  if (!env.RESEND_API_KEY) return null;
  if (!resendClient) {
    resendClient = new Resend(env.RESEND_API_KEY);
  }
  return resendClient;
}

export async function sendResetPasswordEmail({
  to,
  resetUrl,
}: {
  to: string;
  resetUrl: string;
}): Promise<void> {
  const client = getResendClient();
  if (!client || !env.RESEND_FROM_EMAIL) {
    console.warn(
      "[auth/email] RESEND_API_KEY or RESEND_FROM_EMAIL not configured, skipping password reset email send",
    );
    return;
  }

  await client.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to,
    subject: "Reset your password",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Reset your password</h2>
        <p>We received a request to reset your password. Click the button below to choose a new one.</p>
        <p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 6px;">
            Reset Password
          </a>
        </p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}
