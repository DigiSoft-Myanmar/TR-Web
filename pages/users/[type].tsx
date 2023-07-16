import AdminTbl from "@/components/muiTable/AdminTbl";
import OtherTbl from "@/components/muiTable/BannedTbl";
import BannedTbl from "@/components/muiTable/BannedTbl";
import BuyerTbl from "@/components/muiTable/BuyerTbl";
import SellerTbl from "@/components/muiTable/SellerTbl";
import StaffTbl from "@/components/muiTable/StaffTbl";
import SubscribeTbl from "@/components/muiTable/SubscribeTbl";
import ErrorScreen from "@/components/screen/ErrorScreen";

import nextI18nextConfig from "@/next-i18next.config";
import { RoleNav } from "@/types/role";
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

  let userType =
    type === RoleNav.Buyers
      ? Role.Buyer
      : type === RoleNav.Sellers
      ? Role.Seller
      : type === RoleNav.Traders
      ? Role.Trader
      : type === RoleNav.Admin
      ? Role.Admin
      : type === RoleNav.Staff
      ? Role.Staff
      : type === RoleNav.Banned
      ? RoleNav.Banned
      : type === RoleNav.Subscribe
      ? RoleNav.Subscribe
      : type === RoleNav.Inactive
      ? RoleNav.Inactive
      : type === RoleNav.Deleted
      ? RoleNav.Deleted
      : RoleNav.Buyers;

  const { isLoading, error, data, refetch } = useQuery("usersData", () =>
    fetch("/api/user?type=" + userType).then((res) => {
      let json = res.json();
      return json;
    })
  );

  React.useEffect(() => {
    refetch();
  }, [userType]);

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
        <title>{type} | Treasure Rush</title>
      </Head>
      <div>
        {type === RoleNav.Buyers ? (
          <BuyerTbl data={data} refetch={() => refetch()} />
        ) : type === RoleNav.Sellers || type === RoleNav.Traders ? (
          <SellerTbl data={data} refetch={() => refetch()} />
        ) : type === RoleNav.Staff ? (
          <StaffTbl data={data} refetch={() => refetch()} />
        ) : type === RoleNav.Admin ? (
          <AdminTbl data={data} refetch={() => refetch()} />
        ) : type === RoleNav.Subscribe ? (
          <SubscribeTbl data={data} refetch={() => refetch()} />
        ) : type === RoleNav.Banned ||
          type === RoleNav.Deleted ||
          type === RoleNav.Inactive ? (
          <OtherTbl
            data={data}
            refetch={() => refetch()}
            type={
              type === RoleNav.Banned
                ? "Banned"
                : type === RoleNav.Deleted
                ? "Deleted"
                : "Inactive"
            }
          />
        ) : (
          <ErrorScreen statusCode={501} />
        )}
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
