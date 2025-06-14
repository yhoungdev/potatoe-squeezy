import { Context } from 'probot';
import { supabase } from '../lib/supabase';
import { SolanaService } from '../utils/solana';
import { PublicKey } from '@solana/web3.js';

type PullRequestContext = Context<'pull_request.closed'>;

export async function handlePayout(context: PullRequestContext) {
  const { pull_request, repository } = context.payload;

  if (!pull_request.merged) {
    return;
  }

  // Find the bounty associated with this PR
  const { data: bounty, error: bountyError } = await supabase
    .from('bounties')
    .select('*')
    .eq('status', 'claimed')
    .eq('claimedBy', pull_request.user.login)
    .single();

  if (bountyError || !bounty) {
    return;
  }

  // Get the contributor's wallet
  const { data: walletLink, error: walletError } = await supabase
    .from('wallet_links')
    .select('*')
    .eq('githubId', pull_request.user.login)
    .eq('verified', true)
    .single();

  if (walletError || !walletLink) {
    await context.octokit.issues.createComment({
      owner: repository.owner.login,
      repo: repository.name,
      issue_number: bounty.issueId,
      body: `❌ @${pull_request.user.login} needs to link and verify their wallet to receive the bounty payment.`,
    });
    return;
  }

  try {
    const solana = new SolanaService(bounty.network as 'mainnet' | 'devnet');
    const contributorWallet = new PublicKey(walletLink.walletAddress);
    
    // TODO: Get the bot's wallet address from environment
    const botWallet = new PublicKey(process.env.BOT_WALLET_ADDRESS!);

    // Create and send the payment transaction
    const transaction = await solana.createPaymentTransaction(
      botWallet,
      contributorWallet,
      bounty.amount,
      // TODO: Add USDC token mint address
      undefined
    );

    // TODO: Sign and send the transaction
    // const signature = await solana.sendTransaction(transaction);

    // Update bounty status
    const { error: updateError } = await supabase
      .from('bounties')
      .update({
        status: 'paid',
        paidTo: pull_request.user.login,
        // transactionId: signature,
      })
      .eq('id', bounty.id);

    if (updateError) {
      throw updateError;
    }

    await context.octokit.issues.createComment({
      owner: repository.owner.login,
      repo: repository.name,
      issue_number: bounty.issueId,
      body: `✅ Bounty payment sent to @${pull_request.user.login}!`,
    });
  } catch (error) {
    console.error('Payment error:', error);
    await context.octokit.issues.createComment({
      owner: repository.owner.login,
      repo: repository.name,
      issue_number: bounty.issueId,
      body: '❌ Failed to process bounty payment. Please contact the maintainers.',
    });
  }
} 