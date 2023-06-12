import MembershipCard from "@/components/card/MembershipCard";
import MembershipModal from "@/components/modal/sideModal/MembershipModal";
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
          <section className="flex w-full flex-col space-y-5">
            {data && data.length > 0 ? (
              <div className="-mx-4 flex w-full flex-wrap items-center">
                {data.map((e: any, index: number) => (
                  <MembershipCard
                    key={index}
                    {...e}
                    button={
                      <div className="flex flex-row flex-wrap items-center justify-between gap-3 border-t border-t-slate-200 pt-3">
                        <span className="rounded-md bg-primary/20 px-3 py-2 text-sm text-primary">
                          {e.brandCount}
                        </span>
                        <div className="flex flex-row items-center gap-3">
                          <button
                            className="hover:text-primary"
                            onClick={(evt) => {
                              evt.stopPropagation();
                              router.push(
                                "/contents/memberships/" +
                                  encodeURIComponent(e.name)
                              );
                            }}
                          >
                            <span className="sr-only">Edit</span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="h-5 w-5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                              />
                            </svg>
                          </button>
                          <button
                            className="hover:text-primary"
                            onClick={(evt) => {
                              evt.stopPropagation();
                              showConfirmationDialog(
                                t("deleteConfirmation"),
                                "",
                                locale,
                                () => {
                                  fetch(
                                    `/api/memberships?id=${encodeURIComponent(
                                      e.id!
                                    )}`,
                                    {
                                      method: "DELETE",
                                      headers: getHeaders(session),
                                    }
                                  ).then(async (data) => {
                                    if (data.status === 200) {
                                      refetch();
                                      showSuccessDialog(
                                        "Delete Success",
                                        "",
                                        locale
                                      );
                                    } else {
                                      let json = await data.json();
                                      showErrorDialog(
                                        json.error,
                                        json.errorMM,
                                        locale
                                      );
                                    }
                                  });
                                }
                              );
                            }}
                          >
                            <span className="sr-only">Delete</span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="h-5 w-5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    }
                  />
                ))}
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
