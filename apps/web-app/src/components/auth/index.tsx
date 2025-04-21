import { Button } from "../ui/button";
import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { GithubIcon } from "lucide-react";
import API_ENDPOINTS from "@/enums/API_ENUM";
import { BASE_API_URL } from "@/constant";
import useAuth from "@/hooks/useAuth";
import { Link } from "@tanstack/react-router";
import ProductHuntCard from "../misc/ProductHuntCard";

function AuthComponent() {
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const handleGithubLogin = async () => {
    try {
      setIsLoading(true);
      const loginUrl = `${BASE_API_URL}${API_ENDPOINTS.GITHUB_AUTH}`;
      window.location.href = loginUrl;
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
