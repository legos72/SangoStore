import type { ReactNode } from "react";
import { AfricanBottomNav } from "@/components/african-fashion/AfricanBottomNav";

export const metadata = {
  title: "Mode Africaine – SangoStore",
  description: "Découvrez notre collection de vêtements, tissus et accessoires africains de qualité supérieure.",
};

export default function AfricanFashionLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <AfricanBottomNav />
    </>
  );
}
