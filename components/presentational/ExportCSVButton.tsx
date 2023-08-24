import { showErrorDialog, showWarningDialog } from "@/util/swalFunction";
import * as XLSX from "xlsx";
import * as FileSaver from "file-saver";
import React from "react";
import { useSession } from "next-auth/react";
import { hasPermission, isInternal } from "@/util/authHelper";
import { Role } from "@prisma/client";

interface Props {
  csvData: any[];
  fileName: string;
  permission: any;
}

function ExportCSVButton({ csvData, fileName, permission }: Props) {
  const { data: session }: any = useSession();
  const fileType =
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
  const fileExtension = ".xlsx";

  const exportCSV = (csvData: any[], fileName: string) => {
    const ws = XLSX.utils.json_to_sheet(csvData);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, fileName + fileExtension);
  };

  return isInternal(session) ||
    (session.role === Role.Staff && hasPermission(session, permission)) ? (
    <button
      type="button"
      className="flex flex-row items-center gap-3 rounded-md border border-gray-800 bg-white px-3 py-2 transition-colors hover:bg-gray-200"
      onClick={() => {
        if (csvData && csvData.length > 0) {
          exportCSV(csvData, fileName);
        } else {
          showErrorDialog("Empty data");
        }
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="h-5 w-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9.75v6.75m0 0l-3-3m3 3l3-3m-8.25 6a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
        />
      </svg>
      <span className="text-sm">Download CSV</span>
    </button>
  ) : (
    <></>
  );
}

export default ExportCSVButton;
