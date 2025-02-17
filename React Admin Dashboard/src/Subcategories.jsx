import React, { useState, useEffect } from "react";
import { collection, getDocs, addDoc, doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./firebaseConfig";
import { useParams, useNavigate } from "react-router-dom";
import "./Subcategories.css";
import "bootstrap/dist/css/bootstrap.min.css";

const Subcategories = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();

  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [newSubcategory, setNewSubcategory] = useState({ name: "", category: categoryId, imageUrl: "" });
  const [image, setImage] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      const categoryCollection = collection(db, "categories");
      const categorySnapshot = await getDocs(categoryCollection);
      setCategories(categorySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };

    const fetchSubcategories = async () => {
      setLoading(true);
      setError(null);
      try {
        const subcategoriesCollection = collection(db, "subcategories");
        const snapshot = await getDocs(subcategoriesCollection);
        const subcategoryList = await Promise.all(
          snapshot.docs.map(async (docSnapshot) => {
            const data = docSnapshot.data();
            let categoryName = "Unknown";
            if (data.category) {
              const categoryDoc = await getDoc(doc(db, "categories", data.category));
              if (categoryDoc.exists()) {
                categoryName = categoryDoc.data().name;
              }
            }
            return { id: docSnapshot.id, ...data, categoryName };
          })
        );
        setSubcategories(subcategoryList);
      } catch (error) {
        console.error("Error fetching subcategories:", error);
        setError("Failed to fetch subcategories.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
    fetchSubcategories();
  }, [categoryId]);

  const handleAddOrUpdateSubcategory = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = newSubcategory.imageUrl;
      if (image) {
        const imageRef = ref(storage, `subcategories/${image.name}`);
        await uploadBytes(imageRef, image);
        imageUrl = await getDownloadURL(imageRef);
      }

      if (editMode) {
        const subcategoryRef = doc(db, "subcategories", editingSubcategory.id);
        await updateDoc(subcategoryRef, { name: newSubcategory.name, category: newSubcategory.category, imageUrl });
        setSubcategories(
          subcategories.map((sub) =>
            sub.id === editingSubcategory.id ? { ...sub, name: newSubcategory.name, category: newSubcategory.category, imageUrl } : sub
          )
        );
        setEditMode(false);
        setEditingSubcategory(null);
      } else {
        const subcategoriesCollection = collection(db, "subcategories");
        const newSubcategoryData = { ...newSubcategory, imageUrl };
        const docRef = await addDoc(subcategoriesCollection, newSubcategoryData);
        setSubcategories([...subcategories, { id: docRef.id, ...newSubcategoryData }]);
      }

      setNewSubcategory({ name: "", category: categoryId, imageUrl: "" });
      setImage(null);
      setShowForm(false);
    } catch (error) {
      console.error("Error adding/updating subcategory:", error);
    }
  };

  const handleEdit = (subcategory) => {
    setEditMode(true);
    setEditingSubcategory(subcategory);
    setNewSubcategory({ name: subcategory.name, category: subcategory.category, imageUrl: subcategory.imageUrl });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "subcategories", id));
      setSubcategories(subcategories.filter((sub) => sub.id !== id));
    } catch (error) {
      console.error("Error deleting subcategory:", error);
    }
  };

  return (
    <main className="main-container">
      <div className="main-title d-flex justify-content-between align-items-center">
        <div>
          <button className="btn btn-secondary me-3" onClick={() => navigate("/categories")}>
            ← Back
          </button>
          <h3 className="d-inline">SUBCATEGORIES MANAGEMENT</h3>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditMode(false); setNewSubcategory({ name: "", category: categoryId, imageUrl: "" }); }}>
          {showForm ? "Cancel" : "Add Subcategory"}
        </button>
      </div>

      {showForm && (
        <form className="subcategory-form" onSubmit={handleAddOrUpdateSubcategory}>
          <div>
            <label>Subcategory Name</label>
            <input type="text" name="name" placeholder="Subcategory Name" value={newSubcategory.name} onChange={(e) => setNewSubcategory({ ...newSubcategory, name: e.target.value })} required />
          </div>

          <div>
            <label>Category</label>
            <select name="category" value={newSubcategory.category} onChange={(e) => setNewSubcategory({ ...newSubcategory, category: e.target.value })} required>
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label>Upload Image</label>
            <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
          </div>

          <button type="submit" className="btn btn-success">{editMode ? "Update" : "Add"} Subcategory</button>
        </form>
      )}

      <div className="subcategory-list">
        <h2>Subcategories List</h2>
        {loading && <p>Loading...</p>}
        {error && <p className="error-message">{error}</p>}
        <table className="subcategory-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Subcategory Name</th>
              <th>Category Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subcategories.length > 0 ? (
              subcategories.map((sub) => (
                <tr key={sub.id}>
                  <td>{sub.imageUrl ? <img src={sub.imageUrl} alt="Subcategory" width="50" height="50" /> : "N/A"}</td>
                  <td>{sub.name || "N/A"}</td>
                  <td>{sub.categoryName || "Unknown"}</td>
                  <td>
                    <button className="btn btn-warning me-2" onClick={() => handleEdit(sub)}>Edit</button>
                    <button className="btn btn-danger" onClick={() => handleDelete(sub.id)}>Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="4" style={{ textAlign: "center" }}>No subcategories found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default Subcategories;
