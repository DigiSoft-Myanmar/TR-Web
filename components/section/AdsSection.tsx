import { fileUrl } from "@/types/const";
import { Ads } from "@prisma/client";
import Image from "next/image";
import React from "react";
import { fetcher } from "@/util/fetcher";
import useSWR from "swr";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination, Autoplay } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";

function AdsSection({ ads }: { ads: Ads[] }) {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  return (
    <Swiper
      modules={[Navigation, Pagination, Autoplay]}
      effect={"fade"}
      loop={true}
      autoplay={{
        delay: 5000,
      }}
      fadeEffect={{
        crossFade: true,
      }}
      /* navigation={{
      prevEl: ".swiper-prev-button",
      nextEl: ".swiper-next-button",
    }} */
      slidesPerView={1}
      className="my-5 flex w-full flex-row items-stretch justify-center gap-3 md:gap-10"
    >
      {ads?.map((e: Ads, index: number) => (
        <SwiperSlide key={index}>
          <Image
            alt="ads"
            src={fileUrl + e.adsImg}
            className="rounded-md object-none md:object-cover"
            height={400}
            width={1280}
            style={{
              maxHeight: "400px",
              width: "100%",
            }}
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

export default AdsSection;
