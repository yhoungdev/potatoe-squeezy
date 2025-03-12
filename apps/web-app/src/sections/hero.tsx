import Nav from "@/header/nav.astro";

const Hero = () => {
  return (
    <div className="">
      <Nav />
      <div className="items-center flex mt-[2em] justify-center h-[80vh]">
        <div className="w-[90%] lg:w-[600px] mx-auto text-center">
          <h2 className="text-7xl animate-pulse">🍟</h2>

          <div className="flex w-fit px-4 py-1 mx-auto my-8 rounded-full border border-orange-300">
            <small>Coming Soon 🥳🥳</small>
          </div>
          <h1 className="text-3xl font-bold">
            GitHub Just Got Starchier — Turn Potatoes into Bitcoin!
          </h1>

          <div className="flex items-center gap-2 justify-center">
            <p className="my-5">
              When life gives you potatoes, don't make chips—squeeze out Bitcoin
              instead! With PotatoSqueezy, get zapped for your awesome projects
              and make your birthdays even cooler!
            </p>
          </div>

          <a
            href="https://github.com/yhoungdev/potatoe-squeezy"
            target="_blank"
            rel="noopener noreferrer"
          >
            <button className="bg-orange-500 text-white px-4 py-2 w-[150px]">
              Get Start
            </button>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Hero;
