import { defaultDescription } from "@/types/const";
import Head from "next/head";
import Image from "next/image";
import React from "react";

function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center">
      <Head>
        <title>Loading | Treasure Rush</title>
        <meta name="description" content={defaultDescription} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="relative">
        <div className="relative z-30 flex flex-col items-center justify-center">
          <div className="z-50 flex h-[200px] w-[200px] lg:w-auto lg:h-auto flex-col items-center justify-center rounded-full bg-[#FFF] p-5">
            <Image
              src={"/assets/logo_full.png"}
              className="object-cover"
              alt="logo"
              width={200}
              height={100}
              priority={true}
            />
            <div className="loading-bar absolute w-full max-w-[100px] lg:w-[100px]"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoadingScreen;
