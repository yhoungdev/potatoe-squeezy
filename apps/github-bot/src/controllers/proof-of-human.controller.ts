import { Context } from "probot";
import COMMANDS from "../enums/commands.ts";
import { CHALLENGE_TTL_MS, VERIFIED_TTL_MS } from "../constants/index.ts";

type PendingChallenge = {
  key: string;
  owner: string;
  repo: string;
  issueNumber: number;
  userLogin: string;
  commentId: number;
  commentBody: string;
  challengeCode: string;
  challengeCommentId: number;
  timeout: ReturnType<typeof setTimeout>;
};

const pendingChallenges = new Map<string, PendingChallenge>();
const verifiedHumans = new Map<string, number>();

const buildVerificationKey = ({
  owner,
  repo,
  userLogin,
}: {
  owner: string;
  repo: string;
  userLogin: string;
}) => `${owner.toLowerCase()}/${repo.toLowerCase()}:${userLogin.toLowerCase()}`;

const generateChallengeCode = () =>
  Math.random().toString(36).slice(2, 8).toUpperCase();

const isVerificationStillValid = (key: string) => {
  const expiresAt = verifiedHumans.get(key);

  if (!expiresAt) {
    return false;
  }

  if (expiresAt <= Date.now()) {
    verifiedHumans.delete(key);
    return false;
  }

  return true;
};

export class ProofOfHumanController {
  static async ensureVerified(context: Context) {
    const payload = context.payload as Context["payload"] & {
      comment?: { id: number; body?: string };
      repository?: { owner?: { login?: string }; name?: string };
      issue?: { number?: number };
      sender?: { login?: string };
    };

    const owner = payload.repository?.owner?.login;
    const repo = payload.repository?.name;
    const issueNumber = payload.issue?.number;
    const userLogin = payload.sender?.login;
    const commentId = payload.comment?.id;
    const commentBody = payload.comment?.body?.trim() ?? "";

    if (!owner || !repo || !issueNumber || !userLogin || !commentId) {
      return { allowed: false as const, replayBody: null };
    }

    const verificationKey = buildVerificationKey({ owner, repo, userLogin });

    if (commentBody.startsWith(COMMANDS.HUMAN)) {
      return await this.handleVerificationReply(context, {
        verificationKey,
        owner,
        repo,
        issueNumber,
        userLogin,
        commentId,
        commentBody,
      });
    }

    if (isVerificationStillValid(verificationKey)) {
      return { allowed: true as const, replayBody: commentBody };
    }

    await this.createChallenge(context, {
      verificationKey,
      owner,
      repo,
      issueNumber,
      userLogin,
      commentId,
      commentBody,
    });

    return { allowed: false as const, replayBody: null };
  }

  private static async handleVerificationReply(
    context: Context,
    {
      verificationKey,
      owner,
      repo,
      issueNumber,
      userLogin,
      commentId,
      commentBody,
    }: {
      verificationKey: string;
      owner: string;
      repo: string;
      issueNumber: number;
      userLogin: string;
      commentId: number;
      commentBody: string;
    },
  ) {
    const pending = pendingChallenges.get(verificationKey);

    if (!pending) {
      await context.octokit.issues.createComment(
        context.issue({
          body: `@${userLogin} there is no active proof-of-human challenge for you right now.`,
        }),
      );
      return { allowed: false as const, replayBody: null };
    }

    const [, code = ""] = commentBody.split(/\s+/, 2);

    if (code.trim().toUpperCase() !== pending.challengeCode) {
      await context.octokit.issues.createComment(
        context.issue({
          body: `@${userLogin} that code is incorrect. Reply with \`${COMMANDS.HUMAN} ${pending.challengeCode}\` before the 3 minute timer ends.`,
        }),
      );
      return { allowed: false as const, replayBody: null };
    }

    clearTimeout(pending.timeout);
    pendingChallenges.delete(verificationKey);
    verifiedHumans.set(verificationKey, Date.now() + VERIFIED_TTL_MS);

    await context.octokit.issues.deleteComment({
      owner,
      repo,
      comment_id: commentId,
    });

    await context.octokit.issues.deleteComment({
      owner,
      repo,
      comment_id: pending.challengeCommentId,
    });

    await context.octokit.issues.createComment(
      context.issue({
        body: `@${userLogin} verified as human. Your original comment is now accepted.`,
      }),
    );

    return { allowed: true as const, replayBody: pending.commentBody };
  }

  private static async createChallenge(
    context: Context,
    {
      verificationKey,
      owner,
      repo,
      issueNumber,
      userLogin,
      commentId,
      commentBody,
    }: {
      verificationKey: string;
      owner: string;
      repo: string;
      issueNumber: number;
      userLogin: string;
      commentId: number;
      commentBody: string;
    },
  ) {
    const existing = pendingChallenges.get(verificationKey);

    if (existing) {
      if (existing.commentId !== commentId) {
        await context.octokit.issues.deleteComment({
          owner,
          repo,
          comment_id: commentId,
        });

        await context.octokit.issues.createComment(
          context.issue({
            body: `@${userLogin} you already have an active proof-of-human challenge. Reply with \`${COMMANDS.HUMAN} ${existing.challengeCode}\` to unlock commenting.`,
          }),
        );
      }
      return;
    }

    const challengeCode = generateChallengeCode();
    const challengeComment = await context.octokit.issues.createComment(
      context.issue({
        body: `@${userLogin} please prove you are human.

Reply within 3 minutes with:
\`${COMMANDS.HUMAN} ${challengeCode}\`

If you do not verify in time, your comment will be removed automatically.`,
      }),
    );

    const timeout = setTimeout(async () => {
      const pending = pendingChallenges.get(verificationKey);

      if (!pending) {
        return;
      }

      pendingChallenges.delete(verificationKey);

      try {
        await context.octokit.issues.deleteComment({
          owner,
          repo,
          comment_id: pending.commentId,
        });

        await context.octokit.issues.deleteComment({
          owner,
          repo,
          comment_id: pending.challengeCommentId,
        });

        await context.octokit.issues.createComment({
          owner,
          repo,
          issue_number: issueNumber,
          body: `Removed an unverified comment from @${userLogin} after the 3 minute proof-of-human window expired.`,
        });
      } catch (error) {
        context.log.error(error, "Failed to enforce proof-of-human timeout");
      }
    }, CHALLENGE_TTL_MS);

    pendingChallenges.set(verificationKey, {
      key: verificationKey,
      owner,
      repo,
      issueNumber,
      userLogin,
      commentId,
      commentBody,
      challengeCode,
      challengeCommentId: challengeComment.data.id,
      timeout,
    });
  }
}
