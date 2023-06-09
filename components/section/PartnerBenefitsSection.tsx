import React from "react";

const data = [
  {
    svg: (
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
          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
        />
      </svg>
    ),
    title: "Unlimited Product Listing",
    details: "You can list your produts on PyiDwinPhyit.",
  },
  {
    svg: (
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
          d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z"
        />
      </svg>
    ),
    title: "Sales Report",
    details:
      "Sales reporting help businesses to understand the customers' behavior, preferences, and interest.",
  },
  {
    svg: (
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
          d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
        />
      </svg>
    ),
    title: "REASONABLE MEMBERSHIP PRICE",
    details: "Only 10% per transactions only to make your business grow.",
  },
];

function PartnerBenefitsSection() {
  return (
    <div className="flex w-full flex-col space-y-3 md:w-1/3">
      <div className="flex w-full flex-row items-end space-x-3 border-b-2 border-b-base-100 pt-5 pb-3">
        <h1 className="text-primaryText flex-grow pl-3 text-sm font-semibold">
          Partner Benefits
        </h1>
      </div>
      <div className="flex flex-col items-start justify-start space-y-5">
        {data.map((e, index) => (
          <div className="flex flex-row items-center space-x-5" key={index}>
            <div className="h-6 w-6">{e.svg}</div>
            <div className="flex flex-grow flex-col space-y-2 pr-10">
              <h3 className="text-primaryText text-sm font-semibold uppercase">
                {e.title}
              </h3>
              <p className="text-xs font-light">{e.details}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PartnerBenefitsSection;
