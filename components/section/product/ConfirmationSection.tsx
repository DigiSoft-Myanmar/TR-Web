import Map from "@/components/card/Map";
import { useProduct } from "@/context/ProductContext";
import { fileUrl } from "@/types/const";
import { getHeaders } from "@/util/authHelper";
import { getPricing, getPricingSingle } from "@/util/pricing";
import {
  showErrorDialog,
  showSuccessDialog,
  showUnauthorizedDialog,
} from "@/util/swalFunction";
import { formatAmount, getText } from "@/util/textHelper";
import {
  AttrType,
  Category,
  ProductType,
  State,
  StockType,
} from "@prisma/client";
import _ from "lodash";
import { useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useRef } from "react";
import { useForm } from "react-hook-form";

type Props = {
  backFn: Function;
  currentStep: number;
  isDisable?: boolean;
};

enum Details {
  Details,
  Additional,
  Shipping,
}

function ConfirmationSection({ backFn, currentStep, isDisable }: Props) {
  const { t } = useTranslation("common");
  const { product } = useProduct();
  const router = useRouter();
  const { data: session }: any = useSession();
  const { locale } = router;
  const [isSubmit, setSubmit] = React.useState(false);

  const [currentVariation, setCurrentVariation] = React.useState(
    product.type !== ProductType.Variable ? undefined : product.variations[0]
  );
  const [attributes, setAttributes] = React.useState<any>(
    product.type !== ProductType.Variable
      ? []
      : product.variations[0].attributes
  );

  const [pricingInfo, setPricingInfo] = React.useState(getPricing(product));
  const descriptionElement = useRef<HTMLDivElement | null>(null);
  const shortDescriptionElement = useRef<HTMLDivElement | null>(null);
  const shippingInfoElement = useRef<HTMLDivElement | null>(null);
  const additionalInfoElement = useRef<HTMLDivElement | null>(null);

  const [availableVariationList, setAvailableVariationList] = React.useState(
    product && product.type === ProductType.Variable ? product.variations : []
  );
  const [imgList, setImgList] = React.useState(
    product && product.imgList ? [...product.imgList] : []
  );

  React.useEffect(() => {
    let availableVariations: any = [];
    if (product.type === ProductType.Variable) {
      for (let i = 0; i < product.variations.length; i++) {
        let variationAttributes = _.sortBy(
          product.variations[i].attributes,
          (o) => o.attributeId
        );
        let currentAttributes = _.sortBy(attributes, (o) => o.attributeId);
        let exists = true;
        for (let j = 0; j < currentAttributes.length && exists === true; j++) {
          let c = currentAttributes[j];
          if (
            variationAttributes.find(
              (a) =>
                a.attributeId === c.attributeId &&
                (a.name === c.name || a.name === "Any")
            )
          ) {
          } else {
            exists = false;
          }
        }
        if (exists === true) {
          availableVariations.push(product.variations[i]);
        }
      }
    }
    setAvailableVariationList(availableVariations);
  }, [attributes, product.variations]);

  function changeMainImg(img: string) {
    let list = product && imgList ? [...imgList] : [];
    let index = list.findIndex((e: string) => e === img);
    let tempImg = list[0];
    list[0] = img;
    list[index] = tempImg;
    setImgList(list);
  }

  React.useEffect(() => {
    if (
      attributes &&
      attributes.length > 0 &&
      product.type === ProductType.Variable
    ) {
      let variation = product.variations.find((e: any) =>
        _.isEqual(
          _.sortBy(e.attributes, (o) => o.attributeId),
          _.sortBy(attributes, (o) => o.attributeId)
        )
      );

      if (variation) {
        setCurrentVariation(variation);
        setPricingInfo(getPricingSingle(variation));
        if (variation.img) {
          changeMainImg(variation.img);
        }
      } else {
        let allAnyIndex = product.variations.findIndex((e: any) =>
          e.attributes.every((z: any) => z.name === "Any")
        );
        let variations = [...product.variations];
        if (allAnyIndex >= 0) {
          variations.splice(allAnyIndex, 1);
        }
        let v = undefined;
        for (let i = 0; i < variations.length && v === undefined; i++) {
          let otherAttribute = variations[i].attributes.filter(
            (e: any) => e.name !== "Any"
          );
          let attr = attributes.filter((e: any) =>
            otherAttribute.find((o: any) => o.attributeId === e.attributeId)
          );
          let isEqual = _.isEqual(
            _.sortBy(otherAttribute, (o) => o.attributeId),
            _.sortBy(attr, (o) => o.attributeId)
          );
          if (isEqual === true) {
            v = variations[i];
          } else {
            v = undefined;
          }
        }
        if (v) {
          if (v.img) {
            changeMainImg(v.img);
          }
          setCurrentVariation(v);

          setPricingInfo(getPricingSingle(v));
        } else if (allAnyIndex >= 0) {
          setCurrentVariation(product.variations[allAnyIndex]);
          setPricingInfo(getPricingSingle(product.variations[allAnyIndex]));
          if (product.variations[allAnyIndex].img) {
            changeMainImg(product.variations[allAnyIndex].img);
          }
        } else {
          setCurrentVariation(undefined);
          setPricingInfo(undefined);
        }
      }
    }
  }, [attributes, product.variations]);

  React.useEffect(() => {
    if (shortDescriptionElement.current) {
      let parser = new DOMParser();
      let shortDescriptionContent = parser.parseFromString(
        getText(product.shortDescription, product.shortDescriptionMM, locale),
        "text/html"
      );
      shortDescriptionElement.current.innerHTML = "";
      shortDescriptionElement.current.appendChild(shortDescriptionContent.body);
    }
  }, [shortDescriptionElement.current]);

  React.useEffect(() => {
    if (descriptionElement.current) {
      let parser = new DOMParser();
      let descriptionContent = parser.parseFromString(
        getText(product.description, product.descriptionMM, locale),
        "text/html"
      );
      descriptionElement.current.innerHTML = "";
      descriptionElement.current.appendChild(descriptionContent.body);
    }
  }, [descriptionElement.current]);

  React.useEffect(() => {
    if (shippingInfoElement.current) {
      let parser = new DOMParser();
      let shippingContent = parser.parseFromString(
        getText(
          product.shippingInformation,
          product.shippingInformationMM,
          locale
        ),
        "text/html"
      );
      shippingInfoElement.current.innerHTML = "";
      shippingInfoElement.current.appendChild(shippingContent.body);
    }
  }, [shippingInfoElement.current]);

  React.useEffect(() => {
    if (additionalInfoElement.current) {
      let parser = new DOMParser();

      let additionalContent = parser.parseFromString(
        getText(
          product.additionalInformation,
          product.additionalInformationMM,
          locale
        ),
        "text/html"
      );
      additionalInfoElement.current.innerHTML = "";
      additionalInfoElement.current.appendChild(additionalContent.body);
    }
  }, [additionalInfoElement.current]);

  return (
    <div className="flex flex-col">
      {isDisable === true ? (
        <></>
      ) : (
        <>
          <h3 className="text-sm font-semibold text-gray-500">
            {t("step")} {currentStep}
          </h3>
          <p className="my-1 text-xl font-bold">{t("confirmation")}</p>
          <span className="mb-10 text-sm">{t("fillConfirmation")}</span>
        </>
      )}
      <form
        className="flex flex-col space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmit(true);
          let p = { ...product };
          if (product.state) {
            delete p.state;
          }
          if (product.stateId) {
            delete p.stateId;
          }
          if (product.type === ProductType.Fixed) {
            if (
              product.saleStartDate &&
              typeof product.saleStartDate === "string"
            ) {
              p.saleStartDate = new Date(p.saleStartDate);
            }
            if (
              product.saleEndDate &&
              typeof product.saleEndDate === "string"
            ) {
              p.saleEndDate = new Date(p.saleEndDate);
            }
          } else {
            if (product.variations)
              for (let i = 0; i < product.variations.length; i++) {
                if (
                  product.variations[i].saleStartDate &&
                  typeof product.variations[i].saleStartDate === "string"
                ) {
                  p.variations[i].saleStartDate = new Date(
                    p.variations[i].saleStartDate
                  );
                }
                if (
                  product.variations[i].saleEndDate &&
                  typeof product.variations[i].saleEndDate === "string"
                ) {
                  p.variations[i].saleEndDate = new Date(
                    p.variations[i].saleEndDate
                  );
                }
              }
          }

          if (product.id) {
            if (getHeaders(session)) {
              fetch("/api/products?id=" + encodeURIComponent(product.id), {
                method: "PUT",
                body: JSON.stringify(p),
                headers: getHeaders(session),
              }).then(async (data) => {
                setSubmit(false);
                if (data.status === 200) {
                  showSuccessDialog(
                    t("submit") + " " + t("success"),
                    "",
                    router.locale,
                    () => {
                      router.push("/products");
                    }
                  );
                } else {
                  let json = await data.json();
                  if (data.status === 413) {
                    showErrorDialog(t("fileTooLarge"));
                  } else {
                    showErrorDialog(t("somethingWentWrong"), "", router.locale);
                  }
                }
              });
            } else {
              showUnauthorizedDialog(locale, () => {
                router.push("/login");
              });
            }
          } else {
            if (getHeaders(session)) {
              fetch("/api/products/", {
                method: "POST",
                body: JSON.stringify(p),
                headers: getHeaders(session),
              }).then(async (data) => {
                setSubmit(false);
                if (data.status === 200) {
                  showSuccessDialog(
                    t("submit") + " " + t("success"),
                    "",
                    router.locale,
                    () => {
                      router.push("/products");
                    }
                  );
                } else {
                  let json = await data.json();
                  if (data.status === 413) {
                    showErrorDialog(t("fileTooLarge"));
                  } else {
                    showErrorDialog(t("somethingWentWrong"), "", router.locale);
                  }
                }
              });
            } else {
              showUnauthorizedDialog(locale, () => {
                router.push("/login");
              });
            }
          }
        }}
      >
        <div className="relative max-w-screen-xl py-8 px-10">
          <section>
            <div className="relative mx-auto max-w-screen-xl py-8">
              <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-2">
                <div className="flex flex-row items-start gap-4">
                  {imgList.length > 0 && (
                    <div className="grid grid-cols-1 gap-4 lg:mt-4">
                      {imgList[1] && (
                        <img
                          alt={product.name}
                          src={fileUrl + imgList[1]}
                          className="aspect-square w-[200px] rounded-xl object-cover"
                          onClick={() => {
                            changeMainImg(imgList[1]);
                          }}
                        />
                      )}

                      {imgList[2] && (
                        <img
                          alt={product.name}
                          src={fileUrl + imgList[2]}
                          className="aspect-square w-[200px] rounded-xl object-cover"
                          onClick={() => {
                            changeMainImg(imgList[2]);
                          }}
                        />
                      )}

                      {imgList[3] && (
                        <img
                          alt={product.name}
                          src={fileUrl + imgList[3]}
                          className="aspect-square w-[200px] rounded-xl object-cover"
                          onClick={() => {
                            changeMainImg(imgList[3]);
                          }}
                        />
                      )}

                      {imgList[4] && (
                        <img
                          alt={product.name}
                          src={fileUrl + imgList[4]}
                          className="aspect-square w-[200px] rounded-xl object-cover"
                          onClick={() => {
                            changeMainImg(imgList[4]);
                          }}
                        />
                      )}
                    </div>
                  )}
                  <img
                    alt={product.name}
                    src={fileUrl + imgList[0]}
                    className="aspect-square w-full flex-grow rounded-xl object-cover"
                  />
                </div>

                <div className="sticky top-0 flex flex-row flex-wrap gap-3">
                  {product.categories?.map((e: Category, index: number) => (
                    <strong
                      className="rounded-full border border-primary bg-gray-100 px-3 py-0.5 text-xs font-medium tracking-wide text-primary"
                      key={index}
                    >
                      <Link href={"/marketplace?categories=" + e.slug}>
                        {getText(e.name, e.nameMM, locale)}
                      </Link>
                    </strong>
                  ))}

                  <div className="mt-2 flex justify-between">
                    <div>
                      <p className="mt-0.5 text-sm font-semibold text-primary">
                        {product.brand?.brandName}
                      </p>
                      <h1 className="text-3xl font-bold">
                        {getText(product.name, product.nameMM, locale)}
                      </h1>

                      {((product.tags && product.tags.length > 0) ||
                        (product.state && product.state.length > 0)) && (
                        <div className="mt-2 flex w-full flex-row flex-wrap gap-2 text-sm font-semibold text-gray-400">
                          {product?.tags?.map((e: string, index: number) => (
                            <Link href={"/marketplace?tag=" + e} key={index}>
                              {"# " + e}
                            </Link>
                          ))}
                          {product?.state?.map((e: State, index: number) => (
                            <Link
                              href={
                                "/marketplace?state=" +
                                encodeURIComponent(e.name)
                              }
                              key={index}
                            >
                              {"# " + getText(e.name, e.nameMM, locale)}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {product.shortDescription && (
                    <div
                      className="my-3 flex flex-wrap gap-5"
                      ref={shortDescriptionElement}
                    ></div>
                  )}

                  {product.type === ProductType.Variable && (
                    <div className="mt-8">
                      {product.type === ProductType.Variable &&
                        product.attributes &&
                        product.attributes.length > 0 &&
                        product.attributes?.map((elem: any, index: number) => (
                          <fieldset className="mt-4" key={index}>
                            <legend className="mb-1 text-sm font-medium">
                              {locale === "mm" &&
                              elem.nameMM &&
                              elem.nameMM.length > 0
                                ? elem.nameMM
                                : elem.name}
                            </legend>
                            <div className="flex flex-wrap gap-2">
                              {elem.Term && elem.Term.length > 0 ? (
                                elem.Term.sort((a: any, b: any) => {
                                  const nameA = a.name.toUpperCase(); // ignore upper and lowercase
                                  const nameB = b.name.toUpperCase(); // ignore upper and lowercase
                                  if (nameA < nameB) {
                                    return -1;
                                  }
                                  if (nameA > nameB) {
                                    return 1;
                                  }

                                  // names must be equal
                                  return 0;
                                })?.map((el: any, termIndex: number) => (
                                  <div
                                    key={termIndex}
                                    className={`flex cursor-pointer items-center space-x-3 rounded-lg border px-1 shadow-sm transition-colors ${
                                      attributes && attributes.length > 0
                                        ? attributes.find(
                                            (e: any) =>
                                              e.attributeId === el.attributeId
                                          )
                                          ? attributes.find(
                                              (e: any) =>
                                                e.name === el.name &&
                                                e.attributeId === el.attributeId
                                            )
                                            ? "border-primary bg-primary text-white"
                                            : "bg-gray-200"
                                          : availableVariationList.find(
                                              (z: any) =>
                                                z.attributes.find(
                                                  (a: any) =>
                                                    a.attributeId ===
                                                      el.attributeId &&
                                                    (a.name === el.name ||
                                                      a.name === "Any")
                                                )
                                            )
                                          ? "bg-white hover:bg-primary hover:text-white"
                                          : "bg-gray-200"
                                        : "bg-white hover:bg-slate-300 hover:text-primary"
                                    } `}
                                    onClick={(e) => {
                                      let attr: any = [];

                                      if (attributes) {
                                        attr = [...attributes];
                                      }

                                      if (
                                        attr.length ===
                                        product.attributes.length
                                      ) {
                                        attr = [];
                                        attr.push(el);
                                        setAttributes(attr);
                                      } else {
                                        if (
                                          availableVariationList.find(
                                            (z: any) =>
                                              z.attributes.find(
                                                (a: any) =>
                                                  a.attributeId ===
                                                    el.attributeId &&
                                                  (a.name === el.name ||
                                                    a.name === "Any")
                                              )
                                          ) ||
                                          attr.find(
                                            (a: any) =>
                                              a.attributeId === el.attributeId
                                          )
                                        ) {
                                          if (
                                            attr.find(
                                              (a: any) =>
                                                a.attributeId === el.attributeId
                                            )
                                          ) {
                                            attr = attr.filter(
                                              (a: any) =>
                                                a.attributeId !== el.attributeId
                                            );
                                            attr.push(el);
                                          } else {
                                            attr.push(el);
                                          }
                                          setAttributes(attr);
                                        }
                                      }
                                    }}
                                  >
                                    {elem.type === AttrType.Color ? (
                                      <div
                                        className="h-5 w-5 rounded-md shadow-md"
                                        style={{
                                          backgroundColor: el.value,
                                        }}
                                      ></div>
                                    ) : (
                                      elem.type === AttrType.Image && (
                                        <div className="h-5 w-5 rounded-md shadow-md">
                                          <img
                                            src={"/api/files/" + el.value}
                                            className="object-cover"
                                          />
                                        </div>
                                      )
                                    )}
                                    <label
                                      className={`block flex-grow cursor-pointer p-2 text-sm font-medium`}
                                    >
                                      <span className="whitespace-nowrap">
                                        {locale === "mm" ? el.nameMM : el.name}
                                      </span>
                                    </label>
                                  </div>
                                ))
                              ) : (
                                <p>{t("noData")}</p>
                              )}
                            </div>
                          </fieldset>
                        ))}
                    </div>
                  )}

                  {product.type === ProductType.Auction ? (
                    <>
                      <div className="flex flex-col gap-1 mt-5">
                        <h3 className="text-sm font-semibold">
                          {t("openingBid")}
                        </h3>
                        <p>{formatAmount(product.openingBid, locale, true)}</p>
                      </div>
                      <div className="flex flex-col gap-1 mt-3">
                        <h3 className="text-sm font-semibold">
                          {t("estimatedPrice")}
                        </h3>
                        <p>
                          {formatAmount(product.estimatedPrice, locale, true)}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1 mt-3">
                        <h3 className="text-sm font-semibold">
                          {t("startTime")}
                        </h3>
                        <p>
                          {new Date(product.startTime).toLocaleDateString(
                            "en-ca",
                            {
                              year: "numeric",
                              month: "short",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1 mt-3">
                        <h3 className="text-sm font-semibold">
                          {t("endTime")}
                        </h3>
                        <p>
                          {new Date(product.endTime).toLocaleDateString(
                            "en-ca",
                            {
                              year: "numeric",
                              month: "short",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      {pricingInfo ? (
                        <div className="mt-5 flex items-center gap-3">
                          {pricingInfo.isPromotion === false ? (
                            <p className="font-semibold">
                              {formatAmount(
                                pricingInfo.regularPrice,
                                locale,
                                true
                              )}
                            </p>
                          ) : (
                            <p className="font-semibold">
                              {formatAmount(
                                pricingInfo.saleAmount,
                                locale,
                                true
                              )}{" "}
                              <span className="text-xs line-through">
                                {formatAmount(
                                  pricingInfo.regularPrice,
                                  locale,
                                  true
                                )}
                              </span>
                            </p>
                          )}
                          <strong className="rounded-md border border-primary bg-primary/10 px-3 py-2 text-xs font-medium tracking-wide text-primary">
                            {product.type === ProductType.Fixed
                              ? product.stockType === StockType.StockLevel
                                ? product.stockLevel === 0
                                  ? t("OutOfStock")
                                  : t("InStock") + " | " + product.stockLevel
                                : t(product.stockType)
                              : currentVariation.stockType ===
                                StockType.StockLevel
                              ? currentVariation.stockLevel === 0
                                ? t("OutOfStock")
                                : t("InStock") +
                                  " | " +
                                  currentVariation.stockLevel
                              : t(currentVariation.stockType)}
                          </strong>
                        </div>
                      ) : (
                        product.type === ProductType.Variable && (
                          <h3 className="mt-5 text-xs font-semibold leading-6">
                            {t("chooseAttributes")}
                          </h3>
                        )
                      )}
                    </>
                  )}
                  <div className="my-5 flex flex-col space-y-3">
                    {product.description && (
                      <details
                        className="group flex flex-col gap-5 rounded-md border"
                        open
                      >
                        <summary className="flex cursor-pointer items-center bg-[#F3F7FA]  px-5 py-3 font-semibold">
                          <h3 className="flex-grow text-sm font-semibold text-gray-800">
                            Description
                          </h3>
                          <svg
                            className="ml-1.5 h-5 w-5 flex-shrink-0 transition duration-300 group-open:-rotate-180"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </summary>
                        <div
                          className="flex flex-wrap gap-5 px-5 py-3"
                          ref={descriptionElement}
                        ></div>
                      </details>
                    )}
                    {product.additionalInformation && (
                      <details className="group flex flex-col gap-5 rounded-md border">
                        <summary className="flex cursor-pointer items-center bg-[#F3F7FA]  px-5 py-3 font-semibold">
                          <h3 className="flex-grow text-sm font-semibold text-gray-800">
                            Additional Information
                          </h3>
                          <svg
                            className="ml-1.5 h-5 w-5 flex-shrink-0 transition duration-300 group-open:-rotate-180"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </summary>
                        <div
                          className="flex flex-wrap gap-5 px-5 py-3"
                          ref={additionalInfoElement}
                        ></div>
                      </details>
                    )}
                    {product.shippingInformation && (
                      <details className="group flex flex-col gap-5 rounded-md border">
                        <summary className="flex cursor-pointer items-center bg-[#F3F7FA]  px-5 py-3 font-semibold">
                          <h3 className="flex-grow text-sm font-semibold text-gray-800">
                            Shipping Information
                          </h3>
                          <svg
                            className="ml-1.5 h-5 w-5 flex-shrink-0 transition duration-300 group-open:-rotate-180"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </summary>
                        <div
                          className="flex flex-wrap gap-5 px-5 py-3"
                          ref={shippingInfoElement}
                        ></div>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
        {isDisable === true ? (
          <></>
        ) : (
          <>
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
                disabled={isSubmit}
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
                    <span className="ml-1 text-sm font-semibold">
                      Loading...
                    </span>
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
          </>
        )}
      </form>
    </div>
  );
}

export default ConfirmationSection;
