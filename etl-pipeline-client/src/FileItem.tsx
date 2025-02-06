import { useState } from "react";
import { Download, X } from "lucide-react"; // Importujeme ikonu pro download
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
    let url = `http://localhost:8080/files/${category}/${encodedFileName}`;
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

  return (
    <li className="text-gray-700 p-2 rounded-md flex justify-between items-center">
      <a href={fileURL} className="text-blue-500 hover:underline">
        {file.name}
      </a>

      {(isSTL || isImage || isPDF) && (
        <button
          onClick={() => setShowViewer(true)}
          className="text-blue-500 hover:underline cursor-pointer"
        >
          Preview
        </button>
      )}

      {showViewer && (isSTL || isImage || isPDF) && (
        <div className="fixed inset-0 bg-black-40 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white bg-opacity-95 rounded-lg shadow-lg p-6 relative flex flex-col items-center dark:bg-gray-900 max-h-screen max-w-screen">
            <div className="flex items-center justify-center border border-gray-400 rounded-lg overflow-hidden">
              {isSTL ? (
                <STLViewer fileUrl={fileURL} />
              ) : isImage ? (
                <img src={fileURL} />
              ) : <PDFViewer fileURL={fileURL} />}
            </div>

            <div className="absolute top-4 right-4 flex gap-3">
              <a
                href={fileURL}
                download
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-800 transition z-100"
              >
                <Download size={20} />
              </a>

              <button
                onClick={() => setShowViewer(false)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-800 transition cursor-pointer z-100"
              >
                <X size={20}/>
              </button>
            </div>
          </div>
        </div>
      )}
    </li>
  );
}
