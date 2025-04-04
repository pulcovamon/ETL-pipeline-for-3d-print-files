import { useEffect, useState } from "react";
import axios from "axios";
import { Folder } from "./types";
import { ListOfFiles } from "./ListOfFiles";

interface FileStructureProps {
  categories: Folder[];
}

export default function FileStructure({ categories }: FileStructureProps) {
  const [currentPath, setCurrentPath] = useState<string[]>(["datalake"]);
  const [currentCategory, setCurrentCategory] = useState<Folder | null>(null);
  const [currentItems, setCurrentItems] = useState<Folder[]>(categories);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (categories.length > 0) {
      setCurrentItems(categories);
      setCurrentPath(["datalake"]);
      setCurrentCategory(null);
    }
  }, [categories]);

  async function getCategory(category: string): Promise<Folder | null> {
    try {
      const response = await axios.get(`http://0.0.0.0:8000/files/${category}`);
      return response.data || null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  function findFolderByPath(root: Folder, path: string[]): Folder | null {
    let current = root;
    for (let i = 2; i < path.length; i++) {
      const next = current.children.find((child) => child.name === path[i]);
      if (!next) return null;
      current = next;
    }
    return current;
  }

  async function addToPath(newItem: Folder) {
    const newPath = [...currentPath, newItem.name];
    setCurrentPath(newPath);
    setCurrentItems([]);
    setLoading(true);
    console.log(currentCategory);

    if (!currentCategory || currentCategory.name !== newItem.category) {
      console.log(newItem.category);
      const categoryData = await getCategory(newItem.category);
      if (!categoryData) {
        setLoading(false);
        return;
      }
      setCurrentCategory(categoryData);
      if (newItem.name === newItem.category) {
        setCurrentItems(categoryData.children);
      } else {
        const targetFolder = findFolderByPath(categoryData, newPath);
        setCurrentItems(targetFolder ? targetFolder.children : []);
      }
    } else {
      const targetFolder = findFolderByPath(currentCategory, newPath);
      setCurrentItems(targetFolder ? targetFolder.children : []);
    }

    setLoading(false);
  }

  async function setPath(item: string) {
    const index = currentPath.indexOf(item);
    if (index === -1) return;

    const newPath = currentPath.slice(0, index + 1);
    setCurrentPath(newPath);
    setCurrentItems([]);
    setLoading(true);

    if (index === 0) {
      setCurrentItems(categories);
      setCurrentCategory(null);
    } else if (currentCategory) {
      const targetFolder = findFolderByPath(currentCategory, newPath);
      setCurrentItems(targetFolder ? targetFolder.children : []);
    }

    setLoading(false);
  }

  return (
    <div className="file-structure-container p-6 rounded-lg shadow-lg bg-gray-900 w-full border border-white">
      <div className="flex flex-row items-center justify-between">
      <ul className="flex flex-row">
        {currentPath.map((item) => (
          <li
            key={item}
            onClick={() => setPath(item)}
            className="cursor-pointer hover:underline hover:text-orange-500"
          >
            {item}/
          </li>
        ))}
      </ul>
      <img src="/files.svg"></img>
      </div>
      <hr />
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ListOfFiles
          items={currentItems}
          addToPath={addToPath}
          parent={currentPath.length >= 3 ? currentPath[2] : null}
          category={currentPath.length >= 2 ? currentPath[1] : null}
        />
      )}
    </div>
  );
}
