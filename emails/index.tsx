import { Content } from "@prisma/client";
import {
  Body,
  Button,
  Column,
  Container,
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

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000/";

export function DefaultEmail() {
  const content: any = {
    email: "hello",
    phone: "+959450035222",
    addressMM: "ရန်ကုန်",
  };

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
            <Hr style={hr} />
            <Text style={paragraph}>Title</Text>
            <Text style={paragraph}>Description</Text>
            <Button
              pX={10}
              pY={10}
              style={button}
              href="https://dashboard.stripe.com/login"
            >
              View Button
            </Button>
            <Hr style={hr} />
            <Section>
              <Text style={paragraph}>Body</Text>
            </Section>

            <Hr />

            <Text style={paragraph}>
              ဝယ်ယူအားပေးမှုအတွက် ကျေးဇူးတင်ရှိပါသည်။
            </Text>
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

export default DefaultEmail;

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

  fontSize: "14px",
  lineHeight: "20px",
  textAlign: "left" as const,
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
