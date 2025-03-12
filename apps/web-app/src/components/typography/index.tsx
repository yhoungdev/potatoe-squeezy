import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const typographyVariants = cva("", {
  variants: {
    variant: {
      h1: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
      h2: "scroll-m-20 text-3xl font-semibold tracking-tight",
      h3: "scroll-m-20 text-2xl font-semibold tracking-tight",
      h4: "scroll-m-20 text-xl font-semibold tracking-tight",
      h5: "scroll-m-20 text-lg font-semibold tracking-tight",
      h6: "scroll-m-20 text-base font-semibold tracking-tight",
      p: "leading-7 [&:not(:first-child)]:mt-6",
      blockquote: "mt-6 border-l-2 pl-6 italic",
      list: "my-6 ml-6 list-disc [&>li]:mt-2",
      body1: "text-base leading-7",
      body2: "text-sm leading-6",
      caption: "text-xs leading-5",
      muted: "text-sm text-muted-foreground",
    },
    color: {
      default: "",
      primary: "text-primary",
      secondary: "text-secondary",
      muted: "text-muted-foreground",
      accent: "text-accent-foreground",
      destructive: "text-destructive",
    },
    weight: {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
      extrabold: "font-extrabold",
    },
  },
  defaultVariants: {
    variant: "body1",
    color: "default",
    weight: "normal",
  },
});

interface TypographyProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof typographyVariants> {
  as?: keyof JSX.IntrinsicElements;
  children: React.ReactNode;
  weight?: "normal" | "medium" | "semibold" | "bold" | "extrabold";
}

export const Typography = ({
  as: Component = "p",
  children,
  variant,
  color,
  weight,
  className,
  ...props
}: TypographyProps) => {
  return (
    <Component
      className={cn(typographyVariants({ variant, color, weight, className }))}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Typography;
