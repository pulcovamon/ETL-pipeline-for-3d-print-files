import { Folder } from "./types";
import FileItem from "./FileItem";
import { useState } from "react";
import axios from "axios";

interface FolderItemProps {
  parentCategory: string;
  folder: Folder;
  setCategories: (categories: Folder[]) => void;
  categories: Folder[];
}

export default function FolderItem({
  parentCategory,
  folder,
  setCategories,
  categories,
}: FolderItemProps) {
  const [openFolder, setOpenFolder] = useState(false);

  async function handleFolderClick() {
    if (openFolder) {
      setOpenFolder(false);
    } else {
      setOpenFolder(true);
      const children = folder.children;
      console.log(folder);
      setCategories(
        categories.map((cat) =>
          cat.name === parentCategory
            ? {
                ...cat,
                children: cat.children.map((child) =>
                  child.name === folder.name ? { ...child, children } : child
                ),
              }
            : cat
        )
      );
    }
  }

  async function getCategory(category: string): Promise<Folder[]> {
    try {
      const response = await axios.get(`http://0.0.0.0:8080/files/${category}`);
      return response.data.children || [];
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  return (
    <li>
      <button
        onClick={handleFolderClick}
        className="text-gray-700 hover:bg-gray-200 p-2 rounded-md"
      >
        {folder.name}
      </button>
      {openFolder &&
        (folder.children ? (
          <ul className="pl-5 mt-2 bg-gray-100 rounded-md">
            {folder.children.map((subFolder) => (
              <FileItem key={subFolder.name} file={subFolder} parent={folder.name} category={parentCategory} />
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm p-2">Empty</p>
        ))}
    </li>
  );
}
