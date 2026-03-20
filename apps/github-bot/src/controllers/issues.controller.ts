import { Context } from "probot";
import BountyBot from "./commands.controller.ts";
import { ProofOfHumanController } from "./proof-of-human.controller.ts";

export async function handleIssueOpened(context: Context) {
  console.log("Handling issue opened event");
  try {
    const issueComment = context.issue({
      body: "Thanks for opening this issue!",
    });
    await context.octokit.issues.createComment(issueComment);
  } catch (error) {
    console.error("Error handling opened issue:", error);
  }
}

export async function handleIssueComment(context: Context) {
  try {
    console.log("Handling issue comment event");
    const verification = await ProofOfHumanController.ensureVerified(context);

    if (!verification.allowed) {
      return;
    }

    const bot = new BountyBot(context);
    await bot.handleComment(verification.replayBody ?? undefined);
  } catch (error) {
    console.error("Error handling issue comment:", error);
  }
}
