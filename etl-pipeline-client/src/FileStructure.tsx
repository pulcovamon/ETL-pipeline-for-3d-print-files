import { useState } from "react";
import axios from "axios";
import { Folder } from "./types";
import { ListOfFiles } from "./ListOfFiles";

interface FileStructureProps {
  categories: Folder[];
}

export default function FileStructure({
  categories,
}: FileStructureProps) {
  const [currentPath, setCurrentPath] = useState<string[]>(["datalake"]);
  const [currentItems, setCurrentItems] = useState<Folder[]>(categories);

  async function addToPath(newItem: Folder) {
    setCurrentPath([...currentPath, newItem.name]);
    if (newItem.children.length > 0) {
      setCurrentItems(newItem.children);
    } else {
      const children = await getCategory(newItem.name);
      setCurrentItems(children);
    }
  }

  function removeFromPath() {
    if (currentPath.length > 1) {
      setCurrentPath(currentPath.slice(0, -1));
    }
  }

  async function setPath(item: string) {
    const index = currentPath.indexOf(item);
    if (index <= currentPath.length - 1) {
      setCurrentPath(currentPath.slice(0, index + 1));
      if (currentPath.length === 1) {
        setCurrentItems(categories);
      } else if (currentPath.length === 2) {
        const children = await getCategory(item);
        setCurrentItems(children);
      } else {
        const categoryItems = await getCategory(currentPath[1]);
        const parent = categoryItems.filter((catItem) => {
          return catItem.name === item;
        });
        setCurrentItems(parent[0].children);
      }
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
    <div className="file-structure-container p-6 bg-gray-50 rounded-lg shadow-lg dark:bg-gray-900 w-full">
      <ul className="flex flex-row">
        {currentPath.map((item) => {
          return (
            <li
              property={item}
              onClick={() => setPath(item)}
              className="cursor-pointer hover:underline"
            >
              {item}/
            </li>
          );
        })}
      </ul>
      <ListOfFiles
        items={currentItems}
        addToPath={addToPath}
        parent={currentPath.length >= 3 ? currentPath[2] : null}
        category={currentPath.length >= 2 ? currentPath[1] : null}
      />
    </div>
  );
}
