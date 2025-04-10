use anchor_lang::prelude::*;

declare_id!("8kfy8YGqzB1EQf87dqhrfuNaagqpm3yVSZG5T7QnQ294");

#[program]
pub mod program {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
