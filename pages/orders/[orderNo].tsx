import Navbar from "@/components/navbar/Navbar";
import nextI18nextConfig from "@/next-i18next.config";
import Head from "next/head";
import React from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { defaultDescription, fileUrl } from "@/types/const";
import { useSession } from "next-auth/react";
import { getHeaders, isBuyer, isInternal, isSeller } from "@/util/authHelper";
import Image from "next/image";
import { formatAmount, getText } from "@/util/textHelper";
import { useRouter } from "next/router";
import {
  getCartItems,
  getDiscountTotal,
  getOrderStatus,
  getShippingTotal,
  getSubTotal,
  getTotal,
  isCartValid,
} from "@/util/orderHelper";
import {
  Attribute,
  Content,
  District,
  Order,
  PromoCode,
  Role,
  State,
  Term,
  Township,
  User,
} from "@prisma/client";
import prisma from "@/prisma/prisma";
import { sortBy } from "lodash";
import ContentNote from "@/components/presentational/ContentNote";
import { addCartItems } from "../api/orders";
import Avatar from "@/components/presentational/Avatar";
import { OrderStatus } from "@/types/orderTypes";
import OrderCartTbl from "@/components/muiTable/OrderCartTbl";
import StatusHistory from "@/components/presentational/StatusHistory";
import ErrorScreen from "@/components/screen/ErrorScreen";
import StatusSelectBox from "@/components/presentational/StatusSelectBox";
import dynamic from "next/dynamic";
import { showErrorDialog } from "@/util/swalFunction";
import SubmitBtn from "@/components/presentational/SubmitBtn";
import { OrderPermission } from "@/types/permissionTypes";
import ResendDialog from "@/components/modal/dialog/ResendDialog";
import Link from "next/link";
import { encryptPhone } from "@/util/encrypt";

const FormInputRichText: any = dynamic(
  () => import("../../components/presentational/FormInputRichTextSun"),
  {
    ssr: false,
  }
);

