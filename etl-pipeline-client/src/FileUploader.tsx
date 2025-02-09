import { useState } from "react";
import axios from "axios";
import { X } from "lucide-react";
import { Folder } from "./types";

// Typy pro FancyCheckbox
type FancyCheckboxProps = {
  isChecked: boolean;
  onChange: () => void;
};

const FancyCheckbox: React.FC<FancyCheckboxProps> = ({ isChecked, onChange }) => {
  return (
    <label className="flex items-center space-x-3 cursor-pointer">
      <span className="relative inline-block">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={onChange}
          className="absolute opacity-0 w-0 h-0"
        />
        <span
          className={`block w-10 h-6 rounded-full border-2 
            ${isChecked ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-400'} 
            transition-all duration-300 ease-in-out`}
        >
          <span
            className={`absolute top-1 left-1 block w-4 h-4 rounded-full 
              ${isChecked ? 'bg-white transform translate-x-4' : 'bg-gray-300'}
              transition-all duration-300 ease-in-out`}
          ></span>
        </span>
      </span>
      <span className="text-white font-medium">Flatten directories</span>
    </label>
  );
};

export default function FileUploader({ categories }: { categories: Folder[] }) {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<undefined | string>(
    undefined
  );
  const [flattenDirectories, setFlattenDirectories] = useState<boolean>(false);

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

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(event.target.value);
  };

  const handleFileUpload = async () => {
    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    setIsUploading(true);
    try {
      let url = "http://0.0.0.0:8080/upload";
      const params: string[] = [];

      if (selectedCategory) {
        params.push(`category=${selectedCategory}`);
      }
      if (flattenDirectories) {
        params.push(`flatten=true`);
      }
      if (params.length > 0) {
        url += `?${params.join("&")}`;
      }
      await axios.post(url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } catch (error) {
      console.error("Error uploading files", error);
    } finally {
      setIsUploading(false);
      setFiles([]);
      setSelectedCategory(undefined);
      setFlattenDirectories(false);
    }
  };

  const handleButtonClick = () => {
    document.getElementById("fileInput")?.click();
  };

  const handleRemoveFile = (fileName: string) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
  };

  return (
    <div className="space-y-6 flex flex-col justify-items-center">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed p-6 rounded-lg text-center ${
          isDragging ? "border-green-500" : ""
        }`}
      >
        <p className="text-sm text-gray-700 dark:text-white">
          Drag & drop or click to select files (ZIP, RAR, 7Z, STL)
        </p>
        <input
          type="file"
          multiple
          accept=".zip,.rar,.7z,.stl"
          className="hidden"
          onChange={handleFileChange}
          id="fileInput"
        ></input>
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
                  <X size={20} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-2 justify-between">
        <label htmlFor="categories">Category:</label>
        <select
          value={selectedCategory || ""}
          onChange={handleChange}
          name="categories"
          className="border w-full rounded-md p-2 hover:bg-gray-900 cursor-pointer"
        >
          <option key="auto" value={undefined}>
            auto...
          </option>
          {categories
            ? categories.map((cat: Folder) => {
                return (
                  <option key={cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                );
              })
            : null}
        </select>
      </div>

      <div className="flex gap-2 justify-between">
        <FancyCheckbox
          isChecked={flattenDirectories}
          onChange={() => setFlattenDirectories(!flattenDirectories)}
        />
      </div>

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
