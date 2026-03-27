import { Context } from "probot";
import COMMANDS from "../enums/commands.ts";
import { BOUNTY_LABEL, BOUNTY_TOKEN } from "../constants/index.ts";
import {
  acceptApplicant,
  addApplicant,
  getOrCreateBountyState,
  rejectApplicant,
  setBountyAmount,
} from "./bounty-state.ts";

class BountyBot {
  private context: Context;

  constructor(context: Context) {
    this.context = context;
  }

  async handleComment(overrideBody?: string) {
    const { comment: commentContext } = this.context.payload;
    const body = overrideBody ?? commentContext.body;
    console.log(body);

    if (body.startsWith(COMMANDS.BOUNTY)) {
      const bountyMatch = body.match(
        /^\/bounty\s+(\d+(?:\.\d+)?)\s+(sol)$/i,
      );
      if (bountyMatch) {
        const [_, amount, currency] = bountyMatch;
        await this.registerBounty(amount, currency);
      } else {
        await this.registerBounty();
      }
    }

    if (body.startsWith(COMMANDS.APPLY) || body.startsWith(COMMANDS.CLAIM)) {
      await this.applyForBounty();
    }

    if (body.startsWith(COMMANDS.ACCEPT)) {
      const acceptMatch = body.match(/^\/accept\s+@?([a-zA-Z0-9-]+)\s+(\d{4}-\d{2}-\d{2})$/);
      if (acceptMatch) {
        const [, login, dueDate] = acceptMatch;
        await this.acceptBounty(login, dueDate);
      } else {
        await this.sendInvalidAcceptFormat();
      }
    }

    if (body.startsWith(COMMANDS.REJECT)) {
      const rejectMatch = body.match(/^\/reject\s+@?([a-zA-Z0-9-]+)$/);
      if (rejectMatch) {
        const [, login] = rejectMatch;
        await this.rejectBounty(login);
      } else {
        await this.sendInvalidRejectFormat();
      }
    }

    if (body.startsWith(COMMANDS.EDIT_BOUNTY)) {
      await this.editBounty();
    }

    if (body.startsWith(COMMANDS.HELP)) {
      await this.sendHelp();
    }
  }

  private getIssueMeta() {
    const payload = this.context.payload as Context["payload"] & {
      repository?: { owner?: { login?: string }; name?: string };
      issue?: {
        number?: number;
        labels?: Array<{ name?: string }>;
      };
      sender?: { login?: string };
      comment?: { author_association?: string };
    };

    return {
      owner: payload.repository?.owner?.login ?? "",
      repo: payload.repository?.name ?? "",
      issueNumber: payload.issue?.number ?? 0,
      labels: payload.issue?.labels ?? [],
      senderLogin: payload.sender?.login ?? "",
      authorAssociation: payload.comment?.author_association ?? "",
    };
  }

  private issueHasBountyLabel() {
    const { labels } = this.getIssueMeta();
    return labels.some((label) => label.name?.toLowerCase() === BOUNTY_LABEL);
  }

  private isMaintainer() {
    const { authorAssociation } = this.getIssueMeta();
    return ["OWNER", "MEMBER", "COLLABORATOR"].includes(authorAssociation);
  }

  private async registerBounty(amount?: string, currency?: string) {
    if (!this.isMaintainer()) {
      await this.reply(`Only repo maintainers can set or update bounty amounts.`);
      return;
    }

    if (!amount || !currency) {
      await this.reply(
        `Invalid bounty format. Please use: \`/bounty <amount> ${BOUNTY_TOKEN}\`\nExample: \`/bounty 150 ${BOUNTY_TOKEN}\``,
      );
      return;
    }

    if (currency.toUpperCase() !== BOUNTY_TOKEN) {
      await this.reply(`Only ${BOUNTY_TOKEN} bounties are supported right now.`);
      return;
    }

    const { owner, repo, issueNumber } = this.getIssueMeta();
    const state = setBountyAmount(owner, repo, issueNumber, Number(amount));

    await this.reply(`This issue is now an active Potatoe Squeezy bounty worth **${state.amountSol} ${BOUNTY_TOKEN}**.

Interested in contributing? Comment with:
\`/apply\`

Repo maintainers can accept a contributor with:
\`/accept @username YYYY-MM-DD\``);
  }

  private async applyForBounty() {
    if (!this.issueHasBountyLabel()) {
      await this.reply(`This issue is not marked as a bounty issue.`);
      return;
    }

    const { owner, repo, issueNumber, senderLogin } = this.getIssueMeta();
    const state = getOrCreateBountyState(owner, repo, issueNumber);

    if (!state.amountSol) {
      await this.reply(
        `This bounty is not configured yet. A maintainer must first set the reward with \`/bounty 150 ${BOUNTY_TOKEN}\`.`,
      );
      return;
    }

    addApplicant(owner, repo, issueNumber, senderLogin);

    await this.reply(`Application received from @${senderLogin} for this bounty.

Repo maintainers can accept this contributor with:
\`/accept @${senderLogin} YYYY-MM-DD\``);
  }

  private async acceptBounty(login: string, dueDate: string) {
    if (!this.isMaintainer()) {
      await this.reply(`Only repo maintainers can accept bounty applicants.`);
      return;
    }

    const { owner, repo, issueNumber } = this.getIssueMeta();
    const state = getOrCreateBountyState(owner, repo, issueNumber);

    if (!state.amountSol) {
      await this.reply(`This bounty does not have an amount set yet.`);
      return;
    }

    const hasApplied = state.applicants.some(
      (applicant) => applicant.login.toLowerCase() === login.toLowerCase(),
    );

    if (!hasApplied) {
      await this.reply(`@${login} has not applied for this bounty yet.`);
      return;
    }

    acceptApplicant(owner, repo, issueNumber, login, dueDate);

    await this.reply(`Congratulations, @${login}! Your application has been accepted.

This issue is worth **${state.amountSol} ${BOUNTY_TOKEN}** and is due on **${dueDate}**.

Please make sure your pull request is opened and linked to this issue with enough time for maintainers to review it before the deadline.

Repo maintainers: please monitor progress and complete your review before the due date.`);
  }

  private async rejectBounty(login: string) {
    if (!this.isMaintainer()) {
      await this.reply(`Only repo maintainers can reject bounty applicants.`);
      return;
    }

    const { owner, repo, issueNumber } = this.getIssueMeta();
    rejectApplicant(owner, repo, issueNumber, login);

    await this.reply(`Thanks for your interest, @${login}.

Your application was not accepted for this bounty at this time.`);
  }

  private async editBounty() {
    await this.reply(
      `To update this bounty, use \`/bounty <amount> ${BOUNTY_TOKEN}\` again with the new amount.`,
    );
  }

  private async sendInvalidAcceptFormat() {
    await this.reply(
      `Invalid accept format. Please use: \`/accept @username YYYY-MM-DD\``,
    );
  }

  private async sendInvalidRejectFormat() {
    await this.reply(
      `Invalid reject format. Please use: \`/reject @username\``,
    );
  }

  private async reply(body: string) {
    await this.context.octokit.issues.createComment(
      this.context.issue({ body }),
    );
  }

  private async sendHelp() {
    await this.reply(`
Potatoe Squeezy Bot Help

- \`/bounty 150 ${BOUNTY_TOKEN}\`
- \`/apply\`
- \`/accept @username YYYY-MM-DD\`
- \`/reject @username\`
- \`/help\`
    `);
  }
}

export default BountyBot;
