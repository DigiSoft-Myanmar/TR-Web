import { useRouter } from "next/router";
import React from "react";

interface Props {
  detail?: string;
  detailMM?: string;
}

function PricingDetail({ detail, detailMM }: Props) {
  const { locale } = useRouter();
  const detailRef = React.useRef<HTMLParagraphElement | null>(null);

  React.useEffect(() => {
    let parser = new DOMParser();
    if (detail) {
      const detailContent =
        locale === "mm" && detailMM && detailMM.length > 0 ? detailMM : detail;
      let doc = parser.parseFromString(detailContent, "text/html");
      if (detailRef.current) {
        detailRef.current.innerHTML = "";
        detailRef.current.appendChild(doc.body);
      }
    }
  }, [detail, detailMM, locale]);

  return <p className="text-sm" ref={detailRef}></p>;
}

export default PricingDetail;
