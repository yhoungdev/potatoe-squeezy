import { Context } from 'probot';
import { Bounty } from '../types/bounty';
import { supabase } from '../lib/supabase';
import { parseBountyCommand } from '../utils/parser';

type IssueCommentContext = Context<'issue_comment.created'>;

export async function handleBountyCommand(context: IssueCommentContext) {
  const { comment, issue, repository } = context.payload;
  const command = parseBountyCommand(comment.body);

  if (!command) {
    return;
  }

  const bounty: Partial<Bounty> = {
    issueId: issue.number,
    repositoryId: repository.id,
    amount: command.amount,
    currency: command.currency,
    status: 'open',
    createdAt: new Date(),
    network: command.network || 'mainnet',
  };

  if (command.duration) {
    bounty.expiresAt = new Date(Date.now() + command.duration * 24 * 60 * 60 * 1000);
  }

  const { error } = await supabase
    .from('bounties')
    .insert(bounty)
    .select()
    .single();

  if (error) {
    await context.octokit.issues.createComment({
      owner: repository.owner.login,
      repo: repository.name,
      issue_number: issue.number,
      body: '❌ Failed to create bounty. Please try again later.',
    });
    return;
  }

  await context.octokit.issues.createComment({
    owner: repository.owner.login,
    repo: repository.name,
    issue_number: issue.number,
    body: `💰 This issue is now a ${command.amount} ${command.currency} bounty${
      command.duration ? ` (expires in ${command.duration} days)` : ''
    }.`,
  });
}

export async function handleClaimCommand(context: IssueCommentContext) {
  const { comment, issue, repository } = context.payload;
  const username = comment.user.login;

  const { data: bounty, error } = await supabase
    .from('bounties')
    .select('*')
    .eq('issueId', issue.number)
    .eq('repositoryId', repository.id)
    .single();

  if (error || !bounty) {
    await context.octokit.issues.createComment({
      owner: repository.owner.login,
      repo: repository.name,
      issue_number: issue.number,
      body: '❌ No active bounty found for this issue.',
    });
    return;
  }

  if (bounty.status !== 'open') {
    await context.octokit.issues.createComment({
      owner: repository.owner.login,
      repo: repository.name,
      issue_number: issue.number,
      body: '❌ This bounty is no longer available for claiming.',
    });
    return;
  }

  const { error: updateError } = await supabase
    .from('bounties')
    .update({
      status: 'claimed',
      claimedBy: username,
    })
    .eq('id', bounty.id);

  if (updateError) {
    await context.octokit.issues.createComment({
      owner: repository.owner.login,
      repo: repository.name,
      issue_number: issue.number,
      body: '❌ Failed to claim bounty. Please try again later.',
    });
    return;
  }

  await context.octokit.issues.createComment({
    owner: repository.owner.login,
    repo: repository.name,
    issue_number: issue.number,
    body: `🧑‍💻 @${username} has claimed this bounty!`,
  });
} 