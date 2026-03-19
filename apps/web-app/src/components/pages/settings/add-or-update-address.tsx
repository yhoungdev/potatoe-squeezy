import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import WalletService from "@/services/wallet.service";
import { toast } from "sonner";
import { useUserStore } from "@/store/user.store";
import { Solana, Stellar } from "iconsax-reactjs";

interface AddOrUpdateAddressProps {
  onUpdateAddress?: (address: string) => void;
}

type Chain = "solana" | "stellar";

const CHAIN_OPTIONS: { value: Chain; label: string }[] = [
  { value: "solana", label: "Solana" },
  { value: "stellar", label: "Stellar" },
];

const AddOrUpdateAddress = ({ onUpdateAddress }: AddOrUpdateAddressProps) => {
  const { wallet } = useUserStore() || {};
  const { setWallet } = useUserStore();
  const queryClient = useQueryClient();

  const currentChain: Chain = (wallet?.chain as Chain) ?? "solana";
  const [chain, setChain] = useState<Chain>(currentChain);
  const [address, setAddress] = useState("");

  const { data: walletRows = [] } = useQuery({
    queryKey: ["userWallets"],
    queryFn: () => WalletService.getWalletAddress(),
  });

  const selectedWallet = useMemo(
    () =>
      walletRows.find((row: any) => row.chain === chain) ??
      (wallet?.chain === chain ? wallet : null),
    [walletRows, chain, wallet],
  );

  const hasExistingWallet = Boolean(selectedWallet?.id);

  useEffect(() => {
    setAddress(selectedWallet?.address ?? "");
  }, [selectedWallet?.address]);

  const addWalletMutation = useMutation({
    mutationFn: () =>
      WalletService.addWallet({
        chain,
        address: address.trim(),
      }),
    onSuccess: (savedWallet) => {
      toast.success("Wallet address saved successfully.");
      setWallet(savedWallet);
      onUpdateAddress?.(address);
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      queryClient.invalidateQueries({ queryKey: ["userWallets"] });
    },
    onError: () => {
      toast.error("Failed to save wallet address.");
    },
  });

  const updateWalletMutation = useMutation({
    mutationFn: () =>
      WalletService.updateWallet({
        chain,
        address: address.trim(),
      }),
    onSuccess: (savedWallet) => {
      toast.success("Wallet address updated successfully.");
      onUpdateAddress?.(address);
      setWallet(savedWallet);
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      queryClient.invalidateQueries({ queryKey: ["userWallets"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update wallet address.");
    },
  });

  const handleSaveOrUpdate = () => {
    if (!address.trim()) return;

    if (hasExistingWallet) {
      updateWalletMutation.mutate();
    } else {
      addWalletMutation.mutate();
    }
  };

  const isLoading =
    addWalletMutation.isPending || updateWalletMutation.isPending;

  const handleSelectChain = (value: Chain) => {
    setChain(value);
  };

  return (
    <div className="pt-4 space-y-4">
      <div className="flex gap-2">
        {CHAIN_OPTIONS.map((option) => {
          const isActive = chain === option.value;
          const Icon = option.value === "solana" ? Solana : Stellar;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelectChain(option.value)}
              className={`flex items-center gap-2 rounded-md w-full border px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "border-red-400 bg-white/10 text-white"
                  : "border-white/10 bg-gray-900/50 text-white/60 hover:border-white/40"
              }`}
            >
              <Icon
                size={20}
                variant="Bulk"
                color={isActive ? "#FFFFFF" : "#9CA3AF"}
              />
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>

      <Input
        placeholder={`Enter your ${chain} wallet address`}
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        className="bg-gray-900/50 border-white/10 text-white !py-4"
      />

      <div className="flex flex-col justify-end gap-3">
        <Button
          onClick={handleSaveOrUpdate}
          className="w-full"
          disabled={isLoading || !address.trim()}
        >
          {hasExistingWallet ? "Update" : "Save"}
        </Button>
      </div>
    </div>
  );
};

export default AddOrUpdateAddress;
