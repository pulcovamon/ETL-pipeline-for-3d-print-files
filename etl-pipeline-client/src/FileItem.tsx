import { useState } from "react";
import { Download } from "lucide-react"; // Importujeme ikonu pro download
import STLViewer from "./StlViewer";
import { Folder } from "./types";

interface FileItemProps {
  file: Folder;
  parent: string | null;
  category: string;
}

export default function FileItem({ file, parent = null, category }: FileItemProps) {
  const [showViewer, setShowViewer] = useState(false);

  const getDownloadURL = (category: string, fileName: string, parent?: string | null) => {
    const encodedFileName = encodeURIComponent(fileName);
    let url = `http://localhost:8080/files/${category}/${encodedFileName}`;
    if (parent) {
      url += `?parent=${encodeURIComponent(parent)}`;
    }
    return url;
  };

  const fileURL = getDownloadURL(category, file.name, parent);
  const isSTL = file.name.toLowerCase().endsWith(".stl");

  return (
    <li className="text-gray-700 p-2 rounded-md flex justify-between items-center">
      <a href={fileURL} className="text-blue-500 hover:underline">
        {file.name}
      </a>

      {isSTL && (
        <button onClick={() => setShowViewer(true)} className="text-blue-500 hover:underline cursor-pointer">
          Preview
        </button>
      )}

      {showViewer && isSTL && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white bg-opacity-95 rounded-lg shadow-lg p-6 relative flex flex-col items-center">
            <div className="flex items-center justify-center border border-gray-300 rounded-lg overflow-hidden">
              <STLViewer fileUrl={fileURL} />
            </div>

            <div className="absolute top-4 right-4 flex gap-3">
              <a
                href={fileURL}
                download
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
              >
                <Download size={20} />
                Download
              </a>

              <button
                onClick={() => setShowViewer(false)}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </li>
  );
}
