import { useLocalStorage } from "@/hooks/useLocalStorage";
import { isMaintainence } from "@/types/const";
import { getDevice } from "@/util/getDevice";
import { Role } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React from "react";
import AdminSidebar from "../navbar/AdminSidebar";
import AuthHeader from "../navbar/AuthHeader";
import Footer from "../navbar/Footer";
import Header from "../navbar/Header";
import LoadingScreen from "../screen/LoadingScreen";
import { getHeaders, isInternal } from "@/util/authHelper";
import useSWR from "swr";
import { fetcher } from "@/util/fetcher";
import { useQuery } from "react-query";
import { MarketplaceProvider } from "@/context/MarketplaceContext";
import { useScrollDirection } from "react-use-scroll-direction";
import { SellerProvider } from "@/context/SellerContext";
import { AuctionProvider } from "@/context/AuctionContext";
import { encryptPhone } from "@/util/encrypt";
import { NotiProvider } from "@/context/NotificationContext";

declare global {
  interface Window {
    confirmationResult: any;
    recaptchaVerifier: any;
  }
}

interface LayoutProps {
  children: React.ReactNode;
}

function DefaultLayout({ children }: LayoutProps) {
  const router = useRouter();
  const { data: content } = useQuery("siteData", () =>
    fetch("/api/siteManagement").then((res) => {
      let json = res.json();
      return json;
    })
  );
  const { data: categories } = useQuery("categoriesData", () =>
    fetch("/api/products/categories").then((res) => {
      let json = res.json();
      return json;
    })
  );

  const { accessKey } = router.query;
  const { data: session, status }: any = useSession();
  const [showBtn, setShowBtn] = React.useState(false);
  const [isOpen, setOpen] = useLocalStorage("sideMenuOpen", "open");
  //const { data } = useSWR("/api/configurations", fetcher);
  //const { data: paymentMethods } = useSWR("/api/paymentMethods", fetcher);
  const [device, setDevice] = React.useState<any>();
  const [isOnline, setIsOnline] = React.useState<boolean>(true);

  React.useEffect(() => {
    if (getDevice()) {
      setDevice(getDevice());
    }
  }, []);

  React.useEffect(() => {
    function handleOnlineStatus() {
      setIsOnline(navigator.onLine);
    }

    window.addEventListener("online", handleOnlineStatus);
    window.addEventListener("offline", handleOnlineStatus);

    return () => {
      window.removeEventListener("online", handleOnlineStatus);
      window.removeEventListener("offline", handleOnlineStatus);
    };
  });

  React.useEffect(() => {
    if (session && isOnline === true && session.phoneNum) {
      fetch("/api/user/" + encodeURIComponent(session.phoneNum) + "/stats", {
        method: "PUT",
        body: JSON.stringify({ id: session.id, lastOnlineTime: undefined }),
        headers: getHeaders(session),
      });
    }
  }, [isOnline, session]);

  React.useEffect(() => {
    if (session) {
      /* if (!isInternal(session)) {
        if (!session.nrcFront) {
          router.push(
            "/account/" +
              encodeURIComponent(encryptPhone(session.phoneNum)) +
              "?action=edit"
          );
        }
      } */
    }
  }, [session, router.asPath]);

  React.useEffect(() => {
    if (device) {
      try {
        fetch("https://api.ipify.org/?format=json")
          .then((data) => data.json())
          .then((json) => {
            if (session) {
              fetch("/api/siteVisit?ip=" + json.ip, {
                method: "POST",
                body: JSON.stringify(device),
                headers: getHeaders(session),
              });
            } else {
              fetch("/api/siteVisit?ip=" + json.ip, {
                method: "POST",
                body: JSON.stringify(device),
              });
            }
          })
          .catch((e) => {});
      } catch (err) {
        fetch("/api/siteVisit", {
          method: "POST",
          body: JSON.stringify(device),
          headers: getHeaders(session),
        });
      }
    }
  }, [device, session]);

  React.useEffect(() => {
    window.addEventListener("scroll", () => {
      if (window.pageYOffset > 300) {
        setShowBtn(true);
      } else {
        setShowBtn(false);
      }
    });
  }, []);

  if (status === "loading") {
    return <LoadingScreen />;
  }

  return session && isInternal(session) ? (
    <NotiProvider>
      <div
        className={`bg-gray-50 ${
          router.locale && router.locale === "en"
            ? "font-poppins"
            : "font-myanmarAngoun"
        }`}
      >
        <div className="relative flex h-screen flex-row items-start overflow-y-auto">
          <div
            className={`${
              isOpen === "open"
                ? "min-w-[100%] md:min-w-[250px] md:max-w-[250px]"
                : "min-w-[60px] max-w-[60px]"
            } sticky top-0 left-0 bottom-0 h-screen overflow-y-auto border-r bg-white scrollbar-hide`}
          >
            <AdminSidebar isOpen={isOpen} />
          </div>
          <button
            className={
              isOpen === "open"
                ? "fixed right-[20px] top-8 z-30 rounded-md bg-[#fad1d4] p-2 text-primary md:top-4 md:left-[230px] md:right-auto"
                : "fixed left-[40px] top-4 z-30 rounded-md bg-[#fad1d4] p-2 text-primary"
            }
            onClick={() =>
              setOpen((prevValue: string) =>
                prevValue === "open" ? "close" : "open"
              )
            }
          >
            {isOpen === "open" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5"
                />
              </svg>
            )}
          </button>
          <div
            className={`flex ${
              isOpen === "open"
                ? "w-[calc(100%-250px)]"
                : "max-w-[calc(100%-60px)]"
            }  flex-grow flex-col`}
          >
            <AuthHeader />
            <main className={router.asPath.includes("reports") ? "" : "m-5"}>
              {children}
            </main>
          </div>
        </div>
      </div>
    </NotiProvider>
  ) : (
    <SellerProvider>
      <NotiProvider>
        <MarketplaceProvider>
          <AuctionProvider>
            <div
              className={`min-h-screen bg-gray-50 ${
                router.locale && router.locale === "en"
                  ? "font-poppins"
                  : "font-myanmarAngoun"
              }`}
            >
              <Header
                content={content}
                categories={categories}
                device={device}
              />

              {children}
              {showBtn === true && (
                <button
                  className="fixed right-5 bottom-24 z-50 flex h-10 w-10 items-center justify-center rounded-md bg-[#f0777f] text-white hover:bg-primary-focus"
                  onClick={() => {
                    if (window) {
                      window.scrollTo({
                        top: 0,
                        behavior: "smooth",
                      });
                    }
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7 11l5-5m0 0l5 5m-5-5v12"
                    />
                  </svg>
                </button>
              )}
              <Footer content={content} />
            </div>
          </AuctionProvider>
        </MarketplaceProvider>
      </NotiProvider>
    </SellerProvider>
  );
}

export default DefaultLayout;
