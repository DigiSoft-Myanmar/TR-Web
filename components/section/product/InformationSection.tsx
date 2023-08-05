import FormInput from "@/components/presentational/FormInput";
import FormInputTextArea from "@/components/presentational/FormInputTextArea";
import { useProduct } from "@/context/ProductContext";
import {
  Brand,
  Category,
  Condition,
  ProductType,
  State,
  User,
} from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Role } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";
import Image from "next/image";
import { useRouter } from "next/router";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import MultiUploadModal from "@/components/modal/sideModal/MultiUploadModal";
import MultiGalleryModal from "@/components/modal/sideModal/MultiGalleryModal";
import { fileUrl } from "@/types/const";
import ProductCategoryModal from "@/components/modal/sideModal/ProductCategoryModal";
import StateSelectBox from "@/components/presentational/StateSelectBox";
import { ImgType } from "@/types/orderTypes";
import { showErrorDialog } from "@/util/swalFunction";
import { isInternal } from "@/util/authHelper";
import dynamic from "next/dynamic";
import SellerSelectBox from "@/components/presentational/SellerSelectBox";
import BrandAutoCompleteBox from "@/components/presentational/BrandAutoCompleteBox";
import SelectBox from "@/components/presentational/SelectBox";
import { useQuery } from "react-query";

const FormInputRichText: any = dynamic(
  () => import("@/components/presentational/FormInputRichTextSun"),
  {
    ssr: false,
  }
);

type Props = {
  nextFn: Function;
  infoRef: any;
};

type Information = {
  name?: String;
  nameMM?: String;
  slug?: String;
  SKU?: String;
  type?: ProductType;
  brandId?: String;
  categoryIds?: String[];
  tags?: String[];
  shortDescription?: String;
  shortDescriptionMM?: String;
};

