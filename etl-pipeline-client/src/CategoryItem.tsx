import { Folder } from "./types";
import FolderItem from "./FolderItem";
import FileItem from "./FileItem";

interface CategoryItemProps {
  category: Folder;
  openCategories: string[];
  handleCategoryClick: (category: string) => void;
  setCategories: (categories: Folder[]) => void;
  categories: Folder[];
}

export default function CategoryItem({
  category,
  openCategories,
  handleCategoryClick,
  setCategories,
  categories,
}: CategoryItemProps) {
  function isFile(item: Folder): boolean {
    const fileExtensions = [".stl", ".png", ".jpg", ".jpeg", ".txt", ".pdf"];
    return fileExtensions.some((ext) => item.name.toLowerCase().endsWith(ext));
  }

  return (
    <li className="category mb-2">
      <button
        onClick={() => handleCategoryClick(category.name)}
        className="text-left w-full p-3 text-lg font-semibold rounded-md bg-gray-200 hover:bg-gray-300 focus:outline-none"
      >
        {category.name}
      </button>
      {openCategories.includes(category.name) && (
        <ul className="category-files pl-5 mt-2 bg-gray-100 rounded-md">
          {category.children.length > 0 ? (
            category.children.map((child) => (
                isFile(child) ?
                <FileItem file={child} /> :
              <FolderItem
                key={child.name}
                parentCategory={category.name}
                folder={child}
                setCategories={setCategories}
                categories={categories}
              />
            ))
          ) : (
            <p className="text-gray-500 text-sm p-2">Empty</p>
          )}
        </ul>
      )}
    </li>
  );
}
