import Navbar from "@/components/navbar/Navbar";
import nextI18nextConfig from "@/next-i18next.config";
import Head from "next/head";
import React from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { defaultDescription, fileUrl } from "@/types/const";
import { useRouter } from "next/router";
import { formatAmount, getText } from "@/util/textHelper";
import Link from "next/link";
import ProductInfo from "@/components/presentational/ProductInfo";
import { convertMsToTime, getValue } from "@/util/formatter";
import prisma from "@/prisma/prisma";
import {
  Brand,
  Category,
  Condition,
  Product,
  ProductType,
  Review,
  StockType,
  UnitSold,
  User,
} from "@prisma/client";
import Avatar from "@/components/presentational/Avatar";
import { getPricing, getPricingSingle } from "@/util/pricing";
import { RemainingTime } from "@/types/productTypes";
import { useQuery } from "react-query";
import { isBuyer } from "@/util/authHelper";
import { useSession } from "next-auth/react";
import ZoomImage from "@/components/presentational/ZoomImage";
import _ from "lodash";

function MarketplacePage({
  product,
  attributes: parentAttributes,
}: {
  product:
    | any
    | (Product & {
        Brand: Brand;
        Condition: Condition;
        seller: User;
        UnitSold: UnitSold[];
        categories: Category[];
        Review: Review[];
      });
  attributes: any;
}) {
  const [qty, setQty] = React.useState(1);

  const { data: session }: any = useSession();
  const { t } = useTranslation("common");
  const router = useRouter();
  const { locale } = router;
  const { type } = router.query;

  const [pricingInfo, setPricingInfo] = React.useState(getPricing(product));

  const [currentVariation, setCurrentVariation] =
    React.useState<any>(undefined);
  const [attributes, setAttributes] = React.useState<any>([]);

  const [availableVariationList, setAvailableVariationList] = React.useState(
    product && product.type === ProductType.Variable ? product.variations : []
  );
  const [imgList, setImgList] = React.useState(
    product && product.imgList ? [...product.imgList] : []
  );

  const [remainingTime, setRemainingTime] = React.useState<RemainingTime>();
  const { data } = useQuery(["bidAmount", product.id, product.SKU], () =>
    fetch(
      "/api/auction/prod?prodId=" + product.id + "&SKU=" + product.SKU
    ).then((res) => {
      let json = res.json();
      return json;
    })
  );
  const [bidAmount, setBidAmount] = React.useState(0);

  React.useEffect(() => {
    if (product.type === ProductType.Variable) {
      setCurrentVariation(product.variations[0]);
      setAttributes(product.variations[0].attributes);
    } else {
      setCurrentVariation(undefined);
      setAttributes([]);
    }
  }, [product]);

  React.useEffect(() => {
    try {
      fetch("https://api.ipify.org/?format=json")
        .then((data) => data.json())
        .then((json) => {
          fetch(
            "/api/products/clickCount?productId=" +
              product.id.toString() +
              "&ip=" +
              json.ip,
            {
              method: "POST",
            }
          );
        });
    } catch (err) {
      fetch("/api/products/clickCount?productId=" + product.id.toString(), {
        method: "POST",
      });
    }
  }, [product]);

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

  const increaseQty = () => {
    setQty((prevValue) => prevValue + 1);
  };

  const decreaseQty = () => {
    setQty((prevValue) => (prevValue - 1 <= 0 ? prevValue : prevValue - 1));
  };

  React.useEffect(() => {
    if (data?.currentBid) {
      setBidAmount(data?.currentBid + 1000);
    } else {
      setBidAmount(product.openingBid);
    }
  }, [product, data]);

  React.useEffect(() => {
    if (product) {
      const startDate = new Date(product.startTime);
      if (new Date() >= startDate) {
        const intervalId = setInterval(() => {
          if (product.endTime) {
            if (new Date(product.endTime!).valueOf() > new Date().valueOf()) {
              let remainingTime =
                new Date(product.endTime!).valueOf() - new Date().valueOf();
              setRemainingTime(convertMsToTime(remainingTime));
            } else {
              setRemainingTime(undefined);
            }
          }
        }, 1000);

        // clear interval on re-render to avoid memory leaks
        return () => clearInterval(intervalId);
      }
    }
  }, [product]);

  return (
    <div>
      <Head>
        <title>{product.name} | Treasure Rush</title>
        <meta name="description" content={defaultDescription} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="relative max-w-screen-2xl lg:mx-6 px-4 py-8">
        <nav aria-label="Breadcrumb">
          <ol className="flex items-start gap-1 text-sm text-gray-600">
            <li>
              <Link
                href="/marketplace"
                className="text-sm transition group pb-3 hover:pb-0"
              >
                <span className="sr-only"> Marketplace </span>
                <div className="flex flex-row items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                    />
                  </svg>

                  <span className="ml-3">{t("marketplace")}</span>
                </div>
                <div className="group-hover:flex hidden w-1/2 h-[2px] rounded-full bg-current mt-1"></div>
              </Link>
            </li>

            <li className="rtl:rotate-180 pb-3 mt-0.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
            </li>
            {product.categories.map((z, index) => (
              <React.Fragment key={index}>
                <li>
                  <Link
                    href={
                      "/marketplace?categories=" + encodeURIComponent(z.slug)
                    }
                    className="text-sm transition group pb-3 hover:pb-0"
                  >
                    {" "}
                    <span>{getText(z.name, z.nameMM, locale)} </span>
                    <div className="group-hover:flex hidden w-1/2 h-[2px] rounded-full bg-current mt-1"></div>
                  </Link>
                </li>
                {index < product.categories.length - 1 && (
                  <li className="rtl:rotate-180 pb-3 mt-0.5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </li>
                )}
              </React.Fragment>
            ))}
          </ol>
        </nav>
        <section className="grid grid-cols-1 lg:grid-cols-5 place-items-start gap-5 mt-5">
          <div className="flex flex-col gap-4 lg:col-span-2 w-full">
            <div className="flex-grow w-full border rounded-md">
              <ZoomImage src={fileUrl + imgList[0]} alt={product.name} />
            </div>
            <div className="flex flex-row items-center gap-3 overflow-x-auto scrollbar-hide">
              {imgList.slice(1).map((z, index) => (
                <div
                  key={index}
                  className="min-w-[100px] min-h-[100px] w-[100px] h-[100px] max-w-[100px] max-h-[100px] border flex flex-col items-center justify-center rounded-md cursor-pointer"
                  onClick={() => {
                    changeMainImg(z);
                  }}
                >
                  <img src={fileUrl + z} />
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col lg:col-span-2 order-3 lg:order-2 w-full">
            <div className="hidden lg:flex">
              <ProductInfo
                product={product}
                parentAttributes={parentAttributes}
                attributes={attributes}
                setAttributes={setAttributes}
                availableVariationList={availableVariationList}
                setAvailableVariationList={setAvailableVariationList}
              />
            </div>
            <div className="flex flex-col gap-3 mt-10 w-full">
              <nav
                aria-label="Tabs"
                className="flex border-b-2 border-gray-300 text-sm font-medium"
              >
                <a
                  href=""
                  className="-mb-px border-b-2 border-current p-4 text-primary"
                >
                  About Product
                </a>

                <a
                  href=""
                  className="-mb-px border-b-2 border-transparent p-4 hover:text-primary"
                >
                  Reviews
                </a>
              </nav>

              <div className="flex flex-col gap-5 p-3 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <p className="text-gray-500 text-sm">
                    Brand:{" "}
                    <span className="font-semibold text-primaryText">
                      {getText(
                        product.Brand.name,
                        product.Brand.nameMM,
                        locale
                      )}
                    </span>
                  </p>

                  <p className="text-gray-500 text-sm">
                    Condition:{" "}
                    <span className="font-semibold text-primaryText">
                      {getText(
                        product.Condition.name,
                        product.Condition.nameMM,
                        locale
                      )}
                    </span>
                  </p>
                  <p className="text-gray-500 text-sm">
                    Category:{" "}
                    <span className="font-semibold text-primaryText">
                      {product.categories
                        .map((z) => getText(z.name, z.nameMM, locale))
                        .join(", ")}
                    </span>
                  </p>
                  {product.tags.length > 0 && (
                    <p className="text-gray-500 text-sm">
                      Tags:{" "}
                      <span className="font-semibold text-primaryText">
                        {product.tags.join(", ")}
                      </span>
                    </p>
                  )}
                  {product.type === ProductType.Variable && (
                    <p className="text-gray-500 text-sm">
                      Style:{" "}
                      <span className="font-semibold text-primaryText">
                        Style 1
                      </span>
                    </p>
                  )}
                  <p className="text-gray-500 text-sm">
                    SKU:{" "}
                    <span className="font-semibold text-primaryText">
                      {product.type !== ProductType.Variable
                        ? product.SKU
                        : currentVariation
                        ? currentVariation?.SKU
                        : "-"}
                    </span>
                  </p>
                </div>
                <div
                  className="text-sm"
                  dangerouslySetInnerHTML={{
                    __html: getText(
                      product.shortDescription,
                      product.shortDescriptionMM,
                      locale
                    ),
                  }}
                ></div>

                {product.description?.length > 0 && (
                  <div className="flex flex-col gap-3">
                    <h3 className="font-semibold text-sm">
                      Product Description:{" "}
                    </h3>
                    <div
                      className="text-sm"
                      dangerouslySetInnerHTML={{
                        __html: getText(
                          product.description,
                          product.descriptionMM,
                          locale
                        ),
                      }}
                    ></div>
                  </div>
                )}

                {product.additionalInformation?.length > 0 && (
                  <div className="flex flex-col gap-3">
                    <h3 className="font-semibold text-sm">
                      Additional Information:
                    </h3>
                    <div
                      className="text-sm"
                      dangerouslySetInnerHTML={{
                        __html: getText(
                          product.additionalInformation,
                          product.additionalInformationMM,
                          locale
                        ),
                      }}
                    ></div>
                  </div>
                )}

                {product.shippingInformation?.length > 0 && (
                  <div className="flex flex-col gap-3">
                    <h3 className="font-semibold text-sm">
                      Shipping Information:{" "}
                    </h3>
                    <div
                      className="text-sm"
                      dangerouslySetInnerHTML={{
                        __html: getText(
                          product.shippingInformation,
                          product.shippingInformationMM,
                          locale
                        ),
                      }}
                    ></div>
                  </div>
                )}

                <div className="flex flex-col gap-3 pt-5 border-t border-t-gray-500">
                  <h3 className="font-semibold text-sm">
                    Seller Information:{" "}
                  </h3>
                  <div className="flex flex-row items-start gap-3">
                    <Avatar
                      username={product.seller.username}
                      isLarge={true}
                      profile={product.seller.profile}
                    />
                    <div className="flex flex-col gap-1">
                      <h3 className="font-semibold">
                        {product.seller.displayName
                          ? product.seller.displayName
                          : product.seller.username}
                      </h3>
                      <p className="text-xs mb-1 text-gray-500">
                        96.7% Positive Feedback
                      </p>
                      <Link
                        className="group relative inline-flex items-center overflow-hidden rounded bg-primary px-8 py-3 text-white focus:outline-none focus:ring active:bg-primary-focus"
                        href="/shop"
                      >
                        <span className="absolute -end-full transition-all group-hover:end-4">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="w-5 h-5"
                          >
                            <path d="M2.879 7.121A3 3 0 007.5 6.66a2.997 2.997 0 002.5 1.34 2.997 2.997 0 002.5-1.34 3 3 0 104.622-3.78l-.293-.293A2 2 0 0015.415 2H4.585a2 2 0 00-1.414.586l-.292.292a3 3 0 000 4.243zM3 9.032a4.507 4.507 0 004.5-.29A4.48 4.48 0 0010 9.5a4.48 4.48 0 002.5-.758 4.507 4.507 0 004.5.29V16.5h.25a.75.75 0 010 1.5h-4.5a.75.75 0 01-.75-.75v-3.5a.75.75 0 00-.75-.75h-2.5a.75.75 0 00-.75.75v3.5a.75.75 0 01-.75.75h-4.5a.75.75 0 010-1.5H3V9.032z" />
                          </svg>
                        </span>

                        <span className="text-sm font-medium transition-all group-hover:me-4">
                          Visit Store
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full lg:sticky lg:top-36 order-2 lg:order-3">
            <div className="flex lg:hidden">
              <ProductInfo
                product={product}
                parentAttributes={parentAttributes}
                attributes={attributes}
                setAttributes={setAttributes}
                availableVariationList={availableVariationList}
                setAvailableVariationList={setAvailableVariationList}
              />
            </div>
            {product.type === ProductType.Auction ? (
              <div className="bg-primary px-3 py-2 rounded-md flex flex-col items-center justify-between gap-3">
                <h3 className="text-white font-semibold text-center">
                  Bidding ends in
                </h3>
                <div className="grid grid-flow-col gap-5 text-center auto-cols-max place-items-center text-white">
                  {remainingTime?.days > 0 && (
                    <div className="flex flex-col text-gray-200 text-xs items-center">
                      <span className="countdown font-mono text-lg text-white">
                        <span style={getValue(remainingTime?.days)}></span>
                      </span>
                      days
                    </div>
                  )}
                  <div className="flex flex-col text-gray-200 text-xs items-center">
                    <span className="countdown font-mono text-lg text-white">
                      <span style={getValue(remainingTime?.hours)}></span>
                    </span>
                    hours
                  </div>
                  <div className="flex flex-col text-gray-200 text-xs items-center">
                    <span className="countdown font-mono text-lg text-white">
                      <span style={getValue(remainingTime?.minutes)}></span>
                    </span>
                    min
                  </div>
                  <div className="flex flex-col text-gray-200 text-xs items-center">
                    <span className="countdown font-mono text-lg text-white">
                      <span style={getValue(remainingTime?.seconds)}></span>
                    </span>
                    sec
                  </div>
                </div>
                <div className="py-3 border-t border-t-white w-full flex flex-col gap-3">
                  {data?.currentBid === 0 ? (
                    <>
                      <div className="flex flex-row items-center justify-between gap-3">
                        <p className="text-gray-100 text-sm">Opening Bid: </p>
                        <span className="font-semibold text-white">
                          {formatAmount(product.openingBid, locale, true)}
                        </span>
                      </div>
                      {isBuyer(session) && (
                        <div className="flex flex-row items-center justify-between gap-3">
                          <p className="text-gray-100 text-sm">My Bid: </p>
                          <span className="font-semibold text-white">
                            {t("notBid")}
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex flex-row items-center justify-between gap-3">
                        <p className="text-gray-100 text-sm">Highest Bid: </p>
                        <span className="font-semibold text-white">
                          {formatAmount(data?.currentBid, locale, true)}
                        </span>
                      </div>
                      {isBuyer(session) && (
                        <div className="flex flex-row items-center justify-between gap-3">
                          <p className="text-gray-100 text-sm">My Bid: </p>
                          <span className="font-semibold text-white">
                            {data?.myBid > 0
                              ? formatAmount(data?.myBid, locale, true)
                              : t("notBid")}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ) : pricingInfo &&
              pricingInfo.isPromotion === true &&
              product.type === ProductType.Fixed ? (
              <div className="bg-primary px-3 py-2 rounded-md flex flex-row items-center justify-center gap-3">
                <h3 className="text-white font-semibold">
                  {pricingInfo.discount}% OFF
                </h3>
                {pricingInfo.saleEndDate && (
                  <p className="bg-[#ee6069] p-2 rounded-md text-sm text-white">
                    Until{" "}
                    {new Date(pricingInfo.saleEndDate).toLocaleDateString(
                      "en-ca",
                      {
                        year: "numeric",
                        month: "short",
                        day: "2-digit",
                      }
                    )}
                  </p>
                )}
              </div>
            ) : pricingInfo &&
              pricingInfo.isPromotion === true &&
              product.type === ProductType.Variable ? (
              <div className="bg-primary px-3 py-2 rounded-md flex flex-row items-center justify-center gap-3">
                <h3 className="text-white font-semibold">
                  {pricingInfo.discount}% OFF
                </h3>
                {pricingInfo.saleEndDate && (
                  <p className="bg-[#ee6069] p-2 rounded-md text-sm text-white">
                    Until{" "}
                    {new Date(pricingInfo.saleEndDate).toLocaleDateString(
                      "en-ca",
                      {
                        year: "numeric",
                        month: "short",
                        day: "2-digit",
                      }
                    )}
                  </p>
                )}
              </div>
            ) : (
              <></>
            )}

            <div className="bg-white flex flex-col gap-3 p-1 rounded-md border">
              <h3 className="text-sm font-semibold text-center py-3 border-b border-b-gray-500">
                Product Details
              </h3>
              <div className="flex flex-row items-center gap-3 px-3">
                <img
                  alt={product.name}
                  src={fileUrl + imgList[0]}
                  className="aspect-square w-[100px] rounded-xl border min-h-[100px] min-w-[100px] max-h-[100px] max-w-[100px] object-contain"
                />
                <div className="flex flex-col gap-1 text-sm">
                  <p className="text-gray-500">SKU</p>
                  <span className="font-semibold text-primaryText">
                    {product.type !== ProductType.Variable
                      ? product.SKU
                      : currentVariation
                      ? currentVariation?.SKU
                      : "-"}
                  </span>
                </div>
              </div>
              {product.type === ProductType.Auction ? (
                <>
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col items-start justify-between gap-1 px-3 text-sm">
                      <p className="text-gray-500">Bidding starts at</p>
                      <span className="font-semibold text-primaryText">
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
                      </span>
                    </div>
                    <div className="flex flex-col items-start justify-between gap-1 px-3 text-sm">
                      <p className="text-gray-500">Bidding will end at</p>
                      <span className="font-semibold text-primaryText">
                        {new Date(product.endTime).toLocaleDateString("en-ca", {
                          year: "numeric",
                          month: "short",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    {data?.currentBid !== 0 && (
                      <div className="flex flex-col items-start justify-between gap-1 px-3 text-sm">
                        <p className="text-gray-500">Opening bid</p>
                        <span className="font-semibold text-primaryText">
                          {formatAmount(
                            product.openingBid,
                            router.locale,
                            true
                          )}
                        </span>
                      </div>
                    )}
                    <div className="flex flex-col items-start justify-between gap-1 px-3 text-sm">
                      <p className="text-gray-500">Total bids</p>
                      <span className="font-semibold text-primaryText">
                        {formatAmount(data?.totalBids, locale)}
                      </span>
                    </div>

                    {data?.currentBid === 0 ? (
                      <>
                        <div className="flex flex-col items-start justify-between gap-1 px-3 text-sm">
                          <p className="text-gray-500">Opening bid</p>
                          <span className="font-semibold text-primaryText">
                            {formatAmount(product.openingBid, locale, true)}
                          </span>
                        </div>
                        {isBuyer(session) && (
                          <div className="flex flex-col items-start justify-between gap-1 px-3 text-sm">
                            <p className="text-gray-500">My bid</p>
                            <span className="font-semibold text-primaryText">
                              {t("notBid")}
                            </span>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="flex flex-col items-start justify-between gap-1 px-3 text-sm">
                          <p className="text-gray-500">Highest bid</p>
                          <span className="font-semibold text-primaryText">
                            {formatAmount(data?.currentBid, locale, true)}
                          </span>
                        </div>
                        {isBuyer(session) && (
                          <div className="flex flex-col items-start justify-between gap-1 px-3 text-sm">
                            <p className="text-gray-500">
                              My bid{" "}
                              {data?.currentBid === data?.myBid
                                ? "(Currently Leading)"
                                : ""}
                            </p>
                            <span className="font-semibold text-primaryText">
                              {data?.myBid > 0
                                ? formatAmount(data?.myBid, locale, true)
                                : t("notBid")}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <div className="flex flex-row items-center justify-center gap-3">
                    <div className="flex flex-col items-center px-3">
                      <label htmlFor="Quantity" className="sr-only">
                        {" "}
                        Bidding Amount{" "}
                      </label>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          className="w-10 h-10 leading-10 text-gray-600 transition hover:bg-primary rounded-md hover:text-white"
                          onClick={() => {
                            setBidAmount((prevValue) => {
                              if (data?.currentBid) {
                                if (
                                  data?.currentBid + 1000 <
                                  prevValue - 1000
                                ) {
                                  return prevValue - 1000;
                                } else {
                                  return data?.currentBid + 1000;
                                }
                              } else {
                                if (product.openingBid) {
                                  if (product.openingBid < prevValue - 1000) {
                                    return prevValue - 1000;
                                  } else {
                                    return product.openingBid;
                                  }
                                }
                              }
                              return prevValue;
                            });
                          }}
                        >
                          &minus;
                        </button>

                        <input
                          type="number"
                          id="Bidding Amount"
                          value={bidAmount}
                          className="h-10 w-[70%] rounded border-gray-200 text-center [-moz-appearance:_textfield] sm:text-sm [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none"
                          onChange={(e) => {
                            setBidAmount(e.currentTarget.valueAsNumber);
                          }}
                        />

                        <button
                          type="button"
                          className="w-10 h-10 leading-10 text-gray-600 transition hover:bg-primary rounded-md hover:text-white"
                          onClick={() => {
                            setBidAmount((prevValue) => {
                              return prevValue + 1000;
                            });
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row items-center justify-between gap-3 px-3">
                    <a
                      className="group relative inline-flex items-center justify-center overflow-hidden rounded bg-primary px-8 py-3 text-white focus:outline-none focus:ring active:bg-primary flex-grow"
                      href="/download"
                    >
                      <span className="absolute -start-full transition-all group-hover:start-4">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="w-5 h-5"
                        >
                          <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                        </svg>
                      </span>

                      <span className="text-sm font-medium transition-all group-hover:ms-4">
                        Place Bid
                      </span>
                    </a>
                  </div>
                  {/*  <div className="flex flex-col items-center bg-primary justify-center py-3 mx-3 rounded-md">
                    <h3 className="text-white font-semibold text-center">
                      Bidding ends in
                    </h3>
                    <div className="grid grid-flow-col gap-5 text-center auto-cols-max place-items-center text-white">
                      <div className="flex flex-col text-gray-200 text-xs items-center">
                        <span className="countdown font-mono text-lg text-white">
                          <span style={getValue(15)}></span>
                        </span>
                        days
                      </div>
                      <div className="flex flex-col text-gray-200 text-xs items-center">
                        <span className="countdown font-mono text-lg text-white">
                          <span style={getValue(10)}></span>
                        </span>
                        hours
                      </div>
                      <div className="flex flex-col text-gray-200 text-xs items-center">
                        <span className="countdown font-mono text-lg text-white">
                          <span style={getValue(24)}></span>
                        </span>
                        min
                      </div>
                      <div className="flex flex-col text-gray-200 text-xs items-center">
                        <span className="countdown font-mono text-lg text-white">
                          <span style={getValue(49)}></span>
                        </span>
                        sec
                      </div>
                    </div>
                  </div> */}
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-3">
                    {product.type === ProductType.Variable && (
                      <>
                        {currentVariation?.attributes.map((z, index) => (
                          <div
                            className="flex flex-row items-center justify-between gap-3 px-3 text-sm"
                            key={index}
                          >
                            <p className="text-gray-500">
                              {getText(
                                parentAttributes.find(
                                  (b) => b.id === z.attributeId
                                )?.name,
                                parentAttributes.find(
                                  (b) => b.id === z.attributeId
                                )?.nameMM,
                                locale
                              )}
                            </p>
                            <span className="font-semibold text-primaryText">
                              {getText(z.name, z.nameMM)}
                            </span>
                          </div>
                        ))}
                      </>
                    )}
                    <div className="flex flex-row items-center justify-between gap-3 px-3 text-sm">
                      <p className="text-gray-500">Unit Price</p>
                      <span className="font-semibold text-primaryText">
                        {formatAmount(pricingInfo.regularPrice, locale, true)}
                      </span>
                    </div>
                    {pricingInfo.isPromotion === true ? (
                      <>
                        <div className="flex flex-row items-center justify-between gap-3 px-3 text-sm">
                          <p className="text-gray-500">Discount</p>
                          <span className="font-semibold text-primaryText">
                            {formatAmount(
                              pricingInfo.regularPrice - pricingInfo.salePrice,
                              locale,
                              true
                            )}
                          </span>
                        </div>
                        <div className="flex flex-row items-center justify-between gap-3 px-3 text-sm">
                          <p className="text-gray-500">Cost</p>
                          <span className="font-semibold text-primaryText">
                            {formatAmount(pricingInfo.salePrice, locale, true)}
                          </span>
                        </div>
                      </>
                    ) : (
                      <></>
                    )}

                    <div className="flex flex-row items-center justify-between gap-3 px-3 text-sm">
                      <p className="text-gray-500">Stock</p>
                      <span className="font-semibold text-primaryText">
                        {product.type === ProductType.Fixed
                          ? product.stockType === StockType.StockLevel
                            ? product.stockLevel
                            : t(product.stockType)
                          : currentVariation?.stockType === StockType.StockLevel
                          ? currentVariation?.stockLevel
                          : t(currentVariation?.stockType)}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 py-3 border-t border-t-gray-500">
                    <div className="flex flex-row items-center justify-between gap-3 px-3 text-sm">
                      <p className="text-gray-500">Qty: </p>
                      <span className="font-semibold text-primaryText">
                        {qty}
                      </span>
                    </div>
                    <div className="flex flex-row items-center justify-between gap-3 px-3 text-sm">
                      <p className="text-gray-500">Total Price: </p>
                      <span className="font-semibold text-primaryText">
                        {formatAmount(
                          pricingInfo.isPromotion === true
                            ? pricingInfo.salePrice * qty
                            : pricingInfo.regularPrice * qty,
                          locale,
                          true
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-row items-center justify-center gap-3">
                    <div className="flex flex-col items-center px-3">
                      <label htmlFor="Quantity" className="sr-only">
                        {" "}
                        Quantity{" "}
                      </label>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          className="w-10 h-10 leading-10 text-gray-600 transition hover:bg-primary rounded-md hover:text-white"
                          onClick={() => decreaseQty()}
                        >
                          &minus;
                        </button>

                        <input
                          type="number"
                          id="Quantity"
                          value={qty}
                          className="h-10 w-[70%] rounded border-gray-200 text-center [-moz-appearance:_textfield] sm:text-sm [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none"
                          onChange={(e) => {
                            setQty(e.currentTarget.valueAsNumber);
                          }}
                        />

                        <button
                          type="button"
                          className="w-10 h-10 leading-10 text-gray-600 transition hover:bg-primary rounded-md hover:text-white"
                          onClick={() => {
                            increaseQty();
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row items-center justify-between gap-3 px-3">
                    <a
                      className="group relative inline-flex items-center justify-center overflow-hidden rounded bg-primary px-8 py-3 text-white focus:outline-none focus:ring active:bg-primary flex-grow"
                      href="/download"
                    >
                      <span className="absolute -start-full transition-all group-hover:start-4">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            fillRule="evenodd"
                            d="M6 5v1H4.667a1.75 1.75 0 00-1.743 1.598l-.826 9.5A1.75 1.75 0 003.84 19H16.16a1.75 1.75 0 001.743-1.902l-.826-9.5A1.75 1.75 0 0015.333 6H14V5a4 4 0 00-8 0zm4-2.5A2.5 2.5 0 007.5 5v1h5V5A2.5 2.5 0 0010 2.5zM7.5 10a2.5 2.5 0 005 0V8.75a.75.75 0 011.5 0V10a4 4 0 01-8 0V8.75a.75.75 0 011.5 0V10z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>

                      <span className="text-sm font-medium transition-all group-hover:ms-4">
                        Add to Cart
                      </span>
                    </a>
                  </div>
                </>
              )}

              <div className="py-3 border-t flex flex-row items-center px-3 justify-between gap-3">
                <span className="flex flex-row items-center gap-1 text-primary group cursor-pointer">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                    />
                  </svg>
                  <span className="text-xs group-hover:border-b group-hover:border-b-current">
                    Add to wishlist
                  </span>
                </span>
                <span className="flex flex-row items-center gap-1 text-primary group cursor-pointer">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path d="M13 4.5a2.5 2.5 0 11.702 1.737L6.97 9.604a2.518 2.518 0 010 .792l6.733 3.367a2.5 2.5 0 11-.671 1.341l-6.733-3.367a2.5 2.5 0 110-3.475l6.733-3.366A2.52 2.52 0 0113 4.5z" />
                  </svg>

                  <span className="text-xs group-hover:border-b group-hover:border-b-current">
                    Share
                  </span>
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-500 flex gap-0.5 flex-wrap items-center justify-center">
              Any problem with this product?{" "}
              <span className="flex flex-row items-center gap-0.5 cursor-pointer text-primary hover:border-b hover:border-b-current">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-3 h-3"
                >
                  <path d="M3.5 2.75a.75.75 0 00-1.5 0v14.5a.75.75 0 001.5 0v-4.392l1.657-.348a6.449 6.449 0 014.271.572 7.948 7.948 0 005.965.524l2.078-.64A.75.75 0 0018 12.25v-8.5a.75.75 0 00-.904-.734l-2.38.501a7.25 7.25 0 01-4.186-.363l-.502-.2a8.75 8.75 0 00-5.053-.439l-1.475.31V2.75z" />
                </svg>
                <span className="text-xs font-medium transition-all">
                  Report
                </span>
              </span>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export async function getServerSideProps({ locale, params }: any) {
  const product = await prisma.product.findFirst({
    where: { slug: decodeURIComponent(params.slug) },
    include: {
      Condition: true,
      Brand: true,
      categories: true,
      seller: true,
      UnitSold: true,
      Review: true,
    },
  });
  const attributes = await prisma.attribute.findMany({
    include: {
      Term: true,
    },
  });

  return {
    props: {
      product: JSON.parse(JSON.stringify(product)),
      attributes: JSON.parse(JSON.stringify(attributes)),
      ...(await serverSideTranslations(locale, ["common"], nextI18nextConfig)),
    },
  };
}

export default MarketplacePage;
