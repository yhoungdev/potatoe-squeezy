import { Probot } from "probot";
//@ts-ignore
import { handleIssueOpened, handleIssueComment } from "./controllers";
import { bountyController } from "./controllers";
import { handleBountyCommand, handleClaimCommand } from './controllers/bounty';
import { handleWalletLink, handleWalletVerify } from './controllers/wallet';
import { handlePayout } from './controllers/payout';
import { handleCancelBounty, handleEditBounty, handleExtendBounty } from './controllers/maintainer';
import { parseBountyCommand, parseClaimCommand, parseCancelBountyCommand, parseEditBountyCommand, parseExtendBountyCommand } from './utils/parser';

export default (app: Probot) => {
  app.log.info("App started 🎉");
  app.on("issues.opened", handleIssueOpened);
  app.on("issue_comment.created", async (context) => {
    if (context.isBot) return;
    const { comment } = context.payload;

    if (parseBountyCommand(comment.body)) {
      await handleBountyCommand(context);
    } else if (parseClaimCommand(comment.body)) {
      await handleClaimCommand(context);
    } else if (comment.body.startsWith('/wallet-link')) {
      await handleWalletLink(context);
    } else if (comment.body.startsWith('/wallet-verify')) {
      await handleWalletVerify(context);
    } else if (parseCancelBountyCommand(comment.body)) {
      await handleCancelBounty(context);
    } else if (parseEditBountyCommand(comment.body)) {
      await handleEditBounty(context);
    } else if (parseExtendBountyCommand(comment.body)) {
      await handleExtendBounty(context);
    }
  });
  app.on("issues.labeled", bountyController);

  app.on('pull_request.closed', async (context) => {
    await handlePayout(context);
  });
};
