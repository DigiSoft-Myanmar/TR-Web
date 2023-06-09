import { NextApiRequest, NextApiResponse } from "next";
import puppeteer from "puppeteer";

const saveAsPdf = async (url: string) => {
  const browser = await puppeteer.launch(
    process.env.NODE_ENV === "development"
      ? {}
      : {
          executablePath: "/usr/bin/chromium-browser",
          args: ["--no-sandbox", "--disabled-setupid-sandbox"],
        },
  );
  const page = await browser.newPage();

  await page.goto(url, {
    waitUntil: "networkidle0",
  });

  const result = await page.pdf({
    format: "A4",
    scale: 0.6,
  });
  await browser.close();

  return result;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  try {
    const { orderNo } = req.query; // pass the page to create PDF from as param

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="Order #${orderNo}.pdf"`,
    );

    const pdf = await saveAsPdf(
      process.env.NEXTAUTH_URL + "/api/orders/print/email?orderNo=" + orderNo,
    );
    return res.send(pdf);
  } catch (err) {
    console.log(err);
  }
}
