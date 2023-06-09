import React, { MutableRefObject } from "react";

type Props = {
  label: string;
  placeHolder: string;
  defaultValue?: any;
  error: any;
  formControl: any;
  currentValue?: any;
  optional?: boolean;
};

function FormInputTextArea({
  label,
  placeHolder,
  defaultValue,
  error,
  formControl,
  currentValue,
  optional,
}: Props) {
  return (
    <div>
      <label
        className={`text-sm font-medium ${
          error
            ? "text-error"
            : currentValue && currentValue.length > 0 && !error
            ? "text-green-600"
            : "text-gray-400"
        }`}
      >
        {label}{" "}
        {optional === true ? <></> : <span className="text-primary">*</span>}
      </label>

      <div className={`relative mt-1`}>
        <textarea
          className={`w-full rounded-lg ${
            error
              ? "border-error"
              : currentValue && currentValue.length > 0 && !error
              ? "border-green-600"
              : "border-gray-200"
          } px-4 py-2 pr-12 text-sm leading-6 shadow-sm`}
          placeholder={placeHolder}
          defaultValue={defaultValue}
          {...formControl}
          rows={8}
        />
      </div>
      {error && <span className="p-2 text-xs text-error">{error}</span>}
    </div>
  );
}

export default FormInputTextArea;
