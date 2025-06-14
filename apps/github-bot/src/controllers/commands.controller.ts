//@ts-nocheck
import { Context } from "probot";
import COMMANDS from "../enums/commands";

class BountyBot {
  private context: Context<'issue_comment.created'>;

  constructor(context: Context<'issue_comment.created'>) {
    this.context = context;
  }

  async handleComment() {
    const { comment, sender } = this.context.payload;
    if (!comment || !sender) return;

    const { body } = comment;
    console.log(body);

    if (body.startsWith(COMMANDS.BOUNTY)) {
      const bountyMatch = body.match(/^\/bounty\s+(\d+(?:\.\d+)?)\s+(\w+)$/);
      if (bountyMatch) {
        const [_, amount, currency] = bountyMatch;
        await this.registerBounty(amount, currency);
      } else {
        await this.registerBounty();
      }
    }

    if (body.startsWith(COMMANDS.CLAIM)) {
      await this.claimBounty();
    }

    if (body.startsWith(COMMANDS.EDIT_BOUNTY)) {
      await this.editBounty();
    }

    if (body.startsWith(COMMANDS.HELP)) {
      await this.sendHelp();
    }
  }

  private async registerBounty(amount?: string, currency?: string) {
    if (!amount || !currency) {
      const comment = this.context.issue({
        body: `❌ Invalid bounty format. Please use: \`/bounty <amount> <currency>\`\nExample: \`/bounty 10 USDC\``,
      });
      await this.context.octokit.issues.createComment(comment);
      return;
    }

    const comment = this.context.issue({
      body: `💰 Bounty registered: ${amount} ${currency}`,
    });
    await this.context.octokit.issues.createComment(comment);
  }

  private async claimBounty() {
    const { sender } = this.context.payload;
    if (!sender) return;

    const comment = this.context.issue({
      body: `🛠️ @${sender.login} is claiming this bounty.`,
    });
    await this.context.octokit.issues.createComment(comment);
  }

  private async editBounty() {
    const comment = this.context.issue({
      body: `✏️ Bounty updated.`,
    });
    await this.context.octokit.issues.createComment(comment);
  }

  private async sendHelp() {
    const comment = this.context.issue({
      body: `
🧠 **Potatoe Squeezy Bot Help**
- \`/bounty 10 USDC\`
- \`/claim\`
- \`/edit-bounty 15 USDC\`
- \`/cancel-bounty\`
- \`/help\`
      `,
    });
    await this.context.octokit.issues.createComment(comment);
  }
}

export default BountyBot;
