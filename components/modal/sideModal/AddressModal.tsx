import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useRouter } from "next/router";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormInput from "@/components/presentational/FormInput";
import SubmitBtn from "@/components/presentational/SubmitBtn";
import LocationPickerFull from "@/components/presentational/LocationPickerFull";

interface Props {
  isModalOpen: boolean;
  setModalOpen: Function;
  address: any;
  title: any;
  onClickFn: Function;
  isBilling: boolean;
  userId: string;
}

function AddressModal({
  isModalOpen,
  setModalOpen,
  title,
  address,
  onClickFn,
  isBilling,
  userId,
}: Props) {
  const { t } = useTranslation("common");
  const router = useRouter();
  const [location, setLocation] = React.useState({
    stateId: "",
    districtId: "",
    townshipId: "",
  });

  const schema = z.object(
    isBilling === true
      ? {
          name: z.string().min(1, { message: t("inputError") }),
          email: z.string().email({ message: t("inputValidEmailError") }),
          phoneNum: z.string().regex(new RegExp("^\\+959\\d{7,9}$"), {
            message: t("inputValidPhoneError"),
          }),
          houseNo: z.string().min(1, { message: t("inputError") }),
          street: z.string().min(1, { message: t("inputError") }),
        }
      : {
          name: z.string().min(1, { message: t("inputError") }),
          phoneNum: z.string().regex(new RegExp("^\\+959\\d{7,9}$"), {
            message: t("inputValidPhoneError"),
          }),
          houseNo: z.string().min(1, { message: t("inputError") }),
          street: z.string().min(1, { message: t("inputError") }),
        }
  );

  const { register, handleSubmit, watch, formState, reset } = useForm<any>({
    mode: "onChange",
    resolver: zodResolver(schema),
  });
  const { errors } = formState;
  const { locale } = useRouter();
  const watchFields = watch();

  function submit(data: any) {
    onClickFn({
      ...data,
      ...location,
      userId: userId,
      isBillingAddress: isBilling,
    });
    setModalOpen(false);
  }

  React.useEffect(() => {
    if (address) {
      if (address.phoneNum) {
        reset(address);
      } else {
        reset({
          ...address,
          phoneNum: "+959",
        });
      }
      setLocation({
        stateId: address.stateId,
        districtId: address.districtId,
        townshipId: address.townshipId,
      });
    } else {
      reset({
        phoneNum: "+959",
      });
      setLocation({
        stateId: "",
        districtId: "",
        townshipId: "",
      });
    }
  }, [address]);

  React.useEffect(() => {
    router.beforePopState(({ as }) => {
      if (as !== router.asPath) {
        if (isModalOpen === true) {
          setModalOpen(false);
          return false;
        }
      }
      return true;
    });

    return () => {
      router.beforePopState(() => true);
    };
  }, [router, isModalOpen, setModalOpen]);
  return (
    <>
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 overflow-y-auto"
          onClose={() => setModalOpen(false)}
        >
          <div className="min-h-screen px-4 text-center">
            {isModalOpen === true && (
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
              </Transition.Child>
            )}

            {/* This element is to trick the browser into centering the modal contents. */}
            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-in-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in-out duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="absolute top-0 right-0 bottom-0 flex max-w-lg min-w-[500px] transform overflow-auto rounded-l-xl bg-primary shadow-xl transition-all">
                <div className="inline-block w-full overflow-y-auto bg-white p-6 text-left align-middle">
                  <Dialog.Title
                    as="div"
                    className="text-darkShade flex items-center text-lg font-medium leading-6"
                  >
                    <h3 className="flex-grow">{title}</h3>
                    <button
                      className="bg-lightShade flex rounded-md p-2 focus:outline-none"
                      onClick={() => setModalOpen(false)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-5 w-5"
                      >
                        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                      </svg>
                    </button>
                  </Dialog.Title>
                  <div className="mt-2">
                    <form onSubmit={handleSubmit(submit)}>
                      <div className="mt-2 flex flex-col gap-3">
                        <FormInput
                          label={t("name")}
                          placeHolder={t("enter") + " " + t("name")}
                          error={errors.name?.message}
                          type="text"
                          defaultValue={address?.name}
                          formControl={{ ...register("name") }}
                          currentValue={watchFields.name}
                        />
                        <FormInput
                          label={t("phone")}
                          placeHolder={t("enter") + " " + t("phone")}
                          error={errors.phoneNum?.message}
                          type="text"
                          defaultValue={address?.phoneNum}
                          formControl={{ ...register("phoneNum") }}
                          currentValue={watchFields.phoneNum}
                        />
                        {isBilling === true && (
                          <FormInput
                            label={t("email")}
                            placeHolder={t("enter") + " " + t("email")}
                            error={errors.email?.message}
                            type="text"
                            defaultValue={address?.email}
                            formControl={{ ...register("email") }}
                            currentValue={watchFields.email}
                          />
                        )}

                        <FormInput
                          label={t("houseNo")}
                          placeHolder={t("enter") + " " + t("houseNo")}
                          error={errors.houseNo?.message}
                          type="text"
                          defaultValue={address?.houseNo}
                          formControl={{ ...register("houseNo") }}
                          currentValue={watchFields.houseNo}
                        />

                        <FormInput
                          label={t("street")}
                          placeHolder={t("enter") + " " + t("street")}
                          error={errors.street?.message}
                          type="text"
                          defaultValue={address?.street}
                          formControl={{ ...register("street") }}
                          currentValue={watchFields.street}
                        />

                        <div>
                          <LocationPickerFull
                            selected={{
                              stateId: location?.stateId,
                              districtId: location?.districtId,
                              townshipId: location?.townshipId,
                            }}
                            setSelected={(data) => {
                              setLocation({
                                stateId: data.stateId,
                                districtId: data.districtId,
                                townshipId: data.townshipId,
                              });
                            }}
                            isStart={true}
                          />
                        </div>
                      </div>

                      <div className="mt-4 flex w-full justify-end ">
                        <SubmitBtn
                          isSubmit={false}
                          submitTxt="Loading..."
                          text={t("submit")}
                        />
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

export default AddressModal;
