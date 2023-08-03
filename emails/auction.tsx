import { formatAmount } from "@/util/textHelper";
import {
  Auctions,
  Brand,
  Condition,
  Content,
  Product,
  User,
  WonList,
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
import * as React from "react";

const baseUrl = "http://52.221.211.85/";

export default function AuctionEmail({
  content,
  wonList,
}: {
  content: Content;
  wonList: WonList & {
    product: Product & {
      Brand: Brand;
      Condition: Condition;
      seller: User;
    };
    auction: Auctions & {
      createdBy: User;
    };
  };
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

            <Section>
              <Row>
                <Column>
                  <Text style={header}>
                    {wonList.status === "AutoCancelled"
                      ? "Auto-Cancelled: Inaction Leads to Cancellation"
                      : wonList.status === "InCart"
                      ? "In Cart: Ready for Checkout"
                      : wonList.status === "LowPrice"
                      ? "Waiting for Seller Confirmation"
                      : wonList.status === "Purchased"
                      ? "Already Purchased"
                      : wonList.status === "RejectByBuyer"
                      ? "Rejected by buyer"
                      : wonList.status === "RejectBySeller"
                      ? "Rejected by seller"
                      : ""}
                  </Text>
                  <Text style={paragraph}>
                    {wonList.status === "AutoCancelled"
                      ? "We are sorry to inform you that since there was no action from the seller, the system automatically cancelled the offer."
                      : wonList.status === "InCart"
                      ? "Congratulations. The product is in " +
                        wonList.auction.createdBy.username +
                        " cart."
                      : wonList.status === "LowPrice"
                      ? wonList.auction.createdBy.username +
                        " won the product with highest bid " +
                        formatAmount(wonList.auction.amount, "en", true) +
                        ". We are waiting for the seller to confirm the offer."
                      : wonList.status === "Purchased"
                      ? wonList.auction.createdBy.username +
                        " has already purchased the product."
                      : wonList.status === "RejectByBuyer"
                      ? wonList.auction.createdBy.username +
                        " has rejected the offer."
                      : wonList.status === "RejectBySeller"
                      ? wonList.product.seller.username +
                        " has rejected the offer."
                      : ""}
                  </Text>
                  <Text style={paragraph}>
                    - on{" "}
                    {new Date(wonList.updatedAt).toLocaleDateString("en-ca", {
                      timeZone: "Asia/Yangon",
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </Column>
              </Row>
            </Section>
            <Hr />

            <Button pX={10} pY={10} style={button} href={baseUrl + "/auctions"}>
              View Auction
            </Button>
            <Hr style={hr} />
            <Section>
              <Text
                style={{
                  ...header,
                  textAlign: "center",
                  paddingBottom: 10,
                }}
              >
                Product Details
              </Text>
              <Container>
                <Row>
                  <Column>
                    <Img
                      src={`${baseUrl}/api/files/${wonList.product.imgList[0]}`}
                      height="80"
                      width="80"
                      alt={wonList.product.name}
                      style={{
                        border: "1px #E71D2A solid",
                        borderRadius: 10,
                        marginTop: 10,
                      }}
                    />
                  </Column>
                  <Column>
                    <Text style={paragraph}>Name: {wonList.product.name}</Text>

                    <Text style={paragraph}>SKU: {wonList.auction.SKU}</Text>
                    <Text style={paragraph}>
                      Brand: {wonList.product.Brand.name}
                    </Text>

                    <Text style={paragraph}>
                      Seller: {wonList.product.seller?.username}
                    </Text>
                  </Column>
                  <Column align="right">
                    <Text style={priceStyle}>Bid Amount </Text>
                    <Text>
                      {formatAmount(wonList.auction.amount, "en", true)}
                    </Text>
                    <Text style={priceStyle}>Bid Time </Text>
                    <Text>
                      {new Date(wonList.auction.createdAt).toLocaleDateString(
                        "en-ca",
                        {
                          timeZone: "Asia/Yangon",
                          year: "numeric",
                          month: "short",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </Text>
                  </Column>
                </Row>
              </Container>
            </Section>

            <Hr />

            <Text style={paragraph}>
              ဝယ်ယူအားပေးမှုအတွက် ကျေးဇူးတင်ရှိပါသည်။
            </Text>
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
