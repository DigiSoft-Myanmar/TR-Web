import Navbar from "@/components/navbar/Navbar";
import nextI18nextConfig from "@/next-i18next.config";
import Head from "next/head";
import React from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { defaultDescription } from "@/types/const";
import { useSession } from "next-auth/react";
import { Role } from "@prisma/client";
import ErrorScreen from "@/components/screen/ErrorScreen";

function RolePage() {
  const { t } = useTranslation("common");
  const { data: session }: any = useSession();
  return session &&
    (session.role === Role.Admin ||
      session.role === Role.Staff ||
      session.role === Role.SuperAdmin) ? (
    <div>
      <Head>
        <title>Roles | Pyi Twin Phyit</title>
        <meta name="description" content={defaultDescription} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <ErrorScreen statusCode={405} />
      <div className="relative mx-auto max-w-screen-xl px-4 py-8">
        <section className="flex flex-col space-y-5"></section>
      </div>
    </div>
  ) : (
    <ErrorScreen statusCode={401} />
  );
}

export async function getServerSideProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"], nextI18nextConfig)),
    },
  };
}

export default RolePage;
