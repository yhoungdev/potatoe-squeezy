import { Context } from "probot";

export async function handleIssueOpened(context: Context) {
  try {
    const issueComment = context.issue({
      body: "Thanks for opening this issue!",
    });
    await context.octokit.issues.createComment(issueComment);
  } catch (error) {
    console.error('Error handling opened issue:', error);
  }
}

export async function handleIssueComment(context: Context) {
  try {
    // Add your issue comment handling logic here
    const comment = context.payload.comment;
    // Process the comment as needed
  } catch (error) {
    console.error('Error handling issue comment:', error);
  }
}
