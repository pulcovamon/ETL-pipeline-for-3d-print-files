import { useState } from "react";
import axios from "axios";
import CategoryItem from "./CategoryItem";
import { Folder } from "./types";

interface FileStructureProps {
  categories: Folder[];
  setCategories: (categories: Folder[]) => void;
}

export default function FileStructure({
  categories,
  setCategories,
}: FileStructureProps) {
  const [openCategories, setOpenCategories] = useState<string[]>([]);

  async function getCategory(category: string): Promise<Folder[]> {
    try {
      const response = await axios.get(`http://0.0.0.0:8080/files/${category}`);
      return response.data.children || [];
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async function handleCategoryClick(category: string) {
    if (openCategories.includes(category)) {
      setOpenCategories(
        openCategories.filter((openCategory) => openCategory !== category)
      );
    } else {
      setOpenCategories([...openCategories, category]);

      const children: Folder[] = await getCategory(category);

      setCategories(
        categories.map((cat) =>
          cat.name === category ? { ...cat, children } : cat
        )
      );
    }
  }

  return (
    <div className="file-structure-container p-6 bg-gray-50 rounded-lg shadow-lg dark:bg-gray-900 w-full">
      <ul>
        {categories.map((category) => (
          <CategoryItem
                key={category.name}
                category={category}
                openCategories={openCategories}
                handleCategoryClick={handleCategoryClick}
                setCategories={setCategories} categories={categories}/>
        ))}
      </ul>
    </div>
  );
}
