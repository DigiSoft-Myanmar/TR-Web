import "../styles/global.css";
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { appWithTranslation } from "next-i18next";
import React from "react";
import { ThemeProvider } from "next-themes";

import NProgress from "nprogress"; //nprogress module
import "nprogress/nprogress.css"; //styles of nprogress
import Router from "next/router";
import { QueryClient, QueryClientProvider } from "react-query";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { MarketplaceProvider } from "@/context/MarketplaceContext";
//Route Events.
Router.events.on("routeChangeStart", () => NProgress.start());
Router.events.on("routeChangeComplete", () => NProgress.done());
Router.events.on("routeChangeError", () => NProgress.done());
const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: any) {
  React.useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", function () {
        navigator.serviceWorker.register("/firebase-messaging-sw.js").then(
          function (registration) {
            console.log(
              "Service Worker registration successful with scope: ",
              registration.scope
            );
          },
          function (err) {
            console.log("Service Worker registration failed: ", err);
          }
        );
      });
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SessionProvider session={pageProps.session}>
          <DefaultLayout>
            <Component {...pageProps} />
          </DefaultLayout>
        </SessionProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default appWithTranslation(MyApp);
