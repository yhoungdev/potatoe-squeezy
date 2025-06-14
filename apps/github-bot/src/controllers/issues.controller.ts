//@ts-nocheck
import { Context, Probot } from "probot";
import { IssueCommentCreatedEvent, IssuesOpenedEvent } from "@octokit/webhooks-types";

export async function handleIssueOpened(context: Context<'issues.opened'>) {
  try {
    const issueComment = context.issue({
      body: "Thanks for opening this issue!",
    });
    await context.octokit.issues.createComment(issueComment);
  } catch (error) {
    console.error("Error handling opened issue:", error);
  }
}

export async function handleIssueComment(context: Context<'issue_comment.created'>) {
  try {
    // Add your issue comment handling logic here
    const { comment } = context.payload;
    if (comment) {
      // Process the comment as needed
      console.log("Processing comment:", comment.body);
    }
  } catch (error) {
    console.error("Error handling issue comment:", error);
  }
}
