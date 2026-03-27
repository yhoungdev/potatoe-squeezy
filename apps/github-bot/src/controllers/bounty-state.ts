type Applicant = {
  login: string;
  appliedAt: Date;
};

type AcceptedAssignment = {
  login: string;
  dueDate: string;
  acceptedAt: Date;
};

export type BountyState = {
  owner: string;
  repo: string;
  issueNumber: number;
  amountSol: number | null;
  applicants: Applicant[];
  accepted: AcceptedAssignment | null;
  completedAt: Date | null;
};

const bountyStates = new Map<string, BountyState>();

const buildIssueKey = (owner: string, repo: string, issueNumber: number) =>
  `${owner.toLowerCase()}/${repo.toLowerCase()}#${issueNumber}`;

export const getBountyState = (
  owner: string,
  repo: string,
  issueNumber: number,
) => {
  return bountyStates.get(buildIssueKey(owner, repo, issueNumber)) ?? null;
};

export const getOrCreateBountyState = (
  owner: string,
  repo: string,
  issueNumber: number,
) => {
  const key = buildIssueKey(owner, repo, issueNumber);
  const existing = bountyStates.get(key);

  if (existing) {
    return existing;
  }

  const next: BountyState = {
    owner,
    repo,
    issueNumber,
    amountSol: null,
    applicants: [],
    accepted: null,
    completedAt: null,
  };

  bountyStates.set(key, next);
  return next;
};

export const setBountyAmount = (
  owner: string,
  repo: string,
  issueNumber: number,
  amountSol: number,
) => {
  const state = getOrCreateBountyState(owner, repo, issueNumber);
  state.amountSol = amountSol;
  return state;
};

export const addApplicant = (
  owner: string,
  repo: string,
  issueNumber: number,
  login: string,
) => {
  const state = getOrCreateBountyState(owner, repo, issueNumber);
  const normalizedLogin = login.toLowerCase();
  const alreadyApplied = state.applicants.some(
    (applicant) => applicant.login.toLowerCase() === normalizedLogin,
  );

  if (!alreadyApplied) {
    state.applicants.push({
      login,
      appliedAt: new Date(),
    });
  }

  return state;
};

export const rejectApplicant = (
  owner: string,
  repo: string,
  issueNumber: number,
  login: string,
) => {
  const state = getOrCreateBountyState(owner, repo, issueNumber);
  const normalizedLogin = login.toLowerCase();
  state.applicants = state.applicants.filter(
    (applicant) => applicant.login.toLowerCase() !== normalizedLogin,
  );

  if (state.accepted?.login.toLowerCase() === normalizedLogin) {
    state.accepted = null;
  }

  return state;
};

export const acceptApplicant = (
  owner: string,
  repo: string,
  issueNumber: number,
  login: string,
  dueDate: string,
) => {
  const state = getOrCreateBountyState(owner, repo, issueNumber);
  state.accepted = {
    login,
    dueDate,
    acceptedAt: new Date(),
  };
  return state;
};

export const markBountyCompleted = (
  owner: string,
  repo: string,
  issueNumber: number,
) => {
  const state = getBountyState(owner, repo, issueNumber);

  if (!state) {
    return null;
  }

  state.completedAt = new Date();
  return state;
};
