import Avatar from "@/components/presentational/Avatar";
import { useProfile } from "@/context/ProfileContext";
import { authErrors } from "@/types/authErrors";
import { fileUrl } from "@/types/const";
import { getHeaders, isSeller } from "@/util/authHelper";
import { encryptPhone } from "@/util/encrypt";
import { fetcher } from "@/util/fetcher";
import {
  showErrorDialog,
  showSuccessDialog,
  showUnauthorizedDialog,
} from "@/util/swalFunction";
import { formatAmount, getText } from "@/util/textHelper";
import { Role } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";
import Image from "next/image";
import { useRouter } from "next/router";
import React from "react";
import { useForm } from "react-hook-form";
import useSWR from "swr";

type Props = {
  backFn: Function;
  currentStep: number;
};

function ConfirmationSection({ backFn, currentStep }: Props) {
  const { t } = useTranslation("common");
  const {
    user: profile,
    profileImg,
    nrcFront,
    nrcBack,
    locationStr,
  } = useProfile();
  const [isSubmit, setSubmit] = React.useState(false);
  const router = useRouter();
  const { locale } = router;
  const { data: session }: any = useSession();
  const { data } = useSWR("/api/products/categories", fetcher);
  const { data: membershipData } = useSWR("/api/memberships", fetcher);

  return (
    <div className="flex flex-col">
      <h3 className="text-sm font-semibold text-gray-500">
        {t("step")} {currentStep}
      </h3>
      <p className="my-1 text-xl font-bold">{t("confirmation")}</p>
      <span className="mb-10 text-sm">{t("fillConfirmation")}</span>
      <form
        className="flex flex-col space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          const FormData = require("form-data");
          let form = new FormData();
          let imgList = [];
          if (profileImg) {
            form.append("theFiles", profileImg);
            imgList.push({ type: "profile" });
          }
          if (nrcFront) {
            form.append("theFiles", nrcFront);
            imgList.push({ type: "nrcFront" });
          }
          if (nrcBack) {
            form.append("theFiles", nrcBack);
            imgList.push({ type: "nrcBack" });
          }
          form.append("data", JSON.stringify({ user: profile, img: imgList }));
          setSubmit(true);
          if (getHeaders(session)) {
            fetch("/api/user/" + encodeURIComponent(profile.phoneNum!), {
              method: "POST",
              body: form,
              headers: getHeaders(session),
            }).then(async (data) => {
              setSubmit(false);
              if (data.status === 200) {
                showSuccessDialog(
                  t("submit") + " " + t("success"),
                  "",
                  router.locale,
                  () => {
                    router.push(
                      "/account/" +
                        encodeURIComponent(encryptPhone(profile.phoneNum)) +
                        "?reload=true",
                      null,
                      {
                        shallow: false,
                      }
                    );
                  }
                );
              } else {
                if (data.status === 413) {
                  showErrorDialog(t("fileTooLarge"));
                } else {
                  let json = await data.json();
                  if (json.error) {
                    let errText = "";
                    if (json.error.code) {
                      let errCode = json.error.code.replace("auth/", "");
                      if (errCode in authErrors) {
                        errText = authErrors[errCode];
                      } else {
                        errText = "Something went wrong. Please try again.";
                      }
                      showErrorDialog(errText, "", router.locale);
                    } else {
                      if (json.error) {
                        showErrorDialog(
                          json.error,
                          json.errorMM,
                          router.locale
                        );
                      } else {
                        showErrorDialog(
                          "Something went wrong. Please try again.",
                          "",
                          router.locale
                        );
                      }
                    }
                  } else {
                    showErrorDialog(t("somethingWentWrong"), "", router.locale);
                  }
                }
              }
            });
          } else {
            showUnauthorizedDialog(router.locale, () => {
              router.push("/login");
            });
          }
        }}
      >
        <div>
          <div className="flex justify-center">
            {profileImg ? (
              <img
                draggable={false}
                className="h-32 w-32 rounded-full object-cover shadow-md"
                src={URL.createObjectURL(profileImg)}
              />
            ) : profile.profile ? (
              <Avatar
                username={profile.username}
                profile={profile.profile}
                size={128}
              />
            ) : (
              <></>
            )}
          </div>
          <div className="flex flex-col gap-3 mt-5">
            <div className="flex flex-row items-center justify-between gap-3">
              <h3 className="font-semibold text-sm">{t("username")}</h3>
              <p>{profile.username}</p>
            </div>
            <div className="flex flex-row items-center justify-between gap-3">
              <h3 className="font-semibold text-sm">{t("displayName")}</h3>
              <p>{profile.displayName}</p>
            </div>
            <div className="flex flex-row items-center justify-between gap-3">
              <h3 className="font-semibold text-sm">{t("phoneNum")}</h3>
              <p>{profile.phoneNum}</p>
            </div>
            <div className="flex flex-row items-center justify-between gap-3">
              <h3 className="font-semibold text-sm">{t("email")}</h3>
              <p>{profile.email}</p>
            </div>
            <div className="flex flex-row items-center justify-between gap-3">
              <h3 className="font-semibold text-sm">{t("dob")}</h3>
              <p>
                {new Date(profile.dob).toLocaleDateString("en-ca", {
                  year: "numeric",
                  month: "short",
                  day: "2-digit",
                })}
              </p>
            </div>
            <div className="flex flex-row items-center justify-between gap-3">
              <h3 className="font-semibold text-sm">{t("houseNo")}</h3>
              <p>{profile.houseNo}</p>
            </div>
            <div className="flex flex-row items-center justify-between gap-3">
              <h3 className="font-semibold text-sm">{t("street")}</h3>
              <p>{profile.street}</p>
            </div>
            <div className="flex flex-row items-center justify-between gap-3">
              <h3 className="font-semibold text-sm">{t("location")}</h3>
              <p>{locationStr}</p>
            </div>
            <div className="flex flex-row items-center justify-between gap-3">
              <h3 className="font-semibold text-sm">{t("gender")}</h3>
              <p>{profile.gender}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-5 border-t pt-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {nrcFront ? (
                <img
                  draggable={false}
                  className="h-40 w-full rounded-md border object-contain p-2"
                  src={URL.createObjectURL(nrcFront)}
                />
              ) : profile.nrcFront ? (
                <Image
                  src={fileUrl + profile.nrcFront}
                  width={300}
                  height={160}
                  alt="nrcFront"
                  quality={100}
                  className="h-40 w-full rounded-md border object-contain p-2"
                />
              ) : (
                <></>
              )}

              {nrcBack ? (
                <img
                  draggable={false}
                  className="h-40 w-full rounded-md border object-contain p-2"
                  src={URL.createObjectURL(nrcBack)}
                />
              ) : profile.nrcBack ? (
                <Image
                  src={fileUrl + profile.nrcBack}
                  width={300}
                  height={160}
                  alt="nrcBack"
                  quality={100}
                  className="h-40 w-full rounded-md border object-contain p-2"
                />
              ) : (
                <></>
              )}
            </div>

            <div className="flex flex-row items-center justify-between gap-3">
              <h3 className="font-semibold text-sm">{t("nrc")}</h3>
              <p>
                {profile.nrcState} / {profile.nrcTownship} ({profile.nrcType}){" "}
                {profile.nrcNumber}
              </p>
            </div>
          </div>

          {data && (
            <div className="flex flex-col gap-3 mt-5 border-t pt-5">
              <div className="flex flex-row items-center justify-between gap-3">
                <h3 className="font-semibold text-sm">{t("categoriesInfo")}</h3>
              </div>
              <p>
                {data
                  .filter((z) => profile.preferCategoryIDs.includes(z.id))
                  .map((b) => getText(b.name, b.nameMM, locale))
                  .join(", ")}
              </p>
            </div>
          )}
          {isSeller(profile) && (
            <div className="flex flex-col gap-3 mt-5 border-t pt-5">
              <div className="flex flex-row items-center justify-between gap-3">
                <h3 className="font-semibold text-sm">{t("membership")}</h3>
                <p>
                  {getText(
                    membershipData.find((z) => z.id === profile.membershipId)
                      .name,
                    membershipData.find((z) => z.id === profile.membershipId)
                      .nameMM,
                    locale
                  )}
                </p>
              </div>
              {profile.memberStartDate && (
                <div className="flex flex-row items-center justify-between gap-3">
                  <h3 className="font-semibold text-sm">
                    {t("memberStartDate")}
                  </h3>
                  <p>
                    {new Date(profile.memberStartDate).toLocaleDateString(
                      "en-ca",
                      {
                        year: "numeric",
                        month: "short",
                        day: "2-digit",
                      }
                    )}
                  </p>
                </div>
              )}
              <div className="flex flex-row items-center justify-between gap-3">
                <h3 className="font-semibold text-sm">
                  {t("shippingIncluded")}
                </h3>
                <p>{profile.shippingIncluded ? "Enabled" : "Disabled"}</p>
              </div>
              {profile.shippingIncluded ? (
                <>
                  <div className="flex flex-row items-center justify-between gap-3">
                    <h3 className="font-semibold text-sm">
                      {t("defaultShippingCost")}
                    </h3>
                    <p>
                      {formatAmount(profile.defaultShippingCost, locale, true)}
                    </p>
                  </div>
                  <div className="flex flex-row items-center justify-between gap-3">
                    <h3 className="font-semibold text-sm">
                      {t("isOfferFreeShipping")}
                    </h3>
                    <p>
                      {profile.isOfferFreeShipping ? "Enabled" : "Disabled"}
                    </p>
                  </div>
                  {profile.isOfferFreeShipping ? (
                    <div className="flex flex-row items-center justify-between gap-3">
                      <h3 className="font-semibold text-sm">
                        {t("freeShippingCost")}
                      </h3>
                      <p>
                        {formatAmount(profile.freeShippingCost, locale, true)}
                      </p>
                    </div>
                  ) : (
                    <></>
                  )}
                </>
              ) : (
                <></>
              )}
            </div>
          )}

          <div className="flex flex-col gap-3 mt-5 border-t pt-5">
            <div className="flex flex-row items-center justify-between gap-3">
              <h3 className="font-semibold text-sm">{t("isBlocked")}</h3>
              <p>{profile.isBlocked ? "Yes" : "No"}</p>
            </div>
            <div className="flex flex-row items-center justify-between gap-3">
              <h3 className="font-semibold text-sm">{t("isDeleted")}</h3>
              <p>{profile.isDeleted ? "Yes" : "No"}</p>
            </div>
            {isSeller(profile) && (
              <div className="flex flex-row items-center justify-between gap-3">
                <h3 className="font-semibold text-sm">{t("sellAllow")}</h3>
                <p>{profile.sellAllow ? "Allow" : "Disabled"}</p>
              </div>
            )}
          </div>
        </div>

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
            className={`inline-flex items-center gap-3 rounded-r-md border bg-primary p-3 text-white shadow-sm hover:bg-primary-focus focus:relative`}
            title="Next"
            type="submit"
          >
            {isSubmit === true ? (
              <>
                <svg
                  role="status"
                  className="inline h-4 w-4 animate-spin"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="#E5E7EB"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentColor"
                  />
                </svg>
                <span className="ml-1 text-sm font-semibold">Loading...</span>
              </>
            ) : (
              <>
                <span className="text-sm font-semibold">Submit</span>
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
              </>
            )}
          </button>
        </span>
      </form>
    </div>
  );
}

export default ConfirmationSection;
