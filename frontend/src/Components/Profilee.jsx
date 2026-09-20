import { useState } from "react";
import axios from "axios";
import "../pages/Profile.css";
import { Navigate, useNavigate } from "react-router-dom";


const STEPS = ["Personal", "Medical", "Donation", "Location"];

const ORGANS = [
  { name: "Kidney",   emoji: "🫘" },
  { name: "Liver",    emoji: "🫁" },
  { name: "Heart",    emoji: "❤️" },
  { name: "Lungs",    emoji: "🌬️" },
  { name: "Pancreas", emoji: "🧬" },
  { name: "Eyes",     emoji: "👁️" },
];

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function ProfilePage() {
  const navigate=useNavigate()

  const [step, setStep] = useState(0);

  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    phone:                       "",
    age:                         "",
    weight:                      "",
    DOB:                         "",
    role:                        "donor",
    bloodGroup:                  "",
    lastDonationDate:            "",
    isAvailableForBloodDonation: true,
    isOrganDonor:                false,
    organsDonating:              [],
    state:                       "",
    city:                        "",
    pincode:                     "",
    location: { type: 'Point', coordinates: [0, 0] },
    medicalConditions:           "",
    emergencyContact:            "",
  });

  const [geoStatus, setGeoStatus] = useState("idle"); 

  function detectLocation() {
    if (!navigator.geolocation) {
      setGeoStatus("error");
      return;
    }
    setGeoStatus("detecting");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm(prev => ({
          ...prev,
          location: {
            type: 'Point',
            coordinates: [pos.coords.longitude, pos.coords.latitude]
          }
        }));
        setGeoStatus("success");
      },
      () => setGeoStatus("error"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }


  function update(fieldName, value) {
    setForm({ ...form, [fieldName]: value });
  }

  
  function toggleOrgan(organName) {
    const already = form.organsDonating.includes(organName);
    if (already) {
      update("organsDonating", form.organsDonating.filter(o => o !== organName));
    } else {
      update("organsDonating", [...form.organsDonating, organName]);
    }
  }

  
  async function handleSubmit() {
    try {
      const response=await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:8800"}/pulseConnect-userDetails`,form,{withCredentials:true})
console.log(response);

      if (response.data.success) {
        setSubmitted(true);
      } else {
        const data = await response.json();
        alert(data.message || "Something went wrong!");
      }
    } catch (error) {
      alert("Cannot connect to server. Is it running?");
    }
  }

  if (submitted) {
    return (
      <div className="profile-page">
        <div className="profile-card">
          <div className="success-screen">
            <span className="success-icon">❤️</span>
            <h2>Profile Complete!</h2>
            <p>Thank you for registering. Your profile is under review and will be verified shortly.</p>
            <button className="btn-next" onClick={() => { setSubmitted(false); setStep(0); navigate('/user-DashBoard') }}>
         Go To 
         DashBoard
            </button>
          </div>
        </div>
      </div>
    );
  }

  
  
  
  return (
    <div className="profile-page">
      <div className="profile-card">

        <div className="card-header">
          <div className="logo">🩸 pulseConnect</div>
          <h2>Complete Your Profile</h2>
          <p>Step {step + 1} of {STEPS.length} — {STEPS[step]}</p>

          {}
          <div className="step-dots">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`dot ${i === step ? "active" : ""}`}
                style={{ width: i === step ? "28px" : "8px" }}
              />
            ))}
          </div>
        </div>

        <div className="card-body">
          <div className="step-label">
            Step {step + 1} / {STEPS.length} — {STEPS[step]}
          </div>

          {}
          {step === 0 && (
            <div>
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
                    placeholder="e.g. 22"
                    min="18"
                    value={form.age}
                    onChange={e => update("age", e.target.value)}
                  />
                </div>
              </div>

              <div className="two-col">
                <div className="field">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91 XXXXX XXXXX"
                    value={form.phone}
                    onChange={e => update("phone", e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Weight (kg)</label>
                  <input
                    type="number"
                    placeholder="e.g. 65"
                    value={form.weight}
                    onChange={e => update("weight", e.target.value)}
                  />
                </div>
              </div>

              <div className="field">
                <label>I am a</label>
                <select value={form.role} onChange={e => update("role", e.target.value)}>
                  <option value="donor">Donor</option>
                  <option value="recipient">Recipient</option>
                </select>
              </div>

              <div className="field">
                <label>Emergency Contact (Name and Number)</label>
                <input
                  type="text"
                  placeholder="e.g. Rahul — 98765 43210"
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
                      className={`blood-btn ${form.bloodGroup === bg ? "selected" : ""}`}
                      onClick={() => update("bloodGroup", bg)}
                    >
                      {bg}
                    </button>
                  ))}
                </div>
              </div>

              <div className="field">
                <label>Available for Blood Donation?</label>
                <div className="toggle-row">
                  <button
                    className={`toggle-btn ${form.isAvailableForBloodDonation ? "selected" : ""}`}
                    onClick={() => update("isAvailableForBloodDonation", true)}
                  >
                    ✓ Yes
                  </button>
                  <button
                    className={`toggle-btn ${!form.isAvailableForBloodDonation ? "selected" : ""}`}
                    onClick={() => update("isAvailableForBloodDonation", false)}
                  >
                    ✗ No
                  </button>
                </div>
              </div>

              <div className="field">
                <label>Last Blood Donation Date</label>
                <input
                  type="date"
                  value={form.lastDonationDate}
                  onChange={e => update("lastDonationDate", e.target.value)}
                />
              </div>

              <div className="field">
                <label>Medical Conditions / Allergies</label>
                <textarea
                  placeholder="Any chronic illness, medications, allergies..."
                  value={form.medicalConditions}
                  onChange={e => update("medicalConditions", e.target.value)}
                />
              </div>
            </div>
          )}

          {}
          {step === 2 && (
            <div>
              <div className="field">
                <label>Are you an Organ Donor?</label>
                <div className="toggle-row">
                  <button
                    className={`toggle-btn ${form.isOrganDonor ? "selected" : ""}`}
                    onClick={() => update("isOrganDonor", true)}
                  >
                    ❤️ Yes
                  </button>
                  <button
                    className={`toggle-btn ${!form.isOrganDonor ? "selected" : ""}`}
                    onClick={() => update("isOrganDonor", false)}
                  >
                    No
                  </button>
                </div>
              </div>

              {}
              {form.isOrganDonor && (
                <div className="field">
                  <label>Which organs are you willing to donate?</label>
                  <div className="organ-grid">
                    {ORGANS.map(organ => (
                      <button
                        key={organ.name}
                        className={`organ-btn ${form.organsDonating.includes(organ.name) ? "selected" : ""}`}
                        onClick={() => toggleOrgan(organ.name)}
                      >
                        <span>{organ.emoji}</span>
                        {organ.name}
                        {form.organsDonating.includes(organ.name) && (
                          <span style={{ marginLeft: "auto", color: "#e63946" }}>✓</span>
                        )}
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
                <label>📍 Precise Location (for Nearby Search)</label>
                <button
                  type="button"
                  className={`blood-btn ${geoStatus === 'success' ? 'selected' : ''}`}
                  onClick={detectLocation}
                  style={{ width: '100%', padding: '12px', fontSize: '14px', cursor: 'pointer' }}
                >
                  {geoStatus === 'idle' && '📍 Detect My Location'}
                  {geoStatus === 'detecting' && '⏳ Detecting...'}
                  {geoStatus === 'success' && `✅ Location captured (${form.location.coordinates[1].toFixed(4)}, ${form.location.coordinates[0].toFixed(4)})`}
                  {geoStatus === 'error' && '❌ Failed — please allow location access and retry'}
                </button>
              </div>

              <div className="info-box">
                📍 Your location helps connect you with nearby donors or recipients during emergencies. It is kept secure and only shared with verified users.
              </div>
            </div>
          )}

          <div className="btn-row">

            {step > 0 && (
              <button className="btn-back" onClick={() => setStep(step - 1)}>
                ← Back
              </button>
            )}

            {}
            <button
              className="btn-next"
              onClick={() => {
                if (step < STEPS.length - 1) {
                  setStep(step + 1);  
                } else {
                  handleSubmit();      
                }
              }}
            >
              {step < STEPS.length - 1 ? "Continue →" : "Submit Profile ❤️"}
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}