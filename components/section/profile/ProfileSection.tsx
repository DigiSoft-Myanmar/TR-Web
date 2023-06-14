import FormInput from "@/components/presentational/FormInput";
import LocationPicker from "@/components/presentational/LocationPicker";
import LocationPickerFull from "@/components/presentational/LocationPickerFull";
import { useProfile } from "@/context/ProfileContext";
import { fileUrl } from "@/types/const";
import { showErrorDialog } from "@/util/swalFunction";
import { zodResolver } from "@hookform/resolvers/zod";
import { Role } from "@prisma/client";
import { useTranslation } from "next-i18next";
import Image from "next/image";
import { useRouter } from "next/router";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type Props = {
  nextFn: Function;
};

type Profile = {
  username?: string;
  email?: string;
  phoneNum?: string;
  houseNo?: string;
  street?: string;
  stateId?: string;
  districtId?: string;
  townshipId?: string;
  profile?: string;
  dob?: Date;
};

function ProfileSection({ nextFn }: Props) {
  const { t } = useTranslation("common");
  const genderList = ["male", "female"];
  const {
    user: profile,
    setUser: setProfile,
    profileImg,
    setProfileImg,
  } = useProfile();

  const schema = z.object({
    username: z.string().min(1, { message: t("inputError") }),
    email: z.string().email({ message: t("inputValidEmailError") }),
    phoneNum: z.string().regex(new RegExp("^\\+959\\d{7,9}$"), {
      message: t("inputValidPhoneError"),
    }),
    houseNo: z.string().min(1, { message: t("inputError") }),
    street: z.string().min(1, { message: t("inputError") }),
    dob: z.date(),
  });

  const { register, handleSubmit, watch, formState } = useForm<Profile>({
    mode: "onChange",
    defaultValues: profile,
    resolver: zodResolver(schema),
  });
  const { errors } = formState;
  const { locale } = useRouter();
  const watchFields = watch();

  function submit(data: Profile) {
    setProfile((prevValue: any) => {
      return { ...prevValue, ...data };
    });

    if (
      profile &&
      (profile.profile || profileImg) &&
      profile.stateId &&
      profile.districtId &&
      profile.townshipId
    ) {
      nextFn();
    } else {
      showErrorDialog(t("fillInformation"));
    }
  }

  return (
    <div className="flex flex-col">
      <h3 className="text-sm font-semibold text-gray-500">{t("step")} 1</h3>
      <p className="my-1 text-xl font-bold">{t("profile")}</p>
      <span className="mb-10 text-sm">{t("fillProfile")}</span>
      <form className="flex flex-col space-y-3" onSubmit={handleSubmit(submit)}>
        <div className="flex flex-col items-center">
          {profileImg ? (
            <div className="relative flex cursor-pointer flex-row items-center justify-center">
              <Image
                src={URL.createObjectURL(profileImg)}
                width={96}
                height={96}
                alt="Profile"
                quality={100}
                className="h-24 w-24 rounded-full border p-2"
              />
              <label className="absolute bottom-0 right-0 flex w-fit cursor-pointer items-center justify-center rounded-full bg-primary p-2 text-sm text-white hover:bg-primary-focus focus:relative">
                <input
                  id="dropzone-file"
                  type="file"
                  className="hidden"
                  multiple={false}
                  onChange={(e) => {
                    let fileList = e.currentTarget.files;
                    if (fileList) {
                      for (let i = 0; i < fileList.length; i++) {
                        if (fileList[i].size > 2097152) {
                          showErrorDialog(t("fileTooLarge"), "", locale);
                        } else {
                          setProfileImg(fileList[0]);
                        }
                      }
                    }
                  }}
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                  />
                </svg>
              </label>
            </div>
          ) : profile && profile.profile ? (
            <div className="relative flex cursor-pointer flex-row items-center justify-center">
              <Image
                src={fileUrl + profile.profile}
                width={96}
                height={96}
                alt="Profile"
                quality={100}
                className="h-24 w-24 rounded-full border p-2"
              />
              <label className="absolute bottom-0 right-0 flex w-fit cursor-pointer items-center justify-center rounded-full bg-primary p-2 text-sm text-white hover:bg-primary-focus focus:relative">
                <input
                  id="dropzone-file"
                  type="file"
                  className="hidden"
                  multiple={false}
                  onChange={(e) => {
                    let fileList = e.currentTarget.files;
                    if (fileList) {
                      for (let i = 0; i < fileList.length; i++) {
                        if (fileList[i].size > 2097152) {
                          showErrorDialog(t("fileTooLarge"), "", locale);
                        } else {
                          setProfileImg(fileList[0]);
                        }
                      }
                    }
                  }}
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                  />
                </svg>
              </label>
            </div>
          ) : (
            <div className="flex justify-center">
              <label className="relative flex h-24 w-24 cursor-pointer items-center justify-center gap-1 rounded-full bg-gray-200">
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
                    d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                  />
                </svg>
                <input
                  id="dropzone-file"
                  type="file"
                  className="hidden"
                  multiple={false}
                  onChange={(e) => {
                    let fileList = e.currentTarget.files;
                    if (fileList) {
                      for (let i = 0; i < fileList.length; i++) {
                        if (fileList[i].size > 2097152) {
                          showErrorDialog(t("fileTooLarge"), "", locale);
                        } else {
                          setProfileImg(fileList[0]);
                        }
                      }
                    }
                  }}
                />
                <span className="absolute bottom-0 right-0 flex w-fit items-center justify-center rounded-full bg-primary p-2 text-sm text-white hover:bg-primary-focus focus:relative">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-4 w-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                    />
                  </svg>
                </span>
              </label>
            </div>
          )}
          {!profile?.profile && profileImg === undefined && (
            <span className="mt-3 p-2 text-xs text-error">
              {t("inputProfileError")}
            </span>
          )}
        </div>

        <FormInput
          label={t("username")}
          placeHolder={t("enter") + " " + t("username")}
          error={errors.username?.message}
          type="text"
          defaultValue={profile?.username}
          formControl={{ ...register("username") }}
          currentValue={watchFields.username}
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
          defaultValue={profile?.phoneNum}
          formControl={{ ...register("phoneNum") }}
          currentValue={watchFields.phoneNum}
          disabled={true}
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
                d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
              />
            </svg>
          }
        />

        <FormInput
          label={t("email")}
          placeHolder={t("enter") + " " + t("email")}
          error={errors.email?.message}
          type="email"
          defaultValue={profile?.email}
          formControl={{ ...register("email") }}
          currentValue={watchFields.email}
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
                d="M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zm0 0c0 1.657 1.007 3 2.25 3S21 13.657 21 12a9 9 0 10-2.636 6.364M16.5 12V8.25"
              />
            </svg>
          }
        />

        {/* //TODO check date */}
        <FormInput
          label={t("dob")}
          placeHolder={t("enter") + " " + t("dob")}
          error={errors.dob?.message}
          type="date"
          defaultValue={
            profile?.dob ? profile?.dob.toISOString().substring(0, 10) : ""
          }
          formControl={{
            ...register("dob", {
              setValueAs: (v) => (v ? new Date(v) : ""),
            }),
          }}
          currentValue={
            watchFields.dob
              ? new Date(watchFields.dob)?.toISOString().substring(0, 10)
              : ""
          }
        />

        <FormInput
          label={t("houseNo")}
          placeHolder={t("enter") + " " + t("houseNo")}
          error={errors.houseNo?.message}
          type="text"
          defaultValue={profile?.houseNo}
          formControl={{ ...register("houseNo") }}
          currentValue={watchFields.houseNo}
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
                d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
              />
            </svg>
          }
        />

        <FormInput
          label={t("street")}
          placeHolder={t("enter") + " " + t("street")}
          error={errors.street?.message}
          type="text"
          defaultValue={profile?.street}
          formControl={{ ...register("street") }}
          currentValue={watchFields.street}
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
                d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"
              />
            </svg>
          }
        />
        <LocationPickerFull
          selected={{
            stateId: profile?.stateId,
            districtId: profile?.districtId,
            townshipId: profile?.townshipId,
          }}
          setSelected={(data) => {
            setProfile((prevValue) => {
              return {
                ...prevValue,
                stateId: data.stateId,
                districtId: data.districtId,
                townshipId: data.townshipId,
              };
            });
          }}
        />

        <div className="flex flex-wrap items-center justify-center gap-3">
          {genderList.map((elem, index) => (
            <div
              className={`flex cursor-pointer items-center space-x-3 rounded-lg border px-3 shadow-sm transition-colors hover:bg-primary-focus hover:text-white ${
                profile?.gender === elem
                  ? "border-primary text-primary ring-1 ring-primary"
                  : "border-gray-200"
              } `}
              key={index}
              onClick={(e) => {
                setProfile((prevValue: any) => {
                  return { ...prevValue, gender: elem };
                });
              }}
            >
              <label
                className={`block flex-grow cursor-pointer p-4 text-sm font-medium`}
              >
                <span className="whitespace-nowrap"> {t(elem)} </span>
              </label>
              {elem === profile?.gender && (
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

        <span className="flex justify-end divide-x overflow-hidden">
          <button
            className={`inline-block rounded-md border bg-primary p-3 text-white shadow-sm hover:bg-primary-focus focus:relative`}
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

export default ProfileSection;
