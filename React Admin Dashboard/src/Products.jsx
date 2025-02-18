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
  const [productType, setProductType] = useState("dealer"); // Default to dealer
  const [newProduct, setNewProduct] = useState({
    prodName: "",
    category: "",
    subcategory: "",
    cost: "",
    dealerCost: "",
    customerCost: "",
    gst: "",
    moq: "",
    stockQuantity: "",
    stockAvailable: false,
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
      customerCost: "",
      gst: "",
      moq: "",
      stockQuantity: "",
      stockAvailable: false,
      imageUrl: ""
    });
    setImage(null);
    setProductType("dealer"); // Reset to dealer by default
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewProduct({ ...newProduct, [name]: type === "checkbox" ? checked : value });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleProductTypeChange = (e) => {
    setProductType(e.target.value);
    setNewProduct({
      ...newProduct,
      dealerCost: "",
      customerCost: ""
    });
  };

  const calculatePriceBasedOnMOQ = (quantity) => {
    // Check if the quantity is greater than or equal to MOQ for special pricing
    const price = {
      dealer: quantity >= newProduct.moq ? newProduct.dealerCost : newProduct.dealerCost * 1.1, // 10% more if below MOQ for dealer
      customer: quantity >= newProduct.moq ? newProduct.customerCost : newProduct.customerCost * 1.2 // 20% more if below MOQ for customer
    };
    return price;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let imageUrl = newProduct.imageUrl;

    if (image) {
      const imageRef = ref(storage, `products/${image.name}`);
      
      // Ensure image is uploaded successfully
      await uploadBytes(imageRef, image).then(() => {
        // Get the download URL after successful upload
        getDownloadURL(imageRef).then((url) => {
          imageUrl = url;  // Update imageUrl with the Firebase URL
        }).catch((err) => {
          console.error("Error getting download URL: ", err);
        });
      }).catch((err) => {
        console.error("Error uploading image: ", err);
      });
    }

    // Calculate the new prices based on MOQ
    const { dealer, customer } = calculatePriceBasedOnMOQ(newProduct.stockQuantity);

    const newProductData = { 
      ...newProduct, 
      imageUrl, 
      dealerCost: productType === "dealer" ? dealer : "", 
      customerCost: productType === "customer" ? customer : "" 
    };

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
    setProductType(product.dealerCost ? "dealer" : "customer");
    setNewProduct({
      prodName: product.prodName,
      category: product.category,
      subcategory: product.subcategory,
      cost: product.cost,
      dealerCost: product.dealerCost,
      customerCost: product.customerCost,
      gst: product.gst,
      moq: product.moq,
      stockQuantity: product.stockQuantity,
      stockAvailable: product.stockAvailable,
      imageUrl: product.imageUrl,
    });
    setImage(null);
    setShowForm(true);
  };

  const handleDelete = async (productId) => {
    await deleteDoc(doc(db, "products", productId));
    setProducts(products.filter((product) => product.id !== productId));
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
          <label>
            <input type="radio" name="productType" value="dealer" checked={productType === "dealer"} onChange={handleProductTypeChange} /> Dealer
          </label>
          <label>
            <input type="radio" name="productType" value="customer" checked={productType === "customer"} onChange={handleProductTypeChange} /> Customer
          </label>

          {productType === "dealer" && (
            <>
              <input type="number" name="dealerCost" placeholder="Dealer Cost" value={newProduct.dealerCost} onChange={handleInputChange} required />
            </>
          )}

          {productType === "customer" && (
            <>
              <input type="number" name="customerCost" placeholder="Customer Cost" value={newProduct.customerCost} onChange={handleInputChange} required />
            </>
          )}

          <input type="number" name="gst" placeholder="GST (%)" value={newProduct.gst} onChange={handleInputChange} required />
          <input type="number" name="moq" placeholder="MOQ" value={newProduct.moq} onChange={handleInputChange} required />
          <input type="number" name="stockQuantity" placeholder="Stock Quantity" value={newProduct.stockQuantity} onChange={handleInputChange} required />
          <label>
            <input type="checkbox" name="stockAvailable" checked={newProduct.stockAvailable} onChange={handleInputChange} /> Stock Available
          </label>
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
            <th>Customer Cost</th>
            <th>GST</th>
            <th>MOQ</th>
            <th>Stock Quantity</th>
            <th>Stock Available</th>
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
                <td>{product.customerCost}</td>
                <td>{product.gst}</td>
                <td>{product.moq}</td>
                <td>{product.stockQuantity}</td>
                <td>{product.stockAvailable ? "Yes" : "No"}</td>
                <td>
                  <button onClick={() => handleEdit(product)} className="btn btn-warning btn-sm">Edit</button>
                  <button onClick={() => handleDelete(product.id)} className="btn btn-danger btn-sm">Delete</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="12">No products available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Products;
