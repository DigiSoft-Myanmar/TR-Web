import FormInput from "@/components/presentational/FormInput";
import { useProfile } from "@/context/ProfileContext";
import { fetcher } from "@/util/fetcher";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import useSWR from "swr";
import { Membership } from "@prisma/client";
import { formatAmount, getText } from "@/util/textHelper";
import FormInputCheckbox from "@/components/presentational/FormInputCheckbox";
import dynamic from "next/dynamic";
import MembershipTable from "@/components/presentational/MembershipTable";
import SelectBox from "@/components/presentational/SelectBox";

const FormInputRichText: any = dynamic(
  () => import("@/components/presentational/FormInputRichTextSun"),
  {
    ssr: false,
  }
);

type Props = {
  backFn: Function;
  nextFn: Function;
  submitRef: any;
  content: any;
};

function SellerInfoSection({ backFn, nextFn, submitRef, content }: Props) {
  const { t } = useTranslation("common");
  const {
    user: profile,
    setUser: setProfile,
    membership,
    setMembership,
  } = useProfile();
  const { locale } = useRouter();
  const { data } = useSWR("/api/memberships", fetcher);

  const schema = z.object({
    shippingIncluded: z.boolean(),
    defaultShippingCost: z
      .number({
        invalid_type_error: t("inputValidNumber"),
        required_error: "",
      })
      .min(0, {
        message: t("inputValidAmount"),
      })
      .nonnegative({ message: t("inputValidAmount") }),
    isOfferFreeShipping: z.boolean(),
    freeShippingCost: z
      .number({
        invalid_type_error: t("inputValidNumber"),
        required_error: "",
      })
      .min(0, {
        message: t("inputValidAmount"),
      })
      .nonnegative({ message: t("inputValidAmount") }),
    isDefaultShippingInfo: z.boolean(),
  });

  const { register, handleSubmit, watch, formState } = useForm<any>({
    mode: "onChange",
    defaultValues: {
      shippingIncluded: profile.shippingIncluded,
      defaultShippingCost: profile.defaultShippingCost
        ? profile.defaultShippingCost
        : 0,
      isOfferFreeShipping: profile.isOfferFreeShipping,
      freeShippingCost: profile.freeShippingCost ? profile.freeShippingCost : 0,
      isDefaultShippingInfo: profile.isDefaultShippingInfo,
    },
    resolver: zodResolver(schema),
  });
  const { errors } = formState;
  const watchFields = watch();

  function submit(data: any) {
    //TODO if false -> change other fields false
    setProfile((prevValue: any) => {
      return { ...prevValue, ...data };
    });
    nextFn();
  }

  return (
    <div className="flex flex-col">
      <h3 className="text-sm font-semibold text-gray-500">{t("step")} 5</h3>
      <p className="my-1 text-xl font-bold">{t("sellerInfo")}</p>
      <span className="mb-10 text-sm">{t("fillSellerInfo")}</span>
      <form className="flex flex-col space-y-3" onSubmit={handleSubmit(submit)}>
        <FormInputCheckbox
          formControl={{ ...register("shippingIncluded") }}
          label={t("shippingIncluded")}
          value={watchFields.shippingIncluded}
        />

        {watchFields.shippingIncluded ? (
          <>
            <FormInput
              label={t("defaultShippingCost")}
              placeHolder={t("enter") + " " + t("defaultShippingCost")}
              error={errors.defaultShippingCost?.message}
              type="number"
              defaultValue={profile?.defaultShippingCost}
              formControl={{
                ...register("defaultShippingCost", {
                  setValueAs: (v) => (v ? parseInt(v) : undefined),
                }),
              }}
              currentValue={watchFields.defaultShippingCost}
            />
            <FormInputCheckbox
              formControl={{ ...register("isOfferFreeShipping") }}
              label={t("isOfferFreeShipping")}
              value={watchFields.isOfferFreeShipping}
            />
            {watchFields.isOfferFreeShipping ? (
              <FormInput
                label={t("freeShippingCost")}
                placeHolder={t("enter") + " " + t("freeShippingCost")}
                error={errors.freeShippingCost?.message}
                type="number"
                defaultValue={profile?.freeShippingCost}
                formControl={{
                  ...register("freeShippingCost", {
                    setValueAs: (v) => (v ? parseInt(v) : undefined),
                  }),
                }}
                currentValue={watchFields.freeShippingCost}
              />
            ) : (
              <></>
            )}
          </>
        ) : (
          <></>
        )}

        <FormInputCheckbox
          formControl={{ ...register("isDefaultShippingInfo") }}
          label={t("isDefaultShippingInfo")}
          value={watchFields.isDefaultShippingInfo}
        />

        {watchFields.isDefaultShippingInfo ? (
          <>
            <FormInputRichText
              content={profile?.defaultShippingInfo}
              label={t("defaultShippingInfo") + " " + t("eng")}
              setContent={(e: string) => {
                setProfile((prevValue: any) => {
                  return { ...prevValue, defaultShippingInfo: e };
                });
              }}
            />
            {profile?.defaultShippingInfo &&
            profile?.defaultShippingInfo.length > 0 ? (
              <FormInputRichText
                content={profile?.defaultShippingInfoMM}
                label={t("defaultShippingInfo") + " " + t("mm")}
                setContent={(e: string) => {
                  setProfile((prevValue: any) => {
                    return { ...prevValue, defaultShippingInfoMM: e };
                  });
                }}
              />
            ) : (
              <></>
            )}
          </>
        ) : (
          <></>
        )}

        <label
          className={`text-sm font-medium ${
            profile && profile.membershipId ? "text-green-600" : "text-error"
          }`}
        >
          <span className="whitespace-nowrap">
            {" "}
            {t("membership")} <span className="text-primary">*</span>
          </span>
        </label>

        <SelectBox
          isSearch={false}
          list={
            data
              ? data.map((z: Membership) => {
                  return {
                    name: z.name,
                    nameMM: z.nameMM,
                    value: z.id,
                  };
                })
              : []
          }
          selected={
            profile.membershipId
              ? data?.find((b: any) => b.id === profile.membershipId)
                ? {
                    name: data.find((b: any) => b.id === profile.membershipId)
                      .name,
                    value: data.find((b: any) => b.id === profile.membershipId)
                      .id,
                    nameMM: data.find((b: any) => b.id === profile.membershipId)
                      .nameMM,
                  }
                : undefined
              : undefined
          }
          setSelected={(e: any) => {
            if (e) {
              setProfile((prevValue: any) => {
                return { ...prevValue, Membership: e, membershipId: e.value };
              });
            }
          }}
        />

        <MembershipTable data={data} content={content} />

        <span className="mt-5 flex justify-end divide-x overflow-hidden">
          <button
            className={`inline-block rounded-l-md border bg-primary p-3 text-white shadow-sm hover:bg-primary-focus focus:relative`}
            title="Previous"
            onClick={() => {
              backFn();
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path
                fillRule="evenodd"
                d="M20.25 12a.75.75 0 01-.75.75H6.31l5.47 5.47a.75.75 0 11-1.06 1.06l-6.75-6.75a.75.75 0 010-1.06l6.75-6.75a.75.75 0 111.06 1.06l-5.47 5.47H19.5a.75.75 0 01.75.75z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <button
            className={`inline-block rounded-r-md border bg-primary p-3 text-white shadow-sm hover:bg-primary-focus focus:relative`}
            title="Next"
            type="submit"
            ref={submitRef}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path
                fillRule="evenodd"
                d="M3.75 12a.75.75 0 01.75-.75h13.19l-5.47-5.47a.75.75 0 011.06-1.06l6.75 6.75a.75.75 0 010 1.06l-6.75 6.75a.75.75 0 11-1.06-1.06l5.47-5.47H4.5a.75.75 0 01-.75-.75z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </span>
      </form>
    </div>
  );
}

export default SellerInfoSection;
