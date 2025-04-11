/**
 * @description
 * Yoo, so i Probot does'nt support Ts enums ye
 * I am not stupid for using object, it is just for the main time.
 * I will change it to enum if Probot supports it.
 * For now lets be squashing some potatoes 🍟
 */
const COMMANDS = {
  BOUNTY: "/bounty",
  CLAIM: "/claim",
  CANCEL_BOUNTY: "/cancel-bounty",
  EDIT_BOUNTY: "/edit-bounty",
  HELP: "/help",
} as const;

export default COMMANDS;
