import React from "react";
import { invoiceStatusObj } from "../muiTable/OrderFullTbl";
import Icon from "@/components/presentational/Icon";

function StatusHistory({ e, index }: { e: any; index: number }) {
  const noteRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (noteRef.current && e.note) {
      let parser = new DOMParser();
      let shortDescriptionContent = parser.parseFromString(e.note, "text/html");
      noteRef.current.innerHTML = "";
      noteRef.current.appendChild(shortDescriptionContent.body);
    }
  }, [noteRef.current, e.note]);

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
      <h3 className="mb-1 flex items-center text-lg font-semibold text-gray-900">
        {e.status}
        {index === 0 && (
          <span className="mr-2 ml-3 rounded bg-primary/10 px-2.5 py-0.5 text-sm font-medium text-primary">
            Latest
          </span>
        )}
      </h3>
      <time className="mb-2 block text-sm font-normal leading-none text-gray-400">
        Updated on{" "}
        {new Date(e.updatedDate).toLocaleDateString("en-ca", {
          year: "numeric",
          month: "long",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </time>
      <div ref={noteRef}></div>
    </li>
  );
}

export default StatusHistory;
