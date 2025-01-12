import React from "react";
import GithubUsersCard from "../misc/github_users_card.tsx";

function UsersPage(props) {
  return (
    <div className={"flex flex-wrap justify-center md:justify-start gap-4"}>
      {[1, 1, 1, 1, 1].map((user) => {
        return <GithubUsersCard user_avatar_url={"lore"} user_name={""} />;
      })}
    </div>
  );
}

export default UsersPage;
