import { Link } from "react-router-dom";
import logo from "./assets/kmt.png"; // Adjust the path to your image
import "./Sidebar.css";

function Sidebar() {
  return (
    <div className="sidebar">
      <div className="text-center mb-4">
        <img 
          src={logo} 
          alt="KissanMart Logo" 
          style={{ width: "150px", height: "auto" }} 
        />
      </div>
      <ul className="nav flex-column flex-grow-1">
        <li className="nav-item">
          <Link to="/" className="nav-link text-white">
            <i className="bi bi-speedometer2 me-2"></i> Dashboard
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/categories" className="nav-link text-white">
            <i className="bi bi-tags me-2"></i> Categories
          </Link>
        </li>
        {/* <li className="nav-item">
          <Link to="/Subcategories" className="nav-link text-white">
            <i className="bi bi-list-nested me-2"></i> Subcategories
          </Link>
        </li> */}
        <li className="nav-item">
          <Link to="/products" className="nav-link text-white">
            <i className="bi bi-box-seam me-2"></i> Products
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/customers" className="nav-link text-white">
            <i className="bi bi-people me-2"></i> Customers
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/dealers" className="nav-link text-white">
            <i className="bi bi-shop me-2"></i> Orders
          </Link>
        </li>
      </ul>
      <div className="mt-auto">
        <Link to="/logout" className="nav-link text-white">
          <i className="bi bi-box-arrow-right me-2"></i> Logout
        </Link>
      </div>
    </div>
  );
}

export default Sidebar;
