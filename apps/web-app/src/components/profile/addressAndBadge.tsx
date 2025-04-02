import { Button } from "../ui/button";
import { ChevronRight, CopyIcon } from "lucide-react";
import { TipBadge } from "./TipBadge";
import Typography from "../typography";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import WalletService from "@/services/wallet.service";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { useUserStore } from "@/store/user.store";

interface AddressAndBadgeProps {
  username: string;
  onUpdateAddress: (address: string) => void;
  onCopyBadge: () => void;
  currentAddress?: string;
}

const AddressAndBadge = ({
  username,
  onUpdateAddress,
  onCopyBadge,
  currentAddress = "",
}: AddressAndBadgeProps) => {
  const [modalType, setModalType] = useState<"address" | "badge" | null>(null);
  const [address, setAddress] = useState(currentAddress);

  const { user } = useUserStore();
  const { id } = user?.users || {};

  const menuItems = [
    { title: " 💼 Add/Update Wallet Address", type: "address" },
    { title: "✨ Generate Badge", type: "badge" },
  ];

  const handleSave = () => {
    onUpdateAddress(address);
    setModalType(null);
  };

  const mutate = useMutation({
    mutationFn: (address: string) =>
      WalletService.addWallet({
        userId: id,
        address,
      }),
    onSuccess: () => {
      toast.success("Wallet address updated successfully.");
      setModalType(null);
    },
    onError: () => {
      toast.error("Failed to update wallet address.");
    },
  });

  const handleSaveAddress = () => {
    if (address) {
      mutate.mutate(address, {
        onSuccess: () => {
          toast.success("Wallet address updated successfully.");
        },
      });
    }
  };

  return (
    <>
      <div className="flex flex-col gap-6 mt-6">
        {menuItems.map((item) => (
          <div
            key={item.type}
            onClick={() => setModalType(item.type as "address" | "badge")}
            className="flex items-center justify-between p-4 transition-all duration-200 border cursor-pointer bg-gray-900/50 hover:bg-gray-900/70 rounded-xl border-white/5 hover:border-purple-500/30"
          >
            <h4 className="text-sm text-gray-300">{item.title}</h4>
            <ChevronRight className="text-gray-400" />
          </div>
        ))}
      </div>

      <Dialog open={modalType !== null} onOpenChange={() => setModalType(null)}>
        <DialogContent className="bg-gray-950/95 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">
              {modalType === "address" ? "Update Wallet Address" : "Your Badge"}
            </DialogTitle>
          </DialogHeader>

          {modalType === "address" ? (
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
                <Button
                  variant="outline"
                  onClick={() => setModalType(null)}
                  className="w-full border-white/10 hover:bg-gray-900/50"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="pt-4 space-y-4">
              <Typography
                variant="h6"
                className="text-sm text-center text-gray-300"
              >
                Your Tip Badge ✨
              </Typography>
              <div className="flex justify-center p-4 border bg-gray-900/50 rounded-xl border-white/5">
                <TipBadge username={username} />
              </div>
              <Button
                onClick={onCopyBadge}
                className="w-full bg-gray-800 animate-pulse"
              >
                Copy Badge Code <CopyIcon />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddressAndBadge;
