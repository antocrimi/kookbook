"use client";

import { Primitive } from "@radix-ui/react-primitive";
import { type ComponentPropsWithoutRef } from "react";
import styles from "./index.module.scss";

type LogoSize = "xs" | "sm" | "md" | "lg" | "xl";

type PrimitiveLogoProps = ComponentPropsWithoutRef<typeof Primitive.svg>;

export interface LogoProps extends PrimitiveLogoProps {
  className?: string;
  size?: LogoSize;
}

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

export const Logo = ({ className, size = "md", ...props }: LogoProps) => {
  return (
    <Primitive.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 25 24"
      fill="none"
      className={cx(styles.logo, styles[`size-${size}`], className)}
      role="img"
      aria-label="Immergine logo"
      {...props}
    >
      <path
        d="M8.81726 24C3.9565 24 0 19.982 0 15.04C0 10.098 3.9565 6.07993 8.81726 6.07993C10.2641 6.07993 11.6416 6.42484 12.9125 7.1071C13.2024 7.26319 13.5195 7.33872 13.8366 7.33872C14.2231 7.33872 14.6071 7.22291 14.9415 6.99633C15.546 6.58345 15.8805 5.86846 15.8111 5.13081C15.7963 4.97975 15.7888 4.8287 15.7888 4.67765C15.7888 2.09965 17.855 0 20.3944 0C22.9338 0 25 2.09965 25 4.68016C25 7.26067 22.9338 9.36033 20.3944 9.36033C20.05 9.36033 19.7082 9.32256 19.3762 9.24452C19.23 9.21179 19.0838 9.19417 18.9377 9.19417C18.3728 9.19417 17.8253 9.44089 17.4438 9.88398C16.9656 10.4404 16.8244 11.2208 17.0796 11.9131C17.4462 12.9126 17.632 13.965 17.632 15.04C17.632 19.982 13.6756 24 8.81479 24H8.81726Z"
        fill="currentColor"
      />
    </Primitive.svg>
  );
};
