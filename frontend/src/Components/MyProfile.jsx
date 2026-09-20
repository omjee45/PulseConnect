import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../pages/Profile.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:8800";

const STEPS  = ["Personal", "Medical", "Donation", "Location"];
const ORGANS = [
  { name: "Kidney",   emoji: "🫘" },
  { name: "Liver",    emoji: "🫁" },
  { name: "Heart",    emoji: "❤️" },
  { name: "Lungs",    emoji: "🌬️" },
  { name: "Pancreas", emoji: "🧬" },
  { name: "Eyes",     emoji: "👁️" },
];
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function MyProfile() {
  const navigate  = useNavigate();
  const [step,      setStep]      = useState(0);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [error,     setError]     = useState(null);
  const [geoStatus, setGeoStatus] = useState("idle"); 

  const [form, setForm] = useState({
    fullName:                    "",
    phone:                       "",
    age:                         "",
    weight:                      "",
    DOB:                         "",
    bloodGroup:                  "",
    lastDonationDate:            "",
    isAvailableForBloodDonation: true,
    isOrganDonor:                false,
    organsDonating:              [],
    state:                       "",
    city:                        "",
    pincode:                     "",
    location: { type: "Point", coordinates: [0, 0] },
    medicalConditions:           "",
    emergencyContact:            "",
  });

  
  useEffect(() => {
    async function load() {
      try {
        const res = await axios.get(`${API}/pulseConnect-userDetails`, { withCredentials: true });
        const u = res.data?.user || res.data;
        if (u) {
          setForm(prev => ({
            ...prev,
            fullName:                    u.fullName  || "",
            phone:                       u.phone     || "",
            age:                         u.age       || "",
            weight:                      u.weight    || "",
            DOB:                         u.DOB           ? u.DOB.split("T")[0]           : "",
            bloodGroup:                  u.bloodGroup    || "",
            lastDonationDate:            u.lastDonationDate ? u.lastDonationDate.split("T")[0] : "",
            isAvailableForBloodDonation: u.isAvailableForBloodDonation ?? true,
            isOrganDonor:                u.isOrganDonor  ?? false,
            organsDonating:              u.organsDonating || [],
            state:                       u.state     || "",
            city:                        u.city      || "",
            pincode:                     u.pincode   || "",
            location:                    u.location  || { type: "Point", coordinates: [0, 0] },
            medicalConditions:           u.medicalConditions || "",
            emergencyContact:            u.emergencyContact  || "",
          }));
        }
      } catch {
        setError("Could not load your profile. Please log in.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function toggleOrgan(name) {
    setForm(prev => {
      const already = prev.organsDonating.includes(name);
      return {
        ...prev,
        organsDonating: already
          ? prev.organsDonating.filter(o => o !== name)
          : [...prev.organsDonating, name],
      };
    });
  }

  function detectLocation() {
    if (!navigator.geolocation) { setGeoStatus("error"); return; }
    setGeoStatus("detecting");
    navigator.geolocation.getCurrentPosition(
      pos => {
        setForm(prev => ({
          ...prev,
          location: { type: "Point", coordinates: [pos.coords.longitude, pos.coords.latitude] },
        }));
        setGeoStatus("success");
      },
      () => setGeoStatus("error"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await axios.post(`${API}/pulseConnect-userDetails`, form, { withCredentials: true });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  
  if (loading) {
    return (
      <div className="profile-page">
        <div className="bg-dots" />
        <div className="profile-card">
          <div className="card-header">
            <div className="logo">🩸 PulseConnect</div>
            <h2>My Profile</h2>
            <p>Loading your details…</p>
          </div>
          <div className="card-body" style={{ textAlign: "center", padding: "60px 32px" }}>
            <div style={{ fontSize: 40, animation: "heartbeat 1.2s ease-in-out infinite" }}>❤️</div>
          </div>
        </div>
      </div>
    );
  }

  
  const SavedBanner = saved && (
    <div style={{
      background: "rgba(5,150,105,0.15)",
      border: "1px solid rgba(5,150,105,0.3)",
      borderRadius: 10,
      padding: "12px 16px",
      color: "#34d399",
      fontSize: 14,
      fontWeight: 600,
      marginBottom: 18,
      textAlign: "center",
    }}>
      ✅ Profile saved successfully!
    </div>
  );

  const ErrorBanner = error && (
    <div style={{
      background: "rgba(230,57,70,0.1)",
      border: "1px solid rgba(230,57,70,0.25)",
      borderRadius: 10,
      padding: "12px 16px",
      color: "#f87171",
      fontSize: 14,
      marginBottom: 18,
      textAlign: "center",
    }}>
      ❌ {error}
    </div>
  );

  const [lat, lng] = form.location?.coordinates ?? [0, 0];
  const hasCoords  = lat !== 0 || lng !== 0;

  return (
    <div className="profile-page">
      <div className="bg-dots" />

      <div className="profile-card">
        {}
        <div className="card-header">
          <div className="logo">🩸 PulseConnect</div>
          <h2>👤 My Profile</h2>
          <p>View and update your details anytime</p>

          {}
          <div className="step-dots" style={{ marginTop: 18 }}>
            {STEPS.map((s, i) => (
              <div
                key={s}
                className={`dot${i === step ? " active" : ""}`}
                style={{ width: i === step ? 28 : 8, cursor: "pointer" }}
                onClick={() => setStep(i)}
                title={s}
              />
            ))}
          </div>
        </div>

        {}
        <div className="card-body">
          {SavedBanner}
          {ErrorBanner}

          <div className="step-label">{`Step ${step + 1} of ${STEPS.length} — ${STEPS[step]}`}</div>

          <form onSubmit={handleSave}>

            {}
            {step === 0 && (
              <div>
                <div className="field">
                  <label>Full Name</label>
                  <input
                    type="text"
                    placeholder="Your full name"
                    value={form.fullName}
                    onChange={e => update("fullName", e.target.value)}
                  />
                </div>
                <div className="two-col">
                  <div className="field">
                    <label>Date of Birth</label>
                    <input
                      type="date"
                      value={form.DOB}
                      onChange={e => update("DOB", e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label>Age</label>
                    <input
                      type="number"
                      placeholder="e.g. 25"
                      min="18"
                      value={form.age}
                      onChange={e => update("age", e.target.value)}
                    />
                  </div>
                </div>
                <div className="two-col">
                  <div className="field">
                    <label>Phone</label>
                    <input
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={form.phone}
                      onChange={e => update("phone", e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label>Weight (kg)</label>
                    <input
                      type="number"
                      placeholder="e.g. 65"
                      min="45"
                      value={form.weight}
                      onChange={e => update("weight", e.target.value)}
                    />
                  </div>
                </div>
                <div className="field">
                  <label>Emergency Contact</label>
                  <input
                    type="text"
                    placeholder="Name & phone of your emergency contact"
                    value={form.emergencyContact}
                    onChange={e => update("emergencyContact", e.target.value)}
                  />
                </div>
              </div>
            )}

            {}
            {step === 1 && (
              <div>
                <div className="field">
                  <label>Blood Group</label>
                  <div className="blood-grid">
                    {BLOOD_GROUPS.map(bg => (
                      <button
                        key={bg}
                        type="button"
                        className={`blood-btn${form.bloodGroup === bg ? " selected" : ""}`}
                        onClick={() => update("bloodGroup", bg)}
                      >
                        {bg}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="field">
                  <label>Medical Conditions (if any)</label>
                  <textarea
                    placeholder="e.g. Diabetes, Hypertension…"
                    value={form.medicalConditions}
                    onChange={e => update("medicalConditions", e.target.value)}
                  />
                </div>
                <div className="info-box">
                  🏥 Your medical info is private and only used to ensure safe donations.
                </div>
              </div>
            )}

            {}
            {step === 2 && (
              <div>
                <div className="field">
                  <label>Available for Blood Donation?</label>
                  <div className="toggle-row">
                    {[true, false].map(v => (
                      <button
                        key={String(v)}
                        type="button"
                        className={`toggle-btn${form.isAvailableForBloodDonation === v ? " selected" : ""}`}
                        onClick={() => update("isAvailableForBloodDonation", v)}
                      >
                        {v ? "✅ Yes" : "❌ No"}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="field">
                  <label>Last Donation Date</label>
                  <input
                    type="date"
                    value={form.lastDonationDate}
                    onChange={e => update("lastDonationDate", e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Organ Donor?</label>
                  <div className="toggle-row">
                    {[true, false].map(v => (
                      <button
                        key={String(v)}
                        type="button"
                        className={`toggle-btn${form.isOrganDonor === v ? " selected" : ""}`}
                        onClick={() => update("isOrganDonor", v)}
                      >
                        {v ? "🫀 Yes" : "❌ No"}
                      </button>
                    ))}
                  </div>
                </div>
                {form.isOrganDonor && (
                  <div className="field">
                    <label>Organs to Donate</label>
                    <div className="organ-grid">
                      {ORGANS.map(o => (
                        <button
                          key={o.name}
                          type="button"
                          className={`organ-btn${form.organsDonating.includes(o.name) ? " selected" : ""}`}
                          onClick={() => toggleOrgan(o.name)}
                        >
                          {o.emoji} {o.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {}
            {step === 3 && (
              <div>
                <div className="two-col">
                  <div className="field">
                    <label>State</label>
                    <input
                      type="text"
                      placeholder="e.g. Maharashtra"
                      value={form.state}
                      onChange={e => update("state", e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label>City</label>
                    <input
                      type="text"
                      placeholder="e.g. Mumbai"
                      value={form.city}
                      onChange={e => update("city", e.target.value)}
                    />
                  </div>
                </div>
                <div className="field">
                  <label>Pincode</label>
                  <input
                    type="text"
                    placeholder="e.g. 400001"
                    maxLength="6"
                    value={form.pincode}
                    onChange={e => update("pincode", e.target.value)}
                  />
                </div>

                {}
                <div className="field">
                  <label>📍 Precise Location (for Nearby Donor Search)</label>
                  <button
                    type="button"
                    className={`blood-btn${hasCoords && geoStatus === "success" ? " selected" : ""}`}
                    onClick={detectLocation}
                    style={{ width: "100%", padding: "13px", fontSize: "14px" }}
                  >
                    {geoStatus === "idle"      && (hasCoords ? `✅ Coords saved (${lng.toFixed(4)}, ${lat.toFixed(4)})` : "📍 Detect My Location")}
                    {geoStatus === "detecting" && "⏳ Detecting…"}
                    {geoStatus === "success"   && `✅ Captured (${lng.toFixed(4)}, ${lat.toFixed(4)})`}
                    {geoStatus === "error"     && "❌ Failed — allow location access and retry"}
                  </button>
                </div>

                <div className="info-box">
                  📍 Your location helps connect you with nearby donors during emergencies. Only shared with verified users.
                </div>
              </div>
            )}

            {}
            <div className="btn-row">
              {step > 0 && (
                <button type="button" className="btn-back" onClick={() => setStep(s => s - 1)}>
                  ← Back
                </button>
              )}
              {step < STEPS.length - 1 && (
                <button type="button" className="btn-next" onClick={() => setStep(s => s + 1)}>
                  Next →
                </button>
              )}
              {step === STEPS.length - 1 && (
                <button type="submit" className="btn-next" disabled={saving}>
                  {saving ? "Saving…" : "💾 Save Changes"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {}
      <div className="ecg-container">
        <svg className="ecg-svg" viewBox="0 0 1200 60" preserveAspectRatio="none">
          <polyline
            points="0,30 100,30 120,5 140,55 160,30 260,30 280,5 300,55 320,30 420,30 440,5 460,55 480,30 580,30 600,5 620,55 640,30 740,30 760,5 780,55 800,30 900,30 920,5 940,55 960,30 1060,30 1080,5 1100,55 1120,30 1200,30"
            fill="none"
            stroke="#e63946"
            strokeWidth="2"
          />
        </svg>
      </div>
    </div>
  );
}
