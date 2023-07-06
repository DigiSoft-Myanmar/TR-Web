import nextI18nextConfig from "@/next-i18next.config";
import Head from "next/head";
import React from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { appName, defaultDescription, fileUrl } from "@/types/const";
import { useSession } from "next-auth/react";
import ErrorScreen from "@/components/screen/ErrorScreen";
import { Role, User } from "@prisma/client";
import { getInitials, getText } from "@/util/textHelper";
import { useRouter } from "next/router";
import { RoleNav } from "@/types/role";
import Link from "next/link";
import {
  showErrorDialog,
  showInputDialog,
  showSuccessDialog,
} from "@/util/swalFunction";
import prisma from "@/prisma/prisma";
import { isInternal } from "@/util/authHelper";
import {
  BuyerPermission,
  SellerPermission,
  StaffPermission,
  TraderPermission,
} from "@/types/permissionTypes";
import { ProfileProvider } from "@/context/ProfileContext";
import ProfileScreen from "@/components/screen/ProfileScreen";
import { decryptPhone } from "@/util/encrypt";
import UserScreen from "@/components/screen/UserScreen";

function Default({ user }: { user: any }) {
  const { t }: any = useTranslation("common");
  const { data: session }: any = useSession();
  const router = useRouter();
  const { locale } = router;
  const { action } = router.query;

  if (session?.id !== user.id && isInternal(session) === false) {
    return (
      <div>
        <Head>
          <title>
            {user?.username} | {appName}
          </title>
          <meta name="description" content={defaultDescription} />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <UserScreen user={user} />
      </div>
    );
  }

  return session &&
    (session.id === user?.id ||
      isInternal(session) ||
      (session.role === Role.Staff &&
        session.role === Role.Staff &&
        session.userDefinedRole &&
        session.userDefinedRole.permission &&
        session.userDefinedRole.permission.find(
          (z: any) =>
            (action?.toString().toLowerCase() === "edit" &&
              ((user.role === Role.Buyer &&
                z === BuyerPermission.buyerUpdateAllow) ||
                (user.role === Role.Seller &&
                  z === SellerPermission.sellerUpdateAllow) ||
                (user.role === Role.Trader &&
                  z === TraderPermission.traderUpdateAllow) ||
                (user.role === Role.Staff &&
                  z === StaffPermission.staffUpdateAllow))) ||
            ((action.toString().toLowerCase() === "view" || !action) &&
              ((user.role === Role.Buyer &&
                z === BuyerPermission.buyerViewAllow) ||
                (user.role === Role.Seller &&
                  z === SellerPermission.sellerViewAllow) ||
                (user.role === Role.Trader &&
                  z === TraderPermission.traderViewAllow) ||
                (user.role === Role.Staff &&
                  z === StaffPermission.staffViewAllow)))
        ))) ? (
    <div>
      <Head>
        <title>
          {user?.username} | {appName}
        </title>
        <meta name="description" content={defaultDescription} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {action?.toString().toLowerCase() === "edit" ? (
        <ProfileProvider user={user}>
          <ProfileScreen />
        </ProfileProvider>
      ) : (
        <UserScreen user={user} />
      )}
    </div>
  ) : (
    <ErrorScreen statusCode={401} />
  );
}

export async function getServerSideProps({ params, locale }: any) {
  let user: any = await prisma.user.findFirst({
    where: { phoneNum: decryptPhone(decodeURIComponent(params.phoneNum)) },
    include: {
      state: true,
      district: true,
      township: true,
      currentMembership: true,
      userDefinedRole: true,
    },
  });
  return {
    props: {
      user: JSON.parse(JSON.stringify(user)),
      ...(await serverSideTranslations(locale, ["common"], nextI18nextConfig)),
    },
  };
}

export default Default;
