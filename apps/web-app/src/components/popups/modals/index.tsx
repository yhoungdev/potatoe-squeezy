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
  trigger?: React.ReactNode;
  children: React.ReactNode;
  title: string;
  onClose?: () => void;
  open?: boolean;
  closeOnOverlayClick?: boolean;
}

const ModalLayout = ({
  trigger,
  children,
  title,
  onClose,
  open,
  closeOnOverlayClick = true,
}: IModalLayout) => {
  return (
    <AlertDialog open={open}>
      {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
      <AlertDialogContent
        onPointerDownOutside={(e) => {
          if (!closeOnOverlayClick) {
            e.preventDefault();
          }
        }}
      >
        <AlertDialogHeader>
          <div className="flex items-center justify-between">
            <AlertDialogTitle>{title}</AlertDialogTitle>
            {(closeOnOverlayClick || !open) && (
              <AlertDialogCancel onClick={onClose} className="p-2">
                <X className="w-4 h-4" />
              </AlertDialogCancel>
            )}
          </div>
          <div>{children}</div>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ModalLayout;
