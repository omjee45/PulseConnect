import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../pages/Dashboard.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8800";

async function getUsers() {
  const res = await axios.get(`${API_URL}/users/verified-users`);
  const data = await res.data.users;
  return data.map((u) => ({
    id:    u._id || u.id,
    name:  u.fullName || u.name,
    email: u.email,
    role:  u.role || "user",   
    type:  u.donorType || null, 
    blood: u.bloodGroup || "—",
  }));
}

const COLORS = ["#e8433a", "#4f8ef7", "#3ecf6e", "#f59e0b", "#9b5cf6"];

function initials(name = "") {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function avatarColor(id = "") {
  return COLORS[String(id).charCodeAt(0) % COLORS.length];
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [tab,     setTab]     = useState("users");   
  const [search,  setSearch]  = useState("");
  const [toasts,  setToasts]  = useState([]);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (e) {
      setError("Failed to load. Check your API URL.");
    } finally {
      setLoading(false);
    }
  }

  function toast(msg, type = "ok") {
    const id = Date.now();
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3000);
  }

  const allUsers  = users.filter((u) => u.role !== "donor");
  const allDonors = users.filter((u) => u.role === "donor");

  const q    = search.toLowerCase();
  const list = (tab === "users" ? allUsers : allDonors).filter(
    (u) => !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
  );

  return (
    <div className="layout">

      {}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">🩸</div>
          PulseConnect
        </div>

        <button className={`nav-btn ${tab === "users"  ? "active" : ""}`} onClick={() => setTab("users")}>
          👤 &nbsp; Users
        </button>
        <button className={`nav-btn ${tab === "donors" ? "active" : ""}`} onClick={() => setTab("donors")}>
          💉 &nbsp; Donors
        </button>
      </aside>

      {}
      <div className="main">

        <div className="topbar">
          <h1>{tab === "users" ? "Users" : "Donors"}</h1>
          <input
            className="search"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="refresh-btn" onClick={load}>↻ Refresh</button>
        </div>

        <div className="content">

          <div className="cards">
            <div className="card">
              <div className="card-label">Total Users</div>
              <div className="card-value blue">{allUsers.length}</div>
            </div>
            <div className="card">
              <div className="card-label">Total Donors</div>
              <div className="card-value green">{allDonors.length}</div>
            </div>
          </div>

          <div className="table-box">
            <div className="table-box-header">
              <span>{tab === "users" ? "All Users" : "All Donors"}</span>
            </div>

            <div className="table-wrap">
              {loading && <div className="msg">Loading…</div>}
              {error   && <div className="msg err">{error}</div>}
              {!loading && !error && list.length === 0 && (
                <div className="msg">No {tab} found</div>
              )}

              {!loading && !error && list.length > 0 && (
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      {tab === "donors" && <th>Donor Type</th>}
                      {tab === "donors" && <th>Blood Group</th>}
                      <th>Chat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((user) => (
                      <tr key={user.id}>

                        <td>
                          <div className="user-cell">
                            <div className="avatar" style={{ background: avatarColor(user.id) }}>
                              {initials(user.name)}
                            </div>
                            <div>
                              <div className="user-name">{user.name}</div>
                            </div>
                          </div>
                        </td>

                        <td style={{ color: "#6b7080", fontSize: 13 }}>{user.email}</td>

                        {tab === "donors" && (
                          <td>
                            <span className={`type-badge ${user.type || "blood"}`}>
                              {user.type || "—"}
                            </span>
                          </td>
                        )}
                        {tab === "donors" && (
                          <td style={{ fontWeight: 600 }}>{user.blood}</td>
                        )}

                        <td>
                          <button
                            style={{
                              padding: '6px 14px',
                              border: 'none',
                              borderRadius: '8px',
                              background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                              color: '#fff',
                              cursor: 'pointer',
                              fontSize: '13px',
                              fontWeight: 600
                            }}
                            onClick={() => navigate(`/chat?userId=${user.id}`)}
                          >
                            💬 Chat
                          </button>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>
      </div>

      <div className="toast-wrap">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>
        ))}
      </div>

    </div>
  );
}