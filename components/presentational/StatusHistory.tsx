import React from "react";
import { invoiceStatusObj } from "../muiTable/OrderFullTbl";
import Icon from "@/components/presentational/Icon";
import { isInternal, isSeller } from "@/util/authHelper";
import { useSession } from "next-auth/react";

function StatusHistory({ e, index }: { e: any; index: number }) {
  const { data: session }: any = useSession();
  return (
    <li className="mb-10 ml-6">
      <span
        className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 ring-8 ring-white"
        style={{
          backgroundColor: invoiceStatusObj[e.status]?.color,
        }}
      >
        <Icon
          icon={invoiceStatusObj[e.status]?.icon}
          fontSize="1rem"
          color="#FFF"
        />
      </span>
      <h3 className="mb-1 flex items-center text-sm font-semibold text-gray-900">
        {e.status}
        {index === 0 && (
          <span className="mr-2 ml-3 rounded bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            Latest
          </span>
        )}
      </h3>
      <time className="mb-2 block text-xs font-normal text-gray-400">
        Updated on{" "}
        {new Date(e.updatedDate).toLocaleDateString("en-ca", {
          year: "numeric",
          month: "long",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </time>
      <div className="text-sm">{e.note}</div>
      {(isInternal(session) || isSeller(session)) && e.updatedUser && (
        <span className="text-xs text-gray-500">
          - {isInternal(session) ? e.updatedUser.username : e.updatedUser.role}{" "}
          {isInternal(session) ? "[" + e.updatedUser.role + "]" : ""}
        </span>
      )}
    </li>
  );
}

export default StatusHistory;
