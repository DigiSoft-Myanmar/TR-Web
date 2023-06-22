import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Role } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { createContext } from "react";

type SellerType = {
  isSeller: boolean;
  toggleSellerMode: Function;
};
const SellerContext = createContext<SellerType>({
  isSeller: false,
  toggleSellerMode: () => {},
});

export const useSeller = () => React.useContext(SellerContext);

export const SellerProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status }: any = useSession();
  const [isSeller, setSeller] = useLocalStorage("isSellerMode", "false");

  async function toggleSellerMode() {
    if (isSeller === "true") {
      setSeller("false");
    } else {
      setSeller("true");
    }
  }

  React.useEffect(() => {
    if (status === "authenticated") {
      if (
        session &&
        (session.role === Role.Seller || session.role === Role.Trader) &&
        session.sellAllow === true
      ) {
      } else {
        setSeller("false");
      }
    } else if (status === "unauthenticated") {
      setSeller("false");
    }
  }, [session]);

  return (
    <SellerContext.Provider
      value={{ isSeller: isSeller === "true", toggleSellerMode }}
    >
      {children}
    </SellerContext.Provider>
  );
};
