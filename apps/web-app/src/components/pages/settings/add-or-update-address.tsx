import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import WalletService from "@/services/wallet.service";
import { toast } from "sonner";
import { useUserStore } from "@/store/user.store";
import { useQueryClient } from "@tanstack/react-query";

interface AddOrUpdateAddressProps {
  onUpdateAddress?: (address: string) => void;
}

const CHAIN_OPTIONS = [
  { value: "solana", label: "Solana" },
  { value: "stellar", label: "Stellar" },
] as const;

const AddOrUpdateAddress = ({ onUpdateAddress }: AddOrUpdateAddressProps) => {
  const { wallet } = useUserStore() || {};

  const { setWallet } = useUserStore();
  const queryClient = useQueryClient();
  const currentChain = wallet?.chain ?? "solana";
  const [chain, setChain] = useState(currentChain);
  const [address, setAddress] = useState("");

  const { data: walletRows = [] } = useQuery({
    queryKey: ["userWallets"],
    queryFn: () => WalletService.getWalletAddress(),
  });

  const selectedWallet = useMemo(
    () =>
      walletRows.find((row) => row.chain === chain) ??
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
      queryClient.invalidateQueries({
        queryKey: ["userProfile"],
      });
      queryClient.invalidateQueries({
        queryKey: ["userWallets"],
      });
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
      queryClient.invalidateQueries({
        queryKey: ["userProfile"],
      });
      queryClient.invalidateQueries({
        queryKey: ["userWallets"],
      });
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

  return (
    <div className="pt-4 space-y-4">
      <select
        value={chain}
        onChange={(e) => setChain(e.target.value)}
        className="w-full rounded-md border border-white/10 bg-gray-900/50 px-3 py-3 text-white outline-none"
      >
        {CHAIN_OPTIONS.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="bg-gray-950 text-white"
          >
            {option.label}
          </option>
        ))}
      </select>
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
