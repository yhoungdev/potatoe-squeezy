import React from "react";
import DefaultButton from "../button";

interface IGithubUserCardProps {
  user_avatar_url: string;
  user_name: string;
}

function GithubUsersCard({ user_name, user_avatar_url }: IGithubUserCardProps) {
  return (
    <div
      className={` w-full lg:w-[250px]
        bg-[#1b1b1b2b] rounded-lg px-2 py-2 shadow-sm 
        border-1 border-gray-600 h-[300px]
        `}
    >
      <button
        style={{
          padding: "5px 16px",
          margin: "0.5rem",
          backgroundColor: "#212830",
          color: "#F0F6FC",
          borderRadius: "10px",
          width: "97%",
          cursor: "pointer",
          border: ".5px solid #80808054",
        }}
      >
        🍟 Zap User ⚡
      </button>
    </div>
  );
}

export default GithubUsersCard;
