import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface IDrawer {
  trigger: React.ReactNode;
  children: React.ReactNode;
  title: string;
  side?: "top" | "right" | "bottom" | "left";
}

const Drawer = ({ trigger, children, title, side = "right" }: IDrawer) => {
  return (
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side={side}>
        <SheetHeader>
          <SheetTitle className="text-white">{title}</SheetTitle>
        </SheetHeader>
        <div className="py-4">{children}</div>
      </SheetContent>
    </Sheet>
  );
};

export default Drawer;
