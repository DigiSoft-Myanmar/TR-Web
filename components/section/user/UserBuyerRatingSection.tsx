import Avatar from "@/components/presentational/Avatar";
import FormInputTextArea from "@/components/presentational/FormInputTextArea";
import { getHeaders, isInternal, isSeller } from "@/util/authHelper";
import { showErrorDialog, showSuccessDialog } from "@/util/swalFunction";
import {
  calculateRating,
  calculateRatingPercentage,
  formatAmount,
} from "@/util/textHelper";
import { zodResolver } from "@hookform/resolvers/zod";
import { Rating, Tooltip } from "@mui/material";
import { Review, ReviewType, User } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";
import { z } from "zod";

function UserBuyerRatingSection({ user }: { user: User }) {
  const { data: session }: any = useSession();
  const { t } = useTranslation("common");
  const [rating, setRating] = React.useState(0);
  const { locale } = useRouter();

  const { data: buyerReview, refetch } = useQuery("buyerReview", () =>
    fetch(
      "/api/user/" +
        encodeURIComponent(user.phoneNum) +
        "/reviews?type=" +
        ReviewType.Buyer
    ).then((res) => {
      let json = res.json();
      return json;
    })
  );

  const schema = z.object({
    message: z
      .string()
      .min(1, { message: t("inputError") })
      .optional()
      .or(z.literal("")),
  });
  const { register, handleSubmit, watch, formState, reset } = useForm<any>({
    mode: "onChange",
    resolver: zodResolver(schema),
  });
  const { errors } = formState;
  const watchFields = watch();

  React.useEffect(() => {
    if (buyerReview) {
      if (buyerReview.myReview) {
        reset({
          message: buyerReview.myReview.message,
        });
        setRating(buyerReview.myReview.rating);
      }
    }
  }, [buyerReview]);

  function submitReview(data: any) {
    fetch("/api/rating?userId=" + user.id, {
      method: "POST",
      body: JSON.stringify({
        message: data.message,
        rating: rating,
        reviewType: ReviewType.Buyer,
      }),
      headers: getHeaders(session),
    }).then((data) => {
      if (data.status === 200) {
        showSuccessDialog("Submit success");
        refetch();
      } else {
        showErrorDialog("Error");
      }
    });
  }

  return (
    <div
      className={`${
        isInternal(session)
          ? "py-5 flex flex-col gap-5"
          : "mx-6 px-4 py-5 flex flex-col gap-5"
      }`}
    >
      {isInternal(session) === false && buyerReview?.canReview === true && (
        <form
          className="p-3 bg-white rounded-md flex flex-col gap-5 lg:px-10 px-5"
          onSubmit={handleSubmit(submitReview)}
        >
          <div className="flex flex-row items-center gap-3 mt-3">
            <h3 className="text-lg">Rate Buyer</h3>
          </div>
          <Rating
            size="large"
            value={rating}
            onChange={(e: any) => {
              setRating(e.currentTarget.value);
            }}
          />
          <FormInputTextArea
            label="Review"
            placeHolder="Enter Review"
            error={errors.message?.message}
            formControl={{
              ...register("message"),
            }}
            currentValue={watchFields.message}
            optional={true}
          />

          <div className="flex flex-row items-center justify-end">
            <button
              className="bg-primary text-white rounded-md px-3 py-2 text-sm hover:bg-primary-focus"
              type="submit"
            >
              Submit
            </button>
          </div>
        </form>
      )}

      <div className="bg-white p-5 rounded-md flex flex-col gap-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:gap-5 justify-between">
          <h3 className="text-lg pl-3">{t("rating")}</h3>
          <Tooltip title="Ratings are provided based on experience with this user.">
            <div className="text-sm text-gray-500 flex flex-row items-center gap-1 cursor-pointer hover:bg-gray-100 rounded-md p-3">
              <span>Ratings and reviews are verified</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-3"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                />
              </svg>
            </div>
          </Tooltip>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-center gap-10 px-5">
          <div className="flex flex-col gap-3 items-center">
            <h3 className="text-4xl text-center font-semibold">
              {buyerReview?.otherReviews.length > 0
                ? (
                    buyerReview?.otherReviews
                      .map((z: Review) => z.rating)
                      .reduce((a, b) => a + b, 0) /
                    buyerReview?.otherReviews.length
                  ).toFixed(1)
                : 0}
            </h3>
            <div className="flex items-center">
              {Array.from(
                Array(
                  buyerReview?.otherReviews.length > 0
                    ? parseFloat(
                        (
                          buyerReview?.otherReviews
                            .map((z: Review) => z.rating)
                            .reduce((a, b) => a + b, 0) /
                          buyerReview?.otherReviews.length
                        ).toFixed(0)
                      )
                    : 0
                ).keys()
              ).map((b) => (
                <svg
                  key={b}
                  aria-hidden="true"
                  className="w-5 h-5 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
              ))}
              {Array.from(
                Array(
                  buyerReview?.otherReviews.length > 0
                    ? 5 -
                        parseFloat(
                          (
                            buyerReview?.otherReviews
                              .map((z: Review) => z.rating)
                              .reduce((a, b) => a + b, 0) /
                            buyerReview?.otherReviews.length
                          ).toFixed(0)
                        )
                    : 5
                ).keys()
              ).map((b) => (
                <svg
                  aria-hidden="true"
                  className="w-5 h-5 text-gray-300"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              {formatAmount(
                buyerReview?.otherReviews.length,
                locale,
                false,
                true
              )}{" "}
              ratings
            </p>
          </div>
          <div className="flex-grow">
            <div className="flex items-center mt-1 w-full">
              <span className="text-xs font-medium text-gray-500">5 star</span>
              <div className="flex-grow h-3 mx-4 bg-gray-200 rounded">
                <div
                  className="h-3 bg-yellow-400 rounded"
                  style={{
                    width:
                      calculateRatingPercentage(buyerReview?.otherReviews)[
                        "5"
                      ] + "%",
                  }}
                ></div>
              </div>
              <span className="text-xs font-medium text-gray-500 min-w-[50px]">
                {calculateRatingPercentage(buyerReview?.otherReviews)["5"] +
                  "%"}
              </span>
            </div>
            <div className="flex items-center mt-1">
              <span className="text-xs font-medium text-gray-500">4 star</span>
              <div className="flex-grow h-3 mx-4 bg-gray-200 rounded">
                <div
                  className="h-3 bg-yellow-400 rounded"
                  style={{
                    width:
                      calculateRatingPercentage(buyerReview?.otherReviews)[
                        "4"
                      ] + "%",
                  }}
                ></div>
              </div>
              <span className="text-xs font-medium text-gray-500 min-w-[50px]">
                {calculateRatingPercentage(buyerReview?.otherReviews)["4"] +
                  "%"}
              </span>
            </div>
            <div className="flex items-center mt-1">
              <span className="text-xs font-medium text-gray-500">3 star</span>
              <div className="flex-grow h-3 mx-4 bg-gray-200 rounded">
                <div
                  className="h-3 bg-yellow-400 rounded"
                  style={{
                    width:
                      calculateRatingPercentage(buyerReview?.otherReviews)[
                        "3"
                      ] + "%",
                  }}
                ></div>
              </div>
              <span className="text-xs font-medium text-gray-500 min-w-[50px]">
                {calculateRatingPercentage(buyerReview?.otherReviews)["3"] +
                  "%"}
              </span>
            </div>
            <div className="flex items-center mt-1">
              <span className="text-xs font-medium text-gray-500">2 star</span>
              <div className="flex-grow h-3 mx-4 bg-gray-200 rounded">
                <div
                  className="h-3 bg-yellow-400 rounded"
                  style={{
                    width:
                      calculateRatingPercentage(buyerReview?.otherReviews)[
                        "2"
                      ] + "%",
                  }}
                ></div>
              </div>
              <span className="text-xs font-medium text-gray-500 min-w-[50px]">
                {calculateRatingPercentage(buyerReview?.otherReviews)["2"] +
                  "%"}
              </span>
            </div>
            <div className="flex items-center mt-1">
              <span className="text-xs font-medium text-gray-500">1 star</span>
              <div className="flex-grow h-3 mx-4 bg-gray-200 rounded">
                <div
                  className="h-3 bg-yellow-400 rounded"
                  style={{
                    width:
                      calculateRatingPercentage(buyerReview?.otherReviews)[
                        "1"
                      ] + "%",
                  }}
                ></div>
              </div>
              <span className="text-xs font-medium text-gray-500 min-w-[50px]">
                {calculateRatingPercentage(buyerReview?.otherReviews)["1"] +
                  "%"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-5 mt-5">
          {buyerReview?.otherReviews.map(
            (z: Review & { createdBy: User }, index) => (
              <div
                className="bg-white p-3 rounded-md border flex flex-col gap-3 w-full"
                key={index}
              >
                <article className="w-full">
                  <div className="flex items-center mb-4 space-x-4">
                    <Avatar
                      username={z.createdBy.username}
                      profile={z.createdBy.profile}
                      size={40}
                    />
                    <div className="space-y-1 font-medium">
                      <p>
                        {z.createdBy.username}{" "}
                        <time className="block text-sm text-gray-500">
                          Reviewed on{" "}
                          {new Date(z.createdAt).toLocaleDateString("en-ca", {
                            year: "numeric",
                            month: "short",
                            day: "2-digit",
                          })}
                        </time>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center mb-1">
                    {Array.from(Array(z.rating).keys()).map((b) => (
                      <svg
                        key={b}
                        aria-hidden="true"
                        className="w-5 h-5 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                    ))}
                    {Array.from(Array(5 - z.rating).keys()).map((b) => (
                      <svg
                        key={b}
                        aria-hidden="true"
                        className="w-5 h-5 text-gray-300"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                    ))}
                  </div>
                  <p className="mb-2 text-sm text-gray-500">{z.message}</p>
                </article>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default UserBuyerRatingSection;
