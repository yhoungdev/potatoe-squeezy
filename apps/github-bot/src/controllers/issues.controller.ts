import { Context } from "probot";
import BountyBot from "./commands.controller.ts";

export async function handleIssueOpened(context: Context) {
  try {
    const issueComment = context.issue({
      body: "Thanks for opening this issue! Squash more potatoes 🍟",
    });
    await context.octokit.issues.createComment(issueComment);
  } catch (error) {
    console.error("Error handling opened issue:", error);
  }
}

export async function handleIssueComment(context: Context) {
  try {
    const bot = new BountyBot(context);
    await bot.handleComment();
  } catch (error) {
    console.error("Error handling issue comment:", error);
  }
}
