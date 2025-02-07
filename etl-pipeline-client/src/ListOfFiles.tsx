import { FolderClosed } from "lucide-react";
import FileItem from "./FileItem";
import { Folder } from "./types";

interface FileListProps {
  items: Folder[];
  addToPath: (item: Folder) => void;
  parent: string | null;
  category: string | null;
}

export function ListOfFiles({
  items,
  addToPath,
  parent,
  category,
}: FileListProps) {
  return (
    <div className="m-2">
      <ul>
        {items.map((item) => {
          if (item.folder) {
            return (
              <li
                key={item.name}
                className="cursor-pointer hover:underline p-3 hover:text-blue-400"
                onClick={() => addToPath(item)}
              >
                <span className="flex flex-row gap-1">
                  <FolderClosed size={20} />
                  {item.name}
                </span>
              </li>
            );
          }
          return (
            <FileItem
              file={item}
              parent={parent}
              category={category as string}
            />
          );
        })}
      </ul>
    </div>
  );
}
