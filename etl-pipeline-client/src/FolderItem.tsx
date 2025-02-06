import { Folder } from "./types";
import FileItem from "./FileItem";
import { useState } from "react";

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

  return (
    <li>
      <button
        onClick={handleFolderClick}
        className="text-gray-700 hover:bg-gray-200 p-2 rounded-md cursor-pointer dark:text-white dark:hover:bg-gray-700"
      >
        {folder.name}
      </button>
      {openFolder &&
        (folder.children ? (
          <ul className="pl-5 mt-2 bg-gray-100 rounded-md dark:bg-gray-800">
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
