import React, { useState, useEffect } from "react";
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./firebaseConfig";
import "./Products.css";
import "bootstrap/dist/css/bootstrap.min.css";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editProductId, setEditProductId] = useState(null);
  const [newProduct, setNewProduct] = useState({
    prodName: "",
    category: "",
    subcategory: "",
    subTitle: "",
    description: "",
    cost: "",
    dealerCost: "",
    discount: "",
    gst: "",
    stockQuantity: "",
    isStockAvailable: true,
    moq: "",
    imageUrl: ""
  });
  const [image, setImage] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const productsCollection = collection(db, "products");
        const snapshot = await getDocs(productsCollection);
        const productList = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleString() : "N/A",
          };
        });
        setProducts(productList);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Failed to fetch products. Please check the database connection.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const toggleForm = () => {
    setShowForm(!showForm);
    if (showForm) {
      setIsEditMode(false);
      setNewProduct({
        prodName: "",
        category: "",
        subcategory: "",
        subTitle: "",
        description: "",
        cost: "",
        dealerCost: "",
        discount: "",
        gst: "",
        stockQuantity: "",
        isStockAvailable: true,
        moq: "",
        imageUrl: ""
      });
      setImage(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = "";
      if (image) {
        const imageRef = ref(storage, `products/${image.name}`);
        await uploadBytes(imageRef, image);
        imageUrl = await getDownloadURL(imageRef);
      }

      const productsCollection = collection(db, "products");
      const newProductData = { ...newProduct, imageUrl, createdAt: new Date() };

      if (isEditMode) {
        const productDocRef = doc(db, "products", editProductId);
        await updateDoc(productDocRef, newProductData);
        setProducts(
          products.map((product) =>
            product.id === editProductId ? { ...product, ...newProductData } : product
          )
        );
        setIsEditMode(false);
        setEditProductId(null);
      } else {
        await addDoc(productsCollection, newProductData);
        setProducts([...products, { ...newProductData, createdAt: new Date().toLocaleString() }]);
      }

      setNewProduct({
        prodName: "",
        category: "",
        subcategory: "",
        subTitle: "",
        description: "",
        cost: "",
        dealerCost: "",
        discount: "",
        gst: "",
        stockQuantity: "",
        isStockAvailable: true,
        moq: "",
        imageUrl: ""
      });
      setImage(null);
      setShowForm(false);
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  const handleEdit = (product) => {
    setIsEditMode(true);
    setEditProductId(product.id);
    setNewProduct({
      prodName: product.prodName,
      category: product.category,
      subcategory: product.subcategory,
      subTitle: product.subTitle,
      description: product.description,
      cost: product.cost,
      dealerCost: product.dealerCost,
      discount: product.discount,
      gst: product.gst,
      stockQuantity: product.stockQuantity,
      isStockAvailable: product.isStockAvailable,
      moq: product.moq,
      imageUrl: product.imageUrl
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      const productDocRef = doc(db, "products", id);
      await deleteDoc(productDocRef);
      setProducts(products.filter((product) => product.id !== id));
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  return (
    <main className="main-container">
      <div className="main-title">
        <h3>PRODUCTS MANAGEMENT</h3>
        <button className="btn btn-primary" onClick={toggleForm}>
          {showForm ? (isEditMode ? "Cancel Edit" : "Cancel") : "Add Product"}
        </button>
      </div>

      {showForm && (
        <form className="product-form" onSubmit={handleSubmit}>
          <input type="text" name="prodName" placeholder="Product Name" value={newProduct.prodName} onChange={handleInputChange} required />
          <input type="text" name="category" placeholder="Category" value={newProduct.category} onChange={handleInputChange} required />
          <input type="text" name="subcategory" placeholder="Subcategory" value={newProduct.subcategory} onChange={handleInputChange} />
          <input type="text" name="subTitle" placeholder="Subtitle" value={newProduct.subTitle} onChange={handleInputChange} />
          <input type="text" name="description" placeholder="Description" value={newProduct.description} onChange={handleInputChange} />
          <input type="number" name="cost" placeholder="Cost" value={newProduct.cost} onChange={handleInputChange} required />
          <input type="number" name="dealerCost" placeholder="Dealer Cost" value={newProduct.dealerCost} onChange={handleInputChange} required />
          <input type="number" name="discount" placeholder="Discount (%)" value={newProduct.discount} onChange={handleInputChange} required />
          <input type="number" name="gst" placeholder="GST (%)" value={newProduct.gst} onChange={handleInputChange} required />
          <input type="number" name="moq" placeholder="Minimum Order Quantity" value={newProduct.moq} onChange={handleInputChange} required />
          <input type="number" name="stockQuantity" placeholder="Stock Quantity" value={newProduct.stockQuantity} onChange={handleInputChange} required />
          <input type="file" accept="image/*" onChange={handleImageChange} />
          <button type="submit" className="btn btn-success">{isEditMode ? "Update Product" : "Add Product"}</button>
        </form>
      )}

      <div className="product-list">
        <h2>Products List</h2>
        {loading && <p>Loading...</p>}
        {error && <p className="error-message">{error}</p>}
        <table className="product-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Subcategory</th>
              <th>Cost</th>
              <th>Dealer Cost</th>
              <th>Discount</th>
              <th>GST</th>
              <th>Stock Quantity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((product) => (
                <tr key={product.id}>
                  <td>{product.imageUrl ? <img src={product.imageUrl} alt="Product" width="50" height="50" /> : "N/A"}</td>
                  <td>{product.prodName || "N/A"}</td>
                  <td>{product.category || "N/A"}</td>
                  <td>{product.subcategory || "N/A"}</td>
                  <td>{product.cost || "N/A"}</td>
                  <td>{product.dealerCost || "N/A"}</td>
                  <td>{product.discount || "N/A"}</td>
                  <td>{product.gst || "N/A"}</td>
                  <td>{product.stockQuantity || "N/A"}</td>
                  <td>
                    <button className="btn btn-warning mx-2" onClick={() => handleEdit(product)}>Edit</button>
                    <button className="btn btn-danger" onClick={() => handleDelete(product.id)}>Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" style={{ textAlign: "center" }}>No products found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default Products;
