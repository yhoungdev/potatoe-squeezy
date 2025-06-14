import { Context } from 'probot';
import { supabase } from '../lib/supabase';
import { PublicKey } from '@solana/web3.js';

type IssueCommentContext = Context<'issue_comment.created'>;

export async function handleWalletLink(context: IssueCommentContext) {
  const { comment, issue, repository } = context.payload;
  const username = comment.user.login;
  const walletAddress = comment.body.trim().split(' ')[1];

  if (!walletAddress) {
    await context.octokit.issues.createComment({
      owner: repository.owner.login,
      repo: repository.name,
      issue_number: issue.number,
      body: '❌ Please provide a valid Solana wallet address.',
    });
    return;
  }

  try {
    // Validate wallet address
    new PublicKey(walletAddress);

    const { error } = await supabase
      .from('wallet_links')
      .upsert({
        githubId: username,
        walletAddress,
        verified: false,
        createdAt: new Date().toISOString(),
      });

    if (error) {
      throw error;
    }

    await context.octokit.issues.createComment({
      owner: repository.owner.login,
      repo: repository.name,
      issue_number: issue.number,
      body: `✅ Wallet address linked successfully! Please verify your ownership by signing a message with your wallet.`,
    });
  } catch (error) {
    await context.octokit.issues.createComment({
      owner: repository.owner.login,
      repo: repository.name,
      issue_number: issue.number,
      body: '❌ Invalid wallet address or failed to link wallet.',
    });
  }
}

export async function handleWalletVerify(context: IssueCommentContext) {
  const { comment, issue, repository } = context.payload;
  const username = comment.user.login;
  const signature = comment.body.trim().split(' ')[1];

  if (!signature) {
    await context.octokit.issues.createComment({
      owner: repository.owner.login,
      repo: repository.name,
      issue_number: issue.number,
      body: '❌ Please provide a valid signature.',
    });
    return;
  }

  try {
    // TODO: Implement signature verification
    // This would involve verifying that the signature matches the wallet address
    // and that it was created by signing a specific message

    const { error } = await supabase
      .from('wallet_links')
      .update({ verified: true })
      .eq('githubId', username);

    if (error) {
      throw error;
    }

    await context.octokit.issues.createComment({
      owner: repository.owner.login,
      repo: repository.name,
      issue_number: issue.number,
      body: '✅ Wallet verification successful! You can now receive bounty payments.',
    });
  } catch (error) {
    await context.octokit.issues.createComment({
      owner: repository.owner.login,
      repo: repository.name,
      issue_number: issue.number,
      body: '❌ Failed to verify wallet ownership.',
    });
  }
} 