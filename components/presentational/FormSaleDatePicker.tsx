import { useTranslation } from "next-i18next";
import React from "react";

type Props = {
  isSalePeriod: boolean;
  saleStartDate?: Date | null;
  saleEndDate?: Date | null;
  setSaleDate: Function;
  setSalePeriod?: Function;
  error: String;
  setError: Function;
};

function FormSaleDatePicker({
  isSalePeriod,
  saleStartDate,
  saleEndDate,
  setSaleDate,
  setSalePeriod,
  error,
  setError,
}: Props) {
  const { t } = useTranslation("common");
  const [startDate, setStartDate] = React.useState(saleStartDate);
  const [endDate, setEndDate] = React.useState(saleEndDate);

  React.useEffect(() => {
    if (saleEndDate) {
      setEndDate(new Date(saleEndDate));
    }
    if (saleStartDate) {
      setStartDate(new Date(saleStartDate));
    }
  }, [saleStartDate, saleEndDate]);

  React.useEffect(() => {
    if (isSalePeriod === true) {
      if (startDate && endDate) {
        if (startDate > endDate) {
          setError(t("Start date must be less than end date."));
        } else {
          setError("");
        }
      } else {
        setError(t("Please input both start date and end date."));
      }
    } else {
      setError("");
    }
  }, [startDate, endDate, isSalePeriod]);

  return (
    <div className="flex w-full flex-col">
      <div className="flex w-full flex-row flex-wrap items-end justify-end gap-5">
        <div className="flex-grow">
          {isSalePeriod === true && (
            <div className="grid w-full grid-cols-1 gap-5 lg:grid-cols-2">
              <div className="w-full">
                <label
                  className={`text-sm font-medium ${
                    error
                      ? "text-error"
                      : saleStartDate && !error
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                >
                  {t("saleStartDate")}
                </label>

                <div className={`relative mt-1`}>
                  <input
                    type="date"
                    className={`w-full rounded-lg ${
                      error
                        ? "border-error"
                        : saleStartDate && !error
                        ? "border-green-600"
                        : "border-gray-200"
                    } px-4 py-2 pr-12 text-sm leading-6 shadow-sm`}
                    placeholder={t("enter") + " " + t("saleStartDate")}
                    defaultValue={
                      saleStartDate && typeof saleStartDate === "string"
                        ? saleStartDate
                        : saleStartDate?.toISOString().slice(0, 10)
                    }
                    value={
                      startDate && typeof startDate === "string"
                        ? startDate
                        : startDate?.toISOString().slice(0, 10)
                    }
                    onChange={(e) => {
                      setStartDate(e.currentTarget.valueAsDate);
                      setSaleDate(e.currentTarget.valueAsDate, endDate);
                    }}
                  />
                </div>
              </div>
              <div className="w-full">
                <label
                  className={`text-sm font-medium ${
                    error
                      ? "text-error"
                      : saleEndDate && !error
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                >
                  {t("saleEndDate")}
                </label>

                <div className={`relative mt-1`}>
                  <input
                    type="date"
                    className={`w-full rounded-lg ${
                      error
                        ? "border-error"
                        : saleEndDate && !error
                        ? "border-green-600"
                        : "border-gray-200"
                    } px-4 py-2 pr-12 text-sm leading-6 shadow-sm`}
                    placeholder={t("enter") + " " + t("saleEndDate")}
                    defaultValue={
                      saleEndDate && typeof saleEndDate === "string"
                        ? saleEndDate
                        : saleEndDate?.toISOString().slice(0, 10)
                    }
                    value={
                      endDate && typeof endDate === "string"
                        ? endDate
                        : endDate?.toISOString().slice(0, 10)
                    }
                    onChange={(e) => {
                      setEndDate(e.currentTarget.valueAsDate);
                      setSaleDate(startDate, e.currentTarget.valueAsDate);
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        {setSalePeriod && (
          <button
            type="button"
            className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 hover:bg-gray-50"
            onClick={() => {
              if (setSalePeriod) {
                setSalePeriod(!isSalePeriod);
              }
              if (isSalePeriod === true) {
                setSaleDate(null, null);
                setStartDate(null);
                setEndDate(null);
              }
            }}
          >
            {isSalePeriod === true ? t("cancelSchedule") : t("setSchedule")}
          </button>
        )}
      </div>

      {error && isSalePeriod === true && (
        <span className="p-2 text-xs text-error">{error}</span>
      )}
    </div>
  );
}

export default FormSaleDatePicker;
