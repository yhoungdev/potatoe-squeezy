import { Button } from "../ui/button";
import { useState } from "react";
import { motion } from "framer-motion";
import { GithubIcon } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { Link } from "@tanstack/react-router";
import { AuthService } from "@/services/auth.service";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";

function AuthComponent() {
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: "/app", replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleGithubLogin = async () => {
    try {
      setIsLoading(true);
      const callbackURL = `${window.location.origin}/app`;
      const errorCallbackURL = `${window.location.origin}/status/error`;
      const { url } = await AuthService.signInWithGithub({
        callbackURL,
        newUserCallbackURL: callbackURL,
        errorCallbackURL,
      });
      window.location.href = url;
    } catch (error) {
      console.error("Failed to initiate GitHub login:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full space-y-8 text-center lg:max-w-xl"
      >
        <div className="space-y-6">
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="block transition-transform cursor-pointer text-7xl hover:rotate-12"
          >
            🍟
          </motion.span>

          <motion.h1
            className="text-2xl font-semibiold "
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Reward Devs, Get Zapped—The Solana Way!
          </motion.h1>

          <motion.p
            className="leading-relaxed text-gray-400 text-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            When life gives you commits, don't just push—squeeze out some SOL
            instead! With PotatoSqueezy, get zapped and tip GitHub users for
            their awesome contributions. Open-source just got more rewarding!
          </motion.p>
        </div>

        <motion.div
          className="flex flex-col items-center gap-2 pt-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {!isAuthenticated ? (
            <Button className="bg-gray-800 w-fit" onClick={handleGithubLogin}>
              <GithubIcon /> Continue with Github
            </Button>
          ) : (
            <Link to="/app">
              <Button className="py-5">Proceed to Dashboard</Button>
            </Link>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

export default AuthComponent;
