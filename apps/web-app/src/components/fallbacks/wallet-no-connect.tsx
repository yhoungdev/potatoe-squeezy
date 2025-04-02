import { WalletSvg } from "@/assets/svg";
import ConnectWalletButton from "@/button/connectWalletButton";
import React from "react";
import { motion } from "framer-motion";

const WalletNotConnected = () => {
  return (
    <motion.div
      className="flex flex-col items-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <WalletSvg />
      </motion.div>
      <motion.h3
        className="text-lg font-semibold text-gray-500 "
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Wallet Not Connected
      </motion.h3>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mt-4"
      >
        <ConnectWalletButton>Connect Wallet</ConnectWalletButton>
      </motion.div>
    </motion.div>
  );
};

export default WalletNotConnected;
