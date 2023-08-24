import { fetcher } from "@/util/fetcher";
import { showErrorDialog, showSuccessDialog } from "@/util/swalFunction";
import { verifyEmail } from "@/util/verify";
import { useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import useSWR from "swr";
import SelectBox, { SelectType } from "../presentational/SelectBox";
import { ProductNavType } from "@/types/productTypes";
import { Content, Role } from "@prisma/client";
import { PrivacyType } from "@/types/pageType";
import Image from "next/image";
import { SocialIcon } from "react-social-icons";
import { Colors } from "@/types/color";
import { isSeller } from "@/util/authHelper";

export const subscribeList = [
  { name: "allUpdates", value: "All" },
  { name: "auctionUpdates", value: "Auction" },
  { name: "newProducts", value: "NewProducts" },
];

function Footer({ content }: { content: Content }) {
  const { t } = useTranslation("common");
  const { data: session }: any = useSession();
  const { locale } = useRouter();
  const { theme } = useTheme();
  const [onSubmit, setOnSubmit] = React.useState(false);

  let all = subscribeList[0];
  all.name = t(all.name);

  const [subscribe, setSubscribe] = React.useState<SelectType>(all);
  const mailInputRef = React.useRef<HTMLInputElement | null>(null);

  return content ? (
    <footer className="bg-white border-t-4 border-t-primary">
      <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="lg:flex lg:gap-8">
          <div></div>
          <div className="mt-8 grid grid-cols-2 gap-8 lg:mt-0 lg:grid-cols-5 lg:gap-y-16">
            <div className="col-span-2">
              <div className="min-w-[50vw]">
                <Image
                  src="/assets/logo_full.png"
                  width={200}
                  height={100}
                  style={{
                    objectFit: "cover",
                    maxHeight: 100,
                  }}
                  alt="logo"
                />
              </div>
            </div>

            <div className="col-span-2 lg:col-span-3 lg:flex lg:items-end">
              <form
                className="w-full"
                onSubmit={(e: any) => {
                  e.preventDefault();
                  const email = e.target.email.value;
                  if (email) {
                    fetch("/api/subscribe", {
                      method: "POST",
                      body: JSON.stringify({
                        email: email,
                      }),
                    }).then((data) => {
                      if (data.status === 200) {
                        showSuccessDialog(
                          "You have successfully subscribed to our list.",
                          "သင်သည် ကျွန်ုပ်တို့၏စာရင်းတွင် အောင်မြင်စွာ စာရင်းသွင်းပြီးပါပြီ။"
                        );
                      } else {
                        showErrorDialog(
                          "This email address is already in our subscription list.",
                          "ဤအီးမေးလ်လိပ်စာသည် ကျွန်ုပ်တို့၏ စာရင်းသွင်းမှုစာရင်းတွင် ရှိနှင့်ပြီးဖြစ်သည်။",
                          locale
                        );
                      }
                    });
                  }
                }}
              >
                <label htmlFor="UserEmail" className="sr-only">
                  {" "}
                  Email{" "}
                </label>

                <div className="border border-gray-100 p-2 focus-within:ring sm:flex sm:items-center sm:gap-4">
                  <input
                    name="email"
                    type="email"
                    id="UserEmail"
                    placeholder="john@rhcp.com"
                    className="w-full border-none focus:border-transparent focus:ring-transparent sm:text-sm"
                    required
                  />

                  <button className="mt-1 w-full bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-none hover:bg-primary-focus sm:mt-0 sm:w-auto sm:shrink-0">
                    Subscribe
                  </button>
                </div>
              </form>
            </div>

            <div className="lg:col-span-2 sm:col-span-2">
              <span className="text-xs uppercase tracking-wide text-gray-500">
                Call us
              </span>

              <a
                href={"tel:" + encodeURIComponent(content.phone)}
                target="_blank"
                className="block text-2xl font-medium text-gray-900 hover:opacity-75 sm:text-3xl"
              >
                {content.phone}
              </a>

              <ul className="mt-5 space-y-1 text-sm text-gray-700">
                <li>Monday to Friday: {content.workingHourWeekdays}</li>
                <li>Weekend: {content.workingHourWeekend}</li>
              </ul>

              <ul className="mt-8 flex gap-6">
                {content?.socialUrl?.map((e: string, index: number) => (
                  <li key={index}>
                    <SocialIcon
                      url={e}
                      key={index}
                      style={{ width: 24, height: 24 }}
                      color={Colors.primaryText}
                      bgColor={Colors.primaryText}
                    />
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <p className="font-medium text-gray-900">Services</p>

              <ul className="mt-6 space-y-4 text-sm">
                <li>
                  <Link
                    href={"/marketplace"}
                    className="text-gray-700 transition hover:text-primary hover:border-b-2 hover:border-b-primary"
                  >
                    Marketplace
                  </Link>
                </li>

                <li>
                  <Link
                    href={"/marketplace?type=" + ProductNavType.Auction}
                    className="text-gray-700 transition hover:text-primary hover:border-b-2 hover:border-b-primary"
                  >
                    Live Auctions
                  </Link>
                </li>

                <li>
                  <Link
                    href={"/marketplace?type=" + ProductNavType.Promotion}
                    className="text-gray-700 transition hover:text-primary hover:border-b-2 hover:border-b-primary"
                  >
                    Promotions
                  </Link>
                </li>

                <li>
                  <Link
                    href={isSeller(session) ? "/products" : "/memberships"}
                    className="text-gray-700 transition hover:text-primary hover:border-b-2 hover:border-b-primary"
                  >
                    Sell on Treasure Rush
                  </Link>
                </li>
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <p className="font-medium text-gray-900">Helpful Links</p>

              <ul className="mt-6 space-y-4 text-sm">
                <li>
                  <Link
                    href={"/about#contact"}
                    className="text-gray-700 transition hover:text-primary hover:border-b-2 hover:border-b-primary"
                  >
                    Contact
                  </Link>
                </li>

                <li>
                  <Link
                    href={"/faqs"}
                    className="text-gray-700 transition hover:text-primary hover:border-b-2 hover:border-b-primary"
                  >
                    FAQs
                  </Link>
                </li>

                <li>
                  <Link
                    href={"/memberships"}
                    className="text-gray-700 transition hover:text-primary hover:border-b-2 hover:border-b-primary"
                  >
                    Membership
                  </Link>
                </li>

                <li>
                  <Link
                    href={"/about"}
                    className="text-gray-700 transition hover:text-primary hover:border-b-2 hover:border-b-primary"
                  >
                    About Treasure Rush
                  </Link>
                </li>
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <p className="font-medium text-gray-900">Downloads</p>

              <ul className="mt-6 space-y-4 text-sm">
                <li>
                  <div className="flex h-14 w-48 items-center justify-center rounded-xl border border-black bg-primaryText text-white">
                    <div className="mr-3 text-white">
                      <svg viewBox="0 0 384 512" width="30">
                        <path
                          fill="currentColor"
                          d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"
                        />
                      </svg>
                    </div>
                    <a
                      className="text-diamond"
                      href={content.appStoreURL}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <div className="text-xs">Download on the</div>
                      <div className="-mt-1 font-sans text-2xl font-semibold">
                        App Store
                      </div>
                    </a>
                  </div>
                </li>

                <li>
                  <div className="mt-3 flex h-14 w-48 items-center justify-center rounded-lg bg-primaryText text-white">
                    <div className="mr-3">
                      <svg viewBox="30 336.7 120.9 129.2" width="30">
                        <path
                          fill="#FFD400"
                          d="M119.2,421.2c15.3-8.4,27-14.8,28-15.3c3.2-1.7,6.5-6.2,0-9.7  c-2.1-1.1-13.4-7.3-28-15.3l-20.1,20.2L119.2,421.2z"
                        />
                        <path
                          fill="#FF3333"
                          d="M99.1,401.1l-64.2,64.7c1.5,0.2,3.2-0.2,5.2-1.3  c4.2-2.3,48.8-26.7,79.1-43.3L99.1,401.1L99.1,401.1z"
                        />
                        <path
                          fill="#48FF48"
                          d="M99.1,401.1l20.1-20.2c0,0-74.6-40.7-79.1-43.1  c-1.7-1-3.6-1.3-5.3-1L99.1,401.1z"
                        />
                        <path
                          fill="#3BCCFF"
                          d="M99.1,401.1l-64.3-64.3c-2.6,0.6-4.8,2.9-4.8,7.6  c0,7.5,0,107.5,0,113.8c0,4.3,1.7,7.4,4.9,7.7L99.1,401.1z"
                        />
                      </svg>
                    </div>
                    <a
                      className="text-diamond"
                      href={content.playStoreURL}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <div className="text-xs">GET IT ON</div>
                      <div className="-mt-1 font-sans text-xl font-semibold">
                        Google Play
                      </div>
                    </a>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-100 pt-8">
          <div className="sm:flex sm:justify-between">
            <p className="text-xs text-gray-500">
              &copy; 2023. Treasure Rush designed by DigiSoft (Myanmar). All
              rights reserved.
            </p>

            <ul className="mt-8 flex flex-wrap justify-center gap-4 text-xs sm:mt-0 lg:justify-end">
              <li>
                <Link
                  href={"/legal?type=Terms%20%26%20Conditions"}
                  className="text-gray-500 transition hover:text-primary hover:border-b-2 hover:border-b-primary"
                >
                  Terms & Conditions
                </Link>
              </li>

              <li>
                <Link
                  href={"/legal?type=Privacy%20Policy"}
                  className="text-gray-500 transition hover:text-primary hover:border-b-2 hover:border-b-primary"
                >
                  Privacy Policy
                </Link>
              </li>

              <li>
                <Link
                  href={"/legal?type=Cookies"}
                  className="text-gray-500 transition hover:text-primary hover:border-b-2 hover:border-b-primary"
                >
                  Cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  ) : (
    <></>
  );
}

export default Footer;
