import { useEffect, useState } from "react";
import FileStructure from "./FileStructure";
import FileUploader from "./FileUploader";
import { Folder } from "./types";
import axios from "axios";

export default function App() {
  const [categories, setCategories] = useState<Folder[]>([]);

  useEffect(() => {
    async function getCategories() {
      try {
        const response = await axios.get("http://0.0.0.0:8080/categories");
        const categoryItems = response.data.map((cat: string) => {
          return { name: cat, children: [], folder: true }
        });
        setCategories(categoryItems);
      } catch (error) {
        console.error(error);
      }
    }

    getCategories();
    
  }, []);

  return (
    <div className="dark:bg-gray-800 dark:text-white min-h-svh text-lg">
      <div className="w-full bg-gray-100 dark:bg-gray-900 p-10 mb-10">
        <h1>ETL pipeline for 3d printing files</h1>
      </div>
      <div className="flex flex-row gap-10 justify-evenly m-10">
      <FileUploader categories={categories} />
      <FileStructure categories={categories} />
      </div>
    </div>
  );
}
