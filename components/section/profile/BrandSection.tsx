import FormInput from "@/components/presentational/FormInput";
import FormInputTextArea from "@/components/presentational/FormInputTextArea";
import LocationPicker from "@/components/presentational/LocationPicker";
import { useProfile } from "@/context/ProfileContext";
import { fileUrl } from "@/types/const";
import { showErrorDialog } from "@/util/swalFunction";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "next-i18next";
import Image from "next/image";
import { useRouter } from "next/router";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type Props = {
  backFn: Function;
  nextFn: Function;
};

type Brand = {
  brandName?: string;
  brandSlug?: string;
  brandLogo?: string;
  brandBanner?: string;
  brandSlogan?: string;
  brandSloganMM?: string;
  brandDescription?: string;
  brandDescriptionMM?: string;
  brandStateId?: string;
  brandDistrictId?: string;
  brandTownshipId?: string;
};

function BrandSection({ backFn, nextFn }: Props) {
  const { t } = useTranslation("common");
  const {
    brand,
    setBrand,
    brandBannerImg,
    setBrandBannerImg,
    brandLogoImg,
    setBrandLogoImg,
  } = useProfile();

  const { locale } = useRouter();

  const schema = z.object({
    brandName: z.string().min(1, { message: t("inputError") }),
    brandSlogan: z.string().min(1, { message: t("inputError") }),
    brandSloganMM: z
      .string()
      .min(1, { message: t("inputError") })
      .optional()
      .or(z.literal("")),
    brandDescription: z
      .string()
      .min(1, { message: t("inputError") })
      .optional()
      .or(z.literal("")),
    brandDescriptionMM: z
      .string()
      .min(1, { message: t("inputError") })
      .optional()
      .or(z.literal("")),
  });

  const { register, handleSubmit, watch, formState } = useForm<Brand>({
    mode: "onChange",
    defaultValues: brand,
    resolver: zodResolver(schema),
  });
  const { errors } = formState;
  const watchFields = watch();

  function submit(data: Brand) {
    setBrand((prevValue: any) => {
      return { ...prevValue, ...data, brandSlug: data.brandName };
    });
    if (
      brand &&
      (brand.brandBanner || brandBannerImg) &&
      (brand.brandLogo || brandLogoImg) &&
      brand.stateId &&
      brand.districtId &&
      brand.townshipId
    ) {
      nextFn();
    }
  }
  return (
    <div className="flex flex-col">
      <h3 className="text-sm font-semibold text-gray-500">{t("step")} 3</h3>
      <p className="my-1 text-xl font-bold">{t("brand")}</p>
      <span className="mb-10 text-sm">{t("fillBrand")}</span>
      <form className="flex flex-col space-y-3" onSubmit={handleSubmit(submit)}>
        <div className="flex flex-col items-center">
          {brandBannerImg ? (
            <div className="relative mb-3 flex w-full cursor-pointer flex-row">
              <Image
                src={URL.createObjectURL(brandBannerImg)}
                width={600}
                height={192}
                alt="BrandLogo"
                quality={100}
                className="h-48 w-full rounded-md border object-contain p-2"
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
                          setBrandBannerImg(fileList[0]);
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
          ) : brand && brand.brandBanner ? (
            <div className="relative mb-3 flex w-full cursor-pointer flex-row">
              <Image
                src={fileUrl + brand.brandBanner}
                width={600}
                height={192}
                alt="Brand Logo"
                quality={100}
                className="h-48 w-full rounded-md border object-contain p-2"
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
                          setBrandBannerImg(fileList[0]);
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
            <div className="mb-3 flex w-full">
              <label className="relative flex h-48 w-full cursor-pointer items-center justify-center gap-1 rounded-md bg-gray-200">
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
                          setBrandBannerImg(fileList[0]);
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

          {brandLogoImg ? (
            <div className="z-10 -mt-5 flex w-full cursor-pointer flex-row items-center justify-start">
              <div className="relative">
                <Image
                  src={URL.createObjectURL(brandLogoImg)}
                  width={96}
                  height={96}
                  alt="BrandLogo"
                  quality={100}
                  className="h-24 w-24 rounded-full border bg-white object-contain p-2"
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
                            setBrandLogoImg(fileList[0]);
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
            </div>
          ) : brand && brand.brandLogo ? (
            <div className="z-10 -mt-5 flex w-full cursor-pointer flex-row items-center justify-start">
              <div className="relative">
                <Image
                  src={fileUrl + brand.brandLogo}
                  width={96}
                  height={96}
                  alt="Brand Logo"
                  quality={100}
                  className="h-24 w-24 rounded-full border bg-white object-contain p-2"
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
                            setBrandLogoImg(fileList[0]);
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
            </div>
          ) : (
            <div className="z-10 -mt-10 flex w-full justify-start">
              <div>
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
                            setBrandLogoImg(fileList[0]);
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
            </div>
          )}
          {!brand.brandBanner && brandBannerImg === undefined && (
            <span className="mt-3 p-2 text-xs text-error">
              {t("inputBrandBannerError")}
            </span>
          )}
          {!brand.brandLogo && brandLogoImg === undefined && (
            <span className="p-2 text-xs text-error">
              {t("inputBrandLogoError")}
            </span>
          )}
        </div>

        <FormInput
          label={t("brand") + " " + t("name")}
          placeHolder={t("enter") + " " + t("brand") + " " + t("name")}
          error={errors.brandName?.message}
          type="text"
          defaultValue={brand?.brandName}
          formControl={{ ...register("brandName") }}
          currentValue={watchFields.brandName}
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
                d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z"
              />
            </svg>
          }
        />

        <FormInput
          label={t("brandSlogan")}
          placeHolder={t("enter") + " " + t("brandSlogan")}
          error={errors.brandSlogan?.message}
          type="text"
          defaultValue={brand?.brandSlogan}
          formControl={{ ...register("brandSlogan") }}
          currentValue={watchFields.brandSlogan}
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
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              />
            </svg>
          }
        />

        <FormInput
          label={t("brandSlogan") + " " + t("mm")}
          placeHolder={t("enter") + " " + t("brandSlogan") + " " + t("mm")}
          error={errors.brandSloganMM?.message}
          type="text"
          defaultValue={brand?.brandSloganMM}
          formControl={{ ...register("brandSloganMM") }}
          currentValue={watchFields.brandSloganMM}
          optional={true}
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
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              />
            </svg>
          }
        />

        <LocationPicker
          stateId={brand.stateId}
          districtId={brand.districtId}
          townshipId={brand.townshipId}
          setLocation={(e: any) => {
            setBrand((prevValue: any) => {
              return {
                ...prevValue,
                stateId: e.state,
                districtId: e.district,
                townshipId: e.township,
              };
            });
          }}
        />

        <FormInputTextArea
          label={t("brandDescription")}
          placeHolder={t("enter") + " " + t("brandDescription")}
          error={errors.brandDescription?.message}
          defaultValue={brand?.brandDescription}
          formControl={{ ...register("brandDescription") }}
          currentValue={watchFields.brandDescription}
        />

        <FormInputTextArea
          label={t("brandDescription") + " " + t("mm")}
          placeHolder={t("enter") + " " + t("brandDescription") + " " + t("mm")}
          error={errors.brandDescriptionMM?.message}
          defaultValue={brand?.brandDescriptionMM}
          formControl={{ ...register("brandDescriptionMM") }}
          currentValue={watchFields.brandDescriptionMM}
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

export default BrandSection;
