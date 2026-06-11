import { Context } from "probot";
import { BOUNTY_LABEL, BOUNTY_TOKEN } from "../constants/index.ts";
import {
  getBountyState,
  getOrCreateBountyState,
  markBountyCompleted,
} from "./bounty-state.ts";

const parseLinkedIssueNumbers = (body: string | undefined) => {
  if (!body) {
    return [] as number[];
  }

  const matches = body.matchAll(/#(\d+)/g);
  return [...new Set(Array.from(matches).map((match) => Number(match[1])))]
    .filter((value) => Number.isInteger(value) && value > 0);
};

export const handleBountyLabeled = async (context: Context) => {
  try {
    const payload = context.payload as Context["payload"] & {
      label?: { name?: string };
      repository?: { owner?: { login?: string }; name?: string };
      issue?: { number?: number };
    };

    if (payload.label?.name?.toLowerCase() !== BOUNTY_LABEL) {
      return;
    }

    const owner = payload.repository?.owner?.login;
    const repo = payload.repository?.name;
    const issueNumber = payload.issue?.number;

    if (!owner || !repo || !issueNumber) {
      return;
    }

    const state = getOrCreateBountyState(owner, repo, issueNumber);
    const body = state.amountSol
      ? `This issue is now an active Potatoe Squeezy bounty worth **${state.amountSol} ${BOUNTY_TOKEN}**.

Interested in contributing? Comment with:
\`/apply\`

Repo maintainers can accept a contributor with:
\`/accept @username YYYY-MM-DD\``
      : `This issue is now marked as a Potatoe Squeezy bounty.

Repo maintainers can set the reward by commenting:
\`/bounty 150 ${BOUNTY_TOKEN}\`

Contributors will be able to apply once the bounty amount is configured.`;

    await context.octokit.issues.createComment(context.issue({ body }));
  } catch (error) {
    console.error("Error handling bounty label:", error);
  }
};

export const handleMergedBountyPullRequest = async (context: Context) => {
  try {
    const payload = context.payload as Context["payload"] & {
      pull_request?: {
        merged?: boolean;
        body?: string;
        user?: { login?: string };
      };
      repository?: {
        owner?: { login?: string };
        name?: string;
      };
    };

    const owner = payload.repository?.owner?.login;
    const repo = payload.repository?.name;
    const pullRequest = payload.pull_request;

    if (!owner || !repo || !pullRequest?.merged) {
      return;
    }

    const issueNumbers = parseLinkedIssueNumbers(pullRequest.body);

    for (const issueNumber of issueNumbers) {
      const state = getBountyState(owner, repo, issueNumber);

      if (!state || !state.accepted || state.completedAt) {
        continue;
      }

      const contributorLogin = pullRequest.user?.login?.toLowerCase();

      if (contributorLogin !== state.accepted.login.toLowerCase()) {
        continue;
      }

      markBountyCompleted(owner, repo, issueNumber);

      await context.octokit.issues.createComment({
        owner,
        repo,
        issue_number: issueNumber,
        body: `This bounty has been completed by @${state.accepted.login}.

Reward earned: **${state.amountSol} ${BOUNTY_TOKEN}**

The linked pull request was merged successfully, and this issue is now marked as complete.

Thank you to the contributor and the repo maintainers.`,
      });

      await context.octokit.issues.update({
        owner,
        repo,
        issue_number: issueNumber,
        state: "closed",
      });
    }
  } catch (error) {
    console.error("Error handling merged bounty PR:", error);
  }
};
