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

  const menuItems = [
    { title: " 💼 Add/Update Wallet Address", type: "address" },
    { title: "✨ Generate Badge", type: "badge" },
  ];

  const handleSave = () => {
    onUpdateAddress(address);
    setModalType(null);
  };

  return (
    <>
      <div className="flex flex-col gap-6 mt-6">
        {menuItems.map((item) => (
          <div
            key={item.type}
            onClick={() => setModalType(item.type as "address" | "badge")}
            className="bg-gray-900/50 hover:bg-gray-900/70 p-4 rounded-xl cursor-pointer flex items-center justify-between border border-white/5 transition-all duration-200 hover:border-purple-500/30"
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
            <div className="space-y-4 pt-4">
              <Input
                placeholder="Enter your Solana wallet address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="bg-gray-900/50 border-white/10 text-white !py-4"
              />
              <div className="flex flex-col justify-end gap-3">
                <Button onClick={handleSave} className="w-full">
                  Save
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setModalType(null)}
                  className="border-white/10 w-full hover:bg-gray-900/50"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 pt-4">
              <Typography
                variant="h6"
                className="text-center text-sm text-gray-300"
              >
                Your Tip Badge ✨
              </Typography>
              <div className="p-4 bg-gray-900/50 flex justify-center rounded-xl border border-white/5">
                <TipBadge username={username} />
              </div>
              <Button
                onClick={onCopyBadge}
                className="w-full  bg-gray-800 animate-pulse"
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
