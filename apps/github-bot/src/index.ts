import { Probot } from "probot";
import { handleIssueOpened, handleIssueComment } from "./controllers/index.ts";

export default (app: Probot) => {
  app.log.info("App started 🎉");
  app.on("issues.opened", handleIssueOpened);
  app.on("issue_comment.created", async (context) => {
    if (context.isBot) return;
    await handleIssueComment(context);
  });
};
