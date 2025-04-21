import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import WalletService from "@/services/wallet.service";
import { toast } from "sonner";
import { useUserStore } from "@/store/user.store";
import { useQueryClient } from "@tanstack/react-query";

interface AddOrUpdateAddressProps {
  onUpdateAddress?: (address: string) => void;
}

const AddOrUpdateAddress = ({ onUpdateAddress }: AddOrUpdateAddressProps) => {
  const { user } = useUserStore() || {};
  const queryClient = useQueryClient();
  const { id } = user?.users || {};
  const { wallets } = user || {};

  const [address, setAddress] = useState(wallets?.address || "");
  const hasExistingWallet = Boolean(wallets?.address);

  const addWalletMutation = useMutation({
    mutationFn: (address: string) =>
      WalletService.addWallet({
        userId: id,
        address,
      }),
    onSuccess: () => {
      toast.success("Wallet address saved successfully.");
      onUpdateAddress?.(address);
      queryClient.invalidateQueries({
        queryKey: ["userProfile"],
      });
    },
    onError: () => {
      toast.error("Failed to save wallet address.");
    },
  });

  const updateWalletMutation = useMutation({
    mutationFn: () =>
      WalletService.updateWallet({
        walletId: wallets?.id,
        address,
      }),
    onSuccess: () => {
      toast.success("Wallet address updated successfully.");
      onUpdateAddress?.(address);
      queryClient.invalidateQueries({
        queryKey: ["userProfile"],
      });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update wallet address.");
    },
  });

  const handleSaveOrUpdate = () => {
    if (!address) return;

    if (hasExistingWallet && wallets?.id) {
      updateWalletMutation.mutate();
    } else {
      addWalletMutation.mutate(address);
    }
  };

  const isLoading =
    addWalletMutation.isPending || updateWalletMutation.isPending;

  return (
    <div className="pt-4 space-y-4">
      <Input
        placeholder="Enter your Solana wallet address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        className="bg-gray-900/50 border-white/10 text-white !py-4"
      />
      <div className="flex flex-col justify-end gap-3">
        <Button
          onClick={handleSaveOrUpdate}
          className="w-full"
          disabled={isLoading || !address}
        >
          {hasExistingWallet ? "Update" : "Save"}
        </Button>
      </div>
    </div>
  );
};

export default AddOrUpdateAddress;
