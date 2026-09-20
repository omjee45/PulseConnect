import React, { useEffect, useState } from "react";
import axios from "axios";
import "../pages/AdminDashboard.css";

export default function AdminDashboard() {

  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);
  
  async function fetchUsers() {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:8800"}/admin/unverified-users`, {withCredentials:true});
      
      setUsers(res.data.users);
    } catch (err) {
      console.log(err);
    }
  }

  async function verifyUser(id) {
    try {
      await axios.put(`http://localhost:8800/admin/accept-user/${id}`,{}, {withCredentials:true});
      fetchUsers();
    } catch (err) {
      console.log(err);
    }
  }

  async function rejectUser(id) {
    try {
      await axios.delete(`http://localhost:5000/admin/delete-user/${id}`, {withCredentials:true});
      fetchUsers();
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className="admin-container">

      <h1 className="admin-title">PulseConnect Admin Panel</h1>
      <p className="admin-subtitle">Verify New Donor Profiles</p>

      <div className="donor-grid">

        {users.map((user) => (
          <div className="donor-card" key={user._id}>

            <div className="blood-badge">
              {user.bloodGroup}
            </div>

            <h3>{user.name}</h3>

            <p>Email: {user.email}</p>
            <p>City: {user.city}</p>
            <p>Phone: {user.phone}</p>

            <div className="btn-group">

              <button 
                className="verify-btn"
                onClick={() => verifyUser(user._id)}
              >
                Verify
              </button>

              <button 
                className="reject-btn"
                onClick={() => rejectUser(user._id)}
              >
                Reject
              </button>

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}