import { Folder } from "./types";

interface FileItemProps {
  file: Folder;
}

export default function FileItem({ file }: FileItemProps) {
  return (
    <li className="text-gray-700 p-2 rounded-md">
      {file.name}
    </li>
  );
}
