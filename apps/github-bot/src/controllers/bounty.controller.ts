import { Context } from "probot";
const bountyController = async (context: Context) => {
  try {
    const comment = context.issue({
      body: "💰 This issue has been labeled as a bounty",
    });

    await context.octokit.issues.createComment(comment);
  } catch (err) {
    console.error(err);
  }
};

export default bountyController;
