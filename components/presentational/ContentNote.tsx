import React from "react";

function ContentNote({ note }: { note: string }) {
  const noteRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (noteRef.current && note) {
      let parser = new DOMParser();
      let shortDescriptionContent = parser.parseFromString(note, "text/html");
      noteRef.current.innerHTML = "";
      noteRef.current.appendChild(shortDescriptionContent.body);
    }
  }, [noteRef.current, note]);
  return <div ref={noteRef}></div>;
}

export default ContentNote;
