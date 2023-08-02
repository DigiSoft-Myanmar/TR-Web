import FormInput from "@/components/presentational/FormInput";
import FormInputCheckbox from "@/components/presentational/FormInputCheckbox";
import FormInputTextArea from "@/components/presentational/FormInputTextArea";
import { useProfile } from "@/context/ProfileContext";
import { Role } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import useSWR from "swr";
import { fetcher } from "@/util/fetcher";
import { toDateTimeLocal } from "@/util/textHelper";
import { isInternal, isSeller } from "@/util/authHelper";

type Props = {
  backFn: Function;
  nextFn: Function;
  currentStep: number;
  submitRef: any;
};

type Status = {
  isBlocked?: boolean;
  isDeleted?: boolean;
  sellAllow?: boolean;

  memberStartDate?: Date;
  adminNote?: string;
};

function StatusSection({ backFn, nextFn, currentStep, submitRef }: Props) {
  const { t } = useTranslation("common");
  const { user: profile, setUser: setProfile, membership } = useProfile();
  const { locale } = useRouter();
  const { data: session }: any = useSession();

  const [memberStartDate, setMemberStartDate] = React.useState("");
  const [error, setError] = React.useState("");
  const [sellAllow, setSellAllow] = React.useState(false);

  const schema = z.object({
    isBlocked: z.boolean(),
    isDeleted: z.boolean(),
    adminNote: z
      .string()
      .min(1, { message: t("inputError") })
      .optional()
      .or(z.literal("")),
  });

  const { register, handleSubmit, watch, formState, reset } = useForm<Status>({
    mode: "onChange",
    defaultValues: {
      adminNote: profile.adminNote,
      isBlocked: profile.isBlocked,
      isDeleted: profile.isDeleted,
    },
    resolver: zodResolver(schema),
  });
  const { errors } = formState;
  const watchFields = watch();

  React.useEffect(() => {
    if (profile.memberStartDate) {
      setMemberStartDate(
        new Date(profile.memberStartDate).toISOString().substring(0, 10)
      );
      setSellAllow(profile.sellAllow);
      reset({
        adminNote: profile.adminNote,
        isBlocked: profile.isBlocked,
        isDeleted: profile.isDeleted,
      });
    } else {
      setSellAllow(profile.sellAllow);
      reset({
        adminNote: "",
        isBlocked: false,
        isDeleted: false,
      });
      setError("");
    }
  }, [profile]);

  function submit(data: Status) {
    if (isSeller(profile)) {
      if (memberStartDate) {
        setProfile((prevValue: any) => {
          return {
            ...prevValue,
            ...data,
            memberStartDate: new Date(memberStartDate),
            sellAllow: sellAllow,
          };
        });
        nextFn();
      } else {
        setError("Please input member start date");
      }
    } else {
      setProfile((prevValue: any) => {
        return {
          ...prevValue,
          ...data,
        };
      });
      nextFn();
    }
  }

  return (
    <div className="flex flex-col">
      <h3 className="text-sm font-semibold text-gray-500">
        {t("step")} {currentStep}
      </h3>
      <p className="my-1 text-xl font-bold">{t("status")}</p>
      <span className="mb-10 text-sm">{t("fillStatus")}</span>

      <form className="flex flex-col space-y-3" onSubmit={handleSubmit(submit)}>
        {profile &&
          (profile.role === Role.Seller || profile.role === Role.Trader) && (
            <>
              <div>
                <label
                  className={`text-sm font-medium text-gray-400 ${
                    error
                      ? "text-error"
                      : memberStartDate && memberStartDate.length > 0 && !error
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                >
                  {t("memberStartDate")}
                  <span className="text-primary">*</span>
                </label>

                <div className={`relative mt-1`}>
                  <input
                    type={"date"}
                    className={`w-full rounded-lg ${
                      error
                        ? "border-error"
                        : memberStartDate &&
                          memberStartDate.length > 0 &&
                          !error
                        ? "border-green-600"
                        : "border-gray-200"
                    } px-4 py-2 pr-12 text-sm leading-6 shadow-sm`}
                    placeholder={t("enter") + " " + t("memberStartDate")}
                    defaultValue={memberStartDate}
                    onWheelCapture={(e) => e.currentTarget.blur()}
                    disabled={!isInternal(session) === true ? true : false}
                    value={memberStartDate}
                    onChange={(e) => {
                      let value = e.currentTarget.valueAsDate;
                      if (value) {
                        setMemberStartDate(
                          value.toISOString().substring(0, 10)
                        );
                      } else {
                        setError("Please input member start date");
                      }
                    }}
                  />
                </div>
                {error && (
                  <span className="p-2 text-xs text-error">{error}</span>
                )}
              </div>

              <div className="form-control flex">
                <label
                  className="label cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (isInternal(session) === true) {
                      setSellAllow((prevValue) => !prevValue);
                    }
                  }}
                >
                  <input
                    type="checkbox"
                    className="checkbox-primary checkbox"
                    checked={sellAllow}
                    defaultChecked={sellAllow}
                    disabled={!isInternal(session)}
                  />
                  <span className="label-text ml-3 flex-grow">
                    {t("sellAllow")}
                  </span>
                </label>
              </div>
            </>
          )}

        <FormInputCheckbox
          formControl={{ ...register("isBlocked") }}
          label={t("isBlocked")}
          value={watchFields.isBlocked}
          disabled={!isInternal(session)}
        />
        {isInternal(session) && (
          <FormInputCheckbox
            formControl={{ ...register("isDeleted") }}
            label={t("isDeleted")}
            value={watchFields.isDeleted}
            disabled={!isInternal(session)}
          />
        )}
        <FormInputTextArea
          label={t("adminNote")}
          placeHolder={""}
          defaultValue={profile?.adminNote}
          formControl={{ ...register("adminNote") }}
          currentValue={watchFields.adminNote}
          optional={true}
          error={""}
          disabled={isInternal(session) ? false : true}
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

export default StatusSection;
