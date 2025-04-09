import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import Confetti from "react-confetti";
import { useEffect, useRef } from "react";

const SuccessPage = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const params = new URLSearchParams(window.location.search);
  const txnHash = params.get("txnHash");
  useEffect(() => {
    const handleInteraction = () => {
      if (audioRef.current) {
        audioRef.current
          .play()
          .then(() => {
            console.log("✅ Audio played successfully after user interaction.");
          })
          .catch((err) => {
            console.error("❌ Still couldn’t play audio:", err);
          });
      }

      window.removeEventListener("click", handleInteraction);
    };

    window.addEventListener("click", handleInteraction);

    return () => {
      window.removeEventListener("click", handleInteraction);
    };
  }, []);

  return (
    <div className="h-[100vh] w-[80%] lg:w-[400px] mx-auto text-center flex flex-col items-center justify-center text-white">
      <Confetti />
      <audio
        ref={audioRef}
        src="/asset/sounds/magic_sound.mp3"
        preload="auto"
      />

      <h1 className="text-8xl animate-bounce">🎉</h1>
      <h1 className="mb-4 text-2xl">Tip Successful!</h1>
      <p className="mb-6 text-sm text-gray-400">
        Thank you for your generosity. Your tip has been successfully processed.
      </p>
      <div className="w-[90%] lg:w-[60%] flex-col gap-2 flex items-center justify-between">
        <Link to="/app/explore" className="w-full">
          <Button className="w-full">Continue</Button>
        </Link>
        <a href={txnHash} className="w-full" target="_blank">
          <Button className="w-full border-red-400" variant="outline">
            View Transaction
          </Button>
        </a>
      </div>
    </div>
  );
};

export default SuccessPage;
