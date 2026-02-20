import { Link } from "react-router";

export default function CategoryList() {
  const categories = ["Doctor", "Work", "Personal", "Fitness", "Other", "Kids"];

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Browse by Category</h2>

      <div className="grid grid-cols-2 gap-4">
        {categories.map((category) => (
          <Link
            key={category}
            to={`/category/${category}`}
            className="block border p-4 rounded hover:bg-gray-100"
          >
            {category}
          </Link>
        ))}
      </div>
    </div>
  );
}
