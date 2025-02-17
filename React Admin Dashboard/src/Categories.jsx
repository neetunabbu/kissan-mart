import React, { useState, useEffect } from "react";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./firebaseConfig";
import { useNavigate } from "react-router-dom";
import "./Categories.css";
import "bootstrap/dist/css/bootstrap.min.css";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", imageUrl: "", isActive: true });
  const [image, setImage] = useState(null);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [subcategories, setSubcategories] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError(null);
      try {
        const categoriesCollection = collection(db, "categories");
        const snapshot = await getDocs(categoriesCollection);
        const categoryList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setCategories(categoryList);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setError("Failed to fetch categories.");
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const toggleDropdown = async (categoryId) => {
    if (expandedCategory === categoryId) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(categoryId);

      if (!subcategories[categoryId]) {
        try {
          const subcategoriesCollection = collection(db, `categories/${categoryId}/subcategories`);
          const snapshot = await getDocs(subcategoriesCollection);
          const subcategoryList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setSubcategories((prev) => ({ ...prev, [categoryId]: subcategoryList }));
        } catch (error) {
          console.error("Error fetching subcategories:", error);
        }
      }
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = "";
      if (image) {
        const imageRef = ref(storage, `categories/${image.name}`);
        await uploadBytes(imageRef, image);
        imageUrl = await getDownloadURL(imageRef);
      }

      const categoriesCollection = collection(db, "categories");
      const newCategoryData = { ...newCategory, imageUrl };
      await addDoc(categoriesCollection, newCategoryData);

      setCategories([...categories, newCategoryData]);
      setNewCategory({ name: "", imageUrl: "", isActive: true });
      setImage(null);
      setShowForm(false);
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  return (
    <main className="main-container">
      <div className="main-title">
        <h3>CATEGORIES MANAGEMENT</h3>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add Category"}
        </button>
      </div>

      {showForm && (
        <form className="category-form" onSubmit={handleAddCategory}>
          <input
            type="text"
            name="name"
            placeholder="Category Name"
            value={newCategory.name}
            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
            required
          />
          <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
          <button type="submit" className="btn btn-success">Add Category</button>
        </form>
      )}

      <div className="category-list">
        <h2>Categories List</h2>
        {loading && <p>Loading...</p>}
        {error && <p className="error-message">{error}</p>}
        <table className="category-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Category Name</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length > 0 ? (
              categories.map((category) => (
                <React.Fragment key={category.id}>
                  <tr>
                    <td>
                      {category.imageUrl ? (
                        <img src={category.imageUrl} alt="Category" width="50" height="50" />
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td>
                      <button className="btn btn-link" onClick={() => toggleDropdown(category.id)}>
                        {category.name || "N/A"}
                      </button>
                    </td>
                    <td>{category.isActive ? "Yes" : "No"}</td>
                    <td>
                      <button className="btn btn-info" onClick={() => navigate(`/subcategories/${category.id}`)}>
                        View More
                      </button>
                    </td>
                  </tr>
                  {expandedCategory === category.id && (
                    <tr>
                      <td colSpan="4">
                        <div className="subcategory-dropdown">
                          <h5>Subcategories</h5>
                          {subcategories[category.id]?.length > 0 ? (
                            <>
                              <ul>
                                {subcategories[category.id].slice(0, 3).map((sub) => (
                                  <li key={sub.id}>{sub.name}</li>
                                ))}
                              </ul>
                              {subcategories[category.id].length > 3 && (
                                <button className="btn btn-sm btn-secondary" onClick={() => navigate(`/subcategories/${category.id}`)}>
                                  View More
                                </button>
                              )}
                            </>
                          ) : (
                            <p>No subcategories found.</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: "center" }}>No categories found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default Categories;
