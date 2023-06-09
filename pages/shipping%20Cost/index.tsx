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
import { useQuery } from "react-query";
import SellerShippingTbl from "@/components/muiTable/SellerShippingTbl";
import { useRouter } from "next/router";

function Default() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { data: session }: any = useSession();
  const { isLoading, error, data, refetch } = useQuery("usersData", () =>
    fetch("/api/user?type=" + Role.Seller).then((res) => {
      let json = res.json();
      return json;
    }),
  );

  React.useEffect(() => {
    if (session && session.role === Role.Seller) {
      router.push("/shipping%20Cost/" + encodeURIComponent(session.phoneNum));
    }
  }, [session]);

  return session && session.role !== Role.Buyer ? (
    <div>
      <Head>
        <title>Shipping Cost | Pyi Twin Phyit</title>
        <meta name="description" content={defaultDescription} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="relative min-h-screen">
        <SellerShippingTbl
          data={data}
          refetch={() => {
            refetch();
          }}
        />
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

export default Default;
