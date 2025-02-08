import { useEffect, useState } from "react";
import axios from "axios";
import { Folder } from "./types";
import { ListOfFiles } from "./ListOfFiles";

interface FileStructureProps {
  categories: Folder[];
}

export default function FileStructure({ categories }: FileStructureProps) {
  const [currentPath, setCurrentPath] = useState<string[]>(["datalake"]);
  const [currentItems, setCurrentItems] = useState<Folder[]>(categories);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (categories.length > 0) {
      setCurrentItems(categories);
    }
  }, [categories]);

  async function getCategory(category: string): Promise<Folder[]> {
    try {
      const response = await axios.get(`http://0.0.0.0:8080/files/${category}`);
      return response.data.children || [];
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async function addToPath(newItem: Folder) {
    setCurrentPath((prevPath) => [...prevPath, newItem.name]);
    setCurrentItems([]);
    setLoading(true);

    if (newItem.children.length > 0) {
      setCurrentItems(newItem.children);
    } else {
      const children = await getCategory(newItem.name);
      setCurrentItems(children);
    }

    setLoading(false);
  }

  async function setPath(item: string) {
    const index = currentPath.indexOf(item);
    if (index === -1) return;

    setCurrentPath((prevPath) => prevPath.slice(0, index + 1));
    setCurrentItems([]);
    setLoading(true);

    let newItems: Folder[] = [];

    if (index === 0) {
      newItems = categories;
    } else {
      newItems = await getCategory(item);
    }

    setCurrentItems(newItems);
    setLoading(false);
  }

  return (
    <div className="file-structure-container p-6 bg-gray-50 rounded-lg shadow-lg dark:bg-gray-900 w-full">
      <ul className="flex flex-row">
        {currentPath.map((item) => (
          <li
            key={item}
            onClick={() => setPath(item)}
            className="cursor-pointer hover:underline hover:text-blue-400"
          >
            {item}/
          </li>
        ))}
      </ul>
      <hr />
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ListOfFiles
          items={[...new Set(currentItems)]}
          addToPath={addToPath}
          parent={currentPath.length >= 3 ? currentPath[2] : null}
          category={currentPath.length >= 2 ? currentPath[1] : null}
        />
      )}
    </div>
  );
}
