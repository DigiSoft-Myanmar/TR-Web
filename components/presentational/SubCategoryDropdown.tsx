import { getText } from "@/util/textHelper";
import { Category } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";

function SubCategoryDropdown({
  id,
  name,
  subCategory,
  open,
  setOpen,
}: {
  id: string;
  name: string;
  subCategory: Category[];
  open: string;
  setOpen: Function;
}) {
  const { locale } = useRouter();
  const [isHover, setHover] = React.useState(false);
  const [isDetailHover, setDetailHover] = React.useState(false);
  return (
    <div className="group">
      <div
        tabIndex={0}
        className="min-w-[260px] group-hover:text-primary max-w-[288px] text-ellipsis"
        onMouseEnter={() => {
          setHover(true);
          setOpen(id);
        }}
      >
        {name}
      </div>
      {(isHover === true || isDetailHover === true) && open === id && (
        <div
          tabIndex={0}
          className="fixed top-5 left-[280px] w-[50vw] p-2 -mt-3 bg-base-100 shadow rounded-md grid grid-cols-3 max-h-[65vh] overflow-auto min-h-[65vh] gap-3 overflow-y-auto"
          onMouseEnter={() => {
            setDetailHover(true);
          }}
          onMouseLeave={() => {
            setDetailHover(false);
            setHover(false);
          }}
        >
          {subCategory.map((z: any, index) => (
            <div key={index} className="flex flex-col gap-1">
              <Link
                href="/marketplace"
                className="font-semibold text-primary hover:text-primary p-3"
              >
                {getText(z.name, z.nameMM, locale)}
              </Link>
              {z.subCategory &&
                z.subCategory.map((b: any, index1: number) => (
                  <Link
                    href={"/marketplace"}
                    key={index1}
                    className="text-sm hover:text-primary px-3"
                  >
                    {getText(b.name, b.nameMM, locale)}
                  </Link>
                ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SubCategoryDropdown;
