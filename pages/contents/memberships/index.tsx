import MembershipCard from "@/components/card/MembershipCard";
import MembershipModal from "@/components/modal/sideModal/MembershipModal";
import MembershipTable from "@/components/presentational/MembershipTable";
import EmptyScreen from "@/components/screen/EmptyScreen";
import ErrorScreen from "@/components/screen/ErrorScreen";
import nextI18nextConfig from "@/next-i18next.config";
import { defaultDescription } from "@/types/const";
import { getHeaders } from "@/util/authHelper";
import {
  showConfirmationDialog,
  showErrorDialog,
  showSuccessDialog,
} from "@/util/swalFunction";
import { Membership, Role } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";
import { useQuery } from "react-query";

function MembershipPage() {
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
      session.role === Role.Staff ||
      session.role === Role.SuperAdmin) ? (
    <>
      <div>
        <Head>
          <title>Memberships | Treasure Rush</title>
          <meta name="description" content={defaultDescription} />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <div className="relative mx-auto max-w-screen-xl px-4 py-8">
          <section className="flex w-full flex-col space-y-5 bg-white py-10 px-5">
            {data && data.length > 0 ? (
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-5">
                  Memberships
                </h3>
                <MembershipTable data={data} />
              </div>
            ) : (
              <EmptyScreen
                onClickFn={() => {
                  router.push("/contents/memberships/new");
                }}
              />
            )}
          </section>
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
        </div>
      </div>
    </>
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

export default MembershipPage;