function InformationSection({ nextFn, infoRef }: Props) {
  const { t } = useTranslation("common");
  const { product, setProduct, setInfoCheck } = useProduct();
  const { data: session }: any = useSession();
  const tagInput = React.useRef<HTMLInputElement | null>(null);

  const { data: conditionData, refetch } = useQuery("conditionsData", () =>
    fetch("/api/products/conditions").then((res) => {
      let json = res.json();
      return json;
    })
  );

  const [categoryModalOpen, setCategoryModalOpen] = React.useState(false);
  const [uploadModalOpen, setUploadModalOpen] = React.useState(false);
  const [chooseModalOpen, setChooseModalOpen] = React.useState(false);
  const schema = z.object(
    product.type === ProductType.Variable
      ? {
          name: z.string().min(1, { message: t("inputError") }),
          nameMM: z
            .string()
            .min(1, { message: t("inputError") })
            .optional()
            .or(z.literal("")),
          shortDescription: z
            .string()
            .min(1, { message: t("inputError") })
            .optional()
            .or(z.literal("")),
          shortDescriptionMM: z
            .string()
            .min(1, { message: t("inputError") })
            .optional()
            .or(z.literal("")),
        }
      : {
          name: z.string().min(1, { message: t("inputError") }),
          nameMM: z
            .string()
            .min(1, { message: t("inputError") })
            .optional()
            .or(z.literal("")),
          SKU: z.string().min(1, { message: t("inputError") }),
          shortDescription: z
            .string()
            .min(1, { message: t("inputError") })
            .optional()
            .or(z.literal("")),
          shortDescriptionMM: z
            .string()
            .min(1, { message: t("inputError") })
            .optional()
            .or(z.literal("")),
        }
  );
  const [isChecking, setChecking] = React.useState(false);
  const [isVerified, setVerified] = React.useState(false);
  const productType = [
    ProductType.Fixed,
    ProductType.Variable,
    ProductType.Auction,
  ];

  const { register, handleSubmit, watch, formState } = useForm<Information>({
    mode: "onChange",
    defaultValues: product,
    resolver: zodResolver(schema),
  });
  const { errors } = formState;
  const { locale } = useRouter();
  const watchFields = watch();
  const [SKUError, setSKUError] = React.useState("");

  function changeMainImg(img: string) {
    console.log(img);
    let list = product && product.imgList ? [...product.imgList] : [];
    let index = list.findIndex((e: string) => e === img);
    console.log(index);
    let tempImg = list[0];
    list[0] = img;
    list[index] = tempImg;
    setProduct((prevValue: any) => {
      return { ...prevValue, imgList: list };
    });
  }

  React.useEffect(() => {
    console.log(errors);
  }, [errors]);

  function submit(data: Information) {
    setProduct((prevValue: any) => {
      return { ...prevValue, ...data };
    });
    if (
      product &&
      product.imgList &&
      product.imgList.length > 0 &&
      product.sellerId &&
      product.categories &&
      product.categories.length > 0
    ) {
      if (product.type === ProductType.Variable && product.sellerId) {
        nextFn();
      } else if (data.SKU && product.sellerId) {
        setChecking(true);
        let url =
          "/api/products/checkSKU?SKU=" +
          data.SKU +
          "&brandId=" +
          product.sellerId;
        if (product.id) {
          url += "&id=" + encodeURIComponent(product.id);
        }
        fetch(url).then((data) => {
          console.log(data.status);
          if (data.status === 404) {
            setVerified(true);
            setSKUError("");
            nextFn();
          } else {
            setVerified(false);
            setSKUError("SKU Exists");
          }
        });
        setChecking(false);
      } else if (!watchFields.SKU) {
        showErrorDialog(
          "Please input SKU first.",
          "SKU အားဖြည့်စွက်ပေးပါ။",
          locale
        );
      } else if (!product.brandId) {
        showErrorDialog(
          "Please input brand first.",
          "Brand အားဖြည့်စွက်ပေးပါ။",
          locale
        );
      }
    }
  }

  return (
    <>
      <div className="flex flex-col">
        <h3 className="text-sm font-semibold text-gray-500">{t("step")} 1</h3>
        <p className="my-1 text-xl font-bold">{t("information")}</p>
        <span className="mb-10 text-sm">{t("fillInformation")}</span>
        <form
          className="flex flex-col space-y-3"
          onSubmit={handleSubmit(submit)}
        >
          <div className="flex flex-col items-center gap-5">
            {product.imgList && product.imgList.length > 0 ? (
              <div
                className={`grid grid-cols-1 place-items-center items-center gap-5 ${
                  product.imgList.length === 1 ? "" : "lg:grid-cols-2"
                }`}
              >
                <Image
                  src={fileUrl + product.imgList[0]}
                  width={200}
                  height={200}
                  className="h-48 w-48 rounded-md object-contain"
                  alt="prod"
                />
                {product.imgList.length > 1 && (
                  <div className="grid grid-cols-2 place-items-center gap-5">
                    <div
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        changeMainImg(product.imgList[1]);
                      }}
                    >
                      <Image
                        src={fileUrl + product.imgList[1]}
                        width={200}
                        height={200}
                        className="h-24 w-24 rounded-md object-contain"
                        alt="prod1"
                      />
                    </div>
                    {product.imgList[2] && (
                      <div
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          changeMainImg(product.imgList[2]);
                        }}
                      >
                        <Image
                          src={fileUrl + product.imgList[2]}
                          width={100}
                          height={100}
                          className="h-24 w-24 rounded-md object-contain"
                          alt="prod3"
                        />
                      </div>
                    )}
                    {product.imgList[3] && (
                      <div
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          changeMainImg(product.imgList[3]);
                        }}
                      >
                        <Image
                          src={fileUrl + product.imgList[3]}
                          width={100}
                          height={100}
                          className="h-24 w-24 rounded-md object-contain"
                          alt="prod3"
                        />
                      </div>
                    )}
                    {product.imgList[4] && (
                      <div
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          changeMainImg(product.imgList[4]);
                        }}
                      >
                        <Image
                          src={fileUrl + product.imgList[4]}
                          width={100}
                          height={100}
                          className="h-24 w-24 rounded-md object-contain"
                          alt="prod4"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-48 w-48 flex-col items-center justify-center rounded-md bg-gray-200 p-10 text-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-10 w-10"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                  />
                </svg>
              </div>
            )}
            <div className={`relative mt-1 flex flex-row`}>
              <span className="inline-flex divide-x overflow-hidden rounded-md border bg-white shadow-sm">
                <button
                  type="button"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:relative"
                  onClick={() => {
                    if (product.sellerId) {
                      setUploadModalOpen(true);
                    } else {
                      showErrorDialog("Please select seller first.");
                    }
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="mr-3 h-4 w-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                    />
                  </svg>

                  {t("upload")}
                </button>

                <button
                  type="button"
                  className="flex items-center py-2 px-4 text-sm text-gray-700 hover:bg-gray-50 focus:relative"
                  title="Choose"
                  onClick={() => {
                    if (product.sellerId) {
                      setChooseModalOpen(true);
                    } else {
                      showErrorDialog("Please select seller first.");
                    }
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="mr-3 h-4 w-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                    />
                  </svg>

                  {t("choose")}
                </button>
              </span>
            </div>
          </div>
          <div>
            <label className={`text-sm font-medium text-gray-400`}>
              {t("productType")}
              <span className="text-primary">*</span>
            </label>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              {productType.map((elem, index) => (
                <div
                  className={`flex flex-1 cursor-pointer items-start space-x-3 rounded-lg border p-4 px-3 shadow-sm transition-colors hover:bg-primary-focus hover:text-white ${
                    product.type === elem
                      ? "border-primary text-primary ring-1 ring-primary"
                      : "border-gray-200"
                  } `}
                  key={index}
                  onClick={(e) => {
                    if (product.id) {
                      showErrorDialog(
                        "Cannot change product type when update.",
                        t("productType") +
                          "အား ပစ္စည်းပြင်ဆင်သည့်အချိန်တွင် ပြောင်းလဲ၍မရပါ။",
                        locale
                      );
                    } else {
                      setProduct((prevValue: any) => {
                        if (elem === ProductType.Variable) {
                          return {
                            ...prevValue,
                            type: elem,
                            variations: [],
                            attributes: [],
                          };
                        } else {
                          let d = { ...prevValue };
                          if (d.variations) {
                            delete d.variations;
                          }
                          if (d.attributes) {
                            delete d.attributes;
                          }
                          return { ...d, type: elem };
                        }
                      });
                    }
                  }}
                >
                  <label
                    className={`block flex-grow cursor-pointer px-4 text-sm font-medium`}
                  >
                    <span className="whitespace-nowrap"> {t(elem)} </span>
                    <p className="mt-1 text-xs">{t(elem + "desc")}</p>
                  </label>
                  {elem === product.type && (
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

          <FormInput
            label={t("name")}
            placeHolder={t("enter") + " " + t("name")}
            error={errors.name?.message}
            type="text"
            defaultValue={product?.name}
            formControl={{ ...register("name") }}
            currentValue={watchFields.name}
          />

          <FormInput
            label={t("name") + " " + t("mm")}
            placeHolder={t("enter") + " " + t("name") + " " + t("mm")}
            error={errors.nameMM?.message}
            type="text"
            defaultValue={product?.nameMM}
            formControl={{ ...register("nameMM") }}
            currentValue={watchFields.nameMM}
            optional={true}
          />
          {product.type !== ProductType.Variable ? (
            <div className="flex flex-col gap-3">
              <div className="flex flex-row flex-wrap items-center gap-3">
                <FormInput
                  label={t("SKU")}
                  placeHolder={t("enter") + " " + t("SKU")}
                  error={SKUError ? SKUError : errors.SKU?.message}
                  type="text"
                  defaultValue={product?.SKU}
                  formControl={{ ...register("SKU") }}
                  currentValue={watchFields.SKU}
                />
                <button
                  type="button"
                  className={`${
                    SKUError || errors.SKU?.message ? "" : "mt-7"
                  } rounded-md bg-primary px-3 py-2 text-sm text-white hover:bg-primary-focus`}
                  onClick={() => {
                    if (watchFields.SKU && product.sellerId) {
                      setChecking(true);
                      let url =
                        "/api/products/checkSKU?SKU=" +
                        watchFields.SKU +
                        "&brandId=" +
                        product.sellerId;
                      if (product.id) {
                        url += "&id=" + encodeURIComponent(product.id);
                      }
                      fetch(url).then((data) => {
                        if (data.status === 404) {
                          setVerified(true);
                          setSKUError("");
                        } else {
                          setVerified(false);
                          setSKUError("SKU Exists");
                        }
                      });
                      setChecking(false);
                    } else if (!watchFields.SKU) {
                      showErrorDialog(
                        "Please input SKU first.",
                        "SKU အားဖြည့်စွက်ပေးပါ။",
                        locale
                      );
                    } else if (!product.sellerId) {
                      showErrorDialog(
                        "Please input seller first.",
                        "ရောင်းချသူ အားဖြည့်စွက်ပေးပါ။",
                        locale
                      );
                    }
                  }}
                >
                  {isChecking ? (
                    <>
                      <svg
                        role="status"
                        className="mr-3 inline h-4 w-4 animate-spin"
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
                      <span>{"Loading"}</span>
                    </>
                  ) : (
                    <span>Check SKU</span>
                  )}
                </button>
              </div>
              {(product.id && product.SKU === watchFields.SKU) ||
              isVerified === true ? (
                <p className={`text-sm font-medium text-success`}>
                  SKU verified
                </p>
              ) : (
                !SKUError &&
                !errors.SKU?.message && (
                  <p className={`ml-1 text-sm font-medium text-warning`}>
                    SKU is not verified
                  </p>
                )
              )}
            </div>
          ) : (
            <></>
          )}

          {isInternal(session) ? (
            <div>
              <SellerSelectBox
                selected={product?.seller}
                setSelected={(e: User) => {
                  setProduct((prevValue: any) => {
                    return { ...prevValue, seller: e, sellerId: e.id };
                  });
                }}
              />
            </div>
          ) : (
            <></>
          )}

          <div>
            <label className={`text-sm font-medium text-gray-400`}>
              {t("brand")}
              <span className="text-primary">*</span>
            </label>

            <BrandAutoCompleteBox
              setSelected={(e: any) => {
                setProduct((prevValue: any) => {
                  if (e.id) {
                    let d = { ...prevValue };
                    if (d.brandName) {
                      delete d.brandName;
                    }
                    return {
                      ...d,
                      brandId: e.id,
                      Brand: e,
                    };
                  } else {
                    let d = { ...prevValue };
                    if (d.brandId) {
                      delete d.brandId;
                    }
                    return {
                      ...d,
                      Brand: e,
                    };
                  }
                });
              }}
              selected={{ name: product?.Brand?.name, id: product.brandId }}
            />
          </div>

          <div>
            <label className={`text-sm font-medium text-gray-400`}>
              {t("condition")}
              <span className="text-primary">*</span>
            </label>

            <SelectBox
              isSearch={true}
              list={
                conditionData
                  ? conditionData.map((z: Condition) => {
                      return {
                        name: z.name,
                        nameMM: z.nameMM,
                        value: z.id,
                      };
                    })
                  : []
              }
              selected={
                product.Condition
                  ? {
                      name: product?.Condition?.name,
                      value: product?.conditionId,
                      nameMM: product?.Condition?.nameMM,
                    }
                  : undefined
              }
              setSelected={(e: any) => {
                if (e) {
                  setProduct((prevValue: any) => {
                    return { ...prevValue, Condition: e, conditionId: e.value };
                  });
                }
              }}
            />
          </div>

          <div>
            <label className={`text-sm font-medium text-gray-400`}>
              {t("category")}
              <span className="text-primary">*</span>
            </label>

            <button
              type="button"
              className="ml-3 rounded-md bg-primary px-3 py-2 text-sm text-white hover:bg-primary-focus"
              onClick={() => {
                setCategoryModalOpen(true);
              }}
            >
              Choose
            </button>
            {product.categories && (
              <div className="mt-3 flex flex-row items-center gap-3 pb-3 text-sm">
                {product.categories.map((e: Category) => e.name).join(", ")}
              </div>
            )}
          </div>

          <div>
            <label className={`text-sm font-medium text-gray-400`}>
              {t("tags")}
            </label>

            <div className="mt-3 flex flex-row items-center">
              <div className={`relative mt-1`}>
                <input
                  type={"text"}
                  className={`w-full rounded-lg border-gray-200 px-4 py-2 pr-12 text-sm leading-6 shadow-sm`}
                  placeholder={"Enter tag"}
                  ref={tagInput}
                />
              </div>

              <button
                type="button"
                className="ml-3 rounded-md bg-primary px-3 py-2 text-sm text-white hover:bg-primary-focus"
                onClick={() => {
                  if (tagInput.current?.value) {
                    let inputValue = tagInput.current?.value;

                    setProduct((prevValue: any) => {
                      let tag = [];
                      if (prevValue.tags) {
                        tag = prevValue.tags;
                      }
                      if (tag.includes(inputValue)) {
                        return { ...prevValue };
                      } else {
                        tag.push(inputValue);
                        return { ...prevValue, tags: tag };
                      }
                    });
                    tagInput.current.value = "";
                  }
                }}
              >
                Add Tag
              </button>
            </div>

            {product.tags && (
              <div className="mt-3 flex flex-row flex-wrap items-center gap-3">
                {product.tags.map((e: string, index: number) => (
                  <span
                    onClick={() => {
                      setProduct((prevValue: any) => {
                        let tags = prevValue.tags.filter(
                          (a: string) => a !== e
                        );
                        return { ...prevValue, tags: tags };
                      });
                    }}
                    key={index}
                    className="rouunded-md flex flex-row items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-sm"
                  >
                    {e}

                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-4 w-4 cursor-pointer hover:text-primary"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </span>
                ))}
              </div>
            )}
          </div>

          <FormInputRichText
            content={product.shortDescription}
            label={t("shortDescription")}
            disableColor={true}
            setContent={(e: string) => {
              setProduct((prevValue: any) => {
                return { ...prevValue, shortDescription: e };
              });
            }}
          />

          {product.shortDescription && product.shortDescription.length > 0 && (
            <FormInputRichText
              content={product.shortDescriptionMM}
              label={t("shortDescription") + " " + t("mm")}
              disableColor={true}
              setContent={(e: string) => {
                setProduct((prevValue: any) => {
                  return { ...prevValue, shortDescriptionMM: e };
                });
              }}
            />
          )}

          <span className="mt-5 flex justify-end divide-x overflow-hidden">
            <button
              className={`inline-flex items-center gap-3 rounded-md border bg-primary p-3 text-white shadow-sm hover:bg-primary-focus focus:relative`}
              title="Next"
              type="submit"
              ref={infoRef}
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
      <MultiUploadModal
        type={ImgType.Product}
        fileLimit={product.imgList ? 5 - product.imgList.length : 5}
        isModalOpen={uploadModalOpen}
        setModalOpen={setUploadModalOpen}
        sellerId={
          session &&
          (session.role === Role.Seller || session.role === Role.Trader)
            ? session.id
            : product.sellerId
        }
        setFileSrc={(e: string[]) => {
          setProduct((prevValue: any) => {
            let imgList = [];
            if (prevValue.imgList) {
              imgList = prevValue.imgList;
            }
            imgList = [...imgList, ...e];
            if (imgList.length > 5) {
              return { ...prevValue, imgList: imgList.slice(0, 5) };
            }
            return { ...prevValue, imgList: imgList };
          });
        }}
      />
      <MultiGalleryModal
        type={ImgType.Product}
        isModalOpen={chooseModalOpen}
        setModalOpen={setChooseModalOpen}
        fileSrc={product && product.imgList ? product.imgList : []}
        isSeller={true}
        sellerId={
          session &&
          (session.role === Role.Seller || session.role === Role.Trader)
            ? session.id
            : product.sellerId
        }
        setFileSrc={(e: string[]) => {
          setProduct((prevValue: any) => {
            return { ...prevValue, imgList: e };
          });
        }}
      />

      <ProductCategoryModal
        isModalOpen={categoryModalOpen}
        setModalOpen={setCategoryModalOpen}
        chooseCategories={
          product && product.categoryIds ? product.categoryIds : []
        }
        allowChangeParent={product.id ? false : true}
        setChooseCategories={(e: string[], data: any) => {
          setProduct({ ...product, categoryIds: e, categories: data });
        }}
      />
    </>
  );
}

export default InformationSection;
