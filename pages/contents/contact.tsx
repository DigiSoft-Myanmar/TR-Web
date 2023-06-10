import Navbar from "@/components/navbar/Navbar";
import nextI18nextConfig from "@/next-i18next.config";
import Head from "next/head";
import React from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { defaultDescription } from "@/types/const";
import { useSession } from "next-auth/react";
import { Content, Role } from "@prisma/client";
import ErrorScreen from "@/components/screen/ErrorScreen";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import prisma from "@/prisma/prisma";
import { z } from "zod";
import {
  showConfirmationDialog,
  showErrorDialog,
  showSuccessDialog,
} from "@/util/swalFunction";
import { useRouter } from "next/router";
import SubmitBtn from "@/components/presentational/SubmitBtn";
import FormInput from "@/components/presentational/FormInput";
import TextInputDialog from "@/components/modal/dialog/TextInputDialog";
import { SocialIcon } from "react-social-icons";
import { getHeaders } from "@/util/authHelper";

function ContactPage({ data }: { data: any }) {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { locale } = router;
  const { data: session }: any = useSession();
  const [socialUrls, setSocialUrls] = React.useState<string[]>(
    data?.socialUrl ? data.socialUrl : []
  );
  const [isSubmit, setSubmit] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [isModalOpen, setModalOpen] = React.useState(false);
  const [url, setUrl] = React.useState<string>();
  const [updateIndex, setUpdateIndex] = React.useState(-1);

  const schema = z.object({
    googleMapUrl: z.string().min(1, { message: t("inputError") }),
    googleMapUrl1: z.string().min(1, { message: t("inputError") }),
    lat: z
      .number({
        invalid_type_error: t("inputValidNumber"),
        required_error: "",
      })
      .optional()
      .or(z.literal("")),
    long: z
      .number({
        invalid_type_error: t("inputValidNumber"),
        required_error: "",
      })
      .optional()
      .or(z.literal("")),
    email: z.string().email({ message: t("inputValidEmailError") }),
    phone: z.string().regex(new RegExp("^\\+959\\d{7,9}$"), {
      message: t("inputValidPhoneError"),
    }),
    address: z.string().min(1, { message: t("inputError") }),
    addressMM: z.string().min(1, { message: t("inputError") }),
    facebookPlugin: z.string().min(1, { message: t("inputError") }),
  });

  const { register, handleSubmit, watch, formState, reset } = useForm<any>({
    mode: "onChange",
    resolver: zodResolver(schema),
    defaultValues: data,
  });
  const { errors } = formState;
  const watchFields = watch();

  function submit(data: Content) {
    setSubmit(true);
    let b = { ...data, socialUrl: socialUrls };
    fetch("/api/siteManagement", {
      body: JSON.stringify(b),
      method: "POST",
      headers: getHeaders(session),
    }).then(async (data) => {
      setSubmit(false);
      if (data.status === 200) {
        showSuccessDialog(t("submit") + " " + t("success"), "", locale);
        router.reload();
      } else {
        let json = await data.json();
        if (json.error) {
          showErrorDialog(json.error, json.errorMM, locale);
        } else {
          showErrorDialog(t("somethingWentWrong"), "", locale);
        }
      }
    });
  }

  return session &&
    (session.role === Role.Admin ||
      session.role === Role.Staff ||
      session.role === Role.SuperAdmin) ? (
    <div>
      <Head>
        <title>Contact | Pyi Twin Phyit</title>
        <meta name="description" content={defaultDescription} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="relative mx-auto max-w-screen-xl px-4 py-8">
        <form
          onSubmit={handleSubmit(submit)}
          className="rounded-md bg-white p-5"
        >
          <div className="mt-2 flex flex-col gap-3">
            <FormInput
              label={"Google Map URL"}
              placeHolder={"Enter Google Map URL"}
              error={errors.googleMapUrl1?.message}
              type="text"
              defaultValue={data?.googleMapUrl1}
              formControl={{ ...register("googleMapUrl1") }}
              currentValue={watchFields.googleMapUrl1}
            />
            <FormInput
              label={"Google Map URL (Embeded)"}
              placeHolder={"Enter Google Map URL (Embeded)"}
              error={errors.googleMapUrl?.message}
              type="text"
              defaultValue={data?.googleMapUrl}
              formControl={{ ...register("googleMapUrl") }}
              currentValue={watchFields.googleMapUrl}
            />

            <div className="flex flex-row items-center gap-3">
              <FormInput
                label={"Lat"}
                placeHolder={"Enter Latitude"}
                error={errors.lat?.message}
                type="number"
                defaultValue={data?.lag}
                formControl={{
                  ...register("lat", {
                    setValueAs: (v) => (v ? parseFloat(v) : 0),
                  }),
                }}
                currentValue={watchFields.lat}
              />
              <FormInput
                label={"Long"}
                placeHolder={"Enter Longitude"}
                error={errors.long?.message}
                type="number"
                defaultValue={data?.long}
                formControl={{
                  ...register("long", {
                    setValueAs: (v) => (v ? parseFloat(v) : 0),
                  }),
                }}
                currentValue={watchFields.long}
              />
            </div>

            <FormInput
              label={"Email"}
              placeHolder={"Enter Email"}
              error={errors.email?.message}
              type="text"
              defaultValue={data?.email}
              formControl={{ ...register("email") }}
              currentValue={watchFields.email}
            />

            <FormInput
              label={"Phone"}
              placeHolder={"Enter Phone"}
              error={errors.phone?.message}
              type="text"
              defaultValue={data?.phone}
              formControl={{ ...register("phone") }}
              currentValue={watchFields.phone}
            />

            <FormInput
              label={"Address (ENG)"}
              placeHolder={"Enter Address (ENG)"}
              error={errors.address?.message}
              type="text"
              defaultValue={data?.address}
              formControl={{ ...register("address") }}
              currentValue={watchFields.address}
            />

            <FormInput
              label={"Address (MM)"}
              placeHolder={"Enter Address (MM)"}
              error={errors.addressMM?.message}
              type="text"
              defaultValue={data?.addressMM}
              formControl={{ ...register("addressMM") }}
              currentValue={watchFields.addressMM}
            />

            <FormInput
              label={"Facebook Page Id"}
              placeHolder={"Enter Facebook Page Id"}
              error={errors.facebookPlugin?.message}
              type="text"
              defaultValue={data?.facebookPlugin}
              formControl={{ ...register("facebookPlugin") }}
              currentValue={watchFields.facebookPlugin}
            />

            <div className="mt-5 flex flex-col gap-3 border-t pt-5">
              <div className="flex flex-row items-center gap-3">
                <h3 className="text-semibold text-sm">Social Urls</h3>
                <button
                  className="rounded-full bg-primary/20 p-0.5 text-primary hover:bg-primary-focus hover:text-white"
                  type="button"
                  onClick={(evt) => {
                    evt.stopPropagation();
                    setModalOpen(true);
                    setTitle("Create Soical URL");
                    setUrl(undefined);
                    setUpdateIndex(-1);
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-5 w-5"
                  >
                    <path d="M10.75 6.75a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" />
                  </svg>
                </button>
              </div>
              <div className="flex flex-row flex-wrap items-stretch gap-5">
                {socialUrls.map((e, index: number) => (
                  <div
                    className="flex cursor-pointer flex-row items-center space-x-3 rounded-md bg-primary/10 px-3 py-2 hover:bg-primary/30"
                    key={index}
                  >
                    <div className="flex flex-row items-center gap-3">
                      <SocialIcon url={e} style={{ width: 24, height: 24 }} />
                      <span className="text-xs">{e}</span>
                    </div>
                    <div className="flex flex-row items-center justify-end gap-3">
                      <button
                        type="button"
                        className="hover:text-primary"
                        onClick={(evt) => {
                          evt.stopPropagation();
                          setModalOpen(true);
                          setTitle("Update Social Url");
                          setUrl(e);
                          setUpdateIndex(index);
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
                              setSocialUrls((prevValue) => {
                                let d = [...prevValue];
                                d.splice(index, 1);
                                return d;
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
              </div>
            </div>
          </div>

          <div className="flex w-full justify-end">
            <div>
              <SubmitBtn
                isSubmit={isSubmit}
                submitTxt="Loading..."
                text={t("submit")}
              />
            </div>
          </div>
        </form>
      </div>
      <TextInputDialog
        isModalOpen={isModalOpen}
        label="URL"
        onClickFn={(e: string) => {
          if (updateIndex === -1) {
            setSocialUrls((prevValue) => {
              return [...prevValue, e];
            });
          } else {
            setSocialUrls((prevValue) => {
              let d = [...prevValue];
              d[updateIndex] = e;
              return d;
            });
          }
          setModalOpen(false);
        }}
        setModalOpen={setModalOpen}
        title={title}
        value={url ? url : ""}
      />
    </div>
  ) : (
    <ErrorScreen statusCode={401} />
  );
}

export async function getServerSideProps({ locale }: any) {
  let data = await prisma.content.findFirst({});

  return {
    props: {
      data: JSON.parse(JSON.stringify(data)),
      ...(await serverSideTranslations(locale, ["common"], nextI18nextConfig)),
    },
  };
}

export default ContactPage;
