import FormInput from "@/components/presentational/FormInput";
import LocationPicker from "@/components/presentational/LocationPicker";
import LocationPickerFull from "@/components/presentational/LocationPickerFull";
import { ShippingAddress, useMarketplace } from "@/context/MarketplaceContext";
import { showErrorDialog } from "@/util/swalFunction";
import { getText } from "@/util/textHelper";
import { zodResolver } from "@hookform/resolvers/zod";
import { isEqual } from "lodash";
import { useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import React from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "react-query";
import { z } from "zod";

type Props = {
  nextFn: Function;
  backFn: Function;
};

function ShippingSection({ nextFn, backFn }: Props) {
  const { t } = useTranslation("common");
  const { billingAddress, modifyAddress, isAddressDiff, shippingAddress } =
    useMarketplace();
  const { data: user }: any = useSession();

  const { data: addressInfo, refetch } = useQuery(["addressdata", user], () =>
    fetch("/api/user/" + encodeURIComponent(user.phoneNum) + "/address").then(
      (res) => {
        let json = res.json();
        return json;
      }
    )
  );

  const schema = z.object({
    name: z.string().min(1, { message: t("inputError") }),
    phoneNum: z.string().regex(new RegExp("^\\+959\\d{7,9}$"), {
      message: t("inputValidPhoneError"),
    }),
    houseNo: z.string().min(1, { message: t("inputError") }),
    street: z.string().min(1, { message: t("inputError") }),
  });

  const { register, handleSubmit, watch, formState, reset } =
    useForm<ShippingAddress>({
      mode: "onChange",
      defaultValues: shippingAddress,
      resolver: zodResolver(schema),
    });
  const { errors } = formState;
  const { locale } = useRouter();
  const watchFields = watch();
  const [location, setLocation] = React.useState<any>();
  const [isDiff, setDiff] = React.useState(false);

  React.useEffect(() => {
    if (shippingAddress) {
      reset(shippingAddress);
    } else {
      reset({});
    }
  }, [shippingAddress]);

  React.useEffect(() => {
    setDiff(isAddressDiff);
  }, [isAddressDiff]);

  React.useEffect(() => {
    setLocation((prevValue: any) => {
      return {
        stateId: shippingAddress?.stateId,
        districtId: shippingAddress?.districtId,
        townshipId: shippingAddress?.townshipId,
      };
    });
  }, [shippingAddress]);

  function submit(data: ShippingAddress) {
    if (shippingAddress) {
      if (location.stateId && location.districtId && location.townshipId) {
        let d = {
          ...data,
          stateId: location.stateId,
          districtId: location.districtId,
          townshipId: location.townshipId,
        };

        modifyAddress(billingAddress, isDiff, d);
        nextFn();
      } else {
        showErrorDialog(t("fillInformation"), "", locale);
      }
    }
  }

  return (
    <div className="flex flex-col">
      <h3 className="text-sm font-semibold p-gray-500">{t("step")} 2</h3>
      <p className="my-1 p-xl font-bold">{t("shippingInfo")}</p>
      <span className="text-sm">{t("fillShippingInfo")}</span>

      <div className="grid grid-cols-1 lg:grid-cols-3 my-3">
        {addressInfo?.shippingAddress.map((item: any) => (
          <div
            className={`flex flex-col ${
              isEqual(watchFields, item)
                ? "border-2 border-primary"
                : "border border-gray-400"
            } p-3 rounded-md flex-1 m-3`}
            onClick={() => {
              reset(item);
              setLocation({
                stateId: item.stateId,
                districtId: item.districtId,
                townshipId: item.townshipId,
              });
            }}
          >
            <div className="flex flex-row items-center justify-between pb-2">
              <p className="text-sm font-semibold leading-7">
                {item.isBillingAddress
                  ? t("billingAddress")
                  : t("shippingAddress")}
              </p>
            </div>

            <div className="flex flex-col p-1 border-t border-t-gray-400">
              <div className="flex flex-row items-center justify-between mt-1 gap-3">
                <p className="text-xs">{t("name")}</p>
                <p className="text-xs flex-grow text-right">{item?.name}</p>
              </div>
              <div className="flex flex-row items-center justify-between mt-1 gap-3">
                <p className="text-xs">{t("phone")}</p>
                <p className="text-xs flex-grow text-right">{item?.phoneNum}</p>
              </div>
              {item.isBillingAddress && (
                <div className="flex flex-row items-center justify-between mt-1 gap-3">
                  <p className="text-xs">{t("email")}</p>
                  <p className="text-xs flex-grow text-right">{item?.email}</p>
                </div>
              )}
              <div className="flex flex-row items-center justify-between mt-1 gap-3">
                <p className="text-xs">{t("houseNo")}</p>
                <p className="text-xs flex-grow text-right">{item?.houseNo}</p>
              </div>
              <div className="flex flex-row items-center justify-between mt-1 gap-3">
                <p className="text-xs">{t("street")}</p>
                <p className="text-xs flex-grow text-right">{item?.street}</p>
              </div>
              <div className="flex flex-row items-center justify-between mt-1 gap-3">
                <p className="text-xs">{t("location")}</p>
                <p className="text-xs flex-grow text-right">
                  {getText(item.township?.name, item.township?.nameMM, locale)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <form className="flex flex-col space-y-3" onSubmit={handleSubmit(submit)}>
        <FormInput
          label={t("name")}
          placeHolder={t("enter") + " " + t("name")}
          error={errors.name?.message}
          type="p"
          defaultValue={shippingAddress?.name}
          formControl={{ ...register("name") }}
          currentValue={watchFields.name}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
          }
        />

        <FormInput
          label={t("phone")}
          placeHolder={t("enter") + " " + t("phone")}
          error={errors.phoneNum?.message}
          type="p"
          defaultValue={shippingAddress?.phoneNum}
          formControl={{ ...register("phoneNum") }}
          currentValue={watchFields.phoneNum}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
              />
            </svg>
          }
        />

        <FormInput
          label={t("houseNo")}
          placeHolder={t("enter") + " " + t("houseNo")}
          error={errors.houseNo?.message}
          type="p"
          defaultValue={shippingAddress?.houseNo}
          formControl={{ ...register("houseNo") }}
          currentValue={watchFields.houseNo}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
              />
            </svg>
          }
        />

        <FormInput
          label={t("street")}
          placeHolder={t("enter") + " " + t("street")}
          error={errors.street?.message}
          type="p"
          defaultValue={shippingAddress?.street}
          formControl={{ ...register("street") }}
          currentValue={watchFields.street}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"
              />
            </svg>
          }
        />
        <LocationPickerFull
          selected={location}
          isStart={true}
          setSelected={(e: any) => {
            setLocation(() => {
              return {
                stateId: e.stateId,
                districtId: e.districtId,
                townshipId: e.townshipId,
              };
            });
          }}
        />
        <span className="mt-5 flex justify-end divide-x overflow-hidden">
          <button
            className={`inline-block rounded-l-md border bg-primary p-3 p-white shadow-sm hover:bg-primary-focus focus:relative text-white`}
            title="Previous"
            onClick={() => {
              backFn();
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path
                fillRule="evenodd"
                d="M20.25 12a.75.75 0 01-.75.75H6.31l5.47 5.47a.75.75 0 11-1.06 1.06l-6.75-6.75a.75.75 0 010-1.06l6.75-6.75a.75.75 0 111.06 1.06l-5.47 5.47H19.5a.75.75 0 01.75.75z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <button
            className={`inline-block rounded-r-md border bg-primary p-3 p-white shadow-sm hover:bg-primary-focus focus:relative text-white`}
            title="Next"
            type="submit"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path
                fillRule="evenodd"
                d="M3.75 12a.75.75 0 01.75-.75h13.19l-5.47-5.47a.75.75 0 011.06-1.06l6.75 6.75a.75.75 0 010 1.06l-6.75 6.75a.75.75 0 11-1.06-1.06l5.47-5.47H4.5a.75.75 0 01-.75-.75z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </span>
      </form>
    </div>
  );
}

export default ShippingSection;
