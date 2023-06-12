import MembershipScreen from "@/components/screen/MembershipScreen";
import { MembershipProvider } from "@/context/MemberContext";
import nextI18nextConfig from "@/next-i18next.config";
import prisma from "@/prisma/prisma";
import { defaultDescription } from "@/types/const";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";
import { useTranslation } from "react-i18next";

function MembershipDetailsPage(param: any) {
  const router = useRouter();
  const { locale } = router;
  const { t } = useTranslation("common");

  return (
    <div>
      <Head>
        <title>Memberships | Treasure Rush</title>
        <meta name="description" content={defaultDescription} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <MembershipProvider memberDetail={param.membership}>
        <MembershipScreen />
      </MembershipProvider>
    </div>
  );
}

export async function getServerSideProps({ locale, params }: any) {
  console.log(params);
  let membership = await prisma.membership.findFirst({
    where: {
      name: decodeURIComponent(params.name),
    },
  });

  return {
    props: {
      membership: JSON.parse(JSON.stringify(membership)),
      ...(await serverSideTranslations(locale, ["common"], nextI18nextConfig)),
    },
  };
}

export default MembershipDetailsPage;
