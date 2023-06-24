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

export default function Email() {
  return (
    <Html>
      <Head />
      <Preview>Default | Shwe Yee Oo Receipt</Preview>
      <Button
        pX={20}
        pY={12}
        href="https://example.com"
        style={{ background: "#000", color: "#fff" }}
      >
        Click me
      </Button>
    </Html>
  );
}
