import { CartItem } from "@/prisma/models/cartItems";
import { Colors } from "@/types/color";
import { OrderStatus } from "@/types/orderTypes";
import {
  getCartItems,
  getDiscountTotal,
  getPriceTotal,
  getPromoTotal,
  getShippingFeeTotal,
  getShippingTotal,
  getSubTotal,
  getTotal,
  isCartValid,
} from "@/util/orderHelper";
import { formatAmount, getInitials } from "@/util/textHelper";
import {
  Attribute,
  Brand,
  Condition,
  Content,
  Order,
  Product,
  PromoCode,
  Term,
  User,
} from "@prisma/client";
import { Button } from "@react-email/button";
import {
  Body,
  Container,
  Column,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import { sortBy } from "lodash";
import * as React from "react";

const baseUrl = "http://52.221.211.85/";

type CartItemWithProduct = CartItem & {
  prodDetail: Product & { Brand: Brand; Condition: Condition };
};

export default function OrderEmail({
  content,
  order,
  attributes,
  sellerId,
}: {
  content: Content;
  order: any;
  attributes: (Attribute & {
    Term: Term[];
  })[];
  sellerId?: string;
}) {
  return (
    <Html>
      <Head />
      <Preview>Treasure Rush</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={box}>
            <Section>
              <Row>
                <Column>
                  <Img
                    src={`${baseUrl}/assets/logo_full.png`}
                    height="90"
                    alt="Treasure Rush"
                  />
                </Column>
                <Column align="right">
                  <Text style={footer}>{content.email}</Text>
                  <Text style={footer}>{content.phone}</Text>
                  <Text style={footer}>{content.addressMM}</Text>
                </Column>
              </Row>
            </Section>
            <Hr />
            {/* <Text style={paragraph}>
              {order.sellerResponse.filter(
                (z: any) => z.statusHistory.length === 1
              ).length === order.sellerResponse.length
                ? "New Order"
                : order.sellerResponse.filter((z: any) =>
                    z.statusHistory.find(
                      (b: any) =>
                        b.status === OrderStatus.Shipped ||
                        b.status === OrderStatus.Rejected
                    )
                  ).length === order.sellerResponse.length
                ? "Completed Order"
                : "Processing Order"}{" "}
              #{order.orderNo}
            </Text> */}
            <Section>
              <Row>
                <Column>
                  <Text style={header}>Order Info</Text>
                  <Text style={paragraph}>Order No : # {order.orderNo}</Text>
                  <Text style={paragraph}>
                    Ordered Date:
                    {new Date(order.createdAt).toLocaleDateString("en-ca", {
                      timeZone: "Asia/Yangon",
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                    })}
                  </Text>
                  {order.createdAt !== order.updatedAt && (
                    <Text style={paragraph}>
                      Updated Date:{" "}
                      {new Date(order.updatedAt).toLocaleDateString("en-ca", {
                        timeZone: "Asia/Yangon",
                        year: "numeric",
                        month: "short",
                        day: "2-digit",
                      })}
                    </Text>
                  )}
                </Column>
              </Row>
            </Section>
            <Hr />
            <Section>
              <Text style={header}>Seller Info</Text>
              {order.sellerResponse
                .filter((z: any) => (sellerId ? z.sellerId === sellerId : true))
                .map((z: any) => {
                  let lastStatus = sortBy(
                    z.statusHistory,
                    (s) => s.updatedDate
                  ).reverse()[0];
                  return {
                    ...z,
                    lastStatus,
                  };
                })
                .map((status: any, index) => (
                  <Container key={index}>
                    <Row>
                      <Column>
                        {status.seller.profile ? (
                          <Img
                            src={`${baseUrl}/api/files/${status.seller.profile}`}
                            height="40"
                            width="40"
                            alt={status.seller.username}
                            style={{
                              border: "1px #E71D2A solid",
                              borderRadius: 50,
                            }}
                          />
                        ) : (
                          <></>
                        )}
                      </Column>
                      <Column>
                        <Text style={paragraph}>
                          {status.seller.username} (
                          {order.cartItems
                            .filter((b: any) => b.sellerId === status.sellerId)
                            .map((b: any) => b.quantity)
                            .reduce((a, b) => a + b, 0)}
                          )
                        </Text>
                        <Text style={paragraph}>
                          Subtotal:{" "}
                          {formatAmount(
                            order.cartItems
                              .filter(
                                (z: CartItem) =>
                                  isCartValid(
                                    order.sellerResponse.find(
                                      (e: any) => e.sellerId === z.sellerId
                                    )
                                  ) && z.sellerId === status.sellerId
                              )
                              .map((z: CartItem) =>
                                z.salePrice
                                  ? z.salePrice * z.quantity
                                  : z.normalPrice * z.quantity
                              )
                              .reduce((a, b) => a + b, 0),
                            "en",
                            true
                          )}
                        </Text>
                        <Text style={paragraph}>
                          Shipping Cost:{" "}
                          {status.isFreeShipping === true
                            ? "Free Shipping"
                            : status.shippingFee
                            ? formatAmount(
                                isCartValid(
                                  order.sellerResponse.find(
                                    (e: any) => e.sellerId === status.sellerId
                                  )
                                )
                                  ? status.shippingFee
                                  : 0,
                                "en",
                                true
                              )
                            : "Paid by recipient on delivery"}
                        </Text>
                        {order.discountTotal.find(
                          (z: any) => z.sellerId === status.sellerId
                        ) ? (
                          <Text style={paragraph}>
                            Promo Discount:{" "}
                            {formatAmount(
                              order.discountTotal
                                .filter(
                                  (z: any) => z.sellerId === status.sellerId
                                )
                                .map((b: any) => b.discount)[0],
                              "en",
                              true
                            )}
                          </Text>
                        ) : (
                          <></>
                        )}
                      </Column>
                      <Column align="right">
                        <Text style={priceStyle}>
                          Status: {status.lastStatus.status}
                        </Text>
                        <Text style={priceStyle}>
                          Updated Date:{" "}
                          {new Date(
                            status.lastStatus.updatedDate
                          ).toLocaleDateString("en-ca", {
                            timeZone: "Asia/Yangon",
                            year: "numeric",
                            month: "short",
                            day: "2-digit",
                          })}
                        </Text>
                        {order.promoCodes.find(
                          (z) => z.sellerId === status.sellerId
                        ) ? (
                          <Text style={priceStyle}>
                            Applied Promo Code:{" "}
                            {
                              order.promoCodes.find(
                                (z) => z.sellerId === status.sellerId
                              ).promoCode
                            }
                          </Text>
                        ) : (
                          <></>
                        )}
                      </Column>
                    </Row>
                    {index <
                    order.sellerResponse.filter((z: any) =>
                      sellerId ? z.sellerId === sellerId : true
                    ).length -
                      1 ? (
                      <Hr />
                    ) : (
                      <></>
                    )}
                  </Container>
                ))}
            </Section>
            <Hr />
            <Section>
              <Row>
                <Column colSpan={2}>
                  <Row>
                    <Column>
                      <Text style={header}>Billing Address</Text>
                      <Text style={paragraph}>
                        Username: {order?.billingAddress?.name}
                      </Text>
                      <Text style={paragraph}>
                        Phone: {order?.billingAddress?.phoneNum}
                      </Text>

                      {order?.billingAddress?.email && (
                        <Link
                          style={{
                            ...paragraph,
                            color: "#15c",
                            textDecoration: "underline",
                          }}
                        >
                          Email: {order?.billingAddress?.email}
                        </Link>
                      )}

                      <Text style={paragraph}>
                        House No: {order?.billingAddress?.houseNo}
                      </Text>
                      <Text style={paragraph}>
                        Street: {order?.billingAddress?.street}
                      </Text>
                      <Text style={paragraph}>
                        Address:
                        {order?.billingAddress?.townshipStr
                          ? order.billingAddress.townshipStr
                          : ""}
                        {", "}
                        {order?.billingAddress?.districtStr
                          ? order.billingAddress.districtStr
                          : ""}
                        {", "}
                        {order?.billingAddress?.stateStr
                          ? order.billingAddress.stateStr
                          : ""}{" "}
                      </Text>
                    </Column>
                  </Row>
                </Column>
                {order?.isAddressDiff === true && (
                  <Column
                    align="right"
                    style={{
                      verticalAlign: "sub",
                      paddingLeft: "30px",
                    }}
                  >
                    <Text style={header}>Shipping Address</Text>
                    <Text style={paragraph}>
                      Name: {order?.shippingAddress?.name}
                    </Text>
                    <Text style={paragraph}>
                      Phone: {order?.shippingAddress?.phoneNum}
                    </Text>
                    <Text style={paragraph}>
                      House No: {order?.shippingAddress?.houseNo}
                    </Text>
                    <Text style={paragraph}>
                      Street: {order?.shippingAddress?.street}
                    </Text>
                    <Text style={paragraph}>
                      Address:
                      {order?.shippingAddress?.townshipStr
                        ? order.shippingAddress.townshipStr
                        : ""}
                      {", "}
                      {order?.shippingAddress?.districtStr
                        ? order.shippingAddress.districtStr
                        : ""}
                      {", "}
                      {order?.shippingAddress?.stateStr
                        ? order.shippingAddress.stateStr
                        : ""}{" "}
                    </Text>
                  </Column>
                )}
              </Row>
            </Section>
            {order.buyerNote && (
              <>
                <Hr />
                <Section>
                  <Text style={header}>Order Note</Text>
                  <Text style={paragraph}>{order.buyerNote}</Text>
                </Section>
              </>
            )}

            <Button
              pX={10}
              pY={10}
              style={button}
              href={baseUrl + "/orders/" + order.orderNo}
            >
              View Order
            </Button>
            <Hr style={hr} />
            <Section>
              <Text style={header}>Order Details</Text>
              {order.cartItems
                .filter((z) => (sellerId ? z.sellerId === sellerId : true))
                .map((z: any, index) => (
                  <Section key={index}>
                    <Row>
                      <Column>
                        <Img
                          src={
                            z.variation && z.variation.img
                              ? `${baseUrl}/api/files/${z.variation.img}`
                              : `${baseUrl}/api/files/${z.prodDetail.imgList[0]}`
                          }
                          width={80}
                          height={80}
                          alt={z.prodDetail.name}
                        />
                      </Column>
                      <Column>
                        <Text
                          style={
                            isCartValid(
                              order.sellerResponse.find(
                                (e: any) => e.sellerId === z.sellerId
                              )
                            )
                              ? paragraph
                              : rejectParagraph
                          }
                        >
                          Name: {z.prodDetail.name}
                        </Text>

                        <Text
                          style={
                            isCartValid(
                              order.sellerResponse.find(
                                (e: any) => e.sellerId === z.sellerId
                              )
                            )
                              ? paragraph
                              : rejectParagraph
                          }
                        >
                          SKU:{" "}
                          {z.variation && z.variation.SKU
                            ? z.variation.SKU
                            : z.prodDetail.SKU}
                        </Text>
                        <Text
                          style={
                            isCartValid(
                              order.sellerResponse.find(
                                (e: any) => e.sellerId === z.sellerId
                              )
                            )
                              ? paragraph
                              : rejectParagraph
                          }
                        >
                          Brand: {z.prodDetail.Brand.name}
                        </Text>

                        {z.variation?.attributes?.map((b, index2) => (
                          <Text
                            style={
                              isCartValid(
                                order.sellerResponse.find(
                                  (e: any) => e.sellerId === z.sellerId
                                )
                              )
                                ? paragraph
                                : rejectParagraph
                            }
                            key={index2}
                          >
                            {
                              attributes.find((y) => y.id === b.attributeId)
                                .name
                            }
                            : {b.name}
                          </Text>
                        ))}
                        {/* <Text style={paragraph}>Attribute</Text> */}
                        <Text
                          style={
                            isCartValid(
                              order.sellerResponse.find(
                                (e: any) => e.sellerId === z.sellerId
                              )
                            )
                              ? paragraph
                              : rejectParagraph
                          }
                        >
                          Seller: {z.prodDetail.seller?.username}
                        </Text>
                      </Column>

                      <Column
                        align="right"
                        style={{
                          verticalAlign: "sub",
                        }}
                      >
                        <Text
                          style={
                            isCartValid(
                              order.sellerResponse.find(
                                (e: any) => e.sellerId === z.sellerId
                              )
                            )
                              ? paragraph
                              : rejectParagraph
                          }
                        >
                          Unit Price: {z.normalPrice}
                        </Text>
                        {z.salePrice && (
                          <Text
                            style={
                              isCartValid(
                                order.sellerResponse.find(
                                  (e: any) => e.sellerId === z.sellerId
                                )
                              )
                                ? paragraph
                                : rejectParagraph
                            }
                          >
                            Discount:{" "}
                            {z.salePrice ? z.salePrice - z.normalPrice : 0}
                          </Text>
                        )}
                        <Text
                          style={
                            isCartValid(
                              order.sellerResponse.find(
                                (e: any) => e.sellerId === z.sellerId
                              )
                            )
                              ? paragraph
                              : rejectParagraph
                          }
                        >
                          Quantity: {z.quantity}
                        </Text>
                        <Text
                          style={
                            isCartValid(
                              order.sellerResponse.find(
                                (e: any) => e.sellerId === z.sellerId
                              )
                            )
                              ? paragraph
                              : rejectParagraph
                          }
                        >
                          Total Price:{" "}
                          {z.salePrice
                            ? z.salePrice * z.quantity
                            : z.normalPrice * z.quantity}
                        </Text>
                      </Column>
                    </Row>
                    {index <
                    order.cartItems.filter((z) =>
                      sellerId ? z.sellerId === sellerId : true
                    ).length -
                      1 ? (
                      <Hr />
                    ) : (
                      <></>
                    )}
                  </Section>
                ))}
            </Section>

            <Hr />

            <Section>
              <Row>
                <Column align="right">
                  <Text style={priceStyle}>
                    Subtotal :{" "}
                    {formatAmount(
                      getTotal(
                        getCartItems(order?.cartItems, order?.sellerResponse),
                        sellerId
                      ),
                      "en",
                      true
                    )}
                  </Text>
                  <Text style={priceStyle}>
                    Shipping Total:{" "}
                    {formatAmount(
                      getShippingTotal(order?.sellerResponse, sellerId),
                      "en",
                      true
                    )}
                  </Text>
                  <Text style={priceStyle}>
                    Discount:{" "}
                    {formatAmount(
                      getDiscountTotal(
                        order?.sellerResponse,
                        order?.discountTotal,
                        sellerId
                      ),
                      "en",
                      true
                    )}
                  </Text>
                  <Text style={priceStyle}>
                    Total:{" "}
                    {formatAmount(
                      getTotal(
                        getCartItems(order?.cartItems, order?.sellerResponse),
                        sellerId
                      ) -
                        getDiscountTotal(
                          order?.sellerResponse,
                          order?.discountTotal,
                          sellerId
                        ) +
                        getShippingTotal(order?.sellerResponse, sellerId),
                      "en",
                      true
                    )}
                  </Text>
                </Column>
              </Row>
            </Section>

            <Hr />
            <Text style={highlightParagraph}>
              Seller မတူပါက သီးခြားငွေပေးချေရမည်ဖြစ်ပါသည်။
            </Text>
            <Text style={paragraph}>
              ဝယ်ယူအားပေးမှုအတွက် ကျေးဇူးတင်ရှိပါသည်။
            </Text>
            <Text style={paragraph}>ပို့ဆောင်ခအပြောင်းအလဲရှိနိုင်ပါသည်။</Text>

            <Text style={paragraph}>— Treasure Rush Team</Text>
            <Hr style={hr} />

            <Section>
              <Column align="center" style={footerIcon}>
                <Img
                  src={`${baseUrl}/assets/logo_full.png`}
                  height={100}
                  alt="Treasure Rush"
                />
              </Column>
            </Section>
            <Text style={footerLinksWrapper}>
              <Link href="https://treasurerush.com.mm/legal?type=Terms%20%26%20Conditions">
                Terms & Conditions
              </Link>{" "}
              •{" "}
              <Link href="https://treasurerush.com.mm/legal?type=Privacy%20Policy">
                Privacy Policy{" "}
              </Link>
            </Text>
            <Text style={footerCopyright}>
              Copyright © 2023 Treasure Rush designed by DigiSoft (Myanmar){" "}
              <br /> All rights reserved
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const footerText = {
  fontSize: "12px",
  color: "#b7b7b7",
  lineHeight: "15px",
  textAlign: "left" as const,
  marginBottom: "50px",
};

const footerLink = {
  color: "#b7b7b7",
  textDecoration: "underline",
};

const footerLogos = {
  marginBottom: "32px",
  paddingLeft: "8px",
  paddingRight: "8px",
  width: "100%",
};

const socialMediaIcon = {
  display: "inline",
  marginLeft: "32px",
};

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const box = {
  padding: "0 48px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const paragraph = {
  color: "#525f7f",

  fontSize: "12px",
  lineHeight: "14px",
  textAlign: "left" as const,
};

const rejectParagraph = {
  ...paragraph,
  textDecoration: "line-through",
};

const priceStyle = {
  ...paragraph,
  textAlign: "right" as const,
};

const header = {
  ...paragraph,
  fontSize: "14px",
  color: "#E71D2A",
  fontWeight: "600",
  margin: "10px 0",
};

const anchor = {
  color: "#E71D2A",
};

const button = {
  backgroundColor: "#E71D2A",
  borderRadius: "5px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  width: "100%",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  margin: "5px 0px",
};

const footerIcon = { display: "block", margin: "0px 0 0 0" };

const footerLinksWrapper = {
  margin: "8px 0 0 0",
  textAlign: "center" as const,
  fontSize: "12px",
  color: "rgb(102,102,102)",
};

const footerCopyright = {
  margin: "25px 0 0 0",
  textAlign: "center" as const,
  fontSize: "12px",
  color: "rgb(102,102,102)",
};

const highlightParagraph = {
  ...paragraph,
  color: Colors.primary,
};
