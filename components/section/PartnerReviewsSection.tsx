import React from "react";

function PartnerReviewsSection() {
  return (
    <div className="flex w-full flex-col space-y-3 md:w-3/5">
      <div className="flex w-full flex-row items-end space-x-3 border-b-2 border-b-base-100 pt-5 pb-3">
        <h1 className="text-primaryText flex-grow pl-3 text-sm font-semibold">
          Partner Testimonial
        </h1>
      </div>
      <div className="flex flex-col items-start justify-start space-y-5">
        <figure className="mx-auto max-w-screen-md text-center">
          <svg
            aria-hidden="true"
            className="mx-auto mb-3 h-12 w-12 text-gray-400"
            viewBox="0 0 24 27"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M14.017 18L14.017 10.609C14.017 4.905 17.748 1.039 23 0L23.995 2.151C21.563 3.068 20 5.789 20 8H24V18H14.017ZM0 18V10.609C0 4.905 3.748 1.038 9 0L9.996 2.151C7.563 3.068 6 5.789 6 8H9.983L9.983 18L0 18Z"
              fill="currentColor"
            />
          </svg>
          <blockquote>
            <p className="text-lg font-medium italic text-gray-900">
              Lorem ipsum dolor, sit amet consectetur adipisicing elit.
              Temporibus libero ducimus laudantium, facilis maiores est, beatae
              vitae, saepe nesciunt hic sunt. Hic nobis praesentium iure. Earum
              delectus praesentium ipsa architecto.
            </p>
          </blockquote>
          <figcaption className="mt-6 flex items-center justify-center space-x-3">
            <img
              className="h-6 w-6 rounded-full"
              src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/avatars/michael-gouch.png"
              alt="profile picture"
            />
            <div className="flex items-center divide-x-2 divide-gray-500">
              <cite className="pr-3 font-medium text-gray-900">Mg Ba</cite>
              <cite className="pl-3 text-sm font-light text-gray-500">
                Coca Cola
              </cite>
            </div>
          </figcaption>
        </figure>
      </div>
    </div>
  );
}

export default PartnerReviewsSection;
