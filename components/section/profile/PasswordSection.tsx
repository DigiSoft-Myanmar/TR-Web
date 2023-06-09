import FormInput from "@/components/presentational/FormInput";
import { useProfile } from "@/context/ProfileContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type Props = {
  backFn: Function;
  nextFn: Function;
};

type Password = {
  password?: string;
  confirmPassword?: string;
};

function PasswordSection({ backFn, nextFn }: Props) {
  const { t } = useTranslation("common");
  const { profile, setProfile } = useProfile();
  const { locale } = useRouter();

  const schema = z.object({
    password: z
      .string()
      .min(6, { message: t("inputPasswordErrorLength") })
      .optional()
      .or(z.literal("")),
    confirmPassword: z
      .string()
      .min(6, { message: t("inputPasswordErrorLength") })
      .optional()
      .or(z.literal("")),
  });

  const { register, handleSubmit, watch, formState } = useForm<Password>({
    mode: "onChange",
    defaultValues: profile,
    resolver: zodResolver(schema),
  });
  const { errors } = formState;
  const watchFields = watch();

  function submit(data: Password) {
    setProfile((prevValue: any) => {
      return { ...prevValue, ...data };
    });
    nextFn();
  }

  return (
    <div className="flex flex-col">
      <h3 className="text-sm font-semibold text-gray-500">{t("step")} 2</h3>
      <p className="my-1 text-xl font-bold">{t("mailPassword")}</p>
      <span className="mb-10 text-sm">{t("fillPassword")}</span>
      <form className="flex flex-col space-y-3" onSubmit={handleSubmit(submit)}>
        <FormInput
          label={t("password")}
          placeHolder={t("enter") + " " + t("password")}
          error={errors.password?.message}
          type="password"
          defaultValue={""}
          formControl={{ ...register("password") }}
          currentValue={watchFields.password}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          }
        />

        <FormInput
          label={t("confirmPassword")}
          placeHolder={t("enter") + " " + t("confirmPassword")}
          error={
            watchFields.password !== watchFields.confirmPassword
              ? t("passwordsNotSame")
              : errors.confirmPassword?.message
              ? errors.confirmPassword?.message
              : ""
          }
          type="password"
          defaultValue={""}
          formControl={{ ...register("confirmPassword") }}
          currentValue={watchFields.confirmPassword}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          }
        />

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

export default PasswordSection;
