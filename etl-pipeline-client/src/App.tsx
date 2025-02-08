import { useEffect, useState } from "react";
import FileStructure from "./FileStructure";
import FileUploader from "./FileUploader";
import { Folder } from "./types";
import axios from "axios";
import AddCategory from "./AddCategory";

export default function App() {
  const [categories, setCategories] = useState<Folder[]>([]);

  const getCategories = async () => {
    try {
      const response = await axios.get("http://0.0.0.0:8080/categories");
      const categoryItems = response.data.map((cat: string) => ({
        name: cat,
        children: [],
        folder: true,
      }));
      setCategories(categoryItems);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getCategories();
  }, []);

  return (
    <div className="dark:bg-gray-800 dark:text-white min-h-svh text-lg">
      <div className="w-full bg-gray-100 dark:bg-gray-900 p-10 mb-10">
        <h1>ETL pipeline for 3D printing files</h1>
      </div>
      <div className="flex flex-row gap-20 justify-evenly m-15">
        <div className="flex flex-col gap-20">
          <FileUploader categories={categories} />
          <AddCategory onCategoryAdded={getCategories} />
        </div>
        <FileStructure categories={categories} />
      </div>
    </div>
  );
}
