import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../pages/Chat.css";

const CHAT_API = import.meta.env.VITE_CHAT_URL || "http://localhost:8801";
const COLORS = ["#dc2626", "#9333ea", "#2563eb", "#059669", "#d97706", "#e11d48", "#7c3aed"];
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const ORGANS = ["Kidney", "Liver", "Heart", "Lungs", "Pancreas", "Eyes"];

function getColor(id = "") { return COLORS[String(id).charCodeAt(0) % COLORS.length]; }
function getInitials(name = "") { return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2); }
function formatTime(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function formatDate(dateStr) {
    const d = new Date(dateStr);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return "Today";
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function ChatPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [me, setMe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sidebarTab, setSidebarTab] = useState("find"); 

    const [filterBlood, setFilterBlood] = useState("");
    const [filterOrgan, setFilterOrgan] = useState("");
    const [matchingDonors, setMatchingDonors] = useState([]);
    const [donorsLoading, setDonorsLoading] = useState(false);
    const [introMsg, setIntroMsg] = useState("");
    const [showIntroModal, setShowIntroModal] = useState(null); 
    const [requestSending, setRequestSending] = useState(false);

    const [incomingRequests, setIncomingRequests] = useState([]);
    const [outgoingRequests, setOutgoingRequests] = useState([]);

    const [conversations, setConversations] = useState([]);
    const [activeConv, setActiveConv] = useState(null);
    const [activePerson, setActivePerson] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [mobileChat, setMobileChat] = useState(false);
    const [showProfile, setShowProfile] = useState(null); 
    const [profileLoading, setProfileLoading] = useState(false);

    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);
    const typingTimeout = useRef(null);

    const [initError, setInitError] = useState(null);
    useEffect(() => {
        async function init() {
            try {
                const meRes = await axios.get(`${CHAT_API}/chat/me`, { withCredentials: true });
                setMe(meRes.data.user);
                setLoading(false);
                loadRequests();
                loadConversations();
            } catch (err) {
                if (err.response?.status === 401) {
                    navigate("/login");
                } else {
                    setLoading(false);
                    setInitError(
                        err.code === "ERR_NETWORK"
                            ? "Chat server is not running. Please start chatServer.js on port 8801."
                            : err.response?.data?.message || "Failed to connect to chat server."
                    );
                }
            }
        }
        init();
    }, []);

    useEffect(() => {
        if (!me) return;
        const socket = io(CHAT_API, { withCredentials: true, transports: ["websocket", "polling"] });
        socketRef.current = socket;

        socket.on("receiveMessage", (msg) => {
            setMessages(prev => prev.some(m => m._id === msg._id) ? prev : [...prev, msg]);
            setConversations(prev =>
                prev.map(c => c._id === msg.conversationId ? { ...c, lastMessage: msg.text, updatedAt: msg.createdAt } : c)
            );
        });
        socket.on("onlineUsers", (ids) => setOnlineUsers(ids));
        socket.on("userTyping", () => setIsTyping(true));
        socket.on("userStopTyping", () => setIsTyping(false));
        socket.on("newRequest", () => loadRequests());
        socket.on("requestAccepted", () => { loadRequests(); loadConversations(); });
        socket.on("requestRejected", () => loadRequests());

        return () => socket.disconnect();
    }, [me]);

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

    async function loadRequests() {
        try {
            const [incRes, outRes] = await Promise.all([
                axios.get(`${CHAT_API}/chat/requests/incoming`, { withCredentials: true }),
                axios.get(`${CHAT_API}/chat/requests/outgoing`, { withCredentials: true })
            ]);
            setIncomingRequests(incRes.data.requests);
            setOutgoingRequests(outRes.data.requests);
        } catch (err) { console.log(err); }
    }

    async function loadConversations() {
        try {
            const res = await axios.get(`${CHAT_API}/chat/conversations`, { withCredentials: true });
            setConversations(res.data.conversations);
        } catch (err) { console.log(err); }
    }

    async function searchDonors() {
        setDonorsLoading(true);
        try {
            const params = new URLSearchParams();
            if (filterBlood) params.append("bloodGroup", filterBlood);
            if (filterOrgan) params.append("organ", filterOrgan);
            const res = await axios.get(`${CHAT_API}/chat/matching-donors?${params}`, { withCredentials: true });
            setMatchingDonors(res.data.donors);
        } catch (err) { console.log(err); }
        setDonorsLoading(false);
    }

    async function sendRequest(receiverId) {
        setRequestSending(true);
        try {
            await axios.post(`${CHAT_API}/chat/request`, {
                receiverId,
                introMessage: introMsg
            }, { withCredentials: true });
            setShowIntroModal(null);
            setIntroMsg("");
            loadRequests();
            
            setMatchingDonors(prev => prev.filter(d => d._id !== receiverId));
        } catch (err) {
            alert(err.response?.data?.message || "Failed to send request");
        }
        setRequestSending(false);
    }

    async function acceptRequest(reqId) {
        try {
            await axios.put(`${CHAT_API}/chat/request/${reqId}/accept`, {}, { withCredentials: true });
            loadRequests();
            loadConversations();
        } catch (err) { alert("Failed to accept"); }
    }

    async function rejectRequest(reqId) {
        try {
            await axios.put(`${CHAT_API}/chat/request/${reqId}/reject`, {}, { withCredentials: true });
            loadRequests();
        } catch (err) { alert("Failed to reject"); }
    }

    async function openConversation(person) {
        try {
            const res = await axios.post(`${CHAT_API}/chat/conversation`, { receiverId: person._id }, { withCredentials: true });
            const conv = res.data.conversation;
            setActiveConv(conv);
            setActivePerson(person);
            setMobileChat(true);
            const msgRes = await axios.get(`${CHAT_API}/chat/messages/${conv._id}`, { withCredentials: true });
            setMessages(msgRes.data.messages);
            setSidebarTab("chats");
        } catch (err) {
            alert(err.response?.data?.message || "Cannot open chat");
        }
    }

    function sendMessage() {
        if (!input.trim() || !activeConv || !activePerson) return;
        socketRef.current?.emit("sendMessage", {
            conversationId: activeConv._id,
            text: input.trim(),
            receiverId: activePerson._id
        });
        socketRef.current?.emit("stopTyping", { conversationId: activeConv._id, receiverId: activePerson._id });
        setInput("");
    }

    function handleInputChange(e) {
        setInput(e.target.value);
        if (!activeConv || !activePerson) return;
        socketRef.current?.emit("typing", { conversationId: activeConv._id, receiverId: activePerson._id });
        clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => {
            socketRef.current?.emit("stopTyping", { conversationId: activeConv._id, receiverId: activePerson._id });
        }, 1500);
    }

    async function viewProfile(userId) {
        setProfileLoading(true);
        try {
            const res = await axios.get(`${CHAT_API}/chat/profile/${userId}`, { withCredentials: true });
            setShowProfile(res.data.profile);
        } catch (err) {
            alert(err.response?.data?.message || "Cannot view profile");
        }
        setProfileLoading(false);
    }

    function getPartner(conv) {
        if (!me || !conv.participants) return { fullName: "Unknown", _id: "" };
        return conv.participants.find(p => p._id !== me._id) || conv.participants[0];
    }

    const pendingIncoming = incomingRequests.filter(r => r.status === "pending");
    const pendingOutgoing = outgoingRequests.filter(r => r.status === "pending");
    const requestCount = pendingIncoming.length + pendingOutgoing.length;

    function renderMessages() {
        const elements = [];
        let lastDate = "";
        messages.forEach((msg, i) => {
            const msgDate = formatDate(msg.createdAt);
            if (msgDate !== lastDate) {
                lastDate = msgDate;
                elements.push(<div className="date-separator" key={`date-${i}`}>{msgDate}</div>);
            }
            const isSent = msg.sender?._id === me._id || msg.sender === me._id;
            elements.push(
                <div className={`message-row ${isSent ? "sent" : "received"}`} key={msg._id}>
                    <div className="message-bubble">
                        {msg.text}
                        <span className="msg-time">{formatTime(msg.createdAt)}</span>
                    </div>
                </div>
            );
        });
        return elements;
    }

    if (loading) {
        return (
            <div className="chat-loading">
                <div className="spinner"></div>
                Connecting to secure chat…
            </div>
        );
    }

    if (initError) {
        return (
            <div className="chat-loading">
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</div>
                <h3 style={{ color: "#dc2626", marginBottom: "8px" }}>Chat Unavailable</h3>
                <p style={{ color: "#6b7280", maxWidth: "400px", textAlign: "center", lineHeight: 1.6 }}>{initError}</p>
                <button
                    onClick={() => window.location.reload()}
                    style={{
                        marginTop: "20px", padding: "10px 24px", border: "none",
                        borderRadius: "8px", background: "linear-gradient(135deg, #dc2626, #b91c1c)",
                        color: "#fff", cursor: "pointer", fontSize: "14px", fontWeight: 600
                    }}>
                    ↻ Retry
                </button>
            </div>
        );
    }

    return (
        <div className="chat-page">
            {}
            <div className="chat-header-bar">
                <div className="logo-icon">💬</div>
                <span className="logo-text">PulseConnect Chat</span>
                <div className="header-label">
                    <div className="secure-dot"></div>
                    Secure Connection
                </div>
            </div>

            {}
            <div className="chat-container">

                {}
                <div className={`chat-sidebar ${mobileChat ? "hidden" : ""}`}>
                    <div className="sidebar-header">
                        <h2>💬 PulseConnect</h2>
                    </div>

                    {}
                    <div className="sidebar-tabs">
                        <button className={`sidebar-tab ${sidebarTab === "find" ? "active" : ""}`}
                            onClick={() => setSidebarTab("find")}>
                            🔍 Find
                        </button>
                        <button className={`sidebar-tab ${sidebarTab === "requests" ? "active" : ""}`}
                            onClick={() => { setSidebarTab("requests"); loadRequests(); }}>
                            📩 Requests {requestCount > 0 && <span className="tab-badge">{requestCount}</span>}
                        </button>
                        <button className={`sidebar-tab ${sidebarTab === "chats" ? "active" : ""}`}
                            onClick={() => { setSidebarTab("chats"); loadConversations(); }}>
                            💬 Chats
                        </button>
                    </div>

                    <div className="sidebar-list">

                        {}
                        {sidebarTab === "find" && (
                            <div className="find-panel">
                                <div className="filter-section">
                                    <label className="filter-label">Blood Group</label>
                                    <div className="filter-chips">
                                        <button className={`filter-chip ${filterBlood === "" ? "active" : ""}`}
                                            onClick={() => setFilterBlood("")}>All</button>
                                        {BLOOD_GROUPS.map(bg => (
                                            <button key={bg}
                                                className={`filter-chip ${filterBlood === bg ? "active" : ""}`}
                                                onClick={() => setFilterBlood(bg)}>{bg}</button>
                                        ))}
                                    </div>
                                </div>
                                <div className="filter-section">
                                    <label className="filter-label">Organ Needed</label>
                                    <div className="filter-chips">
                                        <button className={`filter-chip ${filterOrgan === "" ? "active" : ""}`}
                                            onClick={() => setFilterOrgan("")}>None</button>
                                        {ORGANS.map(o => (
                                            <button key={o}
                                                className={`filter-chip ${filterOrgan === o ? "active" : ""}`}
                                                onClick={() => setFilterOrgan(o)}>{o}</button>
                                        ))}
                                    </div>
                                </div>
                                <button className="search-donors-btn" onClick={searchDonors}>
                                    🔍 Search Matching Donors
                                </button>

                                {donorsLoading && <div className="sidebar-empty">Searching...</div>}

                                {!donorsLoading && matchingDonors.length === 0 && (
                                    <div className="sidebar-empty">
                                        <div className="empty-icon">🔍</div>
                                        Select filters and search to find matching donors
                                    </div>
                                )}

                                {matchingDonors.map(donor => (
                                    <div key={donor._id} className="user-item">
                                        <div className="user-avatar" style={{ background: getColor(donor._id) }}>
                                            {getInitials(donor.fullName)}
                                            {onlineUsers.includes(donor._id) && <div className="online-dot"></div>}
                                        </div>
                                        <div className="user-info">
                                            <div className="name">{donor.fullName}</div>
                                            <div className="preview">
                                                {donor.bloodGroup && `🩸 ${donor.bloodGroup}`}
                                                {donor.city && ` · 📍 ${donor.city}`}
                                            </div>
                                            {donor.organsDonating?.length > 0 && (
                                                <div className="preview">Organs: {donor.organsDonating.join(", ")}</div>
                                            )}
                                        </div>
                                        <button className="connect-btn"
                                            onClick={() => { setShowIntroModal(donor._id); setIntroMsg(""); }}>
                                            🔗 Connect
                                        </button>
                                    </div>
                                ))}

                                {}
                                {showIntroModal && (
                                    <div className="intro-modal-overlay" onClick={() => setShowIntroModal(null)}>
                                        <div className="intro-modal" onClick={e => e.stopPropagation()}>
                                            <h3>Send Connection Request</h3>
                                            <p className="modal-desc">Write a short message to introduce yourself (optional, max 300 chars)</p>
                                            <textarea
                                                className="intro-textarea"
                                                placeholder="e.g. Hi, I urgently need AB+ blood for my mother's surgery..."
                                                value={introMsg}
                                                onChange={e => setIntroMsg(e.target.value.slice(0, 300))}
                                                rows={4}
                                            />
                                            <div className="modal-char-count">{introMsg.length}/300</div>
                                            <div className="modal-btns">
                                                <button className="modal-cancel" onClick={() => setShowIntroModal(null)}>Cancel</button>
                                                <button className="modal-send"
                                                    disabled={requestSending}
                                                    onClick={() => sendRequest(showIntroModal)}>
                                                    {requestSending ? "Sending..." : "Send Request 🔗"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {}
                        {sidebarTab === "requests" && (
                            <div className="requests-panel">
                                {}
                                {pendingIncoming.length > 0 && (
                                    <>
                                        <div className="requests-section-title">📥 Incoming Requests</div>
                                        {pendingIncoming.map(req => (
                                            <div key={req._id} className="request-card">
                                                <div className="request-top">
                                                    <div className="user-avatar" style={{ background: getColor(req.sender._id) }}>
                                                        {getInitials(req.sender.fullName)}
                                                    </div>
                                                    <div className="user-info">
                                                        <div className="name">{req.sender.fullName}</div>
                                                        <div className="preview">{req.sender.bloodGroup} · {req.sender.city || "Unknown"}</div>
                                                    </div>
                                                </div>
                                                {req.introMessage && (
                                                    <div className="request-intro">"{req.introMessage}"</div>
                                                )}
                                                <div className="request-actions">
                                                    <button className="accept-btn" onClick={() => acceptRequest(req._id)}>✓ Accept</button>
                                                    <button className="reject-btn" onClick={() => rejectRequest(req._id)}>✗ Reject</button>
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                )}

                                {}
                                {outgoingRequests.length > 0 && (
                                    <>
                                        <div className="requests-section-title">📤 Sent Requests</div>
                                        {outgoingRequests.map(req => (
                                            <div key={req._id} className="request-card">
                                                <div className="request-top">
                                                    <div className="user-avatar" style={{ background: getColor(req.receiver._id) }}>
                                                        {getInitials(req.receiver.fullName)}
                                                    </div>
                                                    <div className="user-info">
                                                        <div className="name">{req.receiver.fullName}</div>
                                                        <div className="preview">{req.receiver.bloodGroup} · {req.receiver.city || "Unknown"}</div>
                                                    </div>
                                                    <span className={`status-badge status-${req.status}`}>
                                                        {req.status === "pending" ? "⏳ Pending" :
                                                         req.status === "accepted" ? "✅ Accepted" : "❌ Rejected"}
                                                    </span>
                                                </div>
                                                {req.introMessage && (
                                                    <div className="request-intro">"{req.introMessage}"</div>
                                                )}
                                            </div>
                                        ))}
                                    </>
                                )}

                                {pendingIncoming.length === 0 && outgoingRequests.length === 0 && (
                                    <div className="sidebar-empty">
                                        <div className="empty-icon">📩</div>
                                        No requests yet.<br />
                                        Use "Find" to search for donors!
                                    </div>
                                )}
                            </div>
                        )}

                        {}
                        {sidebarTab === "chats" && (
                            conversations.length === 0 ? (
                                <div className="sidebar-empty">
                                    <div className="empty-icon">💬</div>
                                    No conversations yet.<br />
                                    Chats unlock after a request is accepted!
                                </div>
                            ) : (
                                conversations.map(conv => {
                                    const partner = getPartner(conv);
                                    return (
                                        <div key={conv._id}
                                            className={`user-item ${activeConv?._id === conv._id ? "active" : ""}`}
                                            onClick={() => openConversation(partner)}>
                                            <div className="user-avatar" style={{ background: getColor(partner._id) }}>
                                                {getInitials(partner.fullName)}
                                                {onlineUsers.includes(partner._id) && <div className="online-dot"></div>}
                                            </div>
                                            <div className="user-info">
                                                <div className="name">{partner.fullName}</div>
                                                <div className="preview">{conv.lastMessage || "Start chatting…"}</div>
                                            </div>
                                            <span className="user-time">{formatTime(conv.updatedAt)}</span>
                                        </div>
                                    );
                                })
                            )
                        )}
                    </div>
                </div>

                {}
                <div className={`chat-main ${!activeConv && mobileChat ? "hidden" : ""}`}>
                    {!activeConv ? (
                        <div className="no-chat">
                            <div className="big-icon">🔐</div>
                            <h3>Secure Chat</h3>
                            <p>Find a donor, send a request, and start chatting after they accept</p>
                        </div>
                    ) : (
                        <>
                            <div className="chat-top-bar">
                                <button className="back-btn" onClick={() => setMobileChat(false)}>←</button>
                                <div className="chat-partner-avatar" style={{ background: getColor(activePerson?._id) }}>
                                    {getInitials(activePerson?.fullName)}
                                </div>
                                <div className="partner-info">
                                    <div className="partner-name">{activePerson?.fullName}</div>
                                    <div className={`partner-status ${onlineUsers.includes(activePerson?._id) ? "online" : ""}`}>
                                        {onlineUsers.includes(activePerson?._id) ? "● Online" : "Offline"}
                                    </div>
                                </div>
                                <button className="profile-view-btn" onClick={() => viewProfile(activePerson?._id)}
                                    disabled={profileLoading}>
                                    {profileLoading ? "Loading..." : "👤 Profile"}
                                </button>
                                <div className="secure-badge">🔒 Encrypted</div>
                            </div>

                            <div className="messages-area">
                                {messages.length === 0 && (
                                    <div className="no-chat" style={{ opacity: 0.5 }}><p>No messages yet. Say hello! 👋</p></div>
                                )}
                                {renderMessages()}
                                {isTyping && (
                                    <div className="typing-indicator">
                                        <div className="dot"></div><div className="dot"></div><div className="dot"></div>
                                        {activePerson?.fullName} is typing…
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            <div className="message-input-bar">
                                <input
                                    placeholder="Type a message…"
                                    value={input}
                                    onChange={handleInputChange}
                                    onKeyDown={e => { if (e.key === "Enter") sendMessage(); }}
                                />
                                <button className="send-btn" onClick={sendMessage} disabled={!input.trim()}>➤</button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {}
            {showProfile && (
                <div className="intro-modal-overlay" onClick={() => setShowProfile(null)}>
                    <div className="profile-modal" onClick={e => e.stopPropagation()}>
                        <button className="profile-close" onClick={() => setShowProfile(null)}>✕</button>

                        <div className="profile-header">
                            <div className="profile-avatar" style={{ background: getColor(showProfile._id) }}>
                                {getInitials(showProfile.fullName)}
                            </div>
                            <h3>{showProfile.fullName}</h3>
                            <span className={`role-badge ${showProfile.role}`}>{showProfile.role}</span>
                        </div>

                        <div className="profile-grid">
                            <div className="profile-item">
                                <span className="profile-label">📧 Email</span>
                                <span className="profile-value">{showProfile.email}</span>
                            </div>
                            {showProfile.phone && (
                                <div className="profile-item">
                                    <span className="profile-label">📱 Phone</span>
                                    <span className="profile-value">{showProfile.phone}</span>
                                </div>
                            )}
                            {showProfile.age && (
                                <div className="profile-item">
                                    <span className="profile-label">🎂 Age</span>
                                    <span className="profile-value">{showProfile.age} years</span>
                                </div>
                            )}
                            {showProfile.DOB && (
                                <div className="profile-item">
                                    <span className="profile-label">📅 Date of Birth</span>
                                    <span className="profile-value">{new Date(showProfile.DOB).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
                                </div>
                            )}
                            {showProfile.weight && (
                                <div className="profile-item">
                                    <span className="profile-label">⚖️ Weight</span>
                                    <span className="profile-value">{showProfile.weight} kg</span>
                                </div>
                            )}
                            {showProfile.bloodGroup && (
                                <div className="profile-item">
                                    <span className="profile-label">🩸 Blood Group</span>
                                    <span className="profile-value highlight">{showProfile.bloodGroup}</span>
                                </div>
                            )}
                            {showProfile.isAvailableForBloodDonation !== undefined && (
                                <div className="profile-item">
                                    <span className="profile-label">💉 Blood Donation</span>
                                    <span className="profile-value">{showProfile.isAvailableForBloodDonation ? "✅ Available" : "❌ Not Available"}</span>
                                </div>
                            )}
                            {showProfile.lastDonationDate && (
                                <div className="profile-item">
                                    <span className="profile-label">📅 Last Donation</span>
                                    <span className="profile-value">{new Date(showProfile.lastDonationDate).toLocaleDateString("en-IN")}</span>
                                </div>
                            )}
                            {showProfile.isOrganDonor && (
                                <div className="profile-item full-width">
                                    <span className="profile-label">🫀 Organs Donating</span>
                                    <span className="profile-value">{showProfile.organsDonating?.join(", ") || "None specified"}</span>
                                </div>
                            )}
                            {showProfile.state && (
                                <div className="profile-item">
                                    <span className="profile-label">📍 Location</span>
                                    <span className="profile-value">{showProfile.city}{showProfile.state ? `, ${showProfile.state}` : ""}{showProfile.pincode ? ` - ${showProfile.pincode}` : ""}</span>
                                </div>
                            )}
                            {showProfile.medicalConditions && (
                                <div className="profile-item full-width">
                                    <span className="profile-label">🏥 Medical Conditions</span>
                                    <span className="profile-value">{showProfile.medicalConditions}</span>
                                </div>
                            )}
                            {showProfile.emergencyContact && (
                                <div className="profile-item full-width">
                                    <span className="profile-label">🆘 Emergency Contact</span>
                                    <span className="profile-value">{showProfile.emergencyContact}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

