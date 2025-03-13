import { Button } from "../ui/button";
import { ChevronRight } from "lucide-react";
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
  currentAddress = ""
}: AddressAndBadgeProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [address, setAddress] = useState(currentAddress);

  const handleSave = () => {
    onUpdateAddress(address);
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="flex flex-col gap-6 mt-6">
        <div 
          onClick={() => setIsModalOpen(true)}
          className="bg-gray-900/50 hover:bg-gray-900/70 p-4 rounded-xl cursor-pointer flex items-center justify-between border border-white/5 transition-all duration-200 hover:border-purple-500/30"
        >
          <h4 className="text-sm text-gray-300">Add/Update Wallet Address</h4>
          <ChevronRight className="text-gray-400" />
        </div>
        <div className="space-y-4">
          <Typography variant="h6" className="text-center text-sm text-gray-300">
            Your Tip Badge ✨
          </Typography>
          <div className="p-4 bg-gray-900/50 rounded-xl border border-white/5">
            <TipBadge username={username} />
          </div>
          <Button 
            onClick={onCopyBadge} 
            className="w-full animate-pulse"
          >
            Copy Badge Code
          </Button>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-gray-950/95 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Update Wallet Address</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Input
              placeholder="Enter your Solana wallet address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="bg-gray-900/50 border-white/10 text-white !py-4"
            />
            <div className="flex flex-col justify-end gap-3">

            <Button 
                onClick={handleSave}
                className="w-full" 
              >
                Save
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => setIsModalOpen(false)}
                className="border-white/10 w-full hover:bg-gray-900/50"
              >
                Cancel
              </Button>
             
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddressAndBadge;
