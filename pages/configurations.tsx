// @ts-nocheck
import nextI18nextConfig from "@/next-i18next.config";
import Head from "next/head";
import React from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { defaultDescription } from "@/types/const";
import FormInput from "@/components/presentational/FormInput";
import { useForm } from "react-hook-form";
import { Configuration, Role } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import prisma from "@/prisma/prisma";
import FormInputCheckbox from "@/components/presentational/FormInputCheckbox";
import SubmitBtn from "@/components/presentational/SubmitBtn";
import { showSuccessDialog, showUnauthorizedDialog } from "@/util/swalFunction";
import { useSession } from "next-auth/react";
import ErrorScreen from "@/components/screen/ErrorScreen";
import { getHeaders } from "@/util/authHelper";
import { useRouter } from "next/router";

function Configurations({
  lowStockLimit,
  logClearDuration,
  pointPerMMK,
  pointPerReview,
  isMaintenence,
  accessKey,
  senderEmail,
  senderEmailHost,
  senderEmailPassword,
  senderEmailPort,
  senderEmailTSL,
}: any) {
  const { t } = useTranslation("common");
  const { data: session }: any = useSession();
  const router = useRouter();

  const schema = z.object({
    lowStockLimit: z
      .number({
        invalid_type_error: t("inputValidNumber"),
        required_error: "",
      })
      .min(0, {
        message: t("inputValidAmount"),
      })
      .nonnegative({ message: t("inputValidAmount") }),
    logClearDuration: z
      .number({
        invalid_type_error: t("inputValidNumber"),
        required_error: "",
      })
      .min(0, {
        message: t("inputValidAmount"),
      })
      .nonnegative({ message: t("inputValidAmount") }),
    pointPerMMK: z
      .number({
        invalid_type_error: t("inputValidNumber"),
        required_error: "",
      })
      .min(0, {
        message: t("inputValidAmount"),
      })
      .nonnegative({ message: t("inputValidAmount") }),
    pointPerReview: z
      .number({
        invalid_type_error: t("inputValidNumber"),
        required_error: "",
      })
      .min(0, {
        message: t("inputValidAmount"),
      })
      .nonnegative({ message: t("inputValidAmount") }),
    isMaintenence: z.boolean(),
    accessKey: z
      .string()
      .min(1, { message: t("inputError") })
      .optional()
      .or(z.literal("")),
    senderEmail: z.string().min(1, { message: t("inputError") }),
    senderEmailPassword: z.string().min(1, { message: t("inputError") }),
    senderEmailHost: z.string().min(1, { message: t("inputError") }),
    senderEmailPort: z.string().min(1, { message: t("inputError") }),
    senderEmailTSL: z.boolean(),
  });

  const { register, handleSubmit, watch, formState, reset } =
    useForm<Configuration>({
      mode: "onChange",
      resolver: zodResolver(schema),
      defaultValues: {
        accessKey: accessKey,
        isMaintenence: isMaintenence,
        logClearDuration: logClearDuration,
        lowStockLimit: lowStockLimit,
        pointPerMMK: pointPerMMK,
        pointPerReview: pointPerReview,
        senderEmail: senderEmail,
        senderEmailHost: senderEmailHost,
        senderEmailPort: senderEmailPort,
        senderEmailTSL: senderEmailTSL,
      },
    });
  const { errors } = formState;
  const watchFields = watch();
  const [isSubmit, setSubmit] = React.useState(false);

  function submitConfiguration(data: Configuration) {
    setSubmit(true);
    if (getHeaders(session)) {
      fetch("/api/configurations", {
        method: "POST",
        body: JSON.stringify(data),
        headers: getHeaders(session),
      })
        .then((data) => data.json())
        .then((json) => {
          setSubmit(false);
          showSuccessDialog(t("submitSuccess"));
        });
    } else {
      showUnauthorizedDialog(router.locale, () => {
        router.push("/login");
      });
    }
  }

  return session &&
    (session.role === Role.Admin ||
      session.role === Role.SuperAdmin ||
      session.role === Role.Staff) ? (
    <div>
      <Head>
        <title>Configurations | Treasure Rush</title>
        <meta name="description" content={defaultDescription} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <form onSubmit={handleSubmit(submitConfiguration)}>
        <div className="flex flex-col divide-y bg-white">
          <details className="group flex flex-col gap-3">
            <summary
              className={`flex items-center bg-primary px-10 py-5 text-lg font-medium text-white`}
            >
              <span className="flex-grow">Purchase Configuration</span>
              <span className="ml-auto shrink-0 transition duration-300 group-open:-rotate-180">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </summary>
            <div className="flex flex-col gap-3 px-10 py-5">
              <FormInput
                label={"Low Stock Limit"}
                placeHolder={t("enter") + " " + "Low Stock Limit"}
                error={errors.lowStockLimit?.message}
                type="number"
                defaultValue={lowStockLimit}
                formControl={{
                  ...register("lowStockLimit", {
                    valueAsNumber: true,
                  }),
                }}
                currentValue={watchFields.lowStockLimit}
              />

              <FormInput
                label={"Log Clear Duration (in Days)"}
                placeHolder={t("enter") + " " + "Log Clear Duration"}
                error={errors.logClearDuration?.message}
                type="number"
                defaultValue={logClearDuration}
                formControl={{
                  ...register("logClearDuration", {
                    valueAsNumber: true,
                  }),
                }}
                currentValue={watchFields.logClearDuration}
              />

              <FormInput
                label={"Point per MMK"}
                placeHolder={t("enter") + " " + "Point per MMK"}
                error={errors.pointPerMMK?.message}
                type="number"
                defaultValue={pointPerMMK}
                formControl={{
                  ...register("pointPerMMK", {
                    valueAsNumber: true,
                  }),
                }}
                currentValue={watchFields.pointPerMMK}
              />

              <FormInput
                label={"Point per Review"}
                placeHolder={t("enter") + " " + "Point per Review"}
                error={errors.pointPerReview?.message}
                type="number"
                defaultValue={pointPerReview}
                formControl={{
                  ...register("pointPerReview", {
                    valueAsNumber: true,
                  }),
                }}
                currentValue={watchFields.pointPerReview}
              />
            </div>
          </details>

          <details className="group flex flex-col gap-3">
            <summary
              className={`flex items-center bg-primary px-10 py-5 text-lg font-medium text-white`}
            >
              <span className="flex-grow">Maintenance Configuration</span>
              <span className="ml-auto shrink-0 transition duration-300 group-open:-rotate-180">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </summary>
            <div className="flex flex-col gap-3 px-10 py-5">
              <FormInputCheckbox
                formControl={{ ...register("isMaintenence") }}
                label="Maintenance Mode"
                defaultValue={isMaintenence}
              />
              <FormInput
                label={"Access Key"}
                placeHolder={t("enter") + " " + "Access Key"}
                error={errors.accessKey?.message}
                type="text"
                defaultValue={accessKey}
                formControl={{
                  ...register("accessKey"),
                }}
                optional={true}
                currentValue={watchFields.accessKey}
              />
            </div>
          </details>

          <details className="group flex flex-col gap-3">
            <summary
              className={`flex items-center bg-primary px-10 py-5 text-lg font-medium text-white`}
            >
              <span className="flex-grow">Email Configuration</span>
              <span className="ml-auto shrink-0 transition duration-300 group-open:-rotate-180">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </summary>
            <div className="flex flex-col gap-3 px-10 py-5">
              <FormInput
                label={"Sender Email"}
                placeHolder={t("enter") + " " + "Sender Email"}
                error={errors.senderEmail?.message}
                type="text"
                defaultValue={senderEmail}
                formControl={{
                  ...register("senderEmail"),
                }}
                currentValue={watchFields.senderEmail}
              />

              <FormInput
                label={"Sender Password"}
                placeHolder={t("enter") + " " + "Sender Password"}
                error={errors.senderEmailPassword?.message}
                type="password"
                defaultValue={senderEmailPassword}
                formControl={{
                  ...register("senderEmailPassword"),
                }}
                currentValue={""}
              />

              <FormInput
                label={"Sender Email Host"}
                placeHolder={t("enter") + " " + "Sender Email Host"}
                error={errors.senderEmailHost?.message}
                type="text"
                defaultValue={senderEmailHost}
                formControl={{
                  ...register("senderEmailHost"),
                }}
                currentValue={watchFields.senderEmailHost}
              />

              <FormInput
                label={"Sender Email Port"}
                placeHolder={t("enter") + " " + "Sender Email Port"}
                error={errors.senderEmailPort?.message}
                type="text"
                defaultValue={senderEmailPort}
                formControl={{
                  ...register("senderEmailPort"),
                }}
                currentValue={watchFields.senderEmailPort}
              />

              <FormInputCheckbox
                formControl={{ ...register("senderEmailTSL") }}
                label={"Is TSL ?"}
                value={senderEmailTSL}
              />
            </div>
          </details>

          <div className="flex items-center justify-end px-10 py-5">
            <div>
              <SubmitBtn
                isSubmit={isSubmit}
                submitTxt={"Loading..."}
                text={"Submit"}
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  ) : (
    <ErrorScreen statusCode={401} />
  );
}

export async function getServerSideProps({ locale }: any) {
  let configuration: any = await prisma.configuration.findFirst({});
  if (configuration?.createdAt) {
    delete configuration.createdAt;
  }
  if (configuration?.updatedAt) {
    delete configuration.updatedAt;
  }
  return {
    props: {
      ...configuration,
      ...(await serverSideTranslations(locale, ["common"], nextI18nextConfig)),
    },
  };
}

export default Configurations;
