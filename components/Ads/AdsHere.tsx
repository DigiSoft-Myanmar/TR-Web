import { useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import React from "react";

interface Props {
  width?: number;
  height?: number;
  src?: string;
}

function AdsHere({ width = 1200, height = 300, src }: Props) {
  const { data: session } = useSession();
  const { t } = useTranslation("common");

  /* return (
    <section
      className={`${
        width && height
          ? `px-4 py-10 mx-auto lg:items-center lg:flex overflow-hidden min-w-[${width}px] min-h-[${height}px] max-w-[${width}px] max-h-[${height}px]`
          : "mx-10 "
      } text-white bg-brandLight rounded-md my-10 flex items-center justify-center`}
    >
      <div
        className={`px-4 py-10 mx-auto ${
          height ? `lg:h[${height}px]` : "lg:h-[380px]"
        } lg:items-center lg:flex`}
      >
        <div className="max-w-3xl mx-auto text-center">
          <h1
            className={`${
              width && width <= 300 ? "text-2xl" : "text-3xl"
            }  font-extrabold text-white leading-loose sm:leading-loose`}
          >
            {t("placeYourAdsHere")}
          </h1>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            {session &&
              (session.role === Role.Trader ||
                session.role === Role.Seller) && (
                <Link href="/ads">
                  <a
                    className="block w-full px-12 py-3 text-sm font-medium text-brand bg-white border border-white rounded sm:w-auto active:text-opacity-75 hover:bg-transparent hover:text-lightShade focus:outline-none focus:ring"
                    href="/ads"
                  >
                    {t("getStarted")}
                  </a>
                </Link>
              )}

            <Link href="/memberships">
              <a className="block w-full px-12 py-3 text-sm font-medium text-white border border-white rounded sm:w-auto hover:bg-brand active:bg-brand focus:outline-none focus:ring">
                {t("learnMore")}
              </a>
            </Link>
          </div>
        </div>
      </div>
    </section>
  ); */

  return width === 1200 && height === 300 ? (
    <img
      src={src ? src : "/assets/images/Ads1200x300.png"}
      className={`overflow-hidden xl:min-w-[${width}px] min-h-[${height}px] xl:max-w-[${width}px] max-h-[${height}px] mx-auto xl:w-[1200px] xl:max-w-[1200px] object-contain my-5`}
    />
  ) : (
    <img
      src={src ? src : "/assets/images/Ads1200x300.png"}
      className={`overflow-hidden min-w-[${width}px] min-h-[${height}px] max-w-[${width}px] max-h-[${height}px] object-contain mx-10 md:mx-20 my-5`}
    />
  );
}

export default AdsHere;
