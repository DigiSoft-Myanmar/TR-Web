import React, { Fragment, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import useSWR from "swr";
import { fetcher } from "@/util/fetcher";
import { Brand, User } from "@prisma/client";
import Image from "next/image";
import { fileUrl } from "@/types/const";
import { getInitials } from "@/util/textHelper";
import Avatar from "./Avatar";

type Props = {
  selected: User;
  setSelected: Function;
  isEmpty?: boolean;
};

export default function SellerSelectBox({
  selected,
  setSelected,
  isEmpty,
}: Props) {
  const { data } = useSWR("/api/user?isSeller=true", fetcher);

  React.useEffect(() => {
    if (isEmpty === true) {
    } else if (data) {
      if (selected) {
        let b = data.find((e: Brand) => e.id === selected.id);
        setSelected(b);
      } else {
        setSelected(data[0]);
      }
    }
  }, [data, selected, isEmpty]);

  return (
    <div>
      <label className={`text-sm font-medium text-gray-400`}>
        Sellers <span className="text-primary">*</span>
      </label>
      <Listbox value={selected} onChange={(e) => setSelected(e)}>
        <div className="relative mt-1">
          <Listbox.Button className="relative w-full cursor-pointer rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
            <span className="block truncate">
              {selected?.username ? selected?.username : "Select Seller"}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>
          {data && (
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {isEmpty === true && (
                  <Listbox.Option
                    className={({ active }) =>
                      `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                        active ? "bg-primary/10 text-primary" : "text-gray-900"
                      }`
                    }
                    value={undefined}
                  >
                    {({ selected }) => (
                      <div className="flex items-center gap-3">
                        Select Seller
                      </div>
                    )}
                  </Listbox.Option>
                )}
                {data.map((brand: User, ind: number) => (
                  <Listbox.Option
                    key={ind}
                    className={({ active }) =>
                      `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                        active ? "bg-primary/10 text-primary" : "text-gray-900"
                      }`
                    }
                    value={brand}
                  >
                    {({ selected }) => (
                      <div className="flex items-center gap-3">
                        <Avatar
                          profile={brand.profile}
                          username={brand.username}
                        />

                        <span
                          className={`block truncate ${
                            selected ? "font-medium" : "font-normal"
                          }`}
                        >
                          {brand.username}
                        </span>
                        {brand.sellAllow === true ? (
                          <span className="bg-success/20 text-success text-xs p-1 rounded-md">
                            Active
                          </span>
                        ) : (
                          <span className="bg-error/20 text-error text-xs p-1 rounded-md">
                            Disable
                          </span>
                        )}
                        {selected ? (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </div>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          )}
        </div>
      </Listbox>
    </div>
  );
}
