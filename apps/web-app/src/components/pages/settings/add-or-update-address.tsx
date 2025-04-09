import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import WalletService from "@/services/wallet.service";
import { toast } from "sonner";
import { useUserStore } from "@/store/user.store";

interface AddOrUpdateAddressProps {
  onUpdateAddress?: (address: string) => void;
}

const AddOrUpdateAddress = ({ onUpdateAddress }: AddOrUpdateAddressProps) => {
  const { user } = useUserStore() || {};
  const { id } = user?.users || {};

  const { wallets } = user || {};

  const [address, setAddress] = useState(wallets?.address || "");

  const mutate = useMutation({
    mutationFn: (address: string) =>
      WalletService.addWallet({
        userId: id,
        address,
      }),
    onSuccess: () => {
      toast.success("Wallet address updated successfully.");
      onUpdateAddress?.(address);
    },
    onError: () => {
      toast.error("Failed to update wallet address.");
    },
  });

  const handleSaveAddress = () => {
    if (address) {
      mutate.mutate(address);
    }
  };

  return (
    <div className="pt-4 space-y-4">
      <Input
        placeholder="Enter your Solana wallet address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        className="bg-gray-900/50 border-white/10 text-white !py-4"
      />
      <div className="flex flex-col justify-end gap-3">
        <Button onClick={handleSaveAddress} className="w-full">
          Save
        </Button>
      </div>
    </div>
  );
};

export default AddOrUpdateAddress;
