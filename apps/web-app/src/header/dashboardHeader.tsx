import useAuth from "@/hooks/useAuth.ts";
import { IGithubUserData } from "../../../../interface/index.interface";
import { SettingsIcon } from "@/assets/svg.tsx";

function DashboardHeader() {
  const { session, user } = useAuth();
  const { user_metadata } = user;

  const { email, avatar_url, user_name, provider_id } =
    user_metadata<IGithubUserData> || {};

  // if (!session) {
  //    if (typeof  window !== "undefined") {
  //        window.location.href = '/'
  //    }
  // }

  return (
    <div
      className={"  w-full  mx-auto flex items-center gap-2 justify-between"}
    >
      <div>
        <a href={"/app"}>
          <h1 className="text-4xl text-red-50">🍟</h1>
        </a>
      </div>

      <div className={"flex gap-2 items-center justify-center"}>
        <SettingsIcon />
        <div
          className="w-10 h-10 rounded-full bg-no-repeat bg-center bg-cover bg-gray-500"
          style={{ backgroundImage: `url(${avatar_url})` }}
        ></div>

        <h4>{user_name}</h4>
      </div>
    </div>
  );
}

export default DashboardHeader;
