import { useState } from "react";
import FileStructure from "./FileStructure";
import FileUploader from "./FileUploader";

interface Folder {
  name: string;
  children: Folder[];
}

export default function App() {
  const [categories, setCategories] = useState<Folder[]>([
    { name: "terrain", children: [] },
    { name: "basing", children: [] },
    { name: "creature", children: [] },
    { name: "character", children: [] },
  ]);

  return (
    <div className="dark:bg-gray-800 dark:text-white min-h-svh">
      <div className="w-full bg-gray-100 dark:bg-gray-900 p-10 mb-10">
        <h1>ETL pipeline for 3d printing files</h1>
      </div>
      <div className="flex flex-row gap-10 justify-evenly m-10">
      <FileUploader />
      <FileStructure categories={categories} setCategories={setCategories} />
      </div>
    </div>
  );
}
