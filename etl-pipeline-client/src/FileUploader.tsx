import { useState } from "react";
import axios from "axios";
import { X } from "lucide-react";

export default function FileUploader() {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    }
  };

  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      setFiles((prevFiles) => [...prevFiles, file]);
    }
  };

  const handleFileUpload = async () => {
    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    setIsUploading(true);
    try {
      await axios.post("http://0.0.0.0:8080/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Files uploaded successfully!");
    } catch (error) {
      console.error("Error uploading files", error);
      alert("Failed to upload files.");
    } finally {
      setIsUploading(false);
      setFiles([]);
    }
  };

  const handleButtonClick = () => {
    document.getElementById("fileInput")?.click();
  };

  const handleRemoveFile = (fileName: string) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
  };

  return (
    <div className="p-6 space-y-6 flex flex-col justify-items-center">
      <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed p-6 rounded-lg text-center ${isDragging ? "border-green-500" : ""}`}>
        <p className="text-sm text-gray-700 dark:text-white">Drag & drop or click to select files (ZIP, RAR, 7Z, STL)</p>
        <input
          type="file"
          multiple
          accept=".zip,.rar,.7z,.stl"
          className="hidden"
          onChange={handleFileChange}
          id="fileInput">
          </input>
        <button
          onClick={handleButtonClick}
          type="button"
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 cursor-pointer"
        >
          Select File
        </button>
      </div>

      {files.length > 0 && (
        <div>
          <h3 className="font-semibold">Selected Files</h3>
          <ul className="list-disc pl-5 mt-2">
            {files.map((file) => (
              <li key={file.name} className="flex justify-between items-center">
                {file.name}
                <button
                  onClick={() => handleRemoveFile(file.name)}
                  className="ml-2 text-red-500 hover:text-red-700 cursor-pointer"
                >
                  <X size={20}/>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={handleFileUpload}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 cursor-pointer disabled:bg-gray-500 disabled:hover:bg-gray-500 disabled:cursor-not-allowed"
        disabled={isUploading || files.length === 0}
      >
        {isUploading ? "Uploading..." : "Send"}
      </button>
    </div>
  );
}
