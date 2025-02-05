import { useState } from "react";
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
        <button onClick={() => setShowViewer(true)} className="text-blue-500 hover:underline">
          Preview
        </button>
      )}

      {showViewer && isSTL && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white bg-opacity-80 p-6 rounded-lg shadow-lg relative">
            <STLViewer fileUrl={fileURL} />
            <div className="absolute top-2 right-2">
              <a href={fileURL }>Download</a>
            <button
              onClick={() => setShowViewer(false)}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
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
