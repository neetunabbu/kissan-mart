import React, { useState, useEffect } from "react";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./firebaseConfig";
import { useParams, useNavigate } from "react-router-dom"; 
import "./Subcategories.css";
import "bootstrap/dist/css/bootstrap.min.css";

const Subcategories = () => {
  const { categoryId } = useParams();
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [newSubcategory, setNewSubcategory] = useState({
    name: "",
    imageUrl: "",
    category: categoryId,
  });
  const [image, setImage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubcategories = async () => {
      setLoading(true);
      setError(null);
      try {
        const subcategoriesCollection = collection(db, "subcategories");
        const snapshot = await getDocs(subcategoriesCollection);
        const subcategoryList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSubcategories(subcategoryList);
      } catch (error) {
        console.error("Error fetching subcategories:", error);
        setError("Failed to fetch subcategories.");
      } finally {
        setLoading(false);
      }
    };
    fetchSubcategories();
  }, [categoryId]);

  const handleAddSubcategory = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = "";
      if (image) {
        const imageRef = ref(storage, `subcategories/${image.name}`);
        await uploadBytes(imageRef, image);
        imageUrl = await getDownloadURL(imageRef);
      }

      const subcategoriesCollection = collection(db, "subcategories");
      const newSubcategoryData = { ...newSubcategory, imageUrl };
      await addDoc(subcategoriesCollection, newSubcategoryData);

      setSubcategories([...subcategories, newSubcategoryData]);
      setNewSubcategory({ name: "", imageUrl: "", category: categoryId });
      setImage(null);
      setShowForm(false);
    } catch (error) {
      console.error("Error adding subcategory:", error);
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
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add Subcategory"}
        </button>
      </div>

      {showForm && (
        <form className="subcategory-form" onSubmit={handleAddSubcategory}>
          <input
            type="text"
            name="name"
            placeholder="Subcategory Name"
            value={newSubcategory.name}
            onChange={(e) => setNewSubcategory({ ...newSubcategory, name: e.target.value })}
            required
          />
          <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
          <button type="submit" className="btn btn-success">Add Subcategory</button>
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subcategories.length > 0 ? (
              subcategories.map((sub) => (
                <tr key={sub.id}>
                  <td>
                    {sub.imageUrl ? (
                      <img src={sub.imageUrl} alt="Subcategory" width="50" height="50" />
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td>{sub.name || "N/A"}</td>
                  <td>
                    <button className="btn btn-info" onClick={() => navigate(`/products/${sub.id}`)}>
                      View More
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" style={{ textAlign: "center" }}>No subcategories found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default Subcategories;
