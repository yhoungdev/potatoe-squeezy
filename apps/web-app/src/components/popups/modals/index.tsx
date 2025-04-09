import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { X } from "lucide-react";

interface IModalLayout {
  trigger: React.ReactNode;
  children: React.ReactNode;
  title: string;
  onClose?: () => void;
}

const ModalLayout = ({ trigger, children, title, onClose }: IModalLayout) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center justify-between">
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogCancel className="p-2">
              <X className="w-4 h-4" />
            </AlertDialogCancel>
          </div>
          <div>{children}</div>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
};
export default ModalLayout;