function Default({
  stateList,
  districtList,
  townshipList,
  order,
  attributeList,
  sellerList,
  address,
  internalUsers,
}: {
  stateList: State[];
  districtList: District[];
  townshipList: Township[];
  attributeList: (Attribute & {
    Term: Term[];
  })[];
  order: any;
  sellerList: User[];
  address: Content;
  internalUsers: User[];
}) {
  const { t } = useTranslation("common");
  const { data: session }: any = useSession();
  const router = useRouter();
  const { locale } = router;
  const [statusHistory, setStatusHistory] = React.useState([]);
  const [content, setContent] = React.useState("");
  const [isSubmit, setSubmit] = React.useState(false);
  const [resendMailOpen, setResendMailOpen] = React.useState(false);

  React.useEffect(() => {
    if (order) {
      setStatusHistory(
        order.sellerResponse.map((z: any) => {
          let sellerId = z.sellerId;
          return {
            ...sortBy(z.statusHistory, (e) => e.updatedDate).reverse()[0],
            sellerId: sellerId,
          };
        })
      );
    }
  }, [order]);

  return session &&
    (isInternal(session) ||
      session.id === order.orderByUserId ||
      sellerList.find((b) => b.id === session.id)) ? (
    <>
      <div>
        <Head>
          <title>#{order.orderNo} | Treasure Rush</title>
          <meta name="description" content={defaultDescription} />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <div
          className={`relative max-w-screen-2xl ${
            isInternal(session) ? "" : "mx-6"
          } py-5`}
        >
          <div className="relative mx-auto grid grid-cols-1 lg:grid-cols-4 gap-5">
            <section
              className={`flex flex-col space-y-5 rounded-md bg-white p-5 shadow-md lg:col-span-3`}
            >
              <div className="flex flex-row flex-wrap items-center justify-between gap-5">
                <div className="flex flex-col gap-3 lg:flex-[2]">
                  <Image
                    width={128}
                    height={48}
                    className="object-contain"
                    alt="logo"
                    src="/assets/logo_full.png"
                  />
                </div>
                <div className="flex flex-col gap-3 p-3">
                  <h3 className="text-sm text-gray-500">
                    {getText(address?.address, address?.addressMM, locale)}
                  </h3>
                  <h3 className="text-sm text-gray-500">{address?.email}</h3>
                  <h3 className="text-sm text-gray-500">{address?.phone}</h3>
                </div>
              </div>
              <div className="border-t pt-3">
                <h1 className="font-semibold text-primary">Order Info</h1>

                <div className="flex flex-row items-start gap-3 mt-3">
                  <div className="flex flex-col gap-3">
                    <h3 className="text-sm text-gray-500">Order No: </h3>
                    <h3 className="text-sm text-gray-500">Status: </h3>
                    <h3 className="text-sm text-gray-500">Order Date: </h3>
                    {new Date(order?.createdAt).getTime() !==
                      new Date(order?.updatedAt).getTime() && (
                      <h3 className="text-sm text-gray-500">
                        Last Updated Date:{" "}
                      </h3>
                    )}
                  </div>
                  <div className="flex flex-col gap-3">
                    <h3 className="text-sm font-semibold text-primary">
                      # {order?.orderNo}
                    </h3>

                    <h3 className="text-sm font-semibold text-primary flex flex-row items-center gap-1">
                      <span className="text-primary">
                        {
                          getOrderStatus(
                            order,
                            sellerList.find((z) => z.id === session.id)?.id
                          ).status
                        }
                      </span>
                      {getOrderStatus(
                        order,
                        sellerList.find((z) => z.id === session.id)?.id
                      ).status === OrderStatus.Processing && (
                        <span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="w-5 h-5"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                      )}
                    </h3>

                    <h3 className="text-sm text-gray-500">
                      {new Date(order?.createdAt).toLocaleDateString("en-ca", {
                        year: "numeric",
                        month: "long",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </h3>
                    {new Date(order?.createdAt).getTime() !==
                      new Date(order?.updatedAt).getTime() && (
                      <h3 className="text-sm text-gray-500">
                        {new Date(order?.updatedAt).toLocaleDateString(
                          "en-ca",
                          {
                            year: "numeric",
                            month: "long",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          }
                        )}
                      </h3>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-row flex-wrap items-start justify-between gap-5 border-t pt-5">
                <div className="flex flex-col gap-3 lg:flex-[2]">
                  <h1 className="text-primary font-semibold">
                    {order?.isAddressDiff === true
                      ? "Billing Address"
                      : "Billing / Shipping Address"}
                  </h1>
                  <h3 className="text-sm text-gray-500">
                    Name : {order?.billingAddress?.name}
                  </h3>
                  <h3 className="text-sm text-gray-500">
                    Phone : {order?.billingAddress?.phoneNum}
                  </h3>
                  <h3 className="text-sm text-gray-500">
                    E-mail : {order?.billingAddress?.email}
                  </h3>
                  <h3 className="text-sm text-gray-500">
                    House No : {order?.billingAddress?.houseNo}
                  </h3>
                  <h3 className="text-sm text-gray-500">
                    Street : {order?.billingAddress?.street}
                  </h3>
                  <h3 className="text-sm text-gray-500">
                    Location :{" "}
                    {getText(
                      stateList.find(
                        (e) => e.id === order?.billingAddress?.stateId
                      )?.name,
                      stateList.find(
                        (e) => e.id === order?.billingAddress?.stateId
                      )?.nameMM,
                      locale
                    )}{" "}
                    -{" "}
                    {getText(
                      districtList.find(
                        (e) => e.id === order?.billingAddress?.districtId
                      )?.name,
                      districtList.find(
                        (e) => e.id === order?.billingAddress?.districtId
                      )?.nameMM,
                      locale
                    )}
                    -{" "}
                    {getText(
                      townshipList.find(
                        (e) => e.id === order?.billingAddress?.townshipId
                      )?.name,
                      townshipList.find(
                        (e) => e.id === order?.billingAddress?.townshipId
                      )?.nameMM,
                      locale
                    )}
                  </h3>
                </div>
                {order?.isAddressDiff === true && (
                  <div className="flex w-full flex-col gap-3 border-t pt-5 lg:w-fit lg:border-0 lg:pt-0">
                    <h1 className="text-primary font-semibold">
                      Shipping Address
                    </h1>
                    <h3 className="text-sm text-gray-500">
                      Name : {order?.shippingAddress.name}
                    </h3>
                    <h3 className="text-sm text-gray-500">
                      Phone : {order?.shippingAddress.phoneNum}
                    </h3>

                    <h3 className="text-sm text-gray-500">
                      House No : {order?.shippingAddress.houseNo}
                    </h3>
                    <h3 className="text-sm text-gray-500">
                      Street : {order?.shippingAddress.street}
                    </h3>
                    <h3 className="text-sm text-gray-500">
                      Location :{" "}
                      {getText(
                        stateList.find(
                          (e) => e.id === order?.shippingAddress.stateId
                        )?.name,
                        stateList.find(
                          (e) => e.id === order?.shippingAddress.stateId
                        )?.nameMM,
                        locale
                      )}{" "}
                      -{" "}
                      {getText(
                        districtList.find(
                          (e) => e.id === order?.shippingAddress.districtId
                        )?.name,
                        districtList.find(
                          (e) => e.id === order?.shippingAddress.districtId
                        )?.nameMM,
                        locale
                      )}
                      -{" "}
                      {getText(
                        townshipList.find(
                          (e) => e.id === order?.shippingAddress.townshipId
                        )?.name,
                        townshipList.find(
                          (e) => e.id === order?.shippingAddress.townshipId
                        )?.nameMM,
                        locale
                      )}
                    </h3>
                  </div>
                )}
              </div>
              {order.buyerNote && order.buyerNote.length > 0 && (
                <div className="border-t pt-3">
                  <h1 className="text-primary font-semibold">Order Note</h1>
                  <p className="text-sm mt-3 text-gray-500">
                    {order.buyerNote}
                  </p>
                </div>
              )}
              <div className="flex flex-col gap-5 border-t pt-5">
                <h1 className="text-primary font-semibold">Order Details</h1>
                <OrderCartTbl
                  data={order.cartItems.filter((e: any) =>
                    sellerList.find((z) => z.id === session.id)
                      ? e.sellerId === session.id
                      : true
                  )}
                  sellerResponse={order?.sellerResponse}
                  attributeList={attributeList}
                />
              </div>
              <div className="flex flex-row flex-wrap items-end gap-5 border-t pt-5">
                <div className="flex-grow"></div>
                <div className="flex min-w-[300px] flex-col gap-1 p-3">
                  <div className="flex flex-row items-center justify-between gap-3">
                    <h3 className="text-sm text-gray-400">Sub Total:</h3>
                    <p className="text-sm">
                      {formatAmount(
                        getTotal(
                          getCartItems(order?.cartItems, order?.sellerResponse),
                          sellerList.find((z) => z.id === session.id)
                            ? session.id
                            : ""
                        ),
                        locale,
                        true
                      )}
                    </p>
                  </div>

                  <div className="flex flex-row items-center justify-between gap-3">
                    <h3 className="text-sm text-gray-400">Shipping Total:</h3>
                    <p className="text-sm">
                      {formatAmount(
                        getShippingTotal(
                          order?.sellerResponse,
                          sellerList.find((z) => z.id === session.id)
                            ? session.id
                            : ""
                        ),
                        locale,
                        true
                      )}
                    </p>
                  </div>

                  <div className="flex flex-row items-center justify-between gap-3 pb-3">
                    <h3 className="text-sm text-gray-400">
                      Promo Discount Total:
                    </h3>
                    <p className="text-sm">
                      {formatAmount(
                        getDiscountTotal(
                          order?.discountTotal,
                          sellerList.find((z) => z.id === session.id)
                            ? session.id
                            : ""
                        ),
                        locale,
                        true
                      )}
                    </p>
                  </div>

                  <div className="flex flex-row items-center justify-between gap-3 border-t pt-5">
                    <h3 className="text-sm text-gray-400">Total:</h3>
                    <p>
                      {formatAmount(
                        getTotal(
                          getCartItems(order?.cartItems, order?.sellerResponse),
                          sellerList.find((z) => z.id === session.id)
                            ? session.id
                            : ""
                        ) -
                          getDiscountTotal(
                            order?.discountTotal,
                            sellerList.find((z) => z.id === session.id)
                              ? session.id
                              : ""
                          ) +
                          getShippingTotal(
                            order?.sellerResponse,
                            sellerList.find((z) => z.id === session.id)
                              ? session.id
                              : ""
                          ),
                        locale,
                        true
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-5">
                <h3 className="text-sm font-semibold text-gray-700">
                  {`ဝယ်ယူအားပေးမှုအတွက် ကျေးဇူးတင်ရှိပါသည်။`}
                </h3>
                <p className="text-xs mt-3">- Treasure Rush Team</p>
              </div>
            </section>
            <section className={`flex flex-col gap-3`}>
              <div className="bg-white p-3 rounded-md shadow flex flex-row items-center flex-wrap gap-3">
                <a
                  className="bg-primary px-3 py-2 rounded-md text-sm flex flex-row items-center gap-2 text-white flex-1 justify-center"
                  href={
                    sellerList.find((z) => z.id === session.id)
                      ? "/api/orders/print/email?orderNo=" +
                        order.orderNo +
                        "&isSeller=true"
                      : "/api/orders/print/email?orderNo=" + order.orderNo
                  }
                  target="_blank"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 2.75C5 1.784 5.784 1 6.75 1h6.5c.966 0 1.75.784 1.75 1.75v3.552c.377.046.752.097 1.126.153A2.212 2.212 0 0118 8.653v4.097A2.25 2.25 0 0115.75 15h-.241l.305 1.984A1.75 1.75 0 0114.084 19H5.915a1.75 1.75 0 01-1.73-2.016L4.492 15H4.25A2.25 2.25 0 012 12.75V8.653c0-1.082.775-2.034 1.874-2.198.374-.056.75-.107 1.127-.153L5 6.25v-3.5zm8.5 3.397a41.533 41.533 0 00-7 0V2.75a.25.25 0 01.25-.25h6.5a.25.25 0 01.25.25v3.397zM6.608 12.5a.25.25 0 00-.247.212l-.693 4.5a.25.25 0 00.247.288h8.17a.25.25 0 00.246-.288l-.692-4.5a.25.25 0 00-.247-.212H6.608z"
                      clipRule="evenodd"
                    />
                  </svg>

                  <span className="text-sm font-semibold">Print</span>
                </a>
                {isInternal(session) && (
                  <button
                    className="bg-primary px-3 py-2 rounded-md text-sm flex flex-row items-center gap-2 text-white flex-1 justify-center"
                    type="button"
                    onClick={() => {
                      setResendMailOpen(true);
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-5 h-5"
                    >
                      <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
                    </svg>

                    <span className="text-sm font-semibold">Send</span>
                  </button>
                )}
              </div>
              {(isSeller(session) || isInternal(session)) && (
                <div className="bg-white p-3 rounded-md shadow flex flex-col gap-3">
                  <h3 className="font-semibold text-primary">Buyer Info</h3>
                  <div className="flex flex-row items-center gap-3 justify-between flex-wrap">
                    <div className="flex flex-row items-center gap-3 flex-grow">
                      <Avatar
                        username={order.orderBy.username}
                        profile={order.orderBy.profile}
                        size={40}
                      />
                      <div className="flex flex-col gap-1">
                        <p className="text-sm">{order.orderBy.username}</p>
                        <p className="text-xs">{order.orderBy.phoneNum}</p>
                        <div className="flex flex-row gap-1">
                          <span className="text-primary">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="w-4 h-4"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </span>
                          <span className="text-xs">5.0</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row items-center justify-start gap-3">
                      {isInternal(session) === false && (
                        <button className="text-xs bg-primary px-3 py-2 rounded-md text-white hover:bg-primary-focus">
                          Submit Review
                        </button>
                      )}
                      <button>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-6 h-6"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10.5 6a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm0 6a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm0 6a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <div
                className={`sticky ${
                  isInternal(session) ? "top-20" : "top-36"
                } bg-white p-3 rounded-md shadow flex flex-col gap-3`}
              >
                <h3 className="font-semibold text-primary">Seller Info</h3>
                {sellerList.find((z) => z.id === session.id) ? (
                  <>
                    {[sellerList.find((z) => z.id === session.id)].map(
                      (seller, index) => (
                        <details
                          className={`flex flex-col gap-3 group cursor-pointer ${
                            index < sellerList.length - 1
                              ? "border-b pb-3 mb-3"
                              : ""
                          }`}
                          key={index}
                          open={seller.id === session.id}
                          onToggle={(e) => {
                            setContent("");
                          }}
                        >
                          <summary className="flex flex-row items-center gap-3 justify-between flex-wrap">
                            <div className="flex flex-row items-center gap-3 flex-grow">
                              <Avatar
                                username={seller.username}
                                profile={seller.profile}
                                size={40}
                              />
                              <div className="flex flex-col gap-1">
                                <p className="text-sm">{seller.username}</p>
                                <p className="text-xs">{seller.phoneNum}</p>

                                <div className="flex flex-row gap-1">
                                  <span className="text-primary">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 24 24"
                                      fill="currentColor"
                                      className="w-4 h-4"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  </span>
                                  <span className="text-xs">5.0</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-row items-center justify-start gap-3">
                              {isInternal(session) === false && (
                                <button className="text-xs bg-primary px-3 py-2 rounded-md text-white hover:bg-primary-focus">
                                  Submit Review
                                </button>
                              )}
                              <Link
                                href={
                                  "/account/" +
                                  encodeURIComponent(
                                    encryptPhone(seller.phoneNum)
                                  )
                                }
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                  className="w-6 h-6"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10.5 6a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm0 6a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm0 6a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </Link>
                            </div>
                            <div className="border-t pt-3 flex flex-row items-center gap-1 justify-between w-full">
                              <p className="text-xs flex-grow">
                                {getOrderStatus(order, seller.id).status} on{" "}
                                {new Date(
                                  getOrderStatus(order, seller.id).updatedDate
                                ).toLocaleDateString("en-ca", {
                                  year: "numeric",
                                  month: "short",
                                  day: "2-digit",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                              <span className="rounded-full bg-white">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                  className="h-5 w-5 flex-shrink-0 transition duration-300 group-open:-rotate-180"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </span>
                            </div>
                          </summary>

                          {(isInternal(session) || isSeller(session)) && (
                            <div className="border-t pt-3 mt-3">
                              <h3 className="text-sm font-semibold text-primary">
                                Status
                              </h3>
                              <div>
                                <StatusSelectBox
                                  data={[
                                    OrderStatus.Accepted,
                                    OrderStatus.Shipped,
                                    OrderStatus.Rejected,
                                  ]}
                                  selected={
                                    statusHistory.find(
                                      (a) => a.sellerId === seller.id
                                    )?.status
                                  }
                                  setSelected={(status) => {
                                    setStatusHistory((prevValue) => {
                                      let currentSeller = prevValue.find(
                                        (z) => z.sellerId == seller.id
                                      );
                                      currentSeller.status = status;
                                      return [
                                        ...prevValue.filter(
                                          (z) => z.sellerId !== seller.id
                                        ),
                                        currentSeller,
                                      ];
                                    });
                                  }}
                                />
                              </div>
                              <div className="flex flex-col gap-1 mt-3">
                                <label className="text-sm font-medium text-gray-500">
                                  Note
                                </label>
                                <textarea
                                  value={content}
                                  onChange={(e) => {
                                    setContent(e.currentTarget.value);
                                  }}
                                  className="border border-gray-400 rounded-md min-h-[200px]"
                                ></textarea>
                              </div>
                              <div className="flex flex-row items-center justify-end mt-3">
                                <SubmitBtn
                                  isSubmit={isSubmit}
                                  submitTxt={"Loading..."}
                                  text="Submit"
                                  disabled={isSubmit}
                                  onClick={() => {
                                    const sellerResponse: any = [
                                      ...order.sellerResponse,
                                    ];
                                    let statusHis: any = sellerResponse.find(
                                      (z: any) => z.sellerId === seller.id
                                    ).statusHistory;
                                    let lastStatus = sortBy(
                                      statusHis,
                                      (e) => e.updatedDate
                                    ).reverse()[0];
                                    let newStatus = statusHistory.find(
                                      (z) => z.sellerId === seller.id
                                    );
                                    if (
                                      lastStatus.status ===
                                        OrderStatus.Shipped ||
                                      lastStatus.status ===
                                        OrderStatus.Rejected ||
                                      lastStatus.status ===
                                        OrderStatus.AutoCancelled
                                    ) {
                                      showErrorDialog(
                                        "Cannot change status since the order is completed",
                                        "",
                                        locale
                                      );
                                      return;
                                    }

                                    let statusList = [
                                      OrderStatus.OrderReceived,
                                      OrderStatus.Accepted,
                                      OrderStatus.Shipped,
                                      OrderStatus.Rejected,
                                      OrderStatus.AutoCancelled,
                                    ];

                                    if (
                                      statusList.findIndex(
                                        (z) => z === newStatus.status
                                      ) <
                                      statusList.findIndex(
                                        (z) => z === lastStatus.status
                                      )
                                    ) {
                                      showErrorDialog(
                                        "Cannot rollback status",
                                        "",
                                        locale
                                      );
                                      return;
                                    }

                                    if (
                                      newStatus.status !== lastStatus.status
                                    ) {
                                      statusHis.push({
                                        status: newStatus.status,
                                        updatedDate: new Date().toISOString(),
                                        updatedBy: session.id,
                                        note: content,
                                      });
                                      setSubmit(true);
                                      fetch(
                                        "/api/orders/" +
                                          order.orderNo +
                                          "?sellerId=" +
                                          seller.id +
                                          "&status=" +
                                          newStatus.status,
                                        {
                                          method: "PUT",
                                          body: JSON.stringify({
                                            sellerResponse: sellerResponse,
                                          }),
                                          headers: getHeaders(session),
                                        }
                                      ).then((data) => {
                                        setSubmit(false);
                                        if (data.status === 200) {
                                          router.reload();
                                        } else {
                                          showErrorDialog("Error");
                                        }
                                      });
                                    } else {
                                      showErrorDialog(
                                        "Cannot submit since the status is same",
                                        "",
                                        locale
                                      );
                                    }
                                  }}
                                />
                              </div>
                            </div>
                          )}
                          <div className={`px-5 relative mt-3 border-t pt-3`}>
                            <ol className="sticky left-5 right-0 border-l border-gray-200">
                              {sortBy(
                                order.sellerResponse.find(
                                  (b: any) => b.sellerId === seller.id
                                )?.statusHistory,
                                (e) => e.updatedDate
                              )
                                .reverse()
                                .map((b, index) => (
                                  <StatusHistory
                                    e={b}
                                    key={index}
                                    index={index}
                                  />
                                ))}
                            </ol>
                          </div>
                        </details>
                      )
                    )}
                  </>
                ) : (
                  <>
                    {sellerList.map((seller, index) => (
                      <details
                        className={`flex flex-col gap-3 group cursor-pointer ${
                          index < sellerList.length - 1
                            ? "border-b pb-3 mb-3"
                            : ""
                        }`}
                        key={index}
                        open={seller.id === session.id}
                        onToggle={(e) => {
                          setContent("");
                        }}
                      >
                        <summary className="flex flex-row items-center gap-3 justify-between flex-wrap">
                          <div className="flex flex-row items-center gap-3 flex-grow">
                            <Avatar
                              username={seller.username}
                              profile={seller.profile}
                              size={40}
                            />
                            <div className="flex flex-col gap-1">
                              <p className="text-sm">{seller.username}</p>
                              <p className="text-xs">{seller.phoneNum}</p>

                              <div className="flex flex-row gap-1">
                                <span className="text-primary">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className="w-4 h-4"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </span>
                                <span className="text-xs">5.0</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-row items-center justify-start gap-3">
                            {isInternal(session) === false && (
                              <button className="text-xs bg-primary px-3 py-2 rounded-md text-white hover:bg-primary-focus">
                                Submit Review
                              </button>
                            )}
                            <Link
                              href={
                                "/account/" +
                                encodeURIComponent(
                                  encryptPhone(seller.phoneNum)
                                )
                              }
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="w-6 h-6"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10.5 6a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm0 6a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm0 6a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </Link>
                          </div>
                          <div className="border-t pt-3 flex flex-row items-center gap-1 justify-between w-full">
                            <p className="text-xs flex-grow">
                              {getOrderStatus(order, seller.id).status} on{" "}
                              {new Date(
                                getOrderStatus(order, seller.id).updatedDate
                              ).toLocaleDateString("en-ca", {
                                year: "numeric",
                                month: "short",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                            <span className="rounded-full bg-white">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                className="h-5 w-5 flex-shrink-0 transition duration-300 group-open:-rotate-180"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </span>
                          </div>
                        </summary>

                        {(isInternal(session) || isSeller(session)) && (
                          <div className="border-t pt-3 mt-3">
                            <h3 className="text-sm font-semibold text-primary">
                              Status
                            </h3>
                            <div>
                              <StatusSelectBox
                                data={[
                                  OrderStatus.Accepted,
                                  OrderStatus.Shipped,
                                  OrderStatus.Rejected,
                                ]}
                                selected={
                                  statusHistory.find(
                                    (a) => a.sellerId === seller.id
                                  )?.status
                                }
                                setSelected={(status) => {
                                  setStatusHistory((prevValue) => {
                                    let currentSeller = prevValue.find(
                                      (z) => z.sellerId == seller.id
                                    );
                                    currentSeller.status = status;
                                    return [
                                      ...prevValue.filter(
                                        (z) => z.sellerId !== seller.id
                                      ),
                                      currentSeller,
                                    ];
                                  });
                                }}
                              />
                            </div>
                            <div className="flex flex-col gap-1 mt-3">
                              <label className="text-sm font-medium text-gray-500">
                                Note
                              </label>
                              <textarea
                                value={content}
                                onChange={(e) => {
                                  setContent(e.currentTarget.value);
                                }}
                                className="border border-gray-400 rounded-md min-h-[200px]"
                              ></textarea>
                            </div>
                            <div className="flex flex-row items-center justify-end mt-3">
                              <SubmitBtn
                                isSubmit={isSubmit}
                                submitTxt={"Loading..."}
                                text="Submit"
                                disabled={isSubmit}
                                onClick={() => {
                                  const sellerResponse: any = [
                                    ...order.sellerResponse,
                                  ];
                                  let statusHis: any = sellerResponse.find(
                                    (z: any) => z.sellerId === seller.id
                                  ).statusHistory;
                                  let lastStatus = sortBy(
                                    statusHis,
                                    (e) => e.updatedDate
                                  ).reverse()[0];
                                  let newStatus = statusHistory.find(
                                    (z) => z.sellerId === seller.id
                                  );
                                  if (
                                    lastStatus.status === OrderStatus.Shipped ||
                                    lastStatus.status ===
                                      OrderStatus.Rejected ||
                                    lastStatus.status ===
                                      OrderStatus.AutoCancelled
                                  ) {
                                    showErrorDialog(
                                      "Cannot change status since the order is completed",
                                      "",
                                      locale
                                    );
                                    return;
                                  }

                                  let statusList = [
                                    OrderStatus.OrderReceived,
                                    OrderStatus.Accepted,
                                    OrderStatus.Shipped,
                                    OrderStatus.Rejected,
                                    OrderStatus.AutoCancelled,
                                  ];

                                  if (
                                    statusList.findIndex(
                                      (z) => z === newStatus.status
                                    ) <
                                    statusList.findIndex(
                                      (z) => z === lastStatus.status
                                    )
                                  ) {
                                    showErrorDialog(
                                      "Cannot rollback status",
                                      "",
                                      locale
                                    );
                                    return;
                                  }

                                  if (newStatus.status !== lastStatus.status) {
                                    statusHis.push({
                                      status: newStatus.status,
                                      updatedDate: new Date().toISOString(),
                                      updatedBy: session.id,
                                      note: content,
                                    });
                                    setSubmit(true);
                                    fetch(
                                      "/api/orders/" +
                                        order.orderNo +
                                        "?sellerId=" +
                                        seller.id +
                                        "&status=" +
                                        newStatus.status,
                                      {
                                        method: "PUT",
                                        body: JSON.stringify({
                                          sellerResponse: sellerResponse,
                                        }),
                                        headers: getHeaders(session),
                                      }
                                    ).then((data) => {
                                      setSubmit(false);
                                      if (data.status === 200) {
                                        router.reload();
                                      } else {
                                        showErrorDialog("Error");
                                      }
                                    });
                                  } else {
                                    showErrorDialog(
                                      "Cannot submit since the status is same",
                                      "",
                                      locale
                                    );
                                  }
                                }}
                              />
                            </div>
                          </div>
                        )}
                        <div className={`px-5 relative mt-3 border-t pt-3`}>
                          <ol className="sticky left-5 right-0 border-l border-gray-200">
                            {sortBy(
                              order.sellerResponse.find(
                                (b: any) => b.sellerId === seller.id
                              )?.statusHistory,
                              (e) => e.updatedDate
                            )
                              .reverse()
                              .map((b, index) => (
                                <StatusHistory
                                  e={b}
                                  key={index}
                                  index={index}
                                />
                              ))}
                          </ol>
                        </div>
                      </details>
                    ))}
                  </>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
      <ResendDialog
        orderNo={order?.orderNo}
        internalUsers={internalUsers}
        buyerEmail={order?.orderBy?.email}
        sellerList={sellerList}
        isModalOpen={resendMailOpen}
        setModalOpen={setResendMailOpen}
      />
    </>
  ) : (
    <ErrorScreen statusCode={401} />
  );
}

export async function getServerSideProps({ locale, params }: any) {
  let stateList = await prisma.state.findMany({});
  let districtList = await prisma.district.findMany({});
  let townshipList = await prisma.township.findMany({});
  let attributeList = await prisma.attribute.findMany({
    include: {
      Term: true,
    },
  });
  let order: any = await prisma.order.findFirst({
    where: {
      orderNo: parseInt(params.orderNo),
    },
    include: {
      orderBy: true,
      promoCodes: true,
    },
  });
  order = await addCartItems(order);
  const sellerList = [];
  const internalUsers = await prisma.user.findMany({
    where: {
      OR: [
        {
          role: {
            in: [Role.Admin, Role.SuperAdmin],
          },
        },
        {
          role: Role.Staff,
          userDefinedRole: {
            permission: {
              has: OrderPermission.orderEmailAllow,
            },
          },
        },
      ],
    },
  });
  const address = await prisma.content.findFirst({});

  if (order) {
    for (let i = 0; i < order.cartItems.length; i++) {
      let item: any = order.cartItems[i];
      let prod = await prisma.product.findFirst({
        where: {
          id: item.productId,
        },
        include: {
          seller: true,
          Brand: true,
          Condition: true,
        },
      });
      order.cartItems[i].id = i + 1;
      if (prod) {
        order.cartItems[i].productInfo = prod;
      }
    }
    for (let i = 0; i < order.sellerResponse.length; i++) {
      let item: any = order.sellerResponse[i];
      let s = sortBy(
        item.statusHistory,
        (obj: any) => obj.updatedDate
      ).reverse()[0];
      let b = await prisma.brand.findFirst({
        where: {
          id: item.brandId,
        },
      });

      for (let j = 0; j < item.statusHistory.length; j++) {
        let statusItem = item.statusHistory[j];

        if (statusItem.updatedBy) {
          let user = await prisma.user.findFirst({
            where: {
              id: statusItem.updatedBy,
            },
          });
          if (user) {
            item.statusHistory[j].updatedUser = user;
          }
        } else {
          item.statusHistory[j].updatedUser = {
            username: "System",
            role: Role.System,
          };
        }
      }

      let seller = await prisma.user.findFirst({
        where: {
          id: item.sellerId,
        },
      });
      if (seller) {
        sellerList.push(seller);
      }
    }
  }

  return {
    props: {
      sellerList: JSON.parse(JSON.stringify(sellerList)),
      order: JSON.parse(JSON.stringify(order)),
      attributeList: JSON.parse(JSON.stringify(attributeList)),
      stateList: JSON.parse(JSON.stringify(stateList)),
      districtList: JSON.parse(JSON.stringify(districtList)),
      townshipList: JSON.parse(JSON.stringify(townshipList)),
      address: JSON.parse(JSON.stringify(address)),
      internalUsers: JSON.parse(JSON.stringify(internalUsers)),
      ...(await serverSideTranslations(locale, ["common"], nextI18nextConfig)),
    },
  };
}

export default Default;
