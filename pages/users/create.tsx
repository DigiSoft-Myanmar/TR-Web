import Navbar from "@/components/navbar/Navbar";
import nextI18nextConfig from "@/next-i18next.config";
import Head from "next/head";
import React, { Fragment } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { defaultDescription } from "@/types/const";
import ErrorScreen from "@/components/screen/ErrorScreen";
import { Membership, Role, UserDefinedRole } from "@prisma/client";
import { useRouter } from "next/router";
import { custom, z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import SubmitBtn from "@/components/presentational/SubmitBtn";
import FormInput from "@/components/presentational/FormInput";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { useQuery } from "react-query";
import useSWR from "swr";
import { fetcher } from "@/util/fetcher";
import { useSession } from "next-auth/react";
import {
  showErrorDialog,
  showSuccessDialog,
  showUnauthorizedDialog,
} from "@/util/swalFunction";
import { RoleNav } from "@/types/role";
import { getHeaders } from "@/util/authHelper";

export type RegisterSeller = {
  username: string;
  brandName?: string;
  email?: String;
  phoneNum: String;
  otp: String;
  currentMembership?: any;
};

export type RegisterOthers = {
  username: string;
  phoneNum: string;
  password: string;
  confirmPassword: string;
};

function Default() {
  const router = useRouter();
  const { locale } = router;
  const { role: roleQry } = router.query;
  const { t } = useTranslation("common");
  const { data: customRoleList } = useSWR("/api/roles", fetcher);

  const [role, setRole] = React.useState<any>(Role.Buyer);
  const [customRole, setCustomRole] = React.useState<any>();

  const registerSchema = z.object(
    role === Role.Admin || role === Role.Staff
      ? {
          username: z.string().min(1, { message: t("inputError") }),
          email: z.string().email({ message: t("inputValidEmailError") }),
          phoneNum: z.string().regex(new RegExp("^\\+959\\d{7,9}$"), {
            message: t("inputValidPhoneError"),
          }),
          password: z.string().min(1, { message: t("inputError") }),
          confirmPassword: z.string().min(1, { message: t("inputError") }),
        }
      : {
          username: z.string().min(1, { message: t("inputError") }),
          phoneNum: z.string().regex(new RegExp("^\\+959\\d{7,9}$"), {
            message: t("inputValidPhoneError"),
          }),
        }
  );

  const [isSubmit, setSubmit] = React.useState(false);
  const { register, handleSubmit, watch, formState, reset } = useForm<
    RegisterSeller | RegisterOthers
  >({
    mode: "onChange",
    defaultValues: {},
    resolver: zodResolver(registerSchema),
  });
  const { errors }: any = formState;
  const watchFields: any = watch();

  const VALUES = [
    Role.Buyer,
    Role.Seller,
    Role.Trader,
    Role.Staff,
    Role.Admin,
  ] as const;
  const { data: session }: any = useSession();

  React.useEffect(() => {
    if (roleQry) {
      setRole(roleQry);
    } else {
      setRole(Role.Buyer);
    }
  }, [roleQry]);

  React.useEffect(() => {
    if (!watchFields.phoneNum) {
      reset({
        ...watchFields,
        phoneNum: "+959",
      });
    }
  }, [role, watchFields]);

  async function submitRegister(regData: RegisterSeller | RegisterOthers) {
    setSubmit(true);
    let body: any = {
      ...regData,
      role: role,
    };
    if (role === Role.Staff) {
      body.userDefinedId = customRole;
    }
    if (getHeaders(session)) {
      fetch("/api/user", {
        method: "POST",
        body: JSON.stringify(body),
        headers: getHeaders(session),
      }).then((data) => {
        setSubmit(false);
        console.log(data);
        if (data.status === 200) {
          showSuccessDialog(
            "New " + role + " created successfully.",
            "",
            locale,
            () => {
              if (role === Role.Buyer) {
                router.push("/users/" + RoleNav.Buyers);
              } else if (role === Role.Seller) {
                router.push("/users/" + RoleNav.Sellers);
              } else if (role === Role.Staff) {
                router.push("/users/" + RoleNav.Staff);
              } else if (role === Role.Admin) {
                router.push("/users/" + RoleNav.Admin);
              } else {
                router.push("/users");
              }
            }
          );
        } else {
          showErrorDialog(
            "User already exists.",
            "ဤဖုန်းတွင် အသုံးပြုသူရှိနှင့်ပြီးဖြစ်သည်။",
            locale
          );
        }
      });
    } else {
      showUnauthorizedDialog(locale, () => {
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
        <title>Create {role} | Treasure Rush</title>
        <meta name="description" content={defaultDescription} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="relative mx-auto flex max-w-screen-xl justify-center p-10">
        <div className="flex flex-col items-center gap-5 rounded-lg bg-white p-5 shadow-md">
          <p className="text-lg font-medium">Create {role}</p>

          <div>
            <label className={`text-sm font-medium text-gray-400`}>
              Role
              <span className="text-primary">*</span>
            </label>
            <div className="mt-1 flex flex-wrap items-center justify-start gap-3">
              {VALUES.map((elem, index) => (
                <div
                  className={`flex cursor-pointer items-start space-x-3 rounded-lg border p-4 px-3 shadow-sm transition-colors hover:bg-primary/50 hover:text-white ${
                    role === elem
                      ? "border-primary text-primary ring-1 ring-primary"
                      : "border-gray-200"
                  } `}
                  key={index}
                  onClick={(e) => {
                    setRole(elem);
                  }}
                >
                  <label
                    className={`block flex-grow cursor-pointer px-4 text-sm font-medium`}
                  >
                    <span className="whitespace-nowrap"> {t(elem)} </span>
                  </label>
                  {elem === role && (
                    <svg
                      className="top-4 right-4 h-5 w-5 cursor-pointer"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </div>
          {role === Role.Admin || role === Role.Staff ? (
            <form
              className="mb-0 w-full space-y-4 rounded-lg bg-white"
              onSubmit={handleSubmit(submitRegister)}
            >
              <FormInput
                label={t("username")}
                placeHolder={t("enter") + " " + t("username")}
                error={errors.username?.message}
                type="text"
                formControl={{ ...register("username") }}
                currentValue={watchFields.username}
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-5 w-5 text-gray-400"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                    />
                  </svg>
                }
              />
              <FormInput
                label={t("email")}
                placeHolder={t("enter") + " " + t("email")}
                error={errors.email?.message}
                type="email"
                formControl={{ ...register("email") }}
                currentValue={watchFields.email}
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                    />
                  </svg>
                }
              />

              <FormInput
                label={t("phone")}
                placeHolder={t("enter") + " " + t("phone")}
                error={errors.phoneNum?.message}
                type="text"
                formControl={{ ...register("phoneNum") }}
                currentValue={watchFields.phoneNum}
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-5 w-5 text-gray-400"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
                    />
                  </svg>
                }
              />

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

              {role === Role.Staff ? (
                <div>
                  <label className={`text-sm font-medium text-gray-400`}>
                    Custom Role
                    <span className="text-error">*</span>
                  </label>
                  <div className="mt-1 flex flex-wrap items-center justify-start gap-3">
                    {customRoleList?.map(
                      (elem: UserDefinedRole, index: number) => (
                        <div
                          className={`flex cursor-pointer items-start space-x-3 rounded-lg border p-4 px-3 shadow-sm transition-colors hover:bg-primary/50 text-primaryText ${
                            customRole === elem.id
                              ? "border-primary text-primary ring-1 ring-primary"
                              : "border-gray-200"
                          } `}
                          key={index}
                          onClick={(e) => {
                            setCustomRole(elem.id);
                          }}
                        >
                          <label
                            className={`block flex-grow cursor-pointer px-4 text-sm font-medium`}
                          >
                            <span className="whitespace-nowrap">
                              {" "}
                              {elem.name}{" "}
                            </span>
                          </label>
                          {customRole === elem.id && (
                            <svg
                              className="top-4 right-4 h-5 w-5 cursor-pointer"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>
              ) : (
                <></>
              )}

              <SubmitBtn
                isSubmit={isSubmit}
                submitTxt={"Loading..."}
                text={"Create"}
              />
            </form>
          ) : (
            <form
              className="mb-0 w-full space-y-4 rounded-lg bg-white"
              onSubmit={handleSubmit(submitRegister)}
            >
              <FormInput
                label={t("username")}
                placeHolder={t("enter") + " " + t("username")}
                error={errors.username?.message}
                type="text"
                formControl={{ ...register("username") }}
                currentValue={watchFields.username}
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-5 w-5 text-gray-400"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                    />
                  </svg>
                }
              />

              <FormInput
                label={t("phone")}
                placeHolder={t("enter") + " " + t("phone")}
                error={errors.phoneNum?.message}
                type="text"
                formControl={{ ...register("phoneNum") }}
                currentValue={watchFields.phoneNum}
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-5 w-5 text-gray-400"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
                    />
                  </svg>
                }
              />

              <SubmitBtn
                isSubmit={isSubmit}
                submitTxt={"Loading..."}
                text={"Create"}
              />
            </form>
          )}
        </div>
      </div>
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

export default Default;
