import React from "react";

type TVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "default"
  | "success"
  | "warning";

interface IProps {
  children: React.ReactNode;
  className?: string;
  variant?: TVariant;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

const DefaultButton: React.FC<IProps> = ({
  children,
  className = "",
  variant = "primary",
  onClick,
  type = "button",
  disabled = false,
}): React.ReactNode => {
  const variantStyles: Record<string, string> = {
    primary: "bg-orange-500 text-white hover:bg-orange-600",
    secondary: "bg-gray-500 text-white hover:bg-gray-600",
    danger: "bg-red-500 text-white hover:bg-red-600",
    default:
      "bg-[#212830]  border-[#80808054] border text-white hover:bg-red-600",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl my-2 !px-4 !py-2 transition-all duration-300 ${
        variantStyles[variant]
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    >
      {children}
    </button>
  );
};

export default DefaultButton;
