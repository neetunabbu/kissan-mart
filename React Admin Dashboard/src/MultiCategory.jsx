import React, { useState, useEffect } from "react";
import { collection, getDocs, addDoc, doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./firebaseConfig";
import { useParams, useNavigate } from "react-router-dom";
import "./MultiCategory.css";
import "bootstrap/dist/css/bootstrap.min.css";

const MultiCategory = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();

  const [multiCategory, setMultiCategory] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingMultiCategory, setEditingMultiCategory] = useState(null);
  const [newMultiCategory, setNewMultiCategory] = useState({ name: "", category: categoryId, imageUrl: "" });
  const [image, setImage] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      const categoryCollection = collection(db, "categories");
      const categorySnapshot = await getDocs(categoryCollection);
      setCategories(categorySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };

    const fetchMultiCategory = async () => {
      setLoading(true);
      setError(null);
      try {
        const multiCategoryCollection = collection(db, "multiCategory");
        const snapshot = await getDocs(multiCategoryCollection);
        const multiCategoryList = await Promise.all(
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
        setMultiCategory(multiCategoryList);
      } catch (error) {
        console.error("Error fetching multiCategory:", error);
        setError("Failed to fetch multiCategory.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
    fetchMultiCategory();
  }, [categoryId]);

  const handleAddOrUpdateMultiCategory = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = newMultiCategory.imageUrl;
      if (image) {
        const imageRef = ref(storage, `multiCategory/${image.name}`);
        await uploadBytes(imageRef, image);
        imageUrl = await getDownloadURL(imageRef);
      }

      if (editMode) {
        const multiCategoryRef = doc(db, "multiCategory", editingMultiCategory.id);
        await updateDoc(multiCategoryRef, { name: newMultiCategory.name, category: newMultiCategory.category, imageUrl });
        setMultiCategory(
          multiCategory.map((multi) =>
            multi.id === editingMultiCategory.id ? { ...multi, name: newMultiCategory.name, category: newMultiCategory.category, imageUrl } : multi
          )
        );
        setEditMode(false);
        setEditingMultiCategory(null);
      } else {
        const multiCategoryCollection = collection(db, "multiCategory");
        const newMultiCategoryData = { ...newMultiCategory, imageUrl };
        const docRef = await addDoc(multiCategoryCollection, newMultiCategoryData);
        setMultiCategory([...multiCategory, { id: docRef.id, ...newMultiCategoryData }]);
      }

      setNewMultiCategory({ name: "", category: categoryId, imageUrl: "" });
      setImage(null);
      setShowForm(false);
    } catch (error) {
      console.error("Error adding/updating multiCategory:", error);
    }
  };

  const handleEdit = (multi) => {
    setEditMode(true);
    setEditingMultiCategory(multi);
    setNewMultiCategory({ name: multi.name, category: multi.category, imageUrl: multi.imageUrl });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "multiCategory", id));
      setMultiCategory(multiCategory.filter((multi) => multi.id !== id));
    } catch (error) {
      console.error("Error deleting multiCategory:", error);
    }
  };

  return (
    <main className="main-container">
      <div className="main-title d-flex justify-content-between align-items-center">
        <div>
          <button className="btn btn-secondary me-3" onClick={() => navigate("/categories")}>
            ← Back
          </button>
          <h3 className="d-inline">MULTICATEGORY MANAGEMENT</h3>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setShowForm(!showForm);
            setEditMode(false);
            setNewMultiCategory({ name: "", category: categoryId, imageUrl: "" });
          }}
        >
          {showForm ? "Cancel" : "Add MultiCategory"}
        </button>
      </div>

      {showForm && (
        <form className="multiCategory-form" onSubmit={handleAddOrUpdateMultiCategory}>
          <div>
            <label>MultiCategory Name</label>
            <input
              type="text"
              name="name"
              placeholder="MultiCategory Name"
              value={newMultiCategory.name}
              onChange={(e) => setNewMultiCategory({ ...newMultiCategory, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label>Category</label>
            <select
              name="category"
              value={newMultiCategory.category}
              onChange={(e) => setNewMultiCategory({ ...newMultiCategory, category: e.target.value })}
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Upload Image</label>
            <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
          </div>

          <button type="submit" className="btn btn-success">
            {editMode ? "Update" : "Add"} MultiCategory
          </button>
        </form>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <table className="table table-striped mt-4">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Category</th>
              <th>Image</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {multiCategory.length > 0 ? (
              multiCategory.map((multi, index) => (
                <tr key={multi.id}>
                  <td>{index + 1}</td>
                  <td>{multi.name}</td>
                  <td>{multi.categoryName}</td>
                  <td>
                    {multi.imageUrl && <img src={multi.imageUrl} alt={multi.name} width="50" height="50" />}
                  </td>
                  <td>
                    <button className="btn btn-warning me-2" onClick={() => handleEdit(multi)}>
                      Edit
                    </button>
                    <button className="btn btn-danger" onClick={() => handleDelete(multi.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
                  No MultiCategories found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </main>
  );
};

export default MultiCategory;
