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
      const response = await axios.get("http://0.0.0.0:8000/categories");
      const categoryItems = response.data.map((cat: string) => ({
        name: cat,
        children: [],
        folder: true,
        path: ["datalake"],
        category: cat,
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
    <div className="dark:bg-gray-800 dark:text-white min-h-svh text-lg font-mono bg-[url(/star.svg)] bg-repeat">
      <div className="w-full bg-gray-100 dark:bg-gray-900 p-4 flex flex-row gap-5 items-center">
        <img src="/logo.svg" width={50}></img>
        <h1>ETL Pipeline and Storage for 3d Printing Files</h1>
      </div>
      <div className="flex flex-row gap-10 justify-evenly m-20 mt-15">
        <div className="flex flex-col gap-10">
          <FileUploader categories={categories} />
          <AddCategory onCategoryAdded={getCategories} />
        </div>
        <FileStructure categories={categories} />
      </div>
    </div>
  );
}
