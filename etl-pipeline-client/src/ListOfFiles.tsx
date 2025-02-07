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
                property={item.name}
                className="cursor-pointer hover:underline"
                onClick={() => addToPath(item)}
              >
                {item.name}
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
