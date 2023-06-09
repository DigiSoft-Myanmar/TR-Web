import React from "react";

type Props = {
  label: string;
  formControl: any;
  value: boolean | undefined;
  defaultValue?: boolean;
  disabled?: boolean;
};

function FormInputCheckbox({
  label,
  formControl,
  value,
  defaultValue,
  disabled,
}: Props) {
  return (
    <div className="form-control flex">
      <label className="label cursor-pointer">
        <input
          type="checkbox"
          className="checkbox-primary checkbox"
          checked={value}
          defaultChecked={defaultValue}
          {...formControl}
          disabled={disabled === true ? true : false}
        />
        <span className="label-text ml-3 flex-grow">{label}</span>
      </label>
    </div>
  );
}

export default FormInputCheckbox;
