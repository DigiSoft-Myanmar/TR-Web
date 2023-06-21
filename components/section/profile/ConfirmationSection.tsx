import { useProfile } from "@/context/ProfileContext";
import { authErrors } from "@/types/authErrors";
import { getHeaders } from "@/util/authHelper";
import {
  showErrorDialog,
  showSuccessDialog,
  showUnauthorizedDialog,
} from "@/util/swalFunction";
import { Role } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import React from "react";
import { useForm } from "react-hook-form";

type Props = {
  backFn: Function;
  currentStep: number;
};

function ConfirmationSection({ backFn, currentStep }: Props) {
  const { t } = useTranslation("common");
  const { user: profile, profileImg, nrcFront, nrcBack } = useProfile();
  const [isSubmit, setSubmit] = React.useState(false);
  const router = useRouter();
  const { data: session }: any = useSession();

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
                    if (
                      session &&
                      (session.role === Role.Admin ||
                        session.role === Role.Staff ||
                        session.role === Role.SuperAdmin)
                    ) {
                      router.push("/");
                    } else {
                      router.reload();
                    }
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
