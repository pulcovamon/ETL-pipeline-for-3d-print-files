import { useState } from "react";
import axios from "axios";

export default function FileUploader() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(event.target.files);
    }
  };

  const handleFileUpload = async () => {
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (const file of files) {
      formData.append("files", file);
    }

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
      setFiles(null);
    }
  };

  const handleButtonClick = () => {
    document.getElementById("fileInput")?.click();
  };


  return (
    <div className="p-6 space-y-6">
      <div className="border-2 border-dashed p-6 rounded-lg text-center">
        <p className="text-sm text-gray-700">Drag & drop or click to select files (ZIP, RAR, 7Z, STL)</p>
        <input
          type="file"
          multiple
          accept=".zip,.rar,.7z,.stl"
          className="hidden"
          onChange={handleFileChange}
          id="fileInput"
        />
        <button
          onClick={handleButtonClick}
          type="button"
          className="file-button"
        >
          Select File
        </button>
      </div>

      {files && files.length > 0 && (
        <div>
          <h3 className="font-semibold">Selected Files</h3>
          <ul className="list-disc pl-5 mt-2">
            {Array.from(files).map((file) => (
              <li key={file.name}>{file.name}</li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={handleFileUpload}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        disabled={isUploading || !files}
      >
        {isUploading ? "Uploading..." : "Send"}
      </button>
    </div>
  );
}
