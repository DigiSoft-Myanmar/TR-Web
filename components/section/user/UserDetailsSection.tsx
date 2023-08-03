import { fileUrl } from "@/types/const";
import { isInternal, isSeller } from "@/util/authHelper";
import { getText } from "@/util/textHelper";
import {
  District,
  Membership,
  Role,
  State,
  Township,
  User,
  UserDefinedRole,
} from "@prisma/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React from "react";

function UserDetailsSection({
  user,
}: {
  user: User & {
    state: State;
    district: District;
    township: Township;
    currentMembership: Membership;
    userDefinedRole: UserDefinedRole;
  };
}) {
  const { data: session }: any = useSession();
  const { locale } = useRouter();
  const date = new Date(user?.memberStartDate);
  if (user.currentMembership) {
    date.setDate(date.getDate() + user.currentMembership.validity);
  }

  return (
    <div
      className={`${
        isInternal(session)
          ? "py-5 flex flex-col gap-5"
          : "mx-6 px-4 py-5 flex flex-col gap-5"
      }`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-white p-3 rounded-md border flex flex-col gap-5 text-gray-500">
          <h3 className="text-lg text-primaryText border-b pb-3">
            Profile Info
          </h3>
          <div className="flex flex-row items-center gap-3 text-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
            <span>
              {user?.username}{" "}
              {user?.displayName ? "(" + user?.displayName + ")" : ""}
            </span>
          </div>
          <div className="flex flex-row items-center gap-3 text-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
              />
            </svg>

            <span>{user?.phoneNum}</span>
          </div>
          <div className="flex flex-row items-center gap-3 text-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                d="M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zm0 0c0 1.657 1.007 3 2.25 3S21 13.657 21 12a9 9 0 10-2.636 6.364M16.5 12V8.25"
              />
            </svg>

            <span>{user?.email}</span>
          </div>

          <div className="flex flex-row items-center gap-3 text-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.87c1.355 0 2.697.055 4.024.165C17.155 8.51 18 9.473 18 10.608v2.513m-3-4.87v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-3.38a48.474 48.474 0 00-6-.37c-2.032 0-4.034.125-6 .37m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.17c0 .62-.504 1.124-1.125 1.124H4.125A1.125 1.125 0 013 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 016 13.12M12.265 3.11a.375.375 0 11-.53 0L12 2.845l.265.265zm-3 0a.375.375 0 11-.53 0L9 2.845l.265.265zm6 0a.375.375 0 11-.53 0L15 2.845l.265.265z"
              />
            </svg>

            <span>
              {new Date(user?.dob).toLocaleDateString("en-ca", {
                year: "numeric",
                month: "short",
                day: "2-digit",
              })}
            </span>
          </div>

          <div className="flex flex-row items-center gap-3 text-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
              />
            </svg>

            <span>{user?.houseNo}</span>
          </div>

          <div className="flex flex-row items-center gap-3 text-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"
              />
            </svg>

            <span>{user?.street}</span>
          </div>

          <div className="flex flex-row items-center gap-3 text-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
              />
            </svg>

            <span>
              {getText(user?.state.name, user?.state.nameMM, locale) +
                "-" +
                getText(user?.district.name, user?.district.nameMM, locale) +
                getText(user?.township.name, user?.township.nameMM, locale)}
            </span>
          </div>
          <div className="flex flex-row items-center gap-3 text-sm">
            <svg
              version="1.1"
              id="_x32_"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
              fill="currentColor"
              className="w-6 h-6"
            >
              <style type="text/css"></style>
              <g>
                <path
                  fill="currentColor"
                  d="M267.817,171.048c-12.343-12.388-27.371-22.176-44.078-28.53c-7.888,8.766-13.259,19.438-15.502,31.01
		c-0.61,3.12-0.976,6.248-1.144,9.361c1.373,0.472,2.716,0.976,4.029,1.548c14.555,6.171,27.051,16.501,35.808,29.515
		c7.033,10.405,11.702,22.451,13.274,35.504c0.412,3.257,0.61,6.576,0.61,9.963c0,11.306-2.273,21.956-6.377,31.674
		c-5.096,11.985-12.984,22.588-22.886,30.835c-2.105,1.777-4.318,3.426-6.606,4.974c-13.014,8.788-28.546,13.884-45.497,13.884
		c-11.275,0-21.909-2.281-31.643-6.378c-14.586-6.171-27.036-16.508-35.824-29.515c-8.758-12.992-13.854-28.561-13.854-45.474
		c0-11.298,2.243-21.932,6.362-31.674c5.539-13.075,14.464-24.487,25.678-33.008c-0.214-2.953-0.306-5.905-0.306-8.857
		c0-15.165,2.38-29.965,6.912-43.956c-17.348,6.309-32.91,16.34-45.665,29.126c-22.611,22.543-36.648,53.919-36.602,88.37
		c-0.045,34.459,13.992,65.835,36.602,88.385c18.827,18.857,43.788,31.696,71.556,35.426v38.952h-57.901v33.55h57.901V512h33.566
		v-56.268h57.947v-33.55H196.23v-38.952c27.784-3.73,52.775-16.569,71.587-35.426c6.286-6.286,11.886-13.228,16.752-20.742
		c12.587-19.491,19.896-42.781,19.865-67.643c0-5.835-0.412-11.61-1.175-17.24C299.43,214.562,286.583,189.769,267.817,171.048z"
                />
                <path
                  fill="currentColor"
                  d="M349.015,0v33.551h51.203l-52.912,52.912c-22.276-16.981-49.052-25.564-75.691-25.54
		c-31.903-0.024-64.019,12.22-88.37,36.617c-17.424,17.378-28.622,38.714-33.627,61.12c-0.061,0.274-0.091,0.549-0.168,0.778
		c-0.198,0.87-0.366,1.747-0.533,2.579c-0.306,1.617-0.58,3.227-0.839,4.836c-0.168,0.969-0.305,1.984-0.412,2.952
		c-0.198,1.473-0.366,2.983-0.488,4.493c-0.076,0.87-0.168,1.748-0.213,2.617c-0.03,0.435-0.061,0.877-0.091,1.343
		c-0.077,0.877-0.107,1.777-0.138,2.646c-0.061,1.648-0.107,3.326-0.107,4.974c0,1.274,0.046,2.548,0.077,3.852
		c0.061,1.282,0.138,2.548,0.198,3.861l0.198,2.822c0,0.466,0.076,0.938,0.106,1.442c2.686,27.874,14.723,55.124,36.037,76.4
		c12.908,12.916,28.012,22.436,44.078,28.516c4.866-5.363,8.834-11.572,11.687-18.255c2.944-7.01,4.623-14.426,4.958-22.077
		c-10.908-3.921-21.1-10.23-29.888-19.018c-7.949-7.987-13.899-17.118-17.851-26.914c-2.822-6.92-4.638-14.166-5.432-21.475
		c-0.518-4.326-0.64-8.689-0.442-13.014c0.061-1.076,0.137-2.113,0.198-3.158c0.076-0.77,0.137-1.541,0.274-2.319
		c0-0.298,0.061-0.595,0.092-0.9c0.076-0.74,0.168-1.51,0.305-2.243c0.168-1.007,0.336-2.052,0.534-3.051
		c0.884-4.57,2.151-9.063,3.829-13.427c0.306-0.801,0.61-1.571,0.977-2.38c0.336-0.839,0.701-1.678,1.098-2.517
		c0.336-0.839,0.733-1.679,1.175-2.487c0.366-0.831,0.808-1.64,1.282-2.441c2.212-4.104,4.822-8.055,7.812-11.817
		c0.61-0.77,1.251-1.54,1.877-2.281c1.388-1.579,2.792-3.12,4.302-4.63c1.876-1.877,3.784-3.624,5.767-5.234
		c6.5-5.401,13.624-9.635,21.1-12.648c14.662-5.942,30.804-7.453,46.199-4.463c15.41,2.99,29.995,10.36,41.988,22.344
		c7.98,7.987,13.884,17.118,17.836,26.906c5.981,14.662,7.492,30.773,4.501,46.176c-3.021,15.394-10.406,29.988-22.337,41.973
		c-2.624,2.616-5.37,5.035-8.223,7.178c0.167,2.952,0.259,5.905,0.259,8.818c0.046,15.036-2.35,29.858-6.942,43.956
		c16.707-6.042,32.375-15.769,45.726-29.119c24.366-24.327,36.648-56.443,36.617-88.377c0.03-26.647-8.559-53.377-25.571-75.691
		l52.912-52.912v51.226h33.55V0H349.015z"
                />
              </g>
            </svg>

            <span>{user?.gender}</span>
          </div>
          <div className="flex flex-row items-center gap-3 text-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z"
              />
            </svg>

            {user?.nrcState &&
            user?.nrcTownship &&
            user?.nrcType &&
            user?.nrcNumber ? (
              <span>
                {user?.nrcState +
                  "/" +
                  user?.nrcTownship +
                  "(" +
                  user?.nrcType +
                  ")" +
                  user?.nrcNumber}
              </span>
            ) : (
              <span>Not Set</span>
            )}
          </div>
        </div>
        <div className="bg-white p-3 rounded-md border flex flex-col gap-3">
          <h3 className="text-lg text-primaryText border-b pb-3">NRC Info</h3>
          {!user.nrcFront && !user.nrcBack && (
            <span className="text-sm text-gray-500">Not Set</span>
          )}
          {user.nrcFront && (
            <img
              src={fileUrl + user?.nrcFront}
              className="w-full h-[130px] object-contain border rounded-md"
            />
          )}
          {user.nrcBack && (
            <img
              src={fileUrl + user?.nrcBack}
              className="w-full h-[130px] object-contain border rounded-md"
            />
          )}
        </div>

        <div className="bg-white p-3 rounded-md border flex flex-col gap-5 text-gray-500">
          <h3 className="text-lg text-primaryText border-b pb-3">Status</h3>
          <div className="flex flex-row items-center gap-3 text-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
              />
            </svg>

            <span>Role: {user.role}</span>
          </div>
          {user.role === Role.Staff && (
            <div className="flex flex-row items-center gap-3 text-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                />
              </svg>

              <span>Role: {user.userDefinedRole.name}</span>
            </div>
          )}
          <div className="flex flex-row items-center gap-3 text-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z"
              />
            </svg>

            <span>
              Joined Date:{" "}
              {new Date(user.createdAt).toLocaleDateString("en-ca", {
                year: "numeric",
                month: "short",
                day: "2-digit",
              })}
            </span>
          </div>
          {isSeller(user) && (
            <>
              <div className="flex flex-row items-center gap-3 text-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
                  />
                </svg>

                <span>
                  Membership:{" "}
                  {getText(
                    user.currentMembership.name,
                    user.currentMembership.nameMM,
                    locale
                  )}
                </span>
              </div>
              {user.memberStartDate && (
                <>
                  <div className="flex flex-row items-center gap-3 text-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z"
                      />
                    </svg>

                    <span>
                      Start Date:{" "}
                      {new Date(user.memberStartDate).toLocaleDateString(
                        "en-ca",
                        {
                          year: "numeric",
                          month: "short",
                          day: "2-digit",
                        }
                      )}
                    </span>
                  </div>
                  <div className="flex flex-row items-center gap-3 text-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z"
                      />
                    </svg>

                    <span>
                      Expired Date:{" "}
                      {date.toLocaleDateString("en-ca", {
                        year: "numeric",
                        month: "short",
                        day: "2-digit",
                      })}
                    </span>
                  </div>
                </>
              )}
              <div className="flex flex-row items-center gap-3 text-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z"
                  />
                </svg>

                <span>
                  {user?.sellAllow ? "Allow Selling" : "Disable Selling"}
                </span>
              </div>
            </>
          )}
          {user.isBlocked && (
            <div className="flex flex-row items-center gap-3 text-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                />
              </svg>

              <span>{user?.isBlocked ? "Blocked" : "Active"}</span>
            </div>
          )}
          {user.isDeleted && (
            <div className="flex flex-row items-center gap-3 text-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                />
              </svg>

              <span>{user?.isDeleted ? "Deleted" : "Active"}</span>
            </div>
          )}
          {user.adminNote && (
            <>
              <p className="text-xs mt-3">Admin Note</p>
              <p className="text-sm">{user.adminNote}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserDetailsSection;
