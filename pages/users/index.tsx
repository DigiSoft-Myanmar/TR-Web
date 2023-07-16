import BuyerTbl from "@/components/muiTable/BuyerTbl";
import ErrorScreen from "@/components/screen/ErrorScreen";
import nextI18nextConfig from "@/next-i18next.config";
import { encryptPhone } from "@/util/encrypt";
import { fetcher } from "@/util/fetcher";
import { Role } from "@prisma/client";
import { useSession } from "next-auth/react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";
import { useQuery } from "react-query";
import useSWR from "swr";

function Index() {
  const router = useRouter();
  const { data: session }: any = useSession();
  const { type } = router.query;

  const { isLoading, error, data, refetch } = useQuery("usersData", () =>
    fetch("/api/user?type=" + Role.Buyer).then((res) => {
      let json = res.json();
      return json;
    })
  );

  React.useEffect(() => {
    if (
      session &&
      (session.role === Role.Admin ||
        session.role === Role.Staff ||
        session.role === Role.SuperAdmin)
    ) {
    } else {
      if (session) {
        router.push(
          "/account/" + encodeURIComponent(encryptPhone(session.phoneNum))
        );
      }
    }
  }, [session, router.asPath]);

  return session &&
    (session.role === Role.Admin ||
      session.role === Role.Staff ||
      session.role === Role.SuperAdmin) ? (
    <div className="relative min-h-screen">
      <Head>
        <title>Buyers | Treasure Rush</title>
      </Head>
      <div>
        <BuyerTbl data={data} refetch={() => refetch()} />
      </div>
    </div>
  ) : (
    !session && <ErrorScreen statusCode={401} />
  );
}

export async function getServerSideProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"], nextI18nextConfig)),
    },
  };
}

export default Index;
