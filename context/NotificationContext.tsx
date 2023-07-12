import { OutOfStockError } from "@/types/ApiResponseTypes";
import { DeliveryType } from "@/types/orderTypes";
import { fetcher } from "@/util/fetcher";
import { showErrorDialog, showSuccessDialog } from "@/util/swalFunction";
import { formatAmount } from "@/util/textHelper";
import { Notification } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { createContext, useMemo } from "react";
import { useQuery } from "react-query";
import useSWR from "swr";

type NotiType = {
  isNotiPing: number;
  turnOffNotiPing: Function;
  isNotiOpen: boolean;
  openNotiModal: Function;
  closeNotiModal: Function;
  closeNotification: Function;
  newNotiList: Notification[];
  setNotiOpen: Function;
};
const NotiContext = createContext<NotiType>({
  isNotiOpen: false,
  closeNotiModal: () => {},
  isNotiPing: 0,
  newNotiList: [],
  openNotiModal: () => {},
  turnOffNotiPing: () => {},
  closeNotification: () => {},
  setNotiOpen: () => {},
});

export const useNoti = () => React.useContext(NotiContext);

export const NotiProvider = ({ children }: { children: React.ReactNode }) => {
  const [isNotiPing, setIsNotiPing] = React.useState(0);
  const [isNotiOpen, setNotiOpen] = React.useState(false);
  const [newNotiList, setNotiList] = React.useState<Notification[]>([]);
  const router = useRouter();
  const { data: session } = useSession();
  const { data } = useSWR("/api/notifications/update", fetcher);

  React.useEffect(() => {
    if (data) {
      if (data && data.notiOpen > 0) {
        setIsNotiPing(data.notiOpen);
      } else {
        setIsNotiPing(0);
      }
    }
  }, [data]);

  React.useEffect(() => {
    setNotiOpen(false);
  }, [router.asPath]);

  React.useEffect(() => {
    const removeAfterTimeout = setTimeout(() => {
      setNotiList((prevValue) => {
        if (prevValue.length > 0) {
          const updatedNumbers = [...prevValue];
          updatedNumbers.splice(0, 1);
          return updatedNumbers;
        } else {
          return prevValue;
        }
      });
    }, 2000);

    return () => {
      clearTimeout(removeAfterTimeout); // cancel the timeout if the component unmounts or the numbers state changes
    };
  }, [newNotiList]);

  React.useEffect(() => {
    const eventSource = new EventSource("/api/notifications");

    eventSource.onmessage = (event) => {
      console.log(event.data);
      const notification = JSON.parse(event.data);
      setIsNotiPing((prevValue) => prevValue + 1);
      setNotiList((prevValue) => {
        if (prevValue.length < 2) {
          return [...prevValue, notification];
        } else {
          return [prevValue[prevValue.length - 1], notification];
        }
      });
    };

    eventSource.onerror = function (err) {
      console.log(err);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  function closeNotiModal() {
    setNotiOpen(false);
  }
  function openNotiModal() {
    setNotiOpen(true);
  }
  function turnOffNotiPing() {
    setIsNotiPing(0);
  }

  function closeNotification(index: number) {
    setNotiList((prevValue) => {
      if (prevValue && prevValue[index]) {
        return prevValue.splice(index);
      } else {
        return prevValue;
      }
    });
  }

  return (
    <NotiContext.Provider
      value={{
        closeNotiModal,
        isNotiOpen,
        isNotiPing,
        newNotiList,
        openNotiModal,
        turnOffNotiPing,
        closeNotification,
        setNotiOpen,
      }}
    >
      {children}
    </NotiContext.Provider>
  );
};
