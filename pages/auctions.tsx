import Navbar from "@/components/navbar/Navbar";
import nextI18nextConfig from "@/next-i18next.config";
import Head from "next/head";
import React from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { defaultDescription } from "@/types/const";
import { isInternal } from "@/util/authHelper";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

function Default() {
  const { t } = useTranslation("common");
  const { data: session }: any = useSession();
  const router = useRouter();

  return (
    <div>
      <Head>
        <title>Auctions | Treasure Rush</title>
        <meta name="description" content={defaultDescription} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div
        className={`relative max-w-screen-2xl ${
          isInternal(session) ? "" : "mx-6"
        } py-5`}
      >
        <section className="flex flex-col space-y-5">
          <div className="flex">{t("home")}</div>
        </section>
      </div>
    </div>
  );
}

export async function getServerSideProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"], nextI18nextConfig)),
    },
  };
}

export default Default;
