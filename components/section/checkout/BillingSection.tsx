import FormInput from "@/components/presentational/FormInput";
import FormInputCheckbox from "@/components/presentational/FormInputCheckbox";
import LocationPicker from "@/components/presentational/LocationPicker";
import { BillingAddress, useMarketplace } from "@/context/MarketplaceContext";
import { showErrorDialog } from "@/util/swalFunction";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type Props = {
  nextFn: Function;
};

function BillingSection({ nextFn }: Props) {
  const { t } = useTranslation("common");
  const { billingAddress, modifyAddress, isAddressDiff, shippingAddress } =
    useMarketplace();

  const schema = z.object({
    name: z.string().min(1, { message: t("inputError") }),
    email: z.string().email({ message: t("inputValidEmailError") }),
    phoneNum: z.string().regex(new RegExp("^\\+959\\d{7,9}$"), {
      message: t("inputValidPhoneError"),
    }),
    houseNo: z.string().min(1, { message: t("inputError") }),
    street: z.string().min(1, { message: t("inputError") }),
  });

  const { register, handleSubmit, watch, formState, reset } =
    useForm<BillingAddress>({
      mode: "onChange",
      defaultValues: billingAddress,
      resolver: zodResolver(schema),
    });
  const { errors } = formState;
  const { locale } = useRouter();
  const watchFields = watch();
  const [location, setLocation] = React.useState<any>();
  const [isDiff, setDiff] = React.useState(false);

  React.useEffect(() => {
    reset(billingAddress);
  }, [billingAddress]);

  React.useEffect(() => {
    setDiff(isAddressDiff);
  }, [isAddressDiff]);

  React.useEffect(() => {
    setLocation((prevValue: any) => {
      return {
        stateId: billingAddress?.stateId,
        districtId: billingAddress?.districtId,
        townshipId: billingAddress?.townshipId,
      };
    });
  }, [billingAddress]);

  function submit(data: BillingAddress) {
    if (billingAddress) {
      if (location.stateId && location.districtId && location.townshipId) {
        let d = {
          ...data,
          stateId: location.stateId,
          districtId: location.districtId,
          townshipId: location.townshipId,
        };

        modifyAddress(d, isDiff, shippingAddress);
        nextFn(isDiff);
      } else {
        showErrorDialog(t("fillInformation"), "", locale);
      }
    }
  }

  return (
    <div className="flex flex-col">
      <h3 className="text-sm font-semibold text-gray-500">{t("step")} 1</h3>
      <p className="my-1 text-xl font-bold">{t("billingInfo")}</p>
      <span className="mb-10 text-sm">{t("fillBillingInfo")}</span>
      <form className="flex flex-col space-y-3" onSubmit={handleSubmit(submit)}>
        <FormInput
          label={t("name")}
          placeHolder={t("enter") + " " + t("name")}
          error={errors.name?.message}
          type="text"
          defaultValue={billingAddress?.name}
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
          type="text"
          defaultValue={billingAddress?.phoneNum}
          formControl={{ ...register("phoneNum") }}
          currentValue={watchFields.phoneNum}
          disabled={true}
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
          label={t("email")}
          placeHolder={t("enter") + " " + t("email")}
          error={errors.email?.message}
          type="email"
          defaultValue={billingAddress?.email}
          formControl={{ ...register("email") }}
          currentValue={watchFields.email}
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
                d="M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zm0 0c0 1.657 1.007 3 2.25 3S21 13.657 21 12a9 9 0 10-2.636 6.364M16.5 12V8.25"
              />
            </svg>
          }
        />

        <FormInput
          label={t("houseNo")}
          placeHolder={t("enter") + " " + t("houseNo")}
          error={errors.houseNo?.message}
          type="text"
          defaultValue={billingAddress?.houseNo}
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
          type="text"
          defaultValue={billingAddress?.street}
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
        <LocationPicker
          stateId={location?.stateId}
          districtId={location?.districtId}
          townshipId={location?.townshipId}
          setLocation={(e: any) => {
            setLocation(() => {
              return {
                stateId: e.state,
                districtId: e.district,
                townshipId: e.township,
              };
            });
          }}
        />

        <label className="label cursor-pointer">
          <input
            type="checkbox"
            className="checkbox-primary checkbox"
            checked={isDiff}
            onChange={(e) => {
              setDiff(e.currentTarget.checked);
            }}
          />
          <span className="label-text ml-3 flex-grow">
            {t("isAddressDiff")}
          </span>
        </label>

        <span className="flex justify-end divide-x overflow-hidden">
          <button
            className={`inline-block rounded-md border bg-primary p-3 text-white shadow-sm hover:bg-primary-focus focus:relative`}
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

export default BillingSection;
