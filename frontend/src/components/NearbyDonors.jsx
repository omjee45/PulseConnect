import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../pages/NearbyDonors.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:8800";
const BLOOD_GROUPS = ["", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const COLORS = ["#e63946", "#4f8ef7", "#3ecf6e", "#f59e0b", "#9b5cf6", "#ec4899", "#14b8a6"];
const RADIUS_OPTIONS = [
  { value: 10000,  label: "10 km" },
  { value: 25000,  label: "25 km" },
  { value: 50000,  label: "50 km" },
  { value: 100000, label: "100 km" },
  { value: 200000, label: "200 km" },
];

function initials(name = "") {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

function avatarColor(id = "") {
  return COLORS[String(id).charCodeAt(0) % COLORS.length];
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    year: "numeric", month: "short", day: "numeric",
  });
}

function formatDistance(meters) {
  if (!meters && meters !== 0) return null;
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export default function NearbyDonors() {
  const navigate = useNavigate();
  const didInit = useRef(false);

  const [donors,  setDonors]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  
  const [userLat,    setUserLat]    = useState(null);
  const [userLng,    setUserLng]    = useState(null);
  const [geoStatus,  setGeoStatus]  = useState("detecting"); 
  const [radius,     setRadius]     = useState(50000);

  
  const [city,       setCity]       = useState("");
  const [state,      setState]     = useState("");
  const [bloodGroup, setBloodGroup] = useState("");

  
  useEffect(() => {
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLat(pos.coords.latitude);
          setUserLng(pos.coords.longitude);
          setGeoStatus("granted");
        },
        () => {
          setGeoStatus("denied");
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setGeoStatus("denied");
    }

    
    async function loadProfile() {
      try {
        const res = await axios.get(`${API}/pulseConnect-userDetails`, { withCredentials: true });
        const u = res.data?.user || res.data;
        if (u?.city)  setCity(u.city);
        if (u?.state) setState(u.state);
      } catch {
        
      }
    }
    loadProfile();
  }, []);

  
  useEffect(() => {
    if (didInit.current) return;
    
    if (geoStatus === "detecting") return;

    didInit.current = true;
    fetchDonors();
  }, [geoStatus]);

  async function fetchDonors() {
    setLoading(true);
    setError(null);
    try {
      const params = {};

      
      if (userLat !== null && userLng !== null) {
        params.lat    = userLat;
        params.lng    = userLng;
        params.radius = radius;
      } else {
        
        if (city.trim())  params.city  = city.trim();
        if (state.trim()) params.state = state.trim();
      }

      if (bloodGroup.trim()) params.bloodGroup = bloodGroup.trim();

      const res = await axios.get(`${API}/users/nearby-donors`, {
        params,
        withCredentials: true,
      });
      setDonors(res.data.donors || []);
    } catch (e) {
      setError("Failed to load donors. Make sure the server is running.");
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    fetchDonors();
  }

  const usingGeo = userLat !== null && userLng !== null;

  return (
    <div className="nd-page">

      {}
      <div className="nd-hero">
        <div className="nd-hero-tag">📍 Nearby Donors</div>
        <h1>Find a Donor Near You</h1>
        <p>
          Search verified blood &amp; organ donors near your actual location.
          Connect instantly — every second counts in an emergency.
        </p>
      </div>

      {}
      {geoStatus === "detecting" && (
        <div className="nd-geo-banner detecting">
          Detecting your location…
        </div>
      )}
      {geoStatus === "granted" && (
        <div className="nd-geo-banner granted">
          Using your live location — showing donors nearest to you
        </div>
      )}
      {geoStatus === "denied" && (
        <div className="nd-geo-banner denied">
          Location access denied — using city/state filter instead.
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      )}

      {}
      <form className="nd-filter-bar" onSubmit={handleSearch}>
        {usingGeo ? (
          
          <div className="nd-filter-group">
            <label>Search Radius</label>
            <select value={radius} onChange={e => setRadius(Number(e.target.value))}>
              {RADIUS_OPTIONS.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
        ) : (
          
          <>
            <div className="nd-filter-group">
              <label>City</label>
              <input
                type="text"
                placeholder="e.g. Mumbai"
                value={city}
                onChange={e => setCity(e.target.value)}
              />
            </div>
            <div className="nd-filter-group">
              <label>State</label>
              <input
                type="text"
                placeholder="e.g. Maharashtra"
                value={state}
                onChange={e => setState(e.target.value)}
              />
            </div>
          </>
        )}

        <div className="nd-filter-group">
          <label>Blood Group</label>
          <select value={bloodGroup} onChange={e => setBloodGroup(e.target.value)}>
            <option value="">All Groups</option>
            {BLOOD_GROUPS.filter(Boolean).map(bg => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>
        </div>

        <button type="submit" className="nd-search-btn">
          🔍 Search
        </button>
      </form>

      {}
      {loading && (
        <div className="nd-loading">
          <div className="nd-spinner" />
          <p>Searching for nearby donors…</p>
        </div>
      )}

      {}
      {!loading && error && (
        <div className="nd-error">{error}</div>
      )}

      {}
      {!loading && !error && (
        <>
          <div className="nd-results-info">
            <span className="nd-results-count">
              Found <strong>{donors.length}</strong> donor{donors.length !== 1 ? "s" : ""}
              {usingGeo ? ` within ${formatDistance(radius)}` : ""}
            </span>
          </div>

          {donors.length === 0 ? (
            <div className="nd-empty">
              <div className="nd-empty-icon">🩸</div>
              <h3>No Donors Found</h3>
              <p>
                {usingGeo
                  ? "Try increasing the search radius or remove the blood group filter."
                  : "Try broadening your search — remove filters or search a nearby city."}
              </p>
            </div>
          ) : (
            <div className="nd-grid">
              {donors.map(donor => (
                <div className="nd-card" key={donor._id}>

                  <div className="nd-card-header">
                    <div
                      className="nd-avatar"
                      style={{ background: avatarColor(donor._id) }}
                    >
                      {initials(donor.fullName)}
                    </div>
                    <div>
                      <div className="nd-card-name">{donor.fullName}</div>
                      <div className="nd-card-location">
                        📍 {donor.city || "—"}, {donor.state || "—"}
                      </div>
                    </div>
                  </div>

                  {}
                  {donor.distance != null && (
                    <div className="nd-distance-badge">
                      🧭 {formatDistance(donor.distance)} away
                    </div>
                  )}

                  {}
                  <div className="nd-blood-badge">
                    <span>🩸</span> {donor.bloodGroup || "—"}
                  </div>

                  {}
                  <div className="nd-card-meta">
                    <span className="nd-meta-chip available">
                      ● Available
                    </span>
                    {donor.isOrganDonor && (
                      <span className="nd-meta-chip organ">
                        🫀 Organ Donor
                      </span>
                    )}
                    {donor.lastDonationDate && (
                      <span className="nd-meta-chip">
                        Last: {formatDate(donor.lastDonationDate)}
                      </span>
                    )}
                  </div>

                  <button
                    className="nd-chat-btn"
                    onClick={() => navigate(`/chat?userId=${donor._id}`)}
                  >
                    💬 Chat with Donor
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
