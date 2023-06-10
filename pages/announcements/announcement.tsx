import Navbar from "@/components/navbar/Navbar";
import nextI18nextConfig from "@/next-i18next.config";
import Head from "next/head";
import React from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { defaultDescription } from "@/types/const";
import CategoryModal from "@/components/modal/sideModal/CategoryModal";
import Image from "next/image";
import CategoryCard from "@/components/card/CategoryCard";
import { useSession } from "next-auth/react";
import { Banner, Category, Role } from "@prisma/client";
import ErrorScreen from "@/components/screen/ErrorScreen";
import { useQuery } from "react-query";
import EmptyScreen from "@/components/screen/EmptyScreen";
import { useRouter } from "next/router";
import AnnouncementModal from "@/components/modal/sideModal/AnnouncementModal";
import LoadingScreen from "@/components/screen/LoadingScreen";
import { getText } from "@/util/textHelper";
import {
  showConfirmationDialog,
  showErrorDialog,
  showSuccessDialog,
} from "@/util/swalFunction";

function AnnouncementPage() {
  const { isLoading, error, data, refetch } = useQuery("adsData", () =>
    fetch("/api/siteManagement/banner").then((res) => {
      let json = res.json();
      return json;
    })
  );
  const [isModalOpen, setModalOpen] = React.useState(false);
  const { t } = useTranslation("common");
  const { data: session }: any = useSession();
  const [title, setTitle] = React.useState("Create Announcement");
  const [announcement, setAnnouncement] = React.useState<any>();
  const { locale } = useRouter();

  return session &&
    (session.role === Role.Admin ||
      session.role === Role.Staff ||
      session.role === Role.SuperAdmin) ? (
    <div>
      <Head>
        <title>Announcement | Pyi Twin Phyit</title>
        <meta name="description" content={defaultDescription} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="relative mx-auto p-5">
        <h3 className="text-lg font-semibold text-gray-700">Announcements</h3>
        {data && data.length > 0 ? (
          <section className="mt-5 flex flex-col items-start gap-5">
            {data.map((e: Banner, index: number) => (
              <div
                key={index}
                className="flex w-full flex-row items-center justify-between gap-3 rounded-md bg-white px-3 py-2 shadow-md"
              >
                <span className="text-sm text-gray-500">
                  {getText(e.bannerText, e.bannerTextMM, locale)}
                </span>
                <div className="flex flex-row items-center justify-end gap-3">
                  <button
                    type="button"
                    className="hover:text-primary"
                    onClick={(evt) => {
                      evt.stopPropagation();
                      setModalOpen(true);
                      setTitle("Update Announcement");
                      setAnnouncement(e);
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
                        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="hover:text-primary"
                    onClick={(evt) => {
                      evt.stopPropagation();
                      showConfirmationDialog(
                        t("deleteConfirmation"),
                        "",
                        locale,
                        () => {
                          fetch(
                            `/api/siteManagement/banner?id=${encodeURIComponent(
                              e.id
                            )}`,
                            {
                              method: "DELETE",
                            }
                          ).then(async (data) => {
                            if (data.status === 200) {
                              refetch();
                              showSuccessDialog(
                                t("delete") + " " + t("success"),
                                "",
                                locale
                              );
                            } else {
                              let json = await data.json();

                              showErrorDialog(json.error, json.errorMM, locale);
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
            ))}
          </section>
        ) : !data ? (
          <LoadingScreen />
        ) : (
          <EmptyScreen
            onClickFn={() => {
              setAnnouncement(undefined);
              setModalOpen(true);
              setTitle("New Announcement");
            }}
          />
        )}
        <button
          className="fixed right-3 bottom-3 rounded-full bg-primary p-3 text-white"
          onClick={() => {
            setAnnouncement(undefined);
            setModalOpen(true);
            setTitle("New Announcement");
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

      <AnnouncementModal
        isModalOpen={isModalOpen}
        announcement={announcement}
        setModalOpen={setModalOpen}
        setUpdate={() => {
          refetch();
        }}
        title={title}
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

export default AnnouncementPage;
