// @ts-nocheck
import nextI18nextConfig from "@/next-i18next.config";
import Head from "next/head";
import React from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { appName, defaultDescription } from "@/types/const";
import FormInput from "@/components/presentational/FormInput";
import { useForm } from "react-hook-form";
import { Configuration, Role } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import prisma from "@/prisma/prisma";
import FormInputCheckbox from "@/components/presentational/FormInputCheckbox";
import SubmitBtn from "@/components/presentational/SubmitBtn";
import { showSuccessDialog } from "@/util/swalFunction";
import { useSession } from "next-auth/react";
import ErrorScreen from "@/components/screen/ErrorScreen";
import { useRouter } from "next/router";
import { decrypt, encrypt } from "@/util/encrypt";
import { getHeaders } from "@/util/authHelper";

function Configurations({
  senderEmail,
  senderEmailHost,
  senderEmailPassword,
  senderEmailPort,
  senderEmailTSL,
  lowStockLimit,
  maximumAuctionPeriod,
  androidSellAllow,
  iosSellAllow,
  currentVersion,
}: any) {
  const { t } = useTranslation("common");
  const { data: session }: any = useSession();

  const schema = z.object({
    senderEmail: z.string().min(1, { message: t("inputError") }),
    senderEmailPassword: z.string().min(1, { message: t("inputError") }),
    senderEmailHost: z.string().min(1, { message: t("inputError") }),
    senderEmailPort: z.string().min(1, { message: t("inputError") }),
    maximumAuctionPeriod: z
      .number({
        invalid_type_error: t("inputValidNumber"),
        required_error: "",
      })
      .min(0, {
        message: t("inputValidAmount"),
      })
      .nonnegative({ message: t("inputValidAmount") }),
    lowStockLimit: z
      .number({
        invalid_type_error: t("inputValidNumber"),
        required_error: "",
      })
      .min(0, {
        message: t("inputValidAmount"),
      })
      .nonnegative({ message: t("inputValidAmount") }),
    senderEmailTSL: z.boolean(),
    androidSellAllow: z.boolean(),
    iosSellAllow: z.boolean(),
    currentVersion: z.string().min(1, { message: t("inputError") }),
  });

  const { register, handleSubmit, watch, formState, reset } =
    useForm<Configuration>({
      mode: "onChange",
      resolver: zodResolver(schema),
      defaultValues: {
        currentVersion: currentVersion,
        senderEmail: senderEmail,
        senderEmailHost: senderEmailHost,
        senderEmailPort: senderEmailPort,
        senderEmailTSL: senderEmailTSL,
        senderEmailPassword: senderEmailPassword,
      },
    });
  const { errors } = formState;
  const watchFields = watch();
  const [isSubmit, setSubmit] = React.useState(false);
  const router = useRouter();
  const { locale } = useRouter();

  function submitConfiguration(data: Configuration) {
    setSubmit(true);
    fetch("/api/configurations", {
      method: "POST",
      body: JSON.stringify(data),
      headers: getHeaders(session),
    })
      .then((data) => data.json())
      .then((json) => {
        setSubmit(false);
        showSuccessDialog(t("submitSuccess"), "", locale, () => {
          router.reload();
        });
      });
  }

  return session && session.role === Role.SuperAdmin ? (
    <div>
      <Head>
        <title>Configurations | {appName}</title>
        <meta name="description" content={defaultDescription} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <form onSubmit={handleSubmit(submitConfiguration)}>
        <div className="flex flex-col bg-white">
          <h3 className="px-10 text-lg font-semibold mt-10">
            Product Settings
          </h3>
          <div className="flex flex-col gap-3 px-10 py-5 pb-10">
            <FormInput
              label={"Low Stock Limit"}
              placeHolder={t("enter") + " " + "Low Stock Limit"}
              error={errors.lowStockLimit?.message}
              type="number"
              defaultValue={lowStockLimit}
              formControl={{
                ...register("lowStockLimit", {
                  setValueAs: (v) => (v ? parseInt(v) : undefined),
                }),
              }}
              currentValue={watchFields.lowStockLimit}
            />

            <FormInput
              label={"Maximum Auction Period (Days)"}
              placeHolder={t("enter") + " " + "Maximum Auction Period (Days)"}
              error={errors.maximumAuctionPeriod?.message}
              type="number"
              defaultValue={maximumAuctionPeriod}
              formControl={{
                ...register("maximumAuctionPeriod", {
                  setValueAs: (v) => (v ? parseInt(v) : undefined),
                }),
              }}
              currentValue={watchFields.maximumAuctionPeriod}
            />
          </div>
        </div>

        <div className="flex flex-col bg-white border-t">
          <h3 className="px-10 text-lg font-semibold mt-10">
            Email Configurations
          </h3>
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
              label={"Sender Email Password"}
              placeHolder={t("enter") + " " + "Sender Email Password"}
              error={errors.senderEmailPassword?.message}
              type="password"
              formControl={{
                ...register("senderEmailPassword"),
              }}
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
              defaultValue={senderEmailTSL}
            />
          </div>
        </div>
        <div className="flex flex-col bg-white border-t">
          <h3 className="px-10 text-lg font-semibold mt-10">
            Sell Permissions
          </h3>
          <div className="flex flex-col gap-3 px-10 py-5">
            <FormInputCheckbox
              formControl={{ ...register("androidSellAllow") }}
              label={"Is android sell allow ?"}
              defaultValue={androidSellAllow}
            />

            <FormInputCheckbox
              formControl={{ ...register("iosSellAllow") }}
              label={"Is IOS sell allow ?"}
              defaultValue={iosSellAllow}
            />

            <FormInput
              label={"Current App Version"}
              placeHolder={t("enter") + " " + "current app version"}
              error={errors.currentVersion?.message}
              type="text"
              defaultValue={currentVersion}
              formControl={{
                ...register("currentVersion"),
              }}
              currentValue={watchFields.currentVersion}
            />
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

  if (configuration?.senderEmailPassword) {
    configuration.senderEmailPassword = decrypt(
      configuration?.senderEmailPassword
    );
  }

  return {
    props: {
      ...configuration,
      ...(await serverSideTranslations(locale, ["common"], nextI18nextConfig)),
    },
  };
}

export default Configurations;
