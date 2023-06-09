import "suneditor/dist/css/suneditor.min.css";
import React from "react";
import dynamic from "next/dynamic";

/* const SunEditor = dynamic(() => import("suneditor-react"), {
  ssr: false,
}); */

type Props = {
  label: string;
  content: string;
  setContent: Function;
  maxCount?: number;
};
function FormInputRichTextSun({ label, content, setContent, maxCount }: Props) {
  return (
    <div className="w-full">
      <label className={`text-sm font-medium text-gray-400`}>{label}</label>
      <div className="mb-14 h-64">
        {/* <SunEditor
          height="250"
          onChange={(e) => {
            setContent(e);
          }}
          defaultValue={content}
          setContents={content}
          setOptions={{
            maxCharCount: maxCount,
            buttonList: [
              ["undo", "redo"],
              [
                ":p-More Paragraph-default.more_paragraph",
                "font",
                "fontSize",
                "fontColor",
                "hiliteColor",
                "align",
                "horizontalRule",
                "formatBlock",
                "paragraphStyle",
                "blockquote",
              ],
              ["bold", "underline", "italic", "list"],
              ["table", "image"],
              ["fullScreen"],
            ],
          }}
        /> */}
      </div>
    </div>
  );
}

export default FormInputRichTextSun;
