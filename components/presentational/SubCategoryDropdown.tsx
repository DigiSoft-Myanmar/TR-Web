import { getText } from "@/util/textHelper";
import { Category } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";

function SubCategoryDropdown({
  name,
  subCategory,
}: {
  name: string;
  subCategory: Category[];
}) {
  const { locale } = useRouter();
  const [isHover, setHover] = React.useState(false);
  const [isDetailHover, setDetailHover] = React.useState(false);
  return (
    <div className="dropdown dropdown-right group">
      <div
        tabIndex={0}
        className="min-w-[170px] group-hover:text-primary"
        onMouseEnter={() => {
          setHover(true);
        }}
        onMouseLeave={() => {
          setHover(false);
        }}
      >
        {name}
      </div>
      {(isHover === true || isDetailHover === true) && (
        <div
          tabIndex={0}
          className="dropdown-content w-96 p-2 -mt-3 bg-base-100 shadow rounded-md grid grid-cols-2"
          onMouseEnter={() => {
            setDetailHover(true);
          }}
          onMouseLeave={() => {
            setDetailHover(false);
          }}
        >
          {subCategory.map((z: any, index) => (
            <div key={index} className="">
              <Link
                href="/marketplace"
                className="font-semibold text-accent hover:text-primary p-3"
              >
                {getText(z.name, z.nameMM, locale)}
              </Link>
              {z.subCategory &&
                z.subCategory.map((b: any, index1: number) => (
                  <Link
                    href={"/marketplace"}
                    key={index1}
                    className="text-sm hover:text-primary"
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
