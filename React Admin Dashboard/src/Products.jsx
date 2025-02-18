import React, { useState, useEffect } from "react";
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./firebaseConfig";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Products.css";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editProductId, setEditProductId] = useState(null);
  const [image, setImage] = useState(null);
  const [newProduct, setNewProduct] = useState({
    prodName: "",
    category: "",
    subcategory: "",
    cost: "",
    dealerCost: "",
    discount: "",
    gst: "",
    stockQuantity: "",
    imageUrl: ""
  });

  useEffect(() => {
    const fetchProducts = async () => {
      const snapshot = await getDocs(collection(db, "products"));
      setProducts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchProducts();
  }, []);

  const toggleForm = () => {
    setShowForm(!showForm);
    setIsEditMode(false);
    setNewProduct({
      prodName: "",
      category: "",
      subcategory: "",
      cost: "",
      dealerCost: "",
      discount: "",
      gst: "",
      stockQuantity: "",
      imageUrl: ""
    });
    setImage(null);
  };

  const handleInputChange = (e) => {
    setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let imageUrl = newProduct.imageUrl;

    if (image) {
      const imageRef = ref(storage, `products/${image.name}`);
      await uploadBytes(imageRef, image);
      imageUrl = await getDownloadURL(imageRef);2
    }

    const newProductData = { ...newProduct, imageUrl };

    if (isEditMode) {
      await updateDoc(doc(db, "products", editProductId), newProductData);
      setProducts(products.map((product) => (product.id === editProductId ? { ...product, ...newProductData } : product)));
      setIsEditMode(false);
      setEditProductId(null);
    } else {
      const docRef = await addDoc(collection(db, "products"), newProductData);
      setProducts([...products, { id: docRef.id, ...newProductData }]);
    }

    toggleForm();
  };

  const handleEdit = (product) => {
    setIsEditMode(true);
    setEditProductId(product.id);
    setNewProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "products", id));
    setProducts(products.filter((product) => product.id !== id));
  };

  return (
    <div className="container">
      <h3>PRODUCTS MANAGEMENT</h3>
      <button className="btn btn-primary mb-3" onClick={toggleForm}>{showForm ? "Cancel" : "Add Product"}</button>
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-3">
          <input type="text" name="prodName" placeholder="Product Name" value={newProduct.prodName} onChange={handleInputChange} required />
          <input type="text" name="category" placeholder="Category" value={newProduct.category} onChange={handleInputChange} required />
          <input type="text" name="subcategory" placeholder="Subcategory" value={newProduct.subcategory} onChange={handleInputChange} />
          <input type="number" name="cost" placeholder="Cost" value={newProduct.cost} onChange={handleInputChange} required />
          <input type="number" name="dealerCost" placeholder="Dealer Cost" value={newProduct.dealerCost} onChange={handleInputChange} required />
          <input type="number" name="discount" placeholder="Discount (%)" value={newProduct.discount} onChange={handleInputChange} required />
          <input type="number" name="gst" placeholder="GST (%)" value={newProduct.gst} onChange={handleInputChange} required />
          <input type="number" name="stockQuantity" placeholder="Stock Quantity" value={newProduct.stockQuantity} onChange={handleInputChange} required />
          <input type="file" accept="image/*" onChange={handleImageChange} />
          <button type="submit" className="btn btn-success">{isEditMode ? "Update Product" : "Add Product"}</button>
        </form>
      )}
      <table className="table table-bordered">
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
                <td>{product.prodName}</td>
                <td>{product.category}</td>
                <td>{product.subcategory}</td>
                <td>{product.cost}</td>
                <td>{product.dealerCost}</td>
                <td>{product.discount}</td>
                <td>{product.gst}</td>
                <td>{product.stockQuantity}</td>
                <td>
                  <button className="btn btn-warning mx-2" onClick={() => handleEdit(product)}>Edit</button>
                  <button className="btn btn-danger" onClick={() => handleDelete(product.id)}>Delete</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="10" className="text-center">No products found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Products;
