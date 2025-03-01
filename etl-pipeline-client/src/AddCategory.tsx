import { useState } from "react";
import axios from "axios";

export default function AddCategory({ onCategoryAdded }: { onCategoryAdded: () => void }) {
    const [categoryName, setCategoryName] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleAddCategory = async () => {
        if (!categoryName.trim()) {
            setError("Category name cannot be empty!");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await axios.post("http://0.0.0.0:8000/categories", { name: categoryName });
            setCategoryName("");
            onCategoryAdded();
        } catch (error: any) {
            if (error.response?.status === 403) {
                setError("Category already exists!");
            } else {
                setError("Failed to add category.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4 p-5 border rounded-lg bg-gray-900">
            <h3 className="font-semibold">Add New Category</h3>
            <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Category name..."
                className="border p-2 rounded-md w-full"
            />
            {error && <p className="text-red-500">{error}</p>}
            <button
                onClick={handleAddCategory}
                className="bg-linear-to-r from-yellow-600 to-red-600 text-white px-4 py-2 rounded-md hover:from-yellow-700 hover:to-red-800 disabled:from-gray-500 disabled:to-gray-500 cursor-pointer disabled:cursor-not-allowed"
                disabled={isLoading || categoryName === ""}
            >
                {isLoading ? "Adding..." : "Add Category"}
            </button>
        </div>
    );
}
