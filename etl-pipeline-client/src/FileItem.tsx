import { Folder } from "./types";

interface FileItemProps {
  file: Folder;
  parent: string|null;
  category: string;
}

export default function FileItem({ file, parent=null, category }: FileItemProps) {
  const getDownloadURL = (category: string, fileName: string, parent?: string|null) => {
    const encodedFileName = encodeURIComponent(fileName);
    let url = `http://localhost:8080/files/${category}/${encodedFileName}`;
    if (parent) {
      url += `?parent=${encodeURIComponent(parent)}`;
    }
    return url;
  };
  
  return (
    <li className="text-gray-700 p-2 rounded-md">
      <a href={getDownloadURL(category, file.name, parent)}>
      {file.name}
      </a>
    </li>
  );
}
