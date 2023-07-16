import MyanmarMap from "@/components/presentational/MyanmarMap";
import React from "react";
import TopGraph from "./TopGraph";
import RegionGraph from "./RegionGraph";

enum Step {
  Orders,
  Profits,
  Resellers,
}

function RegionStatsCard() {
  const [currentStep, setCurrentStep] = React.useState(Step.Profits);
  const date = new Date();

  return (
    <div className="lg:col-span-4 bg-white shadow-md p-5 grid grid-cols-1 lg:grid-cols-3">
      <div className="p-3 flex flex-col gap-3 items-center">
        <div className="flex flex-col gap-1 justify-between">
          <h4 className="font-light text-base text-gray-500 font-inter mb-2 text-center">
            Region Overview ({date.getFullYear()})
          </h4>
          <div className="inline-flex rounded-lg border border-gray-100 bg-gray-100 p-1 items-center justify-between">
            <button
              className={
                currentStep === Step.Orders
                  ? "inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-white shadow-sm focus:relative"
                  : "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm text-gray-500 hover:text-gray-700 focus:relative"
              }
              type="button"
              onClick={() => {
                setCurrentStep(Step.Orders);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path
                  fillRule="evenodd"
                  d="M10 1c-1.716 0-3.408.106-5.07.31C3.806 1.45 3 2.414 3 3.517V16.75A2.25 2.25 0 005.25 19h9.5A2.25 2.25 0 0017 16.75V3.517c0-1.103-.806-2.068-1.93-2.207A41.403 41.403 0 0010 1zM5.99 8.75A.75.75 0 016.74 8h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75h-.01a.75.75 0 01-.75-.75v-.01zm.75 1.417a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 00.75-.75v-.01a.75.75 0 00-.75-.75h-.01zm-.75 2.916a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75h-.01a.75.75 0 01-.75-.75v-.01zm.75 1.417a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 00.75-.75v-.01a.75.75 0 00-.75-.75h-.01zm1.417-5.75a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75h-.01a.75.75 0 01-.75-.75v-.01zm.75 1.417a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 00.75-.75v-.01a.75.75 0 00-.75-.75h-.01zm-.75 2.916a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75h-.01a.75.75 0 01-.75-.75v-.01zm.75 1.417a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 00.75-.75v-.01a.75.75 0 00-.75-.75h-.01zm1.42-5.75a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75h-.01a.75.75 0 01-.75-.75v-.01zm.75 1.417a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 00.75-.75v-.01a.75.75 0 00-.75-.75h-.01zm-.75 2.916a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75h-.01a.75.75 0 01-.75-.75v-.01zm.75 1.417a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 00.75-.75v-.01a.75.75 0 00-.75-.75h-.01zM12.5 8.75a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75h-.01a.75.75 0 01-.75-.75v-.01zm.75 1.417a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 00.75-.75v-.01a.75.75 0 00-.75-.75h-.01zm0 2.166a.75.75 0 01.75.75v2.167a.75.75 0 11-1.5 0v-2.167a.75.75 0 01.75-.75zM6.75 4a.75.75 0 00-.75.75v.5c0 .414.336.75.75.75h6.5a.75.75 0 00.75-.75v-.5a.75.75 0 00-.75-.75h-6.5z"
                  clipRule="evenodd"
                />
              </svg>
              {currentStep === Step.Orders ? "Orders" : ""}
            </button>

            <button
              className={
                currentStep === Step.Profits
                  ? "inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-white shadow-sm focus:relative"
                  : "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm text-gray-500 hover:text-gray-700 focus:relative"
              }
              type="button"
              onClick={() => {
                setCurrentStep(Step.Profits);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path d="M10.75 10.818v2.614A3.13 3.13 0 0011.888 13c.482-.315.612-.648.612-.875 0-.227-.13-.56-.612-.875a3.13 3.13 0 00-1.138-.432zM8.33 8.62c.053.055.115.11.184.164.208.16.46.284.736.363V6.603a2.45 2.45 0 00-.35.13c-.14.065-.27.143-.386.233-.377.292-.514.627-.514.909 0 .184.058.39.202.592.037.051.08.102.128.152z" />
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-6a.75.75 0 01.75.75v.316a3.78 3.78 0 011.653.713c.426.33.744.74.925 1.2a.75.75 0 01-1.395.55 1.35 1.35 0 00-.447-.563 2.187 2.187 0 00-.736-.363V9.3c.698.093 1.383.32 1.959.696.787.514 1.29 1.27 1.29 2.13 0 .86-.504 1.616-1.29 2.13-.576.377-1.261.603-1.96.696v.299a.75.75 0 11-1.5 0v-.3c-.697-.092-1.382-.318-1.958-.695-.482-.315-.857-.717-1.078-1.188a.75.75 0 111.359-.636c.08.173.245.376.54.569.313.205.706.353 1.138.432v-2.748a3.782 3.782 0 01-1.653-.713C6.9 9.433 6.5 8.681 6.5 7.875c0-.805.4-1.558 1.097-2.096a3.78 3.78 0 011.653-.713V4.75A.75.75 0 0110 4z"
                  clipRule="evenodd"
                />
              </svg>

              {currentStep === Step.Profits ? "Profits" : ""}
            </button>

            <button
              className={
                currentStep === Step.Resellers
                  ? "inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-white shadow-sm focus:relative"
                  : "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm text-gray-500 hover:text-gray-700 focus:relative"
              }
              type="button"
              onClick={() => {
                setCurrentStep(Step.Resellers);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path
                  fillRule="evenodd"
                  d="M8.25 6.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM15.75 9.75a3 3 0 116 0 3 3 0 01-6 0zM2.25 9.75a3 3 0 116 0 3 3 0 01-6 0zM6.31 15.117A6.745 6.745 0 0112 12a6.745 6.745 0 016.709 7.498.75.75 0 01-.372.568A12.696 12.696 0 0112 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 01-.372-.568 6.787 6.787 0 011.019-4.38z"
                  clipRule="evenodd"
                />
                <path d="M5.082 14.254a8.287 8.287 0 00-1.308 5.135 9.687 9.687 0 01-1.764-.44l-.115-.04a.563.563 0 01-.373-.487l-.01-.121a3.75 3.75 0 013.57-4.047zM20.226 19.389a8.287 8.287 0 00-1.308-5.135 3.75 3.75 0 013.57 4.047l-.01.121a.563.563 0 01-.373.486l-.115.04c-.567.2-1.156.349-1.764.441z" />
              </svg>

              {currentStep === Step.Resellers ? "Users" : ""}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 w-full gap-3">
          <div className="flex flex-col bg-white p-3 rounded-md flex-1 border">
            <h4 className="font-light text-sm text-gray-500 font-inter line-clamp-1">
              Buyers
            </h4>
            <p className="font-bold text-lg">2000</p>
          </div>
          <div className="flex flex-col bg-white p-3 rounded-md flex-1 border">
            <h4 className="font-light text-sm text-gray-500 font-inter line-clamp-1">
              Sellers
            </h4>
            <p className="font-bold text-lg">
              2000 Kyat <span className="text-xs text-green-600">+30%</span>
            </p>
          </div>
          <div className="flex flex-col bg-white p-3 rounded-md flex-1 border">
            <h4 className="font-light text-sm text-gray-500 font-inter line-clamp-1">
              Traders
            </h4>
            <p className="font-bold text-lg">
              2000 Kyat <span className="text-xs text-green-600">+30%</span>
            </p>
          </div>
          <div className="flex flex-col bg-white p-3 rounded-md flex-1 border">
            <h4 className="font-light text-sm text-gray-500 font-inter line-clamp-1">
              Orders
            </h4>
            <p className="font-bold text-lg">
              2000 <span className="text-xs text-green-600">+30%</span>
            </p>
          </div>
          <div className="flex flex-col bg-white p-3 rounded-md flex-1 border">
            <h4 className="font-light text-sm text-gray-500 font-inter line-clamp-1">
              Units Sold
            </h4>
            <p className="font-bold text-lg">
              2000 <span className="text-xs text-green-600">+30%</span>
            </p>
          </div>
          <div className="flex flex-col bg-white p-3 rounded-md flex-1 border">
            <h4 className="font-light text-sm text-gray-500 font-inter line-clamp-1">
              Auction Won
            </h4>
            <p className="font-bold text-lg">
              2000 <span className="text-xs text-green-600">+30%</span>
            </p>
          </div>
        </div>

        {/* <MyanmarMap /> */}
      </div>
      <div className="p-3 grid grid-cols-1 col-span-2 gap-3 max-h-[500px]">
        {currentStep === Step.Resellers ? (
          <div className="text-xs flex flex-col">
            <h4 className="font-light text-base text-gray-500 font-inter mb-2 text-center">
              Resellers
            </h4>
            <div className="h-[500px]">
              <RegionGraph />
            </div>
            <h4 className="font-light text-base text-gray-500 font-inter mb-2 text-center">
              Resellers by unit sold (Top 10)
            </h4>
            <div className="h-[400px]">
              <TopGraph />
            </div>
          </div>
        ) : currentStep === Step.Orders ? (
          <div className="text-xs flex flex-col">
            <h4 className="font-light text-base text-gray-500 font-inter mb-2 text-center">
              Orders Count
            </h4>
            <div className="h-[500px]">
              <RegionGraph />
            </div>
            <h4 className="font-light text-base text-gray-500 font-inter mb-2 text-center">
              Gem performance
            </h4>
            <div className="h-[400px]">
              <TopGraph />
            </div>
          </div>
        ) : (
          <div className="text-xs flex flex-col">
            <h4 className="font-light text-base text-gray-500 font-inter mb-2 text-center">
              Profits
            </h4>
            <div className="h-[500px] w-full">
              <RegionGraph />
            </div>
            <h4 className="font-light text-base text-gray-500 font-inter mb-2 text-center">
              Sold Products (Top 10)
            </h4>
            <div className="h-[400px] w-full">
              <TopGraph />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RegionStatsCard;
