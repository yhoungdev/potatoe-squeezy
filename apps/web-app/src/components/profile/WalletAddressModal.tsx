import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface WalletAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (address: string) => void;
  currentAddress?: string;
}

export function WalletAddressModal({
  isOpen,
  onClose,
  onSave,
  currentAddress = "",
}: WalletAddressModalProps) {
  const [address, setAddress] = useState(currentAddress);

  const handleSave = () => {
    onSave(address);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Wallet Address.</DialogTitle>
        </DialogHeader>
        <div className="pt-4 space-y-4">
          <Input
            placeholder="Enter your Solana wallet address."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
