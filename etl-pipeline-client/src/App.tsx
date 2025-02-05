import { useState } from "react";
import FileStructure from "./FileStructure";
import FileUploader from "./FileUploader";

interface Folder {
  name: string;
  children: Folder[];
}

export default function App() {
  const [categories, setCategories] = useState<Folder[]>([
    { name: "terrain", children: [] },
    { name: "basing", children: [] },
    { name: "creature", children: [] },
    { name: "character", children: [] },
  ]);

  return (
    <div className="app-container">
      <FileUploader />
      <FileStructure categories={categories} setCategories={setCategories} />
    </div>
  );
}
