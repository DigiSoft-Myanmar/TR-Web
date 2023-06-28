import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { createContext } from "react";
import { useQuery } from "react-query";
import useSWR from "swr";
import io from "socket.io-client";
import { getHeaders, isBuyer, isInternal } from "@/util/authHelper";
import { Auctions } from "@prisma/client";
import { showErrorDialog } from "@/util/swalFunction";
import { useMarketplace } from "./MarketplaceContext";

let socket: any;

type IAuctionType = {
  newBid: Auctions[];
  setNewBid: Function;
  placeBid: (
    bidAmount: number,
    productId: string,
    SKU: string,
    sellerId: string,
    seller: any
  ) => void;
};
const AuctionContext = createContext<IAuctionType>({
  newBid: [],
  setNewBid: () => {},
  placeBid: () => {},
});

export const useAuction = () => React.useContext(AuctionContext);

export const AuctionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const router = useRouter();
  const { locale } = router;
  const { data: session }: any = useSession();
  const [isSet, setSet] = React.useState(false);
  const [newBid, setNewBid] = React.useState([]);
  const { canShip } = useMarketplace();

  async function socketInitilizer() {
    if (socket === undefined) {
      fetch("/api/auction/socket").finally(() => {
        socket = io("", {
          path: "/api/socket_io",
        });
        if (socket && session) {
          socket.emit("connection");

          socket.on("newBid", (data: any) => {
            console.log(data);
            setNewBid((prevValue: any) => {
              return [...prevValue, data];
            });
          });

          socket.on("error", (data: any) => {
            console.log("Error:", data);
          });

          socket.on("connect_error", (error: any) => {
            // Handle the connection error here
            console.error("Socket connection error:", error);
          });
          socket.on("polling_error", (error: any) => {
            // Handle the polling error here
            console.error("Socket polling error:", error);
          });
        }
      });
      setSet(true);
    }
  }

  React.useEffect(() => {
    if (isSet === false) {
      if (typeof window !== "undefined") {
        socketInitilizer();
      }
      return () => {
        // Clean up event listeners when component unmounts
        if (socket) {
          socket.disconnect();
        }
      };
    }
  }, [isSet]);

  async function placeBid(
    bidAmount: number,
    productId: string,
    SKU: string,
    sellerId: string,
    seller: any
  ) {
    if (session && session.id === sellerId) {
      showErrorDialog(
        "You cannot bid your own product.",
        "သင့်ကိုယ်ပိုင် ပစ္စည်းအား လေလံစျေးခေါ်ခွင့်မရှိပါ။",
        locale
      );
      return;
    }
    if (session && isBuyer(session)) {
      let isAvailable = await canShip(sellerId, seller);
      if (isAvailable === false) {
        return;
      }
      fetch("/api/auction/mobile", {
        method: "POST",
        body: JSON.stringify({
          amount: bidAmount,
          SKU: SKU,
          productId: productId,
        }),
        headers: getHeaders(session),
      });
    } else if (session && !isBuyer(session)) {
      showErrorDialog(
        "You are not allowed to perform this action",
        "ရှေ့ဆက်ရန် ကျေးဇူးပြု၍ အကောင့်ဝင်ပါ။",
        locale
      );
    } else {
      showErrorDialog(
        "Please login to continue.",
        "ရှေ့ဆက်ရန် ကျေးဇူးပြု၍ အကောင့်ဝင်ပါ။",
        locale,
        () => {
          router.push("/login");
        }
      );
    }
  }

  return (
    <AuctionContext.Provider
      value={{
        newBid,
        setNewBid,
        placeBid,
      }}
    >
      {children}
    </AuctionContext.Provider>
  );
};
