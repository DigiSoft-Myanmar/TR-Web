import Navbar from "@/components/navbar/Navbar";
import nextI18nextConfig from "@/next-i18next.config";
import Head from "next/head";
import React, { Fragment } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { defaultDescription } from "@/types/const";
import ErrorScreen from "@/components/screen/ErrorScreen";
import { Membership, Role } from "@prisma/client";
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
  const [currentLevel, setCurrentLevel] = React.useState<any>();
  const { isLoading, error, data } = useQuery("membershipsData", () =>
    fetch("/api/memberships").then((res) => {
      let json = res.json();
      return json;
    })
  );

  const registerSchema = z.object(
    role === Role.Seller
      ? {
          username: z.string().min(1, { message: t("inputError") }),
          brandName: z.string().min(1, { message: t("inputError") }),
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
          email: z.string().email({ message: t("inputValidEmailError") }),
          password: z.string().min(1, { message: t("inputError") }),
          confirmPassword: z.string().min(1, { message: t("inputError") }),
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

  const VALUES = [Role.Buyer, Role.Seller, Role.Staff, Role.Admin] as const;
  const { data: session }: any = useSession();

  React.useEffect(() => {
    if (roleQry) {
      setRole(roleQry);
    } else {
      setRole(Role.Buyer);
    }
  }, [roleQry]);

  React.useEffect(() => {
    if (data && currentLevel === undefined) {
      setCurrentLevel(data[0]);
    }
  }, [currentLevel, data]);

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
    if (role === Role.Seller) {
      body.currentMembership = currentLevel;
    }
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
        <title>Create {role} | Pyi Twin Phyit</title>
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
          {role === Role.Seller ? (
            <form
              className="mb-0 space-y-4 rounded-lg bg-white"
              onSubmit={handleSubmit(submitRegister)}
            >
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <FormInput
                  label={t("ownerName")}
                  placeHolder={t("enter") + " " + t("ownerName")}
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
                  label={t("brandName")}
                  placeHolder={t("enter") + " " + t("brandName")}
                  error={errors.brandName?.message}
                  type="text"
                  formControl={{ ...register("brandName") }}
                  currentValue={watchFields.brandName}
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
                        d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z"
                      />
                    </svg>
                  }
                />
              </div>
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

              <div>
                <label
                  htmlFor="membership"
                  className="text-sm font-medium text-gray-400"
                >
                  Membership
                </label>

                <div className="relative mt-1">
                  <Listbox value={currentLevel} onChange={setCurrentLevel}>
                    <div className="relative mt-1">
                      <Listbox.Button className="relative w-full cursor-default rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-10 text-left focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-primary/30 sm:text-sm">
                        <span className="block truncate">
                          {currentLevel?.name}
                        </span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                          <ChevronUpDownIcon
                            className="h-5 w-5 text-gray-400"
                            aria-hidden="true"
                          />
                        </span>
                      </Listbox.Button>
                      <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                      >
                        <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                          {data &&
                            data.map(
                              (member: Membership, memberIdx: number) => (
                                <Listbox.Option
                                  key={memberIdx}
                                  className={({ active }) =>
                                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                      active
                                        ? "bg-amber-100 text-amber-900"
                                        : "text-gray-900"
                                    }`
                                  }
                                  value={member}
                                >
                                  {({ selected }) => (
                                    <>
                                      <span
                                        className={`block truncate ${
                                          selected
                                            ? "font-medium"
                                            : "font-normal"
                                        }`}
                                      >
                                        {member.name}
                                      </span>
                                      {selected ? (
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                                          <CheckIcon
                                            className="h-5 w-5"
                                            aria-hidden="true"
                                          />
                                        </span>
                                      ) : null}
                                    </>
                                  )}
                                </Listbox.Option>
                              )
                            )}
                        </Listbox.Options>
                      </Transition>
                    </div>
                  </Listbox>
                </div>
              </div>

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

              {customRole &&
                role === Role.Staff &&
                (session.role === Role.Admin ||
                  session.role === Role.SuperAdmin) && (
                  <div className="flex flex-row flex-wrap items-stretch justify-start gap-3">
                    {customRole.map((elem: any, index: number) => (
                      <div
                        className={`flex max-w-fit flex-1 cursor-pointer items-center space-x-3 rounded-lg border px-3 shadow-sm transition-colors hover:bg-primary/50 hover:text-white ${
                          customRole === elem._id
                            ? "border-primary ring-1 ring-primary"
                            : ""
                        } `}
                        key={index}
                        onClick={(e) => {
                          setCustomRole(elem._id);
                        }}
                      >
                        <label
                          className={`block flex-grow cursor-pointer p-4 text-sm font-medium`}
                        >
                          <span className="whitespace-nowrap">
                            {" "}
                            {elem.name}{" "}
                          </span>
                        </label>
                        {elem._id === customRole && (
                          <svg
                            className="text-brand top-4 right-4 h-5 w-5 cursor-pointer"
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
                )}

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
