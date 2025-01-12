import React from "react";
import DefaultButton from "../button";
import Button from "../button";

interface IGithubUserCardProps {
  user_avatar_url: string;
  user_name: string;
}

function GithubUsersCard({ user_name, user_avatar_url }: IGithubUserCardProps) {
  return (
    <div
      className={` w-[85%]  lg:w-[230px]
        bg-[#1b1b1b2b] rounded-lg px-4 shadow-sm 
        border-2 border-gray-300/10 py-4 
        flex flex-col items-center justify-center
        
        `}
    >
      <div className={"h-20 w-20 bg-gray-800 rounded-xl"}></div>
      <div>
        <p>Sudo Whoami</p>
      </div>
        <Button className={'w-full'} variant={'default'}>   🍟 Zap User ⚡</Button>
    </div>
  );
}

export default GithubUsersCard;
