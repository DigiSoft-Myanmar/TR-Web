import { useRouter } from "next/router";
import React from "react";

interface Props {
  error?: string;
  errorMM?: string;
}

function ErrorText({ error, errorMM }: Props) {
  const { locale } = useRouter();
  return error ? (
    locale === "mm" && errorMM && errorMM.length > 0 ? (
      <p className="p-2 text-xs text-error">{errorMM}</p>
    ) : (
      <p className="p-2 text-xs text-error">{error}</p>
    )
  ) : (
    <></>
  );
}

export default ErrorText;
