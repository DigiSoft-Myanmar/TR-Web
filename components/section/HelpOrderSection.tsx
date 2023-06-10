import { FeatureType } from "@/types/pageType";
import { getText } from "@/util/textHelper";
import Image from "next/image";
import { useRouter } from "next/router";
import React from "react";
import { IconPickerItem } from "react-fa-icon-picker";

function HelpOrderSection({ howToOrder }: { howToOrder: any }) {
  const { locale } = useRouter();

  return (
    <section className="text-primaryText">
      <div className="py-16 px-5">
        <div className="">
          <h2 className="text-3xl font-bold sm:text-4xl">
            {getText("How to order", "၀ယ်ယူရန်နည်းလမ်း", locale)}
          </h2>

          <p className="mt-4 text-gray-800">
            {getText(
              `Order now and earn cashback! Shop smart with our cashback feature. Get rewarded for your purchases and save big. Don't miss out on this amazing opportunity to earn while you shop. Order today and enjoy the benefits of our cashback program. Shop now, save more, and earn cashback with us!`,
              `ယခုမှာယူပြီး ငွေပြန်အမ်းရယူလိုက်ပါ။ ကျွန်ုပ်တို့၏ cashback ဝန်ဆောင်မှုဖြင့် စမတ်ကျကျစျေးဝယ်ပါ။ သင်၏ဝယ်ယူမှုများအတွက် ဆုလာဘ်များရယူပြီး ကြီးကြီးမားမားချွေတာလိုက်ပါ။ ဤအံ့သြဖွယ်ကောင်းသောအခွင့်အလမ်းကိုလက်လွတ်မခံပါနဲ့။ ယနေ့မှာယူပြီး ကျွန်ုပ်တို့၏ cashback အစီအစဉ်၏ အကျိုးကျေးဇူးများကို ခံစားလိုက်ပါ။ ယခုပဲဝယ်ပါ၊ ပိုမိုချွေတာပြီး ကျွန်ုပ်တို့နှင့်အတူ ငွေသားပြန်ရယူလိုက်ပါ။`,
              locale
            )}
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 md:mt-16 md:grid-cols-2 md:gap-12 lg:grid-cols-3">
          {howToOrder.map((e: any, index: number) => (
            <div className="flex items-start" key={index}>
              <span className="flex-shrink-0 rounded-lg bg-primary p-4">
                <IconPickerItem icon={e.icon} size={24} color={"#FFF"} />
              </span>

              <div className="ml-4">
                <h2 className="text-lg font-bold uppercase">
                  {getText(e.title, e.titleMM, locale)}
                </h2>

                <p className="mt-1 text-sm text-gray-800">
                  {getText(e.description, e.descriptionMM, locale)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HelpOrderSection;
