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
        router.push("/account/" + session.phoneNum);
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
        ) : type === RoleNav.Sellers ? (
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
      <button
        type="button"
        className="fixed right-3 bottom-3 rounded-full bg-primary p-3 text-white"
        onClick={() => {
          router.push(
            "/users/create?role=" +
              (type === RoleNav.Buyers
                ? Role.Buyer
                : type === RoleNav.Sellers
                ? Role.Seller
                : type === RoleNav.Admin
                ? Role.Admin
                : type === RoleNav.Staff
                ? Role.Staff
                : Role.Buyer)
          );
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-5 w-5"
        >
          <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
        </svg>
      </button>
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
