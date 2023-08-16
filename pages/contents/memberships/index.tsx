import MembershipCard from "@/components/card/MembershipCard";
import MembershipModal from "@/components/modal/sideModal/MembershipModal";
import MembershipTable from "@/components/presentational/MembershipTable";
import EmptyScreen from "@/components/screen/EmptyScreen";
import ErrorScreen from "@/components/screen/ErrorScreen";
import nextI18nextConfig from "@/next-i18next.config";
import prisma from "@/prisma/prisma";
import { defaultDescription } from "@/types/const";
import { otherPermission } from "@/types/permissionTypes";
import { getHeaders, hasPermission } from "@/util/authHelper";
import {
  showConfirmationDialog,
  showErrorDialog,
  showSuccessDialog,
} from "@/util/swalFunction";
import { Content, Membership, Role } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";
import { useQuery } from "react-query";

function MembershipPage({ content }: { content?: Content }) {
  const { locale } = useRouter();
  const router = useRouter();
  const { isLoading, error, data, refetch } = useQuery("membershipsData", () =>
    fetch("/api/memberships").then((res) => {
      let json = res.json();
      return json;
    })
  );
  const [isModalOpen, setModalOpen] = React.useState(false);
  const { t } = useTranslation("common");
  const [membership, setMembership] = React.useState<any>();
  const [title, setTitle] = React.useState(t("New Membership"));
  const { data: session }: any = useSession();

  return session &&
    (session.role === Role.Admin ||
      (session.role === Role.Staff &&
        hasPermission(session, otherPermission.membershipView)) ||
      session.role === Role.SuperAdmin) ? (
    <>
      <div>
        <Head>
          <title>Memberships | Treasure Rush</title>
          <meta name="description" content={defaultDescription} />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <div className="relative mx-auto max-w-screen-xl px-4 py-8">
          <section className="flex w-full flex-col items-start space-y-5 bg-white py-10 px-5">
            {data && data.length > 0 ? (
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-5">
                  Memberships
                </h3>
                <MembershipTable data={data} content={content} />
              </div>
            ) : (
              <EmptyScreen
                onClickFn={() => {
                  router.push("/contents/memberships/new");
                }}
              />
            )}
          </section>
          {hasPermission(session, otherPermission.membershipUpdate) && (
            <button
              className="fixed right-3 bottom-16 rounded-full bg-primary p-3 text-white"
              onClick={() => {
                router.push("/contents/memberships/conf");
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077l1.41-.513m14.095-5.13l1.41-.513M5.106 17.785l1.15-.964m11.49-9.642l1.149-.964M7.501 19.795l.75-1.3m7.5-12.99l.75-1.3m-6.063 16.658l.26-1.477m2.605-14.772l.26-1.477m0 17.726l-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205L12 12m6.894 5.785l-1.149-.964M6.256 7.178l-1.15-.964m15.352 8.864l-1.41-.513M4.954 9.435l-1.41-.514M12.002 12l-3.75 6.495"
                />
              </svg>
            </button>
          )}
          {hasPermission(session, otherPermission.membershipCreate) && (
            <button
              className="fixed right-3 bottom-3 rounded-full bg-primary p-3 text-white"
              onClick={() => {
                router.push("/contents/memberships/new");
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
          )}
        </div>
      </div>
    </>
  ) : (
    <ErrorScreen statusCode={401} />
  );
}

export async function getServerSideProps({ locale }: any) {
  const content = await prisma.content.findFirst({});

  return {
    props: {
      content: JSON.parse(JSON.stringify(content)),
      ...(await serverSideTranslations(locale, ["common"], nextI18nextConfig)),
    },
  };
}

export default MembershipPage;
