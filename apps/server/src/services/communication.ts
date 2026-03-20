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
  twitterUrl?: string | null;
  tippersPublic?: boolean;
};

class CommunicationChannel {
  private resend: Resend | null;
  private readonly from: string;

  constructor() {
    this.resend = process.env.RESEND_API_KEY
      ? new Resend(process.env.RESEND_API_KEY)
      : null;
    this.from =
      process.env.RESEND_FROM_EMAIL ||
      'Potatoe Squeezy <onboarding@resend.dev>';
  }

  private canSendTo(email: string | null | undefined): email is string {
    return Boolean(this.resend && email && email.trim().length > 0);
  }

  private getGreeting(user: MailUser) {
    return user.name?.trim() || user.username?.trim() || 'there';
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
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
          <h2>Welcome to Potatoe Squeezy, ${this.getGreeting(user)}.</h2>
          <p>Your account is ready. You can now set up your wallet, receive tips, and support developers.</p>
          <p>We are glad to have you here.</p>
        </div>
      `,
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

    const senderName = sender?.name?.trim() || sender?.username?.trim() || 'A supporter';

    await this.sendMail({
      to: recipient.email,
      subject: `You received ${amount} SOL`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
          <h2>You just got tipped.</h2>
          <p><strong>${senderName}</strong> sent you <strong>${amount} SOL</strong>.</p>
          ${note ? `<p><strong>Note:</strong> ${note}</p>` : ''}
          ${txHash ? `<p><strong>Transaction:</strong> ${txHash}</p>` : ''}
        </div>
      `,
    });
  }

  async sendProfileUpdatedEmail({
    user,
    displayName,
    twitterUrl,
    tippersPublic,
  }: ProfileUpdatedPayload) {
    if (!this.canSendTo(user.email)) {
      return;
    }

    await this.sendMail({
      to: user.email,
      subject: 'Your Potatoe Squeezy profile was updated',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
          <h2>Your profile has been updated.</h2>
          <p>Hi ${this.getGreeting(user)}, your profile changes were saved successfully.</p>
          <ul>
            <li><strong>Display name:</strong> ${displayName || 'Not set'}</li>
            <li><strong>Twitter/X:</strong> ${twitterUrl || 'Not set'}</li>
            <li><strong>Public tippers:</strong> ${tippersPublic ? 'Enabled' : 'Disabled'}</li>
          </ul>
        </div>
      `,
    });
  }
}

const communicationChannel = new CommunicationChannel();

export default communicationChannel;
