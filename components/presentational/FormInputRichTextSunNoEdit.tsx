import "suneditor/dist/css/suneditor.min.css";
import React from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";

const SunEditor: any = dynamic(() => import("suneditor-react"), {
  ssr: false,
  loading: () => <p>Loading ...</p>,
});

type Props = {
  content: string;
};
function FormInputRichTextSun({ content }: Props) {
  return (
    <div className="w-full">
      <div className="p-5 bg-white">
        <div className="se-empty">
          <SunEditor
            setContents={content}
            disable={true}
            hideToolbar={true}
            width="100%"
            height="100%"
            readOnly={true}
            setOptions={{ resizingBar: false, showPathLabel: false }}
          />
        </div>
      </div>
    </div>
  );
}

export default FormInputRichTextSun;
