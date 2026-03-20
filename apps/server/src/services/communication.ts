import { Resend } from 'resend';

type MailUser = {
  email: string | null | undefined;
  username?: string | null;
  name?: string | null;
};

type TipMailPayload = {
  recipient: MailUser;
  sender?: {
    username?: string | null;
    name?: string | null;
  } | null;
  amount: string | number;
  txHash?: string | null;
  note?: string | null;
};

type ProfileUpdatedPayload = {
  user: MailUser;
  displayName?: string | null;
  email?: string | null;
  twitterUrl?: string | null;
  tippersPublic?: boolean;
};

class CommunicationChannel {
  private resend: Resend | null;
  private readonly from: string;
  private readonly appUrl: string;

  constructor() {
    this.resend = process.env.RESEND_API_KEY
      ? new Resend(process.env.RESEND_API_KEY)
      : null;
    this.from =
      process.env.RESEND_FROM_EMAIL ||
      'Potatoe Squeezy <onboarding@resend.dev>';
    this.appUrl = process.env.FRONTEND_APP_URL || 'https://potatosqueezy.xyz';
  }

  private canSendTo(email: string | null | undefined): email is string {
    return Boolean(this.resend && email && email.trim().length > 0);
  }

  private getGreeting(user: MailUser) {
    return user.name?.trim() || user.username?.trim() || 'there';
  }

  private escapeHtml(value: string) {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  private renderTemplate({
    preheader,
    title,
    intro,
    body,
    ctaLabel,
    ctaUrl,
  }: {
    preheader: string;
    title: string;
    intro: string;
    body: string;
    ctaLabel?: string;
    ctaUrl?: string;
  }) {
    const safePreheader = this.escapeHtml(preheader);
    const safeTitle = this.escapeHtml(title);
    const safeIntro = this.escapeHtml(intro);
    const actionUrl = ctaUrl || this.appUrl;

    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>${safeTitle}</title>
        </head>
        <body style="margin:0;padding:0;background-color:#fff7ed;font-family:Arial,sans-serif;color:#1f2937;">
          <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
            ${safePreheader}
          </div>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#fff7ed;padding:24px 12px;">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background-color:#ffffff;border:1px solid #fed7aa;border-radius:20px;overflow:hidden;">
                  <tr>
                    <td style="background:linear-gradient(135deg,#f97316 0%,#ea580c 100%);padding:28px 32px;color:#ffffff;">
                      <div style="font-size:13px;letter-spacing:0.12em;text-transform:uppercase;opacity:0.88;">
                        Potatoe Squeezy
                      </div>
                      <h1 style="margin:12px 0 0;font-size:28px;line-height:1.2;color:#ffffff;">
                        ${safeTitle}
                      </h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:32px;">
                      <p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#374151;">
                        ${safeIntro}
                      </p>
                      <div style="font-size:15px;line-height:1.7;color:#4b5563;">
                        ${body}
                      </div>
                      ${
                        ctaLabel
                          ? `
                        <div style="margin-top:28px;">
                          <a href="${actionUrl}" style="display:inline-block;background-color:#f97316;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:12px;">
                            ${this.escapeHtml(ctaLabel)}
                          </a>
                        </div>
                      `
                          : ''
                      }
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:20px 32px;background-color:#fffaf5;border-top:1px solid #ffedd5;">
                      <p style="margin:0;font-size:12px;line-height:1.6;color:#9a3412;">
                        You received this email because of activity on your Potatoe Squeezy account.
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
  }

  private async sendMail({
    to,
    subject,
    html,
  }: {
    to: string;
    subject: string;
    html: string;
  }) {
    if (!this.canSendTo(to)) {
      return;
    }

    await this.resend!.emails.send({
      from: this.from,
      to,
      subject,
      html,
    });
  }

  async sendSignupEmail(user: MailUser) {
    if (!this.canSendTo(user.email)) {
      return;
    }

    await this.sendMail({
      to: user.email,
      subject: 'Welcome to Potatoe Squeezy',
      html: this.renderTemplate({
        preheader: 'Your Potatoe Squeezy account is ready.',
        title: `Welcome, ${this.getGreeting(user)}`,
        intro: 'Your account is live and ready for action.',
        body: `
          <p style="margin:0 0 14px;">You can now set up your wallet, receive tips, and reward developers in a few clicks.</p>
          <p style="margin:0;">We are glad to have you in the Potatoe Squeezy community.</p>
        `,
        ctaLabel: 'Open Potatoe Squeezy',
        ctaUrl: this.appUrl,
      }),
    });
  }

  async sendTipReceivedEmail({
    recipient,
    sender,
    amount,
    txHash,
    note,
  }: TipMailPayload) {
    if (!this.canSendTo(recipient.email)) {
      return;
    }

    const senderName =
      sender?.name?.trim() || sender?.username?.trim() || 'A supporter';

    await this.sendMail({
      to: recipient.email,
      subject: `You received ${amount} SOL`,
      html: this.renderTemplate({
        preheader: `You received ${amount} SOL on Potatoe Squeezy.`,
        title: 'You just got tipped',
        intro: `${senderName} sent you ${amount} SOL.`,
        body: `
          <p style="margin:0 0 14px;">Your work is getting noticed and rewarded.</p>
          ${
            note
              ? `<p style="margin:0 0 14px;"><strong>Note:</strong> ${this.escapeHtml(note)}</p>`
              : ''
          }
          ${
            txHash
              ? `<p style="margin:0;word-break:break-all;"><strong>Transaction:</strong> ${this.escapeHtml(txHash)}</p>`
              : ''
          }
        `,
        ctaLabel: 'View Your Dashboard',
        ctaUrl: `${this.appUrl}/app`,
      }),
    });
  }

  async sendProfileUpdatedEmail({
    user,
    displayName,
    email,
    twitterUrl,
    tippersPublic,
  }: ProfileUpdatedPayload) {
    if (!this.canSendTo(user.email)) {
      return;
    }

    await this.sendMail({
      to: user.email,
      subject: 'Your Potatoe Squeezy profile was updated',
      html: this.renderTemplate({
        preheader: 'Your profile details were updated successfully.',
        title: 'Profile updated',
        intro: `Hi ${this.getGreeting(user)}, your latest profile changes have been saved.`,
        body: `
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #ffedd5;"><strong>Display name</strong></td>
              <td style="padding:10px 0;border-bottom:1px solid #ffedd5;" align="right">${this.escapeHtml(displayName || 'Not set')}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #ffedd5;"><strong>Email</strong></td>
              <td style="padding:10px 0;border-bottom:1px solid #ffedd5;" align="right">${this.escapeHtml(email || user.email || 'Not set')}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #ffedd5;"><strong>Twitter/X</strong></td>
              <td style="padding:10px 0;border-bottom:1px solid #ffedd5;" align="right">${this.escapeHtml(twitterUrl || 'Not set')}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;"><strong>Public tippers</strong></td>
              <td style="padding:10px 0;" align="right">${tippersPublic ? 'Enabled' : 'Disabled'}</td>
            </tr>
          </table>
        `,
        ctaLabel: 'Manage Profile',
        ctaUrl: `${this.appUrl}/app`,
      }),
    });
  }
}

const communicationChannel = new CommunicationChannel();

export default communicationChannel;
