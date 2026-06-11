import { Probot } from "probot";
import { handleIssueOpened, handleIssueComment } from "./controllers/index.ts";
import {
  handleBountyLabeled,
  handleMergedBountyPullRequest,
} from "./controllers/index.ts";

export default (app: Probot) => {
  app.log.info("App started 🎉");
  app.on("issues.opened", handleIssueOpened);
  app.on("issue_comment.created", async (context) => {
    if (context.isBot) return;
    await handleIssueComment(context);
  });
  app.on("issues.labeled", handleBountyLabeled);
  app.on("pull_request.closed", handleMergedBountyPullRequest);
};
