import FormInput from "@/components/presentational/FormInput";
import FormInputCheckbox from "@/components/presentational/FormInputCheckbox";
import { useMembership } from "@/context/MemberContext";
import { formatAmount } from "@/util/textHelper";
import { zodResolver } from "@hookform/resolvers/zod";
import { Membership } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

function InformationSection({
  nextFn,
  submitRef,
}: {
  nextFn: Function;
  submitRef: any;
}) {
  const { t } = useTranslation("common");
  const { membership, setMembership } = useMembership();
  const { data: session }: any = useSession();

  const schema = z.object({
    name: z.string().min(1, { message: t("inputError") }),
    nameMM: z.string().min(1, { message: t("inputError") }),
    price: z
      .number({
        invalid_type_error: t("inputValidNumber"),
        required_error: "",
      })
      .min(0, {
        message: t("inputValidAmount"),
      })
      .nonnegative({ message: t("inputValidAmount") }),
    validity: z
      .number({
        invalid_type_error: t("inputValidNumber"),
        required_error: "",
      })
      .min(0, {
        message: t("inputValidAmount"),
      })
      .nonnegative({ message: t("inputValidAmount") }),
    onBoardingLimit: z
      .number({
        invalid_type_error: t("inputValidNumber"),
        required_error: "",
      })
      .min(0, {
        message: t("inputValidAmount"),
      })
      .nonnegative({ message: t("inputValidAmount") }),
    allowDelicatedAccountManager: z.boolean(),
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
      <h3 className="text-sm font-semibold text-gray-500">
        {t("step")} {formatAmount(1, locale)}
      </h3>
      <p className="my-1 text-xl font-bold">{t("memberInfo")}</p>
      <span className="mb-10 text-sm">{t("fillMemberInfo")}</span>
      <form className="flex flex-col space-y-3" onSubmit={handleSubmit(submit)}>
        <FormInput
          label={t("name") + " " + t("eng")}
          placeHolder={t("enter") + " " + t("name") + " " + t("eng")}
          error={errors.name?.message}
          type="text"
          defaultValue={membership?.name}
          formControl={{ ...register("name") }}
          currentValue={watchFields.name}
        />

        <FormInput
          label={t("name") + " " + t("mm")}
          placeHolder={t("enter") + " " + t("name") + " " + t("mm")}
          error={errors.nameMM?.message}
          type="text"
          defaultValue={membership?.nameMM}
          formControl={{ ...register("nameMM") }}
          currentValue={watchFields.nameMM}
        />

        <FormInput
          label={t("pricePerMonth")}
          placeHolder={t("enter") + " " + t("pricePerMonth")}
          error={errors.price?.message}
          type="number"
          defaultValue={membership?.price}
          formControl={{
            ...register("price", {
              setValueAs: (v) => (v ? parseInt(v) : undefined),
            }),
          }}
          currentValue={watchFields.price}
        />

        <FormInput
          label={t("membershipValidity")}
          placeHolder={t("enter") + " " + t("membershipValidity")}
          error={errors.validity?.message}
          type="number"
          defaultValue={membership?.validity}
          formControl={{
            ...register("validity", {
              setValueAs: (v) => (v ? parseInt(v) : undefined),
            }),
          }}
          currentValue={watchFields.validity}
        />

        <FormInput
          label={t("onBoardingSKU")}
          placeHolder={t("enter") + " " + t("onBoardingSKU")}
          error={errors.onBoardingLimit?.message}
          type="number"
          defaultValue={membership?.onBoardingLimit}
          formControl={{
            ...register("onBoardingLimit", {
              setValueAs: (v) => (v ? parseInt(v) : undefined),
            }),
          }}
          currentValue={watchFields.onBoardingLimit}
        />

        <FormInputCheckbox
          formControl={{ ...register("allowDelicatedAccountManager") }}
          label={t("allowDelicatedAccountManager")}
          value={watchFields.allowDelicatedAccountManager}
        />

        <span className="mt-5 flex justify-end divide-x overflow-hidden">
          <button
            className={`inline-flex items-center gap-3 rounded-md border bg-primary p-3 text-white shadow-sm hover:bg-primary-focus focus:relative`}
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

export default InformationSection;
