import FormInput from "@/components/presentational/FormInput";
import { useMembership } from "@/context/MemberContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { Membership } from "@prisma/client";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import React from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

const FormInputRichText: any = dynamic(
  () => import("@/components/presentational/FormInputRichTextSun"),
  {
    ssr: false,
  }
);

function SKUSection({
  backFn,
  nextFn,
  submitRef,
}: {
  backFn: Function;
  nextFn: Function;
  submitRef: any;
}) {
  const { t } = useTranslation("common");
  const { membership, setMembership } = useMembership();
  const { data: session }: any = useSession();

  const schema = z.object({
    SKUListing: z
      .number({
        invalid_type_error: t("inputValidNumber"),
        required_error: "",
      })
      .min(0, {
        message: t("inputValidAmount"),
      })
      .nonnegative({ message: t("inputValidAmount") }),
    extraSKUPricing: z
      .number({
        invalid_type_error: t("inputValidNumber"),
        required_error: "",
      })
      .min(0, {
        message: t("inputValidAmount"),
      })
      .nonnegative({ message: t("inputValidAmount") }),
  });

  const { register, handleSubmit, watch, formState, reset } =
    useForm<Membership>({
      mode: "onChange",
      defaultValues: membership,
      resolver: zodResolver(schema),
    });
  const { errors } = formState;
  const { locale } = useRouter();
  const watchFields = watch();

  React.useEffect(() => {
    reset(membership);
  }, [membership]);

  function submit(data: Membership) {
    setMembership((prevValue: any) => {
      return { ...prevValue, ...data };
    });
    nextFn();
  }

  return (
    <div className="flex flex-col">
      <h3 className="text-sm font-semibold text-gray-500">{t("step")} 3</h3>
      <p className="my-1 text-xl font-bold">{t("skuListingMember")}</p>
      <span className="mb-10 text-sm">{t("fillSKUListingMember")}</span>
      <form className="flex flex-col space-y-3" onSubmit={handleSubmit(submit)}>
        <FormInput
          label={t("SKUListing")}
          placeHolder={t("enter") + " " + t("SKUListing")}
          error={errors.SKUListing?.message}
          type="number"
          defaultValue={membership?.SKUListing}
          formControl={{
            ...register("SKUListing", {
              setValueAs: (v) => (v ? parseInt(v) : undefined),
            }),
          }}
          currentValue={watchFields.SKUListing}
        />

        <FormInput
          label={t("extraSKUPricing")}
          placeHolder={t("enter") + " " + t("extraSKUPricing")}
          error={errors.extraSKUPricing?.message}
          type="number"
          defaultValue={membership?.extraSKUPricing}
          formControl={{
            ...register("extraSKUPricing", {
              setValueAs: (v) => (v ? parseInt(v) : undefined),
            }),
          }}
          currentValue={watchFields.extraSKUPricing}
        />

        <FormInputRichText
          content={membership?.SKUDetails}
          label={t("SKUDetails") + " " + t("eng")}
          setContent={(e: string) => {
            setMembership((prevValue: any) => {
              return { ...prevValue, SKUDetails: e };
            });
          }}
        />

        {membership?.SKUDetails && membership?.SKUDetails.length > 0 ? (
          <FormInputRichText
            content={membership?.SKUDetailsMM}
            label={t("SKUDetails") + " " + t("mm")}
            setContent={(e: string) => {
              setMembership((prevValue: any) => {
                return { ...prevValue, SKUDetailsMM: e };
              });
            }}
          />
        ) : (
          <></>
        )}

        <span className="mt-5 flex justify-end divide-x overflow-hidden">
          <button
            type="button"
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
            className={`inline-flex items-center gap-3 rounded-r-md border bg-primary p-3 text-white shadow-sm hover:bg-primary-focus focus:relative`}
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

export default SKUSection;
