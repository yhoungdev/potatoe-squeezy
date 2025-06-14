import { Context } from 'probot';
import { supabase } from '../lib/supabase';
import { parseEditBountyCommand, parseExtendBountyCommand } from '../utils/parser';

type IssueCommentContext = Context<'issue_comment.created'>;

export async function handleCancelBounty(context: IssueCommentContext) {
  const { comment, issue, repository } = context.payload;
  const username = comment.user.login;

  // Check if user is a maintainer
  const isMaintainer = await checkMaintainerStatus(context, username);
  if (!isMaintainer) {
    await context.octokit.issues.createComment({
      owner: repository.owner.login,
      repo: repository.name,
      issue_number: issue.number,
      body: '❌ Only maintainers can cancel bounties.',
    });
    return;
  }

  const { data: bounty, error: bountyError } = await supabase
    .from('bounties')
    .select('*')
    .eq('issueId', issue.number)
    .eq('repositoryId', repository.id)
    .single();

  if (bountyError || !bounty) {
    await context.octokit.issues.createComment({
      owner: repository.owner.login,
      repo: repository.name,
      issue_number: issue.number,
      body: '❌ No active bounty found for this issue.',
    });
    return;
  }

  const { error: updateError } = await supabase
    .from('bounties')
    .update({ status: 'cancelled' })
    .eq('id', bounty.id);

  if (updateError) {
    await context.octokit.issues.createComment({
      owner: repository.owner.login,
      repo: repository.name,
      issue_number: issue.number,
      body: '❌ Failed to cancel bounty. Please try again later.',
    });
    return;
  }

  await context.octokit.issues.createComment({
    owner: repository.owner.login,
    repo: repository.name,
    issue_number: issue.number,
    body: '🛑 Bounty has been cancelled.',
  });
}

export async function handleEditBounty(context: IssueCommentContext) {
  const { comment, issue, repository } = context.payload;
  const username = comment.user.login;
  const command = parseEditBountyCommand(comment.body);

  if (!command) {
    return;
  }

  // Check if user is a maintainer
  const isMaintainer = await checkMaintainerStatus(context, username);
  if (!isMaintainer) {
    await context.octokit.issues.createComment({
      owner: repository.owner.login,
      repo: repository.name,
      issue_number: issue.number,
      body: '❌ Only maintainers can edit bounties.',
    });
    return;
  }

  const { data: bounty, error: bountyError } = await supabase
    .from('bounties')
    .select('*')
    .eq('issueId', issue.number)
    .eq('repositoryId', repository.id)
    .single();

  if (bountyError || !bounty) {
    await context.octokit.issues.createComment({
      owner: repository.owner.login,
      repo: repository.name,
      issue_number: issue.number,
      body: '❌ No active bounty found for this issue.',
    });
    return;
  }

  const { error: updateError } = await supabase
    .from('bounties')
    .update({
      amount: command.amount,
      currency: command.currency,
    })
    .eq('id', bounty.id);

  if (updateError) {
    await context.octokit.issues.createComment({
      owner: repository.owner.login,
      repo: repository.name,
      issue_number: issue.number,
      body: '❌ Failed to edit bounty. Please try again later.',
    });
    return;
  }

  await context.octokit.issues.createComment({
    owner: repository.owner.login,
    repo: repository.name,
    issue_number: issue.number,
    body: `🛠️ Bounty updated to ${command.amount} ${command.currency}.`,
  });
}

export async function handleExtendBounty(context: IssueCommentContext) {
  const { comment, issue, repository } = context.payload;
  const username = comment.user.login;
  const duration = parseExtendBountyCommand(comment.body);

  if (!duration) {
    return;
  }

  // Check if user is a maintainer
  const isMaintainer = await checkMaintainerStatus(context, username);
  if (!isMaintainer) {
    await context.octokit.issues.createComment({
      owner: repository.owner.login,
      repo: repository.name,
      issue_number: issue.number,
      body: '❌ Only maintainers can extend bounties.',
    });
    return;
  }

  const { data: bounty, error: bountyError } = await supabase
    .from('bounties')
    .select('*')
    .eq('issueId', issue.number)
    .eq('repositoryId', repository.id)
    .single();

  if (bountyError || !bounty) {
    await context.octokit.issues.createComment({
      owner: repository.owner.login,
      repo: repository.name,
      issue_number: issue.number,
      body: '❌ No active bounty found for this issue.',
    });
    return;
  }

  const newExpiry = new Date(Date.now() + duration * 24 * 60 * 60 * 1000);

  const { error: updateError } = await supabase
    .from('bounties')
    .update({ expiresAt: newExpiry.toISOString() })
    .eq('id', bounty.id);

  if (updateError) {
    await context.octokit.issues.createComment({
      owner: repository.owner.login,
      repo: repository.name,
      issue_number: issue.number,
      body: '❌ Failed to extend bounty. Please try again later.',
    });
    return;
  }

  await context.octokit.issues.createComment({
    owner: repository.owner.login,
    repo: repository.name,
    issue_number: issue.number,
    body: `⏳ Bounty extended by ${duration} days.`,
  });
}

async function checkMaintainerStatus(context: IssueCommentContext, username: string): Promise<boolean> {
  const { repository } = context.payload;

  try {
    const { data: membership } = await context.octokit.orgs.getMembershipForUser({
      org: repository.owner.login,
      username,
    });

    return membership.role === 'admin' || membership.role === 'member';
  } catch (error) {
    return false;
  }
} 