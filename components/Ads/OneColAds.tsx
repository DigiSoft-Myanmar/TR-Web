import { AdsLocation } from "@/util/adsHelper";
import { useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import React from "react";

interface Props {
  width?: number;
  height?: number;
  disableTop?: boolean;
  adsList: any;
  adsLocations: AdsLocation[];
}

function OneColAds({
  width,
  height,
  disableTop,
  adsList,
  adsLocations,
}: Props) {
  const { data: session } = useSession();
  const { t } = useTranslation("common");

  const [currentIndex, setCurrentindex] = React.useState(0);

  React.useEffect(() => {
    let timer1 = setTimeout(() => {
      if (adsList.length > 1) {
        if (currentIndex + 1 >= adsList.length) {
          setCurrentindex(0);
        } else {
          setCurrentindex(currentIndex + 1);
        }
      }
    }, 5 * 1000);
    return () => {
      clearTimeout(timer1);
    };
  }, [adsList, currentIndex]);
  return (
    adsList &&
    adsList.length > 0 && (
      <section
        className={`text-white rounded-md mx-auto xl:w-[1200px] xl:max-w-[1200px] ${
          disableTop === true ? "my-0" : "md:my-10"
        }`}
      >
        <div
          className={`overflow-hidden ${
            disableTop === true ? "py-0" : "py-10"
          } mx-auto ${
            height ? `lg:h[${height}px]` : "lg:h-[300px]"
          } lg:items-center lg:flex`}
        >
          {adsList[currentIndex] && adsList[currentIndex].url ? (
            <a
              target="_blank"
              href={adsList[currentIndex].url}
              onClick={(e) => {
                try {
                  fetch("https://api.ipify.org/?format=json")
                    .then((data) => data.json())
                    .then((json) => {
                      fetch(
                        "/api/ads/clickCount?adsId=" +
                          encodeURIComponent(
                            adsList[currentIndex]._id.toString()
                          ) +
                          "&adsLocation=" +
                          encodeURIComponent(adsLocations[0]) +
                          "&ip=" +
                          json.ip,
                        {
                          method: "POST",
                        }
                      );
                    });
                  return true;
                } catch (err) {
                  fetch(
                    "/api/ads/clickCount?adsId=" +
                      adsList[currentIndex]._id.toString() +
                      "&adsLocation=" +
                      encodeURIComponent(adsLocations[0]),
                    {
                      method: "POST",
                    }
                  );
                  return true;
                }
              }}
            >
              <img
                src={
                  "/api/files/" +
                  encodeURIComponent(adsList[currentIndex].filename)
                }
                className="overflow-hidden xl:min-w-[1200px] min-h-[300px] xl:max-w-[1200px] max-h-[300px] object-contain animate-fade"
                key={currentIndex}
              />
            </a>
          ) : (
            <img
              src={
                "/api/files/" +
                encodeURIComponent(adsList[currentIndex].filename)
              }
              className="overflow-hidden xl:min-w-[1200px] min-h-[300px] xl:max-w-[1200px] max-h-[300px] object-contain animate-fade"
              key={currentIndex}
            />
          )}
        </div>
      </section>
    )
  );
}

export default OneColAds;
