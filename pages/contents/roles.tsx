import nextI18nextConfig from "@/next-i18next.config";
import Head from "next/head";
import React from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { defaultDescription } from "@/types/const";
import CategoryModal from "@/components/modal/sideModal/CategoryModal";
import Image from "next/image";
import CategoryCard from "@/components/card/CategoryCard";
import AttributeModal from "@/components/modal/sideModal/AttributeModal";
import { Attribute, Role, UserDefinedRole } from "@prisma/client";
import { useSession } from "next-auth/react";
import ErrorScreen from "@/components/screen/ErrorScreen";
import { useQuery } from "react-query";
import EmptyScreen from "@/components/screen/EmptyScreen";
import AttributeCard from "@/components/card/AttributeCard";
import PermissionModal from "@/components/modal/sideModal/PermissionModal";
import RoleCard from "@/components/card/RoleCard";
import LoadingScreen from "@/components/screen/LoadingScreen";

function RolePage() {
  const { t } = useTranslation("common");
  const [isModalOpen, setModalOpen] = React.useState(false);
  const { data: session }: any = useSession();
  const { isLoading, error, data, refetch } = useQuery("rolesData", () =>
    fetch("/api/roles").then((res) => {
      let json = res.json();
      return json;
    })
  );

  return session &&
    (session.role === Role.Admin || session.role === Role.SuperAdmin) ? (
    <div>
      <Head>
        <title>Roles | Treasure Rush</title>
        <meta name="description" content={defaultDescription} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="relative mx-auto p-5">
        <div className="flex flex-row items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-700">Roles</h3>
          <button
            type="button"
            className="px-3 py-3 bg-primary hover:bg-primary-focus transition rounded-md text-sm text-white flex items-center gap-2"
            onClick={() => {
              setModalOpen(true);
            }}
          >
            <span>Create</span>
          </button>
        </div>
        {isLoading ? (
          <LoadingScreen />
        ) : data && data.length > 0 ? (
          <section className="mt-5 flex flex-row flex-wrap items-start gap-5">
            {data.map((e: any, index: number) => (
              <RoleCard
                key={index}
                role={e}
                setUpdate={() => {
                  refetch();
                }}
                userCount={e.User.length}
              />
            ))}
          </section>
        ) : (
          <EmptyScreen
            onClickFn={() => {
              setModalOpen(true);
            }}
          />
        )}
      </div>

      <PermissionModal
        isModalOpen={isModalOpen}
        setModalOpen={setModalOpen}
        role={undefined}
        setUpdate={() => {
          refetch();
        }}
      />
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
