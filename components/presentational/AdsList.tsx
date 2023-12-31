import React from "react";

function AdsList({ apiURL, title }: { apiURL: string; title: string }) {
  return (
    <details>
      <summary className="flex flex-row cursor-pointer items-end py-3 border-b">
        <div className="flex flex-row items-center justify-between flex-grow">
          <div className={`text-xs font-semibold text-gray-700`}>{title}</div>
        </div>
        <span className="ml-auto shrink-0 transition duration-300 group-open:-rotate-180">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </summary>
      <div className="flex flex-col gap-3 mt-3 border-b pb-3">
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Error unde
          optio itaque incidunt temporibus alias facere, quis perspiciatis,
          architecto pariatur possimus perferendis sed odio ipsa eveniet vitae
          impedit suscipit iste?
        </p>
      </div>
    </details>
  );
}

export default AdsList;
