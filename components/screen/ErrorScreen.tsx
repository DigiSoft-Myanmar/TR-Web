import { isInternal, isSeller } from "@/util/authHelper";
import { encryptPhone } from "@/util/encrypt";
import { useSession } from "next-auth/react";
import Link from "next/link";
import React from "react";

function ErrorScreen({
  statusCode,
  bgNone,
}: {
  statusCode: number;
  bgNone?: boolean;
}) {
  const { data: session }: any = useSession();
  return isSeller(session) && session.sellAllow === false ? (
    <div>
      <div
        className={`relative mx-auto ${
          bgNone === true ? "" : "bg-white"
        } px-4 py-8`}
      >
        <div className="grid h-screen place-content-center px-4">
          <div className="text-center">
            <h1
              className={`text-7xl font-black ${
                bgNone === true ? "text-primary/20" : "text-gray-200"
              }`}
            >
              Pending
            </h1>

            <p className="text-xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Waiting for admin approval
            </p>

            <p className="mt-4 text-gray-500 text-sm">
              You need to wait approval from admin.
            </p>
            <p className="text-gray-500 text-sm mt-2">
              In order to speed up the process, please make sure that you have
              filled all the required information in your profile.
            </p>

            <Link
              href={
                "/account/" +
                encodeURIComponent(encryptPhone(session.phoneNum)) +
                "?action=edit"
              }
              className="mt-6 inline-block rounded bg-primary px-5 py-3 text-sm font-medium text-white hover:bg-primary-focus focus:outline-none focus:ring"
            >
              Edit Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div>
      <div
        className={`relative mx-auto ${
          bgNone === true ? "" : "bg-white"
        } px-4 py-8`}
      >
        <div className="grid h-screen place-content-center px-4">
          <div className="text-center">
            <h1
              className={`text-9xl font-black ${
                bgNone === true ? "text-primary/20" : "text-gray-200"
              }`}
            >
              {statusCode}
            </h1>

            <p className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Uh-oh!
            </p>

            <p className="mt-4 text-gray-500">
              {statusCode === 404
                ? "We can't find that page."
                : statusCode === 401
                ? "You have no permission to access this page."
                : "Something went wrong. We are fixing it."}
            </p>

            <Link
              href="/"
              className="mt-6 inline-block rounded bg-primary px-5 py-3 text-sm font-medium text-white hover:bg-primary-focus focus:outline-none focus:ring"
            >
              Go Back Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ErrorScreen;
