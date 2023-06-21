import FormInputCheckbox from "@/components/presentational/FormInputCheckbox";
import { useProduct } from "@/context/ProductContext";
import { fileUrl } from "@/types/const";
import { fetcher } from "@/util/fetcher";
import { getInitials, getText } from "@/util/textHelper";
import { PaymentStatus } from "@/types/orderTypes";
import { Membership, Role } from "@prisma/client";
import moment from "moment";
import { useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { useForm } from "react-hook-form";
import useSWR from "swr";
import { isInternal } from "@/util/authHelper";

type Props = {
  backFn: Function;
  nextFn: Function;
  currentStep: number;
  submitRef: any;
};

type Status = {
  isPublished?: boolean;
  isFeatured?: boolean;
  isFeaturedSelf: boolean;
};

function StatusSection({ backFn, nextFn, currentStep, submitRef }: Props) {
  const { data: session }: any = useSession();
  const { t } = useTranslation("common");
  const router = useRouter();
  const { locale } = router;
  const { product, setProduct } = useProduct();
  const { register, handleSubmit, watch, formState } = useForm<Status>({
    mode: "onChange",
    defaultValues: product,
  });

  const { data: membershipData } = useSWR("/api/memberships", fetcher);
  const { data: usedSKU } = useSWR(
    "/api/user/SKUUsage?brandId=" + product.sellerId,
    fetcher
  );

  const now = moment();
  const usedDay =
    product && product.seller && product.seller.memberStartDate
      ? now.diff(moment(product.seller.memberStartDate, "YYYY-MM-DD"), "days")
      : 0;

  const { errors } = formState;
  const watchFields = watch();

  function submit(data: Status) {
    setProduct((prevValue: any) => {
      return { ...prevValue, ...data };
    });
    nextFn();
  }

  return (
    <div className="flex flex-col">
      <h3 className="text-sm font-semibold text-gray-500">
        {t("step")} {currentStep}
      </h3>
      <p className="my-1 text-xl font-bold">{t("status")}</p>
      <span className="mb-10 text-sm">{t("fillProductStatus")}</span>
      <form className="flex flex-col space-y-3" onSubmit={handleSubmit(submit)}>
        {membershipData &&
        membershipData.find(
          (e: Membership) => e.id === product.seller?.membershipId
        ) ? (
          <>
            <FormInputCheckbox
              formControl={{ ...register("isPublished") }}
              label={t("isPublished")}
              value={watchFields.isPublished}
              disabled={isInternal(session) ? false : true}
            />
            <FormInputCheckbox
              formControl={{ ...register("isFeatured") }}
              label={t("isFeatured")}
              value={watchFields.isFeatured}
              disabled={isInternal(session) ? false : true}
            />

            <article className="rounded-md border border-primary/30 bg-white p-6 sm:p-8">
              <div className="flex items-start">
                <div
                  className="hidden sm:grid sm:h-20 sm:w-20 sm:shrink-0 sm:place-content-center sm:rounded-full sm:border-2 sm:border-primary"
                  aria-hidden="true"
                >
                  {product?.seller?.profile ? (
                    <Image
                      src={fileUrl + product.seller?.profile}
                      width={80}
                      height={80}
                      className="h-[80px] w-[80px] rounded-full object-contain p-2"
                      alt="brand logo"
                    />
                  ) : (
                    <div className="avatar">
                      <div className="avatar placeholder">
                        <div className="bg-neutral-focus text-neutral-content rounded-full w-[80px] h-[80px] min-w-[80px] min-h-[80px] max-w-[80px] max-h-[80px]">
                          <span>{getInitials(product?.seller?.username)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex-grow sm:ml-8">
                  <strong className="rounded border border-primary bg-primary px-3 py-1.5 text-[10px] font-medium text-white">
                    {getText(
                      membershipData.find(
                        (e: Membership) => e.id === product.seller.membershipId
                      ).name,
                      membershipData.find(
                        (e: Membership) => e.id === product.seller.membershipId
                      ).nameMM,
                      locale
                    )}
                  </strong>

                  <h3 className="mt-4 text-lg font-medium sm:text-xl">
                    <Link
                      href={`/account/${encodeURIComponent(
                        product.seller?.phoneNum
                      )}?action=view`}
                      className="hover:underline"
                    >
                      {product.seller.username}
                    </Link>
                  </h3>

                  <table className="my-5 table w-full">
                    <tbody>
                      <tr>
                        <th className="text-sm font-normal">
                          Product listing in this tier
                        </th>
                        <td className="font-bold text-primary">
                          {
                            membershipData.find(
                              (e: Membership) =>
                                e.id === product.seller.membershipId
                            )?.SKUListing
                          }
                        </td>
                      </tr>
                      <tr>
                        <th className="text-sm font-normal">
                          Product listing used
                        </th>
                        <td className="flex items-center font-bold text-primary">
                          {usedSKU && usedSKU.Usage ? usedSKU.Usage : 0}
                          <span className="ml-5 text-sm font-normal text-primary/50">
                            {t("notIncluded")}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {usedDay >
                  membershipData.find(
                    (e: Membership) => e.id === product.seller.membershipId
                  ).validity ? (
                    <div>
                      <h2 className="sr-only">Steps</h2>
                      <div>
                        <div className="flex flex-row items-center justify-between">
                          <p className="text-sm font-medium text-gray-500">
                            Membership Start Date -{" "}
                            {new Date(
                              product.seller.memberStartDate
                            ).toLocaleDateString("en-CA", {
                              year: "numeric",
                              month: "long",
                              day: "2-digit",
                            })}
                          </p>
                          <p className="text-sm font-medium text-error">
                            Expired
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h2 className="sr-only">Steps</h2>
                      <div>
                        <div className="flex flex-row items-center justify-between">
                          <p className="text-sm font-medium text-gray-500">
                            {t("days")}
                          </p>
                          <p className="text-sm font-medium text-gray-500">
                            {usedDay} of{" "}
                            {
                              membershipData.find(
                                (e: Membership) =>
                                  e.id === product.seller.membershipId
                              ).validity
                            }{" "}
                            {t("days")}
                          </p>
                        </div>
                        <div className="mt-1 overflow-hidden rounded-full bg-gray-200">
                          <div
                            className="h-2 rounded-full bg-primary"
                            style={{
                              width:
                                (usedDay * 100) /
                                  membershipData.find(
                                    (e: Membership) =>
                                      e.id === product.seller.membershipId
                                  ).validity +
                                "%",
                            }}
                          ></div>
                        </div>
                        <p className="mt-1 text-xs font-light text-gray-500">
                          {membershipData.find(
                            (e: Membership) =>
                              e.id === product.seller.membershipId
                          ).validity - usedDay}{" "}
                          {t("days")} {t("remaining")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </article>
          </>
        ) : (
          <p className="text-center text-sm font-semibold text-error">
            Membership not set.
          </p>
        )}

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
