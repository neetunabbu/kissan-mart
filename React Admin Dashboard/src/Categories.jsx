import React, { useState, useEffect } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
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
  const [editCategory, setEditCategory] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError(null);
      try {
        const snapshot = await getDocs(collection(db, "categories"));
        setCategories(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        setError("Failed to fetch categories.");
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = "";
      if (image) {
        const imageRef = ref(storage, `categories/${image.name}`);
        await uploadBytes(imageRef, image);
        imageUrl = await getDownloadURL(imageRef);
      }
      const docRef = await addDoc(collection(db, "categories"), { ...newCategory, imageUrl });
      setCategories([...categories, { id: docRef.id, ...newCategory, imageUrl }]);
      setNewCategory({ name: "", imageUrl: "", isActive: true });
      setImage(null);
      setShowForm(false);
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      await deleteDoc(doc(db, "categories", categoryId));
      setCategories(categories.filter((category) => category.id !== categoryId));
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const handleEditCategory = async (e) => {
    e.preventDefault();
    try {
      const categoryRef = doc(db, "categories", editCategory.id);
      await updateDoc(categoryRef, editCategory);
      setCategories(categories.map((cat) => (cat.id === editCategory.id ? editCategory : cat)));
      setEditCategory(null);
    } catch (error) {
      console.error("Error updating category:", error);
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
            placeholder="Category Name"
            value={newCategory.name}
            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
            required
          />
          <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
          <button type="submit" className="btn btn-success">Add Category</button>
        </form>
      )}

      {editCategory && (
        <form className="category-form" onSubmit={handleEditCategory}>
          <input
            type="text"
            value={editCategory.name}
            onChange={(e) => setEditCategory({ ...editCategory, name: e.target.value })}
            required
          />
          <button type="submit" className="btn btn-warning">Update Category</button>
          <button className="btn btn-secondary" onClick={() => setEditCategory(null)}>Cancel</button>
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
              <th>Subcategory</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length > 0 ? (
              categories.map((category) => (
                <tr key={category.id}>
                  <td>
                    {category.imageUrl ? <img src={category.imageUrl} alt="Category" width="50" height="50" /> : "N/A"}
                  </td>
                  <td>{category.name || "N/A"}</td>
                  <td>{category.isActive ? "Yes" : "No"}</td>
                  <td>
                    <button className="btn btn-info" onClick={() => navigate(`/subcategories/${category.id}`)}>View</button>
                  </td>
                  <td>
                  <button className="btn btn-warning me-2" onClick={() => setEditCategory(category)}>Edit</button>
                  <button className="btn btn-danger" onClick={() => handleDeleteCategory(category.id)}>Delete</button>
                </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>No categories found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default Categories;
