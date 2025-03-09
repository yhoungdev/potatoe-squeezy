import Nav from "@/header/nav.astro";
import AuthButton from "../button/auth";

const Auth = () => {
  return (
    <div className="">
      <Nav />
      <div className="items-center flex mt-[2em] justify-center h-[80vh]">
        <div className="w-[90%] lg:w-[600px] mx-auto text-center">
          <h2 className="text-7xl animate-pulse mb-4">🍟</h2>

          <h1 className="text-3xl font-bold">Continue with Github</h1>

          <div className="flex items-center gap-2 justify-center">
            <p className="my-5">
              When life gives you potatoes, don't make chips—squeeze
              out Bitcoin instead! With PotatoSqueezy, get zapped for your awesome projects and make your birthdays even cooler!
            </p>
          </div>

          <AuthButton />
        </div>
      </div>
    </div>
  );
};

export default Auth;