import Navbar from "@/components/navbar/Navbar";
import nextI18nextConfig from "@/next-i18next.config";
import Head from "next/head";
import React from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { defaultDescription, fileUrl } from "@/types/const";
import { useSession } from "next-auth/react";
import { isInternal } from "@/util/authHelper";
import Image from "next/image";
import { formatAmount, getText } from "@/util/textHelper";
import { useRouter } from "next/router";
import {
  getCartItems,
  getDiscountTotal,
  getOrderStatus,
  getShippingTotal,
  getTotal,
} from "@/util/orderHelper";
import { District, Role, State, Township } from "@prisma/client";
import prisma from "@/prisma/prisma";
import { sortBy } from "lodash";
import ContentNote from "@/components/presentational/ContentNote";

function Default({
  stateList,
  districtList,
  townshipList,
}: {
  stateList: State[];
  districtList: District[];
  townshipList: Township[];
}) {
  const { t } = useTranslation("common");
  const { data: session }: any = useSession();
  const address: any = {};
  const router = useRouter();
  const { locale } = router;
  const order: any = {};
  const statusArr: any = [];
  const sellerList: any = [];
  return (
    <div>
      <Head>
        <title>Orders | Treasure Rush</title>
        <meta name="description" content={defaultDescription} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div
        className={`relative max-w-screen-2xl ${
          isInternal(session) ? "" : "mx-6"
        } px-4 py-5`}
      >
        <div className="relative mx-auto flex flex-row flex-wrap items-start gap-5">
          <section className="flex flex-grow flex-col space-y-5 rounded-md bg-white p-5 shadow-md">
            <div className="flex flex-row flex-wrap items-center justify-between gap-5">
              <div className="flex flex-col gap-3 lg:flex-[2]">
                <Image
                  width={128}
                  height={48}
                  className="object-contain"
                  alt="logo"
                  src="/assets/logo_full.png"
                />
                <h3 className="text-sm text-gray-500">
                  {getText(address?.address, address?.addressMM, locale)}
                </h3>
                <h3 className="text-sm text-gray-500">{address?.email}</h3>
                <h3 className="text-sm text-gray-500">{address?.phone}</h3>
              </div>
              <div className="flex flex-row items-start gap-3 border-t pt-5 md:border-0 md:pt-0">
                <div className="flex flex-col gap-3">
                  <h3 className="text-sm text-gray-500">Order No</h3>
                  <h3 className="text-sm text-gray-500">Order Status</h3>
                  <h3 className="text-sm text-gray-500">Order Date</h3>
                  <h3 className="text-sm text-gray-500">Last Updated Date</h3>
                </div>
                <div className="flex flex-col gap-3">
                  <h3 className="text-sm font-semibold text-primary">
                    # {order?.orderNo}
                  </h3>
                  <h3 className="text-sm font-semibold text-primary">
                    {/* 
                   //TODO Remove
                   {getOrderStatus(
                      statusArr.filter((e: any) =>
                        session &&
                        session.role === Role.Seller &&
                        session.role === Role.Trader
                          ? e.sellerId === session.id
                          : true
                      )
                    )} */}
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
                  <h3 className="text-sm text-gray-500">
                    {new Date(order?.updatedAt).toLocaleDateString("en-ca", {
                      year: "numeric",
                      month: "long",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </h3>
                </div>
              </div>
            </div>
            <div className="flex flex-row flex-wrap items-start justify-between gap-5 border-t pt-5">
              <div className="flex flex-col gap-3 lg:flex-[2]">
                <h1>
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
                  <h1>Shipping Address</h1>
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
            <div className="flex flex-col gap-5 border-t pt-5">
              <h1>Order Details</h1>
              {/*  <OrderCartTbl
                data={cartList.filter((e: any) =>
                  session && session.role === Role.Seller
                    ? e.brandId === session.brand.id
                    : true
                )}
                sellerResponse={order?.sellerResponse}
                attributeList={attributeList}
              /> */}
            </div>
            <div className="flex flex-row flex-wrap items-end gap-5 border-t pt-5">
              <div className="flex-grow"></div>
              <div className="flex min-w-[300px] flex-col gap-1 p-3">
                <div className="flex flex-row items-center justify-between gap-3">
                  <h3 className="text-sm text-gray-400">Sub Total:</h3>
                  <p className="text-sm">
                    {/* {formatAmount(
                      getTotal(
                        getCartItems(order?.cartItems, order?.sellerResponse),
                        session.role === Role.Seller ||
                          session.role === Role.Trader
                          ? session.id
                          : ""
                      ),
                      locale,
                      true
                    )} */}
                  </p>
                </div>
                {order?.promoCode && (
                  <div className="flex flex-row items-center justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <h3 className="text-sm text-gray-400">
                        Promo Code:{" "}
                        <span className="font-semibold text-primary">
                          {order?.promoCode?.promoCode}
                        </span>
                      </h3>
                      <p className="text-sm text-gray-400">Discount Total</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {order?.promoCode?.isPercent === true ? (
                        <>
                          <p className="text-sm">
                            {formatAmount(order?.promoCode?.discount, locale)}%
                          </p>
                          <p className="text-sm">
                            {formatAmount(
                              getDiscountTotal(
                                getCartItems(
                                  order?.cartItems,
                                  order?.sellerResponse
                                ),
                                sellerList,
                                order?.promoCode,
                                session.role === Role.Seller
                                  ? session.brand.id
                                  : ""
                              ),
                              locale,
                              true
                            )}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm">
                          {formatAmount(
                            getDiscountTotal(
                              getCartItems(
                                order?.cartItems,
                                order?.sellerResponse
                              ),
                              sellerList,
                              order?.promoCode,
                              session.role === Role.Seller
                                ? session.brand.id
                                : ""
                            ),
                            locale,
                            true
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex flex-row items-center justify-between gap-3 pb-3">
                  <h3 className="text-sm text-gray-400">Shipping Total:</h3>
                  <p className="text-sm">
                    {/* {formatAmount(
                      getShippingTotal(
                        order?.sellerResponse,
                        session.role === Role.Seller ||
                          session.role === Role.Trader
                          ? session.id
                          : ""
                      ),
                      locale,
                      true
                    )} */}
                  </p>
                </div>
                <div className="flex flex-row items-center justify-between gap-3 border-t pt-5">
                  <h3 className="text-sm text-gray-400">Total:</h3>
                  <p>
                    {/* {formatAmount(
                      getTotal(
                        getCartItems(order?.cartItems, order?.sellerResponse),
                        session.role === Role.Seller ||
                          session.role === Role.Trader
                          ? session.id
                          : ""
                      ) -
                        getDiscountTotal(
                          getCartItems(order?.cartItems, order?.sellerResponse),
                          sellerList,
                          order?.promoCode,
                          session.role === Role.Seller ||
                            session.role === Role.Trader
                            ? session.id
                            : ""
                        ) +
                        getShippingTotal(
                          order?.sellerResponse,
                          session.role === Role.Seller ||
                            session.role === Role.Trader
                            ? session.id
                            : ""
                        ),
                      locale,
                      true
                    )} */}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col flex-wrap gap-3 divide-y border-t">
              {order?.sellerResponse
                ?.filter((e: any) =>
                  session &&
                  (session.role === Role.Seller || session.role === Role.Trader)
                    ? e.sellerId === session.id
                    : true
                )
                .map((e: any, index: number) => (
                  <div key={index} className="flex flex-col gap-3 p-3">
                    <div className="flex flex-row flex-wrap items-center gap-3">
                      <Image
                        src={
                          fileUrl +
                          sellerList.find((b) => b.id === e.sellerId)!.profile
                        }
                        alt={
                          sellerList.find((b) => b.id === e.sellerId)!.username
                        }
                        width={50}
                        height={50}
                        quality={100}
                        className="h-[50px] w-[50px] rounded-md object-contain"
                      />
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-gray-500">
                          {
                            sellerList.find((b) => b.id === e.sellerId)!
                              .username
                          }
                        </span>
                        <span className="text-xs text-primary">
                          {
                            sortBy(
                              e.statusHistory,
                              (obj: any) => obj.updatedDate
                            ).reverse()[0].status
                          }{" "}
                          on{" "}
                          {new Date(
                            sortBy(
                              e.statusHistory,
                              (obj: any) => obj.updatedDate
                            ).reverse()[0].updatedDate
                          ).toLocaleDateString("en-ca", {
                            year: "2-digit",
                            month: "short",
                            day: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-row items-center gap-3 text-xs">
                      {e.shippingFee >= 0 ? (
                        <span
                          className={
                            e.isFreeShipping === true
                              ? "text-xs line-through"
                              : "text-xs"
                          }
                        >
                          {formatAmount(e.shippingFee, locale, true)}
                        </span>
                      ) : (
                        <span
                          className={
                            e.isFreeShipping === true
                              ? "text-xs line-through"
                              : "text-xs"
                          }
                        >
                          Paid by recipient on delivery.
                        </span>
                      )}
                    </div>
                    {sortBy(
                      e.statusHistory,
                      (obj: any) => obj.updatedDate
                    ).reverse()[0].note && (
                      <ContentNote
                        note={
                          sortBy(
                            e.statusHistory,
                            (obj: any) => obj.updatedDate
                          ).reverse()[0].note
                        }
                      />
                    )}
                  </div>
                ))}
            </div>
            <div className="border-t pt-5 ">
              <h3 className="text-sm font-semibold text-gray-700">
                {`We're grateful for your trust in Pyi Twin Phyit. Thank you for
              your purchase!`}
              </h3>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps({ locale }: any) {
  let stateList = await prisma.state.findMany({});
  let districtList = await prisma.district.findMany({});
  let townshipList = await prisma.township.findMany({});
  let attributeList = await prisma.attribute.findMany({
    include: {
      Term: true,
    },
  });

  return {
    props: {
      stateList: JSON.parse(JSON.stringify(stateList)),
      districtList: JSON.parse(JSON.stringify(districtList)),
      townshipList: JSON.parse(JSON.stringify(townshipList)),
      ...(await serverSideTranslations(locale, ["common"], nextI18nextConfig)),
    },
  };
}

export default Default;
