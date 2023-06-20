import Navbar from "@/components/navbar/Navbar";
import nextI18nextConfig from "@/next-i18next.config";
import Head from "next/head";
import React from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { defaultDescription } from "@/types/const";
import { useRouter } from "next/router";
import { formatAmount } from "@/util/textHelper";

function getValue(value: number) {
  let returnVal: any = { "--value": value };
  return returnVal;
}

function MarketplacePage() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { type } = router.query;

  return (
    <div>
      <Head>
        <title>Marketplace | Treasure Rush</title>
        <meta name="description" content={defaultDescription} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="relative max-w-screen-2xl lg:mx-6 px-4 py-8">
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-1 text-sm text-gray-600">
            <li>
              <a href="#" className="block transition hover:text-gray-700">
                <span className="sr-only"> Home </span>

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              </a>
            </li>

            <li className="rtl:rotate-180">
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

            <li>
              <a href="#" className="block transition hover:text-gray-700">
                {" "}
                Shirts{" "}
              </a>
            </li>

            <li className="rtl:rotate-180">
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

            <li>
              <a href="#" className="block transition hover:text-gray-700">
                {" "}
                Plain Tee{" "}
              </a>
            </li>
          </ol>
        </nav>
        <section className="grid grid-cols-1 lg:grid-cols-5 place-items-start gap-5 mt-5">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-1 lg:col-span-2">
            <img
              alt="Les Paul"
              src="https://images.unsplash.com/photo-1456948927036-ad533e53865c?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80"
              className="aspect-square w-full rounded-xl object-cover"
            />

            <div className="grid grid-cols-2 gap-4 lg:mt-4">
              <img
                alt="Les Paul"
                src="https://images.unsplash.com/photo-1456948927036-ad533e53865c?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80"
                className="aspect-square w-full rounded-xl object-cover"
              />

              <img
                alt="Les Paul"
                src="https://images.unsplash.com/photo-1456948927036-ad533e53865c?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80"
                className="aspect-square w-full rounded-xl object-cover"
              />

              <img
                alt="Les Paul"
                src="https://images.unsplash.com/photo-1456948927036-ad533e53865c?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80"
                className="aspect-square w-full rounded-xl object-cover"
              />

              <img
                alt="Les Paul"
                src="https://images.unsplash.com/photo-1456948927036-ad533e53865c?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80"
                className="aspect-square w-full rounded-xl object-cover"
              />
            </div>
          </div>
          <div className="flex flex-col lg:col-span-2">
            <strong className="py-0.5 text-xs font-semibold tracking-wide text-primary">
              Yamaha
            </strong>
            <h1 className="text-xl font-light sm:text-2xl mt-1">
              Fun Product That Does Something Cool
            </h1>

            <p className="text-xs mt-1">New Condition</p>

            <div className="flex flex-row items-center gap-3 mt-5 text-sm text-gray-500">
              <div className="flex flex-row items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5 text-primary"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>4.5 Ratings</span>
              </div>
              <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
              <div className="flex flex-row items-center gap-1">
                <span>2.3k Reviews</span>
              </div>
              <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
              <div className="flex flex-row items-center gap-1">
                <span>2.3k Units Sold</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-10">
              <p className="font-medium text-sm">Choose Style</p>
              <div className="flex flex-row items-center gap-3 flex-wrap">
                <div className="bg-primary text-white p-3 rounded-md font-semibold text-sm">
                  Style 1
                </div>
                <div className="border border-gray-500 text-primaryText p-3 rounded-md text-sm">
                  Style 2
                </div>
                <div className="border border-gray-500 text-primaryText p-3 rounded-md text-sm">
                  Style 3
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-10">
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

              <div className="flex flex-col gap-5 p-3">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <p className="text-gray-500 text-sm">
                    Brand:{" "}
                    <span className="font-semibold text-primaryText">
                      Yamaha
                    </span>
                  </p>

                  <p className="text-gray-500 text-sm">
                    Condition:{" "}
                    <span className="font-semibold text-primaryText">
                      New Condition
                    </span>
                  </p>
                  <p className="text-gray-500 text-sm">
                    Category:{" "}
                    <span className="font-semibold text-primaryText">
                      Accessories, Guitar
                    </span>
                  </p>
                  <p className="text-gray-500 text-sm">
                    Tags:{" "}
                    <span className="font-semibold text-primaryText">
                      Tag 1, Tag 2, Tag 3
                    </span>
                  </p>
                  <p className="text-gray-500 text-sm">
                    Style:{" "}
                    <span className="font-semibold text-primaryText">
                      Style 1
                    </span>
                  </p>
                  <p className="text-gray-500 text-sm">
                    SKU:{" "}
                    <span className="font-semibold text-primaryText">
                      Yamaha-01
                    </span>
                  </p>
                </div>
                <p className="text-sm">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Natus
                  consectetur architecto praesentium porro aut reiciendis amet
                  modi odio laudantium quaerat, distinctio inventore veritatis
                  nesciunt labore sunt, unde voluptate, ut non!
                </p>

                <div className="flex flex-col gap-3">
                  <h3 className="font-semibold text-sm">
                    Product Description:{" "}
                  </h3>
                  <p className="text-sm">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Dolor placeat harum cumque aut eos velit odit culpa
                    voluptas, similique nam officia expedita est amet! Maxime
                    voluptas ex suscipit repellat sapiente?
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <h3 className="font-semibold text-sm">
                    Additional Information:
                  </h3>
                  <p className="text-sm">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Dolor placeat harum cumque aut eos velit odit culpa
                    voluptas, similique nam officia expedita est amet! Maxime
                    voluptas ex suscipit repellat sapiente?
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <h3 className="font-semibold text-sm">
                    Shipping Information:{" "}
                  </h3>
                  <p className="text-sm">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Dolor placeat harum cumque aut eos velit odit culpa
                    voluptas, similique nam officia expedita est amet! Maxime
                    voluptas ex suscipit repellat sapiente?
                  </p>
                </div>

                <div className="flex flex-col gap-3 pt-5 border-t border-t-gray-500">
                  <h3 className="font-semibold text-sm">
                    Seller Information:{" "}
                  </h3>
                  <div className="flex flex-row items-start gap-3">
                    <div className="avatar placeholder">
                      <div className="bg-neutral-focus text-neutral-content rounded-full w-14">
                        <span className="text-3xl">K</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <h3 className="font-semibold">Kevin</h3>
                      <p className="text-xs mb-1 text-gray-500">
                        96.7% Positive Feedback
                      </p>
                      <a
                        className="group relative inline-flex items-center overflow-hidden rounded bg-primary px-8 py-3 text-white focus:outline-none focus:ring active:bg-primary-focus"
                        href="/download"
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
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full">
            {type?.toString() === "auction" ? (
              <div className="bg-primary px-3 py-2 rounded-md flex flex-col items-center justify-between gap-3">
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
                <div className="py-3 border-t border-t-white w-full flex flex-col gap-3">
                  <div className="flex flex-row items-center justify-between gap-3">
                    <p className="text-gray-100 text-sm">Highest Bid: </p>
                    <span className="font-semibold text-white">53,000 MMK</span>
                  </div>
                  <div className="flex flex-row items-center justify-between gap-3">
                    <p className="text-gray-100 text-sm">My Bid: </p>
                    <span className="font-semibold text-white">53,000 MMK</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-primary px-3 py-2 rounded-md flex flex-row items-center justify-between gap-3">
                <h3 className="text-white font-semibold">25% OFF</h3>
                <p className="bg-[#ee6069] p-2 rounded-md text-sm text-white">
                  Until{" "}
                  {new Date().toLocaleDateString("en-ca", {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                  })}
                </p>
              </div>
            )}

            <div className="bg-white flex flex-col gap-3 p-1 rounded-md border">
              <h3 className="text-sm font-semibold text-center py-3 border-b border-b-gray-500">
                Product Details
              </h3>
              <div className="flex flex-row items-center gap-3 px-3">
                <img
                  alt="Les Paul"
                  src="https://images.unsplash.com/photo-1456948927036-ad533e53865c?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80"
                  className="aspect-square w-[100px] rounded-xl object-cover"
                />
                <div className="flex flex-col gap-1 text-sm">
                  <p className="text-gray-500">SKU</p>
                  <span className="font-semibold text-primaryText">
                    Yamaha-01
                  </span>
                </div>
              </div>
              {type?.toString() === "auction" ? (
                <>
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col items-start justify-between gap-1 px-3 text-sm">
                      <p className="text-gray-500">Bidding starts at</p>
                      <span className="font-semibold text-primaryText">
                        {new Date().toLocaleDateString("en-ca", {
                          year: "numeric",
                          month: "short",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="flex flex-col items-start justify-between gap-1 px-3 text-sm">
                      <p className="text-gray-500">Bidding will end at</p>
                      <span className="font-semibold text-primaryText">
                        {new Date().toLocaleDateString("en-ca", {
                          year: "numeric",
                          month: "short",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="flex flex-col items-start justify-between gap-1 px-3 text-sm">
                      <p className="text-gray-500">Opening price</p>
                      <span className="font-semibold text-primaryText">
                        {formatAmount(50000, router.locale, true)}
                      </span>
                    </div>
                    <div className="flex flex-col items-start justify-between gap-1 px-3 text-sm">
                      <p className="text-gray-500">Total bids</p>
                      <span className="font-semibold text-primaryText">
                        {10}
                      </span>
                    </div>
                    <div className="flex flex-col items-start justify-between gap-1 px-3 text-sm">
                      <p className="text-gray-500">Highest bid</p>
                      <span className="font-semibold text-primaryText">
                        {formatAmount(53000, router.locale, true)}
                      </span>
                    </div>
                    <div className="flex flex-col items-start justify-between gap-1 px-3 text-sm">
                      <p className="text-gray-500">
                        My bid (Currently Leading)
                      </p>
                      <span className="font-semibold text-primaryText">
                        {formatAmount(53000, router.locale, true)}
                      </span>
                    </div>
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
                        >
                          &minus;
                        </button>

                        <input
                          type="number"
                          id="Bidding Amount"
                          value="53000"
                          className="h-10 w-[70%] rounded border-gray-200 text-center [-moz-appearance:_textfield] sm:text-sm [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none"
                        />

                        <button
                          type="button"
                          className="w-10 h-10 leading-10 text-gray-600 transition hover:bg-primary rounded-md hover:text-white"
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
                  <div className="flex flex-col items-center bg-primary justify-center py-3 mx-3 rounded-md">
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
                  </div>
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-row items-center justify-between gap-3 px-3 text-sm">
                      <p className="text-gray-500">Style</p>
                      <span className="font-semibold text-primaryText">
                        Style 1
                      </span>
                    </div>
                    <div className="flex flex-row items-center justify-between gap-3 px-3 text-sm">
                      <p className="text-gray-500">Unit Price</p>
                      <span className="font-semibold text-primaryText">
                        5,000 MMK
                      </span>
                    </div>
                    <div className="flex flex-row items-center justify-between gap-3 px-3 text-sm">
                      <p className="text-gray-500">Discount</p>
                      <span className="font-semibold text-primaryText">
                        500 MMK
                      </span>
                    </div>
                    <div className="flex flex-row items-center justify-between gap-3 px-3 text-sm">
                      <p className="text-gray-500">Cost</p>
                      <span className="font-semibold text-primaryText">
                        4,500 MMK
                      </span>
                    </div>

                    <div className="flex flex-row items-center justify-between gap-3 px-3 text-sm">
                      <p className="text-gray-500">Stock Left</p>
                      <span className="font-semibold text-primaryText">10</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 py-3 border-t border-t-gray-500">
                    <div className="flex flex-row items-center justify-between gap-3 px-3 text-sm">
                      <p className="text-gray-500">Qty: </p>
                      <span className="font-semibold text-primaryText">1</span>
                    </div>
                    <div className="flex flex-row items-center justify-between gap-3 px-3 text-sm">
                      <p className="text-gray-500">Total Price: </p>
                      <span className="font-semibold text-primaryText">
                        4,500 MMK
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
                        >
                          &minus;
                        </button>

                        <input
                          type="number"
                          id="Quantity"
                          value="1"
                          className="h-10 w-[70%] rounded border-gray-200 text-center [-moz-appearance:_textfield] sm:text-sm [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none"
                        />

                        <button
                          type="button"
                          className="w-10 h-10 leading-10 text-gray-600 transition hover:bg-primary rounded-md hover:text-white"
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

export async function getServerSideProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"], nextI18nextConfig)),
    },
  };
}

export default MarketplacePage;
