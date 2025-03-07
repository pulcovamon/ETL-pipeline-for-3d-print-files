import { useState } from "react";
import { Box, Download, FileQuestion, FileText, Image, X } from "lucide-react"; // Importujeme ikonu pro download
import STLViewer from "./StlViewer";
import { Folder } from "./types";
import PDFViewer from "./PdfViewer";

interface FileItemProps {
  file: Folder;
  parent: string | null;
  category: string;
}

export default function FileItem({
  file,
  parent = null,
  category,
}: FileItemProps) {
  const [showViewer, setShowViewer] = useState(false);

  const getDownloadURL = (
    category: string,
    fileName: string,
    parent?: string | null
  ) => {
    const encodedFileName = encodeURIComponent(fileName);
    let url = `http://localhost:8000/files/${category}/${encodedFileName}`;
    if (parent) {
      url += `?parent=${encodeURIComponent(parent)}`;
    }
    return url;
  };

  const fileURL = getDownloadURL(category, file.name, parent);
  const isSTL = file.name.toLowerCase().endsWith(".stl");
  const isImage = [".png", ".jpg", ".jpeg"].some((char) =>
    file.name.toLowerCase().endsWith(char)
  );
  const isPDF = file.name.toLocaleLowerCase().endsWith(".pdf");
  let icon = <FileQuestion />;

  if (isSTL) {
    icon = <Box />;
  } else if (isImage) {
    icon = <Image />;
  } else if (isPDF) {
    icon = <FileText />;
  }

  return (
    <div
      className="text-gray-700 p-4 pr-15 pl-10 rounded-md flex justify-between items-center"
    >
      {isSTL || isImage || isPDF ? (
        <span
          onClick={() => setShowViewer(true)}
          className="flex flex-row gap-1 text-white hover:underline cursor-pointer hover:text-orange-500"
        >
          {icon}
          {file.name}
        </span>
      ) : (
        <span className="flex flex-row gap-1 text-white">
          {icon}
          {file.name}
        </span>
      )}
      <a href={fileURL} className="text-white hover:text-orange-500">
        <Download />
      </a>

      {showViewer && (isSTL || isImage || isPDF) && (
        <div className="fixed inset-0 bg-black-40 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-opacity-95 rounded-lg shadow-lg p-5 relative flex flex-col items-center bg-gray-900 max-h-screen max-w-screen">
            <div className="flex flex-row justify-between gap-5 w-full items-center pb-5">
              <h4 className="text-white">{file.name}</h4>
              <div className="flex gap-3">
              <a
                href={fileURL}
                download
                className="flex items-center gap-2 px-4 py-2 bg-linear-to-t from-yellow-600 to-red-600 text-white rounded-md hover:from-yellow-700 hover:to-red-800 transition duration-300 ease-in-out z-100"
              >
                <Download size={20} />
              </a>

              <button
                onClick={() => setShowViewer(false)}
                className="px-4 py-2 bg-linear-to-t from-yellow-600 to-red-600 text-white rounded-md hover:from-yellow-700 hover:to-red-800 transition duration-300 ease-in-out cursor-pointer z-100"
              >
                <X size={20} />
              </button>
            </div>
            </div>
          <div className="bg-linear-to-r from-red-600 to-yellow-600 p-1 rounded-lg">
            <div className="flex items-center justify-center border-none rounded-lg overflow-hidden bg-gray-900">
              {isSTL ? (
                <STLViewer fileUrl={fileURL} />
              ) : isImage ? (
                <img src={fileURL} />
              ) : (
                <PDFViewer fileURL={fileURL} />
              )}
            </div>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}
