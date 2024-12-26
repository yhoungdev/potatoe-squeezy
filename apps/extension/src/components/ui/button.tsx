import React from "react";
import { IButtonProps } from "../../interface";

const Button: React.FC<IButtonProps> = ({
  children,
  className,
}: IButtonProps) => {
  const customClass = `py-2
        px-2 bg-primary-100
         rounded-md text-white font-bold`;
  return <button className={`${customClass} ${className}`}>{children}</button>;
};

export default Button;
