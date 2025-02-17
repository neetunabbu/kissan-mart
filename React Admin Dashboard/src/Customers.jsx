import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebaseConfig";
import "./Customers.css";
import "bootstrap/dist/css/bootstrap.min.css";

const Customers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const usersCollection = collection(db, "users"); // Fetch from Firestore
        const snapshot = await getDocs(usersCollection);
        const userList = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleString() : "N/A",
          };
        });

        setUsers(userList);
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Failed to fetch users. Please check the database connection.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  return (
    <main className="main-container">
      <div className="main-title">
        <h3>CUSTOMERS MANAGEMENT</h3>
      </div>
      <div className="user-list">
        <h2>Customers/Dealers List</h2>
        {loading && <p>Loading...</p>}
        {error && <p className="error-message">{error}</p>}
        <table className="user-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone Number</th>
              <th>WhatsApp No</th>
              <th>Company Name</th>
              <th>GST No</th>
              <th>Registered Type</th>
              <th>Address</th>
              <th>City</th>
              <th>State</th>
              <th>Zip Code</th>
              <th>User ID</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name || "N/A"}</td>
                  <td>{user.email || "N/A"}</td>
                  <td>{user.phoneNumber || "N/A"}</td>
                  <td>{user.whatsAppNo || "N/A"}</td>
                  <td>{user.compName || "N/A"}</td>
                  <td>{user.GSTno || "N/A"}</td>
                  <td>{user.regType || "N/A"}</td>
                  <td>{user.address || "N/A"}</td>
                  <td>{user.city || "N/A"}</td>
                  <td>{user.state || "N/A"}</td>
                  <td>{user.zipCode || "N/A"}</td>
                  <td>{user.userId || "N/A"}</td>
                  <td>{user.createdAt || "N/A"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="13" style={{ textAlign: "center" }}>No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default Customers;
