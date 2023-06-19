import { Ads, AdsPlacement } from "@prisma/client";
import React, { DetailedReactHTMLElement } from "react";
import AdsList from "../presentational/AdsList";
import AdsDetailList from "../presentational/AdsDetailList";
import { AdsLocation, AdsPage } from "@/util/adsHelper";

function AdsPlacementScreen({
  data,
  onBackPress,
}: {
  data: Ads[];
  onBackPress: Function;
}) {
  const [adsLocation, setAdsLocation] = React.useState<any>();
  const [page, setPage] = React.useState<string>(AdsPage.Home);

  const [usage, setUsage] = React.useState([
    {
      title: AdsPage.Home,
      placement: [
        { title: AdsLocation.HomeAds1, ads: [] },
        { title: AdsLocation.HomeAds21, ads: [] },
        { title: AdsLocation.HomeAds22, ads: [] },
        { title: AdsLocation.HomeAds31, ads: [] },
        { title: AdsLocation.HomeAds32, ads: [] },
        { title: AdsLocation.HomeAds33, ads: [] },
        { title: AdsLocation.HomeAds34, ads: [] },
        { title: AdsLocation.HomeAds41, ads: [] },
        { title: AdsLocation.HomeAds42, ads: [] },
        { title: AdsLocation.HomeAds43, ads: [] },
        { title: AdsLocation.HomeAds44, ads: [] },
      ],
    },
    {
      title: AdsPage.Product,
      placement: [
        {
          title: AdsLocation.ProductAds11,
          ads: [],
        },
        {
          title: AdsLocation.ProductAds12,
          ads: [],
        },
        {
          title: AdsLocation.ProductAds21,
          ads: [],
        },
        {
          title: AdsLocation.ProductAds22,
          ads: [],
        },
        {
          title: AdsLocation.ProductAds23,
          ads: [],
        },
        {
          title: AdsLocation.ProductAds24,
          ads: [],
        },
      ],
    },
    {
      title: AdsPage.Marketplace,
      placement: [
        {
          title: AdsLocation.Marketplace1,
          ads: [],
        },
        {
          title: AdsLocation.Marketplace21,
          ads: [],
        },
        {
          title: AdsLocation.Marketplace22,
          ads: [],
        },
        {
          title: AdsLocation.Marketplace23,
          ads: [],
        },
        {
          title: AdsLocation.Marketplace24,
          ads: [],
        },
      ],
    },
    {
      title: AdsPage.Membership,
      placement: [
        {
          title: AdsLocation.Memberships1,
          ads: [],
        },
      ],
    },
  ]);

  return (
    <div className="flex flex-col lg:flex-row bg-white h-[85vh] max-h-[85vh]">
      <div className="lg:min-w-[75%] lg:max-w-[75%] lg:order-1 px-5 py-3 bg-gray-200 lg:max-h-[85vh] overflow-y-auto">
        <h3 className="font-semibold text-sm py-3 border-b">
          Going to Expired
        </h3>
        <div className="bg-white h-32"></div>
        <div className="flex flex-col bg-gray-200 sticky -top-4 py-3">
          <h3 className="font-semibold text-sm py-3">Ads Placement</h3>
          <div className="flex flex-row items-center overflow-x-auto bg-darkShade rounded-md px-3 py-2 scrollbar-hide">
            {Object.values(AdsPage).map((z, index) => (
              <div
                className={
                  page === z
                    ? "text-xs font-semibold flex flex-row items-center mr-3 bg-primary text-white rounded-md px-3 py-1"
                    : "text-xs flex flex-row items-center mr-3 text-gray-300 cursor-pointer"
                }
                key={index}
                onClick={() => {
                  setPage(z);
                }}
              >
                <span className="pr-1 whitespace-nowrap">{z}</span>{" "}
                <span
                  className={`pl-1 ${
                    page === z
                      ? "bg-white text-primaryText"
                      : "bg-gray-700 text-white"
                  } rounded-full p-1`}
                >
                  10
                </span>
              </div>
            ))}
          </div>
        </div>
        {page === AdsPage.Home ? (
          <div
            role="status"
            className="space-y-8 flex flex-col md:items-center p-5 bg-white mt-5"
          >
            <div className="w-full">
              <div className="h-2.5 bg-gray-200 rounded-full w-48 mb-4"></div>
              <div className="h-2 bg-gray-200 rounded-full max-w-[480px] mb-2.5"></div>
              <div className="h-2 bg-gray-200 rounded-full mb-2.5"></div>
              <div className="h-2 bg-gray-200 rounded-full max-w-[440px] mb-2.5"></div>
            </div>
            <div
              className={`my-3 flex justify-center items-center w-full h-20 ${
                adsLocation === AdsLocation.HomeAds1
                  ? "bg-primary"
                  : "bg-gray-300 "
              } rounded text-gray-200 hover:bg-primary hover:text-white cursor-pointer`}
              onClick={(e) => {
                setAdsLocation(AdsLocation.HomeAds1);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-12 h-12"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="w-full">
              <div className="h-2.5 bg-gray-200 rounded-full w-48 mb-4"></div>
              <div className="h-2 bg-gray-200 rounded-full max-w-[480px] mb-2.5"></div>
              <div className="h-2 bg-gray-200 rounded-full mb-2.5"></div>
              <div className="h-2 bg-gray-200 rounded-full max-w-[440px] mb-2.5"></div>
            </div>
            <div className="flex w-full space-x-3">
              <div
                className={`my-3 flex justify-center items-center w-full h-20 ${
                  adsLocation === AdsLocation.HomeAds21
                    ? "bg-primary"
                    : "bg-gray-300 "
                } rounded text-gray-200 hover:bg-primary hover:text-white cursor-pointer`}
                onClick={(e) => {
                  setAdsLocation(AdsLocation.HomeAds21);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-12 h-12 text-gray-200"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div
                className={`my-3 flex justify-center items-center w-full h-20 ${
                  adsLocation === AdsLocation.HomeAds22
                    ? "bg-primary"
                    : "bg-gray-300 "
                } rounded text-gray-200 hover:bg-primary hover:text-white cursor-pointer`}
                onClick={(e) => {
                  setAdsLocation(AdsLocation.HomeAds22);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-12 h-12 text-gray-200"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <div className="w-full">
              <div className="h-2.5 bg-gray-200 rounded-full w-48 mb-4"></div>
              <div className="h-2 bg-gray-200 rounded-full max-w-[480px] mb-2.5"></div>
              <div className="h-2 bg-gray-200 rounded-full mb-2.5"></div>
              <div className="h-2 bg-gray-200 rounded-full max-w-[440px] mb-2.5"></div>
            </div>
            <div className="flex w-full space-x-3">
              <div
                className={`my-3 flex justify-center items-center w-full h-20 ${
                  adsLocation === AdsLocation.HomeAds31
                    ? "bg-primary"
                    : "bg-gray-300 "
                } rounded text-gray-200 hover:bg-primary hover:text-white cursor-pointer`}
                onClick={(e) => {
                  setAdsLocation(AdsLocation.HomeAds31);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-12 h-12 text-gray-200"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div
                className={`my-3 flex justify-center items-center w-full h-20 ${
                  adsLocation === AdsLocation.HomeAds32
                    ? "bg-primary"
                    : "bg-gray-300 "
                } rounded text-gray-200 hover:bg-primary hover:text-white cursor-pointer`}
                onClick={(e) => {
                  setAdsLocation(AdsLocation.HomeAds32);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-12 h-12 text-gray-200"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div
                className={`my-3 flex justify-center items-center w-full h-20 ${
                  adsLocation === AdsLocation.HomeAds33
                    ? "bg-primary"
                    : "bg-gray-300 "
                } rounded text-gray-200 hover:bg-primary hover:text-white cursor-pointer`}
                onClick={(e) => {
                  setAdsLocation(AdsLocation.HomeAds33);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-12 h-12 text-gray-200"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div
                className={`my-3 flex justify-center items-center w-full h-20 ${
                  adsLocation === AdsLocation.HomeAds34
                    ? "bg-primary"
                    : "bg-gray-300 "
                } rounded text-gray-200 hover:bg-primary hover:text-white cursor-pointer`}
                onClick={(e) => {
                  setAdsLocation(AdsLocation.HomeAds34);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-12 h-12 text-gray-200"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <div className="w-full">
              <div className="h-2.5 bg-gray-200 rounded-full w-48 mb-4"></div>
              <div className="h-2 bg-gray-200 rounded-full max-w-[480px] mb-2.5"></div>
              <div className="h-2 bg-gray-200 rounded-full mb-2.5"></div>
              <div className="h-2 bg-gray-200 rounded-full max-w-[440px] mb-2.5"></div>
            </div>
            <div className="flex w-full space-x-3">
              <div
                className={`my-3 flex justify-center items-center w-full h-20 ${
                  adsLocation === AdsLocation.HomeAds41
                    ? "bg-primary"
                    : "bg-gray-300 "
                } rounded text-gray-200 hover:bg-primary hover:text-white cursor-pointer`}
                onClick={(e) => {
                  setAdsLocation(AdsLocation.HomeAds41);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-12 h-12 text-gray-200"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div
                className={`my-3 flex justify-center items-center w-full h-20 ${
                  adsLocation === AdsLocation.HomeAds42
                    ? "bg-primary"
                    : "bg-gray-300 "
                } rounded text-gray-200 hover:bg-primary hover:text-white cursor-pointer`}
                onClick={(e) => {
                  setAdsLocation(AdsLocation.HomeAds42);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-12 h-12 text-gray-200"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div
                className={`my-3 flex justify-center items-center w-full h-20 ${
                  adsLocation === AdsLocation.HomeAds43
                    ? "bg-primary"
                    : "bg-gray-300 "
                } rounded text-gray-200 hover:bg-primary hover:text-white cursor-pointer`}
                onClick={(e) => {
                  setAdsLocation(AdsLocation.HomeAds43);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-12 h-12 text-gray-200"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div
                className={`my-3 flex justify-center items-center w-full h-20 ${
                  adsLocation === AdsLocation.HomeAds44
                    ? "bg-primary"
                    : "bg-gray-300 "
                } rounded text-gray-200 hover:bg-primary hover:text-white cursor-pointer`}
                onClick={(e) => {
                  setAdsLocation(AdsLocation.HomeAds44);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-12 h-12 text-gray-200"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>
        ) : page === AdsPage.Marketplace ? (
          <div
            role="status"
            className="space-y-8 flex flex-col md:items-center p-5 bg-white mt-5"
          >
            <div
              className={`my-3 flex justify-center items-center w-full h-20 ${
                adsLocation === AdsLocation.Marketplace1
                  ? "bg-primary"
                  : "bg-gray-300"
              } rounded text-gray-200 hover:bg-primary hover:text-white cursor-pointer`}
              onClick={(e) => {
                setAdsLocation(AdsLocation.Marketplace1);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-12 h-12"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="w-full">
              <div className="h-2.5 bg-gray-200 rounded-full w-48 mb-4"></div>
              <div className="h-2 bg-gray-200 rounded-full max-w-[480px] mb-2.5"></div>
              <div className="h-2 bg-gray-200 rounded-full mb-2.5"></div>
              <div className="h-2 bg-gray-200 rounded-full max-w-[440px] mb-2.5"></div>
            </div>
            <div className="flex w-full space-x-3">
              <div
                className={`my-3 flex justify-center items-center w-full h-20 ${
                  adsLocation === AdsLocation.Marketplace21
                    ? "bg-primary"
                    : "bg-gray-300"
                } rounded text-gray-200 hover:bg-primary hover:text-white cursor-pointer`}
                onClick={(e) => {
                  setAdsLocation(AdsLocation.Marketplace21);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-12 h-12 text-gray-200"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div
                className={`my-3 flex justify-center items-center w-full h-20 ${
                  adsLocation === AdsLocation.Marketplace22
                    ? "bg-primary"
                    : "bg-gray-300"
                } rounded text-gray-200 hover:bg-primary hover:text-white cursor-pointer`}
                onClick={(e) => {
                  setAdsLocation(AdsLocation.Marketplace22);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-12 h-12 text-gray-200"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div
                className={`my-3 flex justify-center items-center w-full h-20 ${
                  adsLocation === AdsLocation.Marketplace23
                    ? "bg-primary"
                    : "bg-gray-300"
                } rounded text-gray-200 hover:bg-primary hover:text-white cursor-pointer`}
                onClick={(e) => {
                  setAdsLocation(AdsLocation.Marketplace23);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-12 h-12 text-gray-200"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>
        ) : page === AdsPage.Membership ? (
          <div
            role="status"
            className="space-y-8 flex flex-col md:items-center p-5 bg-white mt-5"
          >
            <div className="w-full">
              <div className="h-2.5 bg-gray-200 rounded-full w-48 mb-4"></div>
              <div className="h-2 bg-gray-200 rounded-full max-w-[480px] mb-2.5"></div>
              <div className="h-2 bg-gray-200 rounded-full mb-2.5"></div>
              <div className="h-2 bg-gray-200 rounded-full max-w-[440px] mb-2.5"></div>
            </div>

            <div className="flex w-full space-x-3">
              <div
                className={`my-3 flex justify-center items-center w-full h-20 ${
                  adsLocation === AdsLocation.Memberships1
                    ? "bg-primary"
                    : "bg-gray-300"
                } rounded text-gray-200 hover:bg-primary hover:text-white cursor-pointer`}
                onClick={(e) => {
                  setAdsLocation(AdsLocation.Memberships1);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-12 h-12 text-gray-200"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <div className="w-full">
              <div className="h-2.5 bg-gray-200 rounded-full w-48 mb-4"></div>
              <div className="h-2 bg-gray-200 rounded-full max-w-[480px] mb-2.5"></div>
              <div className="h-2 bg-gray-200 rounded-full mb-2.5"></div>
              <div className="h-2 bg-gray-200 rounded-full max-w-[440px] mb-2.5"></div>
            </div>
          </div>
        ) : page === AdsPage.Product ? (
          <div
            role="status"
            className="space-y-8 flex flex-col md:items-center p-5 bg-white mt-5"
          >
            <div className="w-full">
              <div className="h-2.5 bg-gray-200 rounded-full w-48 mb-4"></div>
              <div className="h-2 bg-gray-200 rounded-full max-w-[480px] mb-2.5"></div>
              <div className="h-2 bg-gray-200 rounded-full mb-2.5"></div>
              <div className="h-2 bg-gray-200 rounded-full max-w-[440px] mb-2.5"></div>
            </div>

            <div className="flex w-full space-x-3">
              <div
                className={`my-3 flex justify-center items-center w-full h-20 ${
                  adsLocation === AdsLocation.ProductAds11
                    ? "bg-primary"
                    : "bg-gray-300"
                } rounded text-gray-200 hover:bg-primary hover:text-white cursor-pointer`}
                onClick={(e) => {
                  setAdsLocation(AdsLocation.ProductAds11);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-12 h-12 text-gray-200"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div
                className={`my-3 flex justify-center items-center w-full h-20 ${
                  adsLocation === AdsLocation.ProductAds12
                    ? "bg-primary"
                    : "bg-gray-300"
                } rounded text-gray-200 hover:bg-primary hover:text-white cursor-pointer`}
                onClick={(e) => {
                  setAdsLocation(AdsLocation.ProductAds12);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-12 h-12 text-gray-200"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <div className="w-full">
              <div className="h-2.5 bg-gray-200 rounded-full w-48 mb-4"></div>
              <div className="h-2 bg-gray-200 rounded-full max-w-[480px] mb-2.5"></div>
              <div className="h-2 bg-gray-200 rounded-full mb-2.5"></div>
              <div className="h-2 bg-gray-200 rounded-full max-w-[440px] mb-2.5"></div>
            </div>
            <div className="flex w-full space-x-3">
              <div
                className={`my-3 flex justify-center items-center w-full h-20 ${
                  adsLocation === AdsLocation.ProductAds21
                    ? "bg-primary"
                    : "bg-gray-300"
                } rounded text-gray-200 hover:bg-primary hover:text-white cursor-pointer`}
                onClick={(e) => {
                  setAdsLocation(AdsLocation.ProductAds21);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-12 h-12 text-gray-200"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div
                className={`my-3 flex justify-center items-center w-full h-20 ${
                  adsLocation === AdsLocation.ProductAds22
                    ? "bg-primary"
                    : "bg-gray-300"
                } rounded text-gray-200 hover:bg-primary hover:text-white cursor-pointer`}
                onClick={(e) => {
                  setAdsLocation(AdsLocation.ProductAds22);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-12 h-12 text-gray-200"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div
                className={`my-3 flex justify-center items-center w-full h-20 ${
                  adsLocation === AdsLocation.ProductAds23
                    ? "bg-primary"
                    : "bg-gray-300"
                } rounded text-gray-200 hover:bg-primary hover:text-white cursor-pointer`}
                onClick={(e) => {
                  setAdsLocation(AdsLocation.ProductAds23);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-12 h-12 text-gray-200"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div
                className={`my-3 flex justify-center items-center w-full h-20 ${
                  adsLocation === AdsLocation.ProductAds24
                    ? "bg-primary"
                    : "bg-gray-300"
                } rounded text-gray-200 hover:bg-primary hover:text-white cursor-pointer`}
                onClick={(e) => {
                  setAdsLocation(AdsLocation.ProductAds24);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-12 h-12 text-gray-200"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <div className="w-full">
              <div className="h-2.5 bg-gray-200 rounded-full w-48 mb-4"></div>
              <div className="h-2 bg-gray-200 rounded-full max-w-[480px] mb-2.5"></div>
              <div className="h-2 bg-gray-200 rounded-full mb-2.5"></div>
              <div className="h-2 bg-gray-200 rounded-full max-w-[440px] mb-2.5"></div>
            </div>
          </div>
        ) : (
          <></>
        )}
      </div>
      <div className="lg:min-w-[25%] lg:max-w-[25%] order-3  lg:max-h-[85vh] overflow-y-auto">
        <h3 className="font-semibold text-sm p-3 border-b">Usage</h3>
        <div className="flex flex-col px-3">
          {usage
            .find((z) => z.title === page)
            ?.placement.map((z, index: number) => (
              <AdsDetailList
                title={z.title}
                ads={[]}
                key={index}
                currentLocation={adsLocation}
              />
            ))}
        </div>
      </div>
    </div>
  );
}

export default AdsPlacementScreen;
