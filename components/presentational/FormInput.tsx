import React, { MutableRefObject } from "react";

type Props = {
  label: string;
  type: string;
  placeHolder: string;
  defaultValue?: any;
  icon?: React.ReactNode;
  error: any;
  formControl: any;
  currentValue?: any;
  optional?: boolean;
  disableRoundedRight?: boolean;
  enableZero?: boolean;
  disabled?: boolean;
  focusFn?: Function;
};

function FormInput({
  label,
  type,
  placeHolder,
  defaultValue,
  icon,
  error,
  formControl,
  currentValue,
  optional,
  disableRoundedRight,
  enableZero,
  disabled,
  focusFn,
}: Props) {
  return (
    <div>
      <label
        className={`text-sm font-medium text-gray-400 ${
          error
            ? "text-error"
            : type === "number"
            ? enableZero === true && currentValue >= 0 && !error
              ? "text-green-600"
              : currentValue > 0 && !error && "text-green-600"
            : currentValue && currentValue.length > 0 && !error
            ? "text-green-600"
            : "text-gray-400"
        }`}
      >
        {label}{" "}
        {optional === true ? <></> : <span className="text-primary">*</span>}
      </label>

      <div className={`relative mt-1`}>
        <input
          type={type}
          className={`w-full ${
            disableRoundedRight ? "rounded-l-lg" : "rounded-lg"
          } ${
            error
              ? "border-error"
              : currentValue && currentValue.length > 0 && !error
              ? "border-green-600"
              : "border-gray-200"
          } px-4 py-2 pr-12 text-sm leading-6 shadow-sm`}
          placeholder={placeHolder}
          defaultValue={defaultValue}
          onWheelCapture={(e) => e.currentTarget.blur()}
          disabled={disabled === true ? true : false}
          step={"any"}
          onFocus={() => {
            if (focusFn) {
              focusFn();
            }
          }}
          {...formControl}
          value={currentValue}
        />
        {icon && (
          <span
            className={`absolute inset-y-0 right-4 inline-flex items-center ${
              error
                ? "text-error"
                : currentValue && currentValue.length > 0 && !error
                ? "text-green-600"
                : "text-gray-400"
            }`}
          >
            {icon}
          </span>
        )}
      </div>
      {error && <span className="p-2 text-xs text-error">{error}</span>}
    </div>
  );
}

export default FormInput;
