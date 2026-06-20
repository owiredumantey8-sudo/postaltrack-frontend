import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const getUserIdFromToken = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.user_id || payload.id || null;
  } catch { return null; }
};

const API = 'https://postaltrack-backend-production.up.railway.app';

const norm = (s) => (s || '').toLowerCase().replace(/ /g, '_').replace(/-/g, '_');

const STATUS_MAP = {
  booked:           { color: '#6366f1', bg: '#eef2ff', border: '#c7d2fe', label: 'Booked',            icon: '📦' },
  picked_up:        { color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', label: 'Picked Up',          icon: '📥' },
  dispatched:       { color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', label: 'Dispatched',         icon: '📥' },
  in_transit:       { color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe', label: 'In Transit',         icon: '🚚' },
  out_for_delivery: { color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe', label: 'Out for Delivery',   icon: '🛵' },
  delivered:        { color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0', label: 'Delivered',           icon: '✅' },
  failed_delivery:  { color: '#ef4444', bg: '#fef2f2', border: '#fecaca', label: 'Failed Delivery',    icon: '❌' },
  returned:         { color: '#ef4444', bg: '#fef2f2', border: '#fecaca', label: 'Returned',           icon: '↩️' },
};

function getSt(s) {
  const n = norm(s);
  if (n.includes('transit') || n === 'dispatched') return STATUS_MAP.in_transit;
  if (n.includes('out'))      return STATUS_MAP.out_for_delivery;
  if (n.includes('fail'))     return STATUS_MAP.failed_delivery;
  if (n.includes('pick') || n.includes('dispatch')) return STATUS_MAP.picked_up;
  if (n.includes('deliver'))  return STATUS_MAP.delivered;
  if (n.includes('book'))     return STATUS_MAP.booked;
  return STATUS_MAP[n] || { color: '#64748b', bg: '#f1f5f9', border: '#e2e8f0', label: s || 'Unknown', icon: '📬' };
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
function formatDateTime(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const FAQ_DATA = [
  {
    q: 'Where is my parcel?',
    a: 'Go to the "My Parcels" tab and click on your shipment to see its full tracking history. Each status update shows the location and timestamp so you know exactly where your parcel was last scanned.',
  },
  {
    q: 'How do I change my delivery address?',
    a: 'Submit a support ticket with the "Wrong Address" category and include your tracking number. Address changes are only possible before the parcel is marked "Out for Delivery". Once it reaches that stage, we cannot redirect it.',
  },
  {
    q: 'My parcel says delivered but I never received it',
    a: 'Submit a support ticket immediately — select "Failed Delivery" as the category. Our team will verify the delivery with the agent and open an investigation. Do not wait, as investigations are easier to resolve within 24 hours of the reported delivery.',
  },
  {
    q: 'How long does delivery take?',
    a: 'Standard delivery within Accra: 2–5 business days. Other regions: 5–10 business days. The estimated time starts once the parcel status changes to "Picked Up" — not from the booking date.',
  },
  {
    q: 'Can I cancel my booking?',
    a: 'Yes. If the parcel is still "Booked" and has not been picked up, go to My Parcels and click "Remove" to cancel for free. Once the status changes to "Picked Up", you must contact support to request a cancellation — a pickup fee may apply.',
  },
  {
    q: 'My item arrived damaged',
    a: 'Do not dispose of the packaging or the item. Submit a support ticket with "Damaged Item" as the category within 48 hours of delivery. Attach clear photos of the damage and the packaging. Our claims team will review and respond with next steps.',
  },
];

function FAQItem({ item, isOpen, onToggle }) {
  return (
    <div style={{ borderBottom: '1px solid #e2e8f0' }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%', padding: '14px 0', background: 'none', border: 'none',
          cursor: 'pointer', display: 'flex', justifyContent: 'space-between',
          alignItems: 'flex-start', gap: 12, textAlign: 'left',
          fontFamily: 'inherit',
        }}
      >
        <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem', lineHeight: 1.4 }}>
          {item.q}
        </span>
        <span style={{
          fontSize: '0.8rem', color: '#94a3b8', flexShrink: 0,
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
          transition: 'transform 0.2s ease', marginTop: 2,
        }}>▼</span>
      </button>
      <div style={{
        maxHeight: isOpen ? '200px' : '0',
        overflow: 'hidden',
        transition: 'max-height 0.25s ease, padding 0.25s ease',
        paddingBottom: isOpen ? '14px' : '0',
      }}>
        <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem', lineHeight: 1.6 }}>
          {item.a}
        </p>
      </div>
    </div>
  );
}

function TrackingPanel({ parcel, events, loading, onClose }) {
  const st = getSt(parcel.current_status);
  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
        zIndex: 1000, animation: 'fadeIn .2s ease',
      }} />
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: '100%', maxWidth: 440,
        background: 'white', zIndex: 1001,
        boxShadow: '-8px 0 40px rgba(0,0,0,0.15)',
        overflowY: 'auto', animation: 'slideFromRight .25s ease',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid #f3f4f6',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          background: st.bg, flexShrink: 0,
        }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#111827', marginBottom: 2 }}>
              {st.icon} Tracking Details
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#6b7280', letterSpacing: 1 }}>
              {parcel.tracking_number}
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'white', border: 'none', borderRadius: '50%',
            width: 32, height: 32, cursor: 'pointer', fontSize: 14,
            color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
          }}>✕</button>
        </div>
        <div style={{ padding: '20px 24px', flex: 1 }}>
          <div style={{
            background: st.bg, border: `1.5px solid ${st.border}`,
            borderRadius: 12, padding: '14px 16px', marginBottom: 16,
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <span style={{ fontSize: 28 }}>{st.icon}</span>
            <div>
              <div style={{ fontWeight: 800, color: st.color, fontSize: 14 }}>{st.label}</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                {parcel.current_location ? `📍 ${parcel.current_location}` : 'Location not updated yet'}
              </div>
            </div>
          </div>
          <div style={{ background: '#f8fafc', borderRadius: 12, padding: '14px 16px', marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>Parcel Info</div>
            {[
              { label: 'Recipient',  value: parcel.recipient_name },
              { label: 'Phone',      value: parcel.recipient_phone },
              { label: 'Address',    value: parcel.recipient_address },
              { label: 'Weight',     value: parcel.weight_kg ? `${parcel.weight_kg} kg` : null },
              { label: 'Value',      value: parcel.declared_value ? `GHS ${parcel.declared_value}` : null },
              { label: 'Agent',      value: parcel.agent_name || null },
              { label: 'Booked',     value: formatDate(parcel.created_at) },
            ].filter(r => r.value).map((row, i, arr) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '5px 0', borderBottom: i < arr.length - 1 ? '1px solid #f3f4f6' : 'none',
                fontSize: 13,
              }}>
                <span style={{ color: '#9ca3af', fontWeight: 600 }}>{row.label}</span>
                <span style={{ color: '#111827', fontWeight: 600, textAlign: 'right', maxWidth: 220, fontSize: 12 }}>{row.value}</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 14 }}>📋 Status History</div>
          {loading ? (
            <p style={{ textAlign: 'center', color: '#9ca3af', padding: '20px 0' }}>Loading…</p>
          ) : events.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', background: '#f8fafc', borderRadius: 12 }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>📭</div>
              <p style={{ margin: 0, color: '#9ca3af', fontSize: 13, fontWeight: 600 }}>No updates yet</p>
              <p style={{ margin: '4px 0 0', color: '#9ca3af', fontSize: 12 }}>Booked on {formatDate(parcel.created_at)}</p>
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 13, top: 10, bottom: 10, width: 2, background: '#e5e7eb' }} />
              {events.map((ev, i) => {
                const evSt = getSt(ev.status_code);
                return (
                  <div key={i} style={{ display: 'flex', gap: 14, marginBottom: 16, position: 'relative' }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', flexShrink: 0, zIndex: 1,
                      background: evSt.bg, border: `2px solid ${evSt.color}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11,
                    }}>{evSt.icon}</div>
                    <div style={{ flex: 1, background: evSt.bg, border: `1px solid ${evSt.border}`, borderRadius: 10, padding: '9px 12px' }}>
                      <div style={{ fontWeight: 700, color: evSt.color, fontSize: 12 }}>{evSt.label}</div>
                      {ev.location && <div style={{ fontSize: 12, color: '#374151', marginTop: 2 }}>📍 {ev.location}</div>}
                      {ev.event_description && <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>💬 {ev.event_description}</div>}
                      <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>{formatDateTime(ev.event_timestamp)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function ParcelCard({ parcel, onOpen, onDelete }) {
  const [copied, setCopied] = useState(false);
  const st = getSt(parcel.current_status);
  const n = norm(parcel.current_status);
  const canDelete = n === 'booked' || n === 'delivered' || n.includes('fail') || n.includes('return');
  const isActive = ['in_transit', 'picked_up', 'dispatched', 'out_for_delivery'].some(k => n.includes(k.replace('_', '')));

  const copyTracking = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(parcel.tracking_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    const msg = n === 'booked'
      ? `Cancel this booking?\n\n${parcel.tracking_number}`
      : `Remove this parcel from your history?\n\n${parcel.tracking_number}`;
    if (!window.confirm(msg)) return;
    onDelete(parcel.parcel_id);
  };

  return (
    <div
      onClick={() => onOpen(parcel)}
      style={{
        background: 'white', borderRadius: 14, border: '1px solid #f1f5f9',
        borderLeft: `4px solid ${st.color}`, padding: '14px 18px',
        cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        transition: 'all .15s', display: 'flex', alignItems: 'center', gap: 16,
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 12, background: st.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20, flexShrink: 0, border: `1px solid ${st.border}`,
      }}>{st.icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
          <span style={{ fontWeight: 700, color: '#0f172a', fontSize: 14 }}>{parcel.recipient_name}</span>
          <span style={{
            background: st.bg, color: st.color, padding: '2px 9px', borderRadius: 20,
            fontSize: 11, fontWeight: 700, border: `1px solid ${st.border}`, flexShrink: 0,
          }}>{st.label}</span>
          {isActive && (
            <span style={{
              width: 7, height: 7, borderRadius: '50%', background: st.color,
              display: 'inline-block', animation: 'pulse 1.5s ease-in-out infinite', flexShrink: 0,
            }} />
          )}
        </div>
        <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 5 }}>
          📍 {parcel.recipient_address?.substring(0, 45)}{parcel.recipient_address?.length > 45 ? '…' : ''}
          <span style={{ marginLeft: 10, color: '#cbd5e1' }}>·</span>
          <span style={{ marginLeft: 10 }}>🗓 {formatDate(parcel.created_at)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#6b7280', letterSpacing: 0.5 }}>{parcel.tracking_number}</span>
          <button onClick={copyTracking} style={{
            background: copied ? '#ecfdf5' : '#f3f4f6', border: 'none', borderRadius: 5,
            padding: '2px 8px', cursor: 'pointer', fontSize: 10, fontWeight: 700,
            color: copied ? '#059669' : '#6b7280', transition: 'all .15s',
          }}>{copied ? '✓ Copied' : '📋 Copy'}</button>
          {parcel.agent_name && (
            <span style={{ fontSize: 11, color: '#059669', fontWeight: 600 }}>🚚 {parcel.agent_name}</span>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
        <button onClick={(e) => { e.stopPropagation(); onOpen(parcel); }} style={{
          padding: '5px 12px', borderRadius: 8, background: '#f8fafc', color: '#475569',
          border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: 11, fontWeight: 700,
        }}>View History →</button>
        {canDelete && (
          <button onClick={handleDelete} style={{
            padding: '4px 10px', borderRadius: 7, background: '#fef2f2', color: '#dc2626',
            border: '1px solid #fecaca', cursor: 'pointer', fontSize: 11, fontWeight: 700,
          }}>🗑 Remove</button>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const userId = getUserIdFromToken();

  const [activeTab, setActiveTab] = useState('parcels');
  const [parcels, setParcels] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');

  const [bookForm, setBookForm] = useState({
    recipient_name: '', recipient_phone: '', recipient_address: '',
    recipient_email: '', weight_kg: '', declared_value: ''
  });
  const [booking, setBooking] = useState(false);
  const [bookedTracking, setBookedTracking] = useState(null);

  const [phoneForm, setPhoneForm] = useState('');
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [savingPhone, setSavingPhone] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [phoneMsg, setPhoneMsg] = useState(null);
  const [passwordMsg, setPasswordMsg] = useState(null);

  const [supportForm, setSupportForm] = useState({ tracking_number: '', category: '', message: '' });
  const [sendingSupport, setSendingSupport] = useState(false);
  const [supportMsg, setSupportMsg] = useState(null);
  const [supportPhotos, setSupportPhotos] = useState([]);
  const [photoErrors, setPhotoErrors] = useState([]);
  const [fetchedStatus, setFetchedStatus] = useState(null);
  const [fetchingStatus, setFetchingStatus] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const [selectedParcel, setSelectedParcel] = useState(null);
  const [parcelEvents, setParcelEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchParcels = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`${API}/api/profile/parcels/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setParcels(Array.isArray(data) ? data : []);
    } catch { setParcels([]); }
  }, [userId]);

  const fetchProfile = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`${API}/api/profile/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setProfile(data);
      setPhoneForm(data.phone_number || '');
    } catch {}
  }, [userId]);

  useEffect(() => {
    if (!userId) { navigate('/login'); return; }
    Promise.all([fetchParcels(), fetchProfile()]).finally(() => setLoading(false));
  }, [userId, fetchParcels, fetchProfile, navigate]);

  const handleBook = async () => {
    const { recipient_name, recipient_phone, recipient_address } = bookForm;
    if (!recipient_name || !recipient_phone || !recipient_address) {
      showToast('Please fill in all required fields.', 'error'); return;
    }
    setBooking(true);
    try {
      const res = await fetch(`${API}/api/parcels/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ ...bookForm, sender_id: userId })
      });
      const data = await res.json();
      if (res.ok) {
        setBookedTracking(data.tracking_number);
        setBookForm({ recipient_name: '', recipient_phone: '', recipient_address: '', recipient_email: '', weight_kg: '', declared_value: '' });
        fetchParcels();
        showToast('Parcel booked successfully!');
      } else {
        showToast(data.message || 'Failed to book parcel.', 'error');
      }
    } catch { showToast('Server error. Try again.', 'error'); }
    setBooking(false);
  };

  const savePhone = async () => {
    if (!phoneForm.trim()) { setPhoneMsg({ text: 'Enter a phone number.', ok: false }); return; }
    setSavingPhone(true); setPhoneMsg(null);
    try {
      const res = await fetch(`${API}/api/profile/update-phone/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ phone_number: phoneForm })
      });
      const data = await res.json();
      setPhoneMsg({ text: data.message, ok: res.ok });
      if (res.ok) fetchProfile();
    } catch { setPhoneMsg({ text: 'Server error.', ok: false }); }
    setSavingPhone(false);
  };

  const savePassword = async () => {
    if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
      setPasswordMsg({ text: 'Please fill in all fields.', ok: false }); return;
    }
    if (passwordForm.new !== passwordForm.confirm) {
      setPasswordMsg({ text: 'New passwords do not match.', ok: false }); return;
    }
    if (passwordForm.new.length < 6) {
      setPasswordMsg({ text: 'Password must be at least 6 characters.', ok: false }); return;
    }
    setSavingPassword(true); setPasswordMsg(null);
    try {
      const res = await fetch(`${API}/api/profile/change-password/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ current_password: passwordForm.current, new_password: passwordForm.new })
      });
      const data = await res.json();
      setPasswordMsg({ text: data.message, ok: res.ok });
      if (res.ok) setPasswordForm({ current: '', new: '', confirm: '' });
    } catch { setPasswordMsg({ text: 'Server error.', ok: false }); }
    setSavingPassword(false);
  };

  useEffect(() => {
    const trackNum = supportForm.tracking_number.trim();
    if (trackNum.length < 5) { setFetchedStatus(null); return; }
    const timer = setTimeout(async () => {
      setFetchingStatus(true);
      try {
        const res = await fetch(`${API}/api/parcels/track/${trackNum}`);
        const data = await res.json();
        if (res.ok && data.current_status) {
          setFetchedStatus({ status: data.current_status, location: data.current_location, recipient: data.recipient_name, updatedAt: data.updated_at });
        } else { setFetchedStatus(null); }
      } catch { setFetchedStatus(null); }
      setFetchingStatus(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [supportForm.tracking_number]);

  const handlePhotoAdd = (e) => {
    const files = Array.from(e.target.files);
    const newErrors = [];
    const validFiles = [];
    files.forEach(file => {
      if (supportPhotos.length + validFiles.length >= 3) { newErrors.push('Maximum 3 photos allowed'); return; }
      if (file.size > 5 * 1024 * 1024) { newErrors.push(`${file.name} is too large (max 5MB)`); return; }
      if (!file.type.startsWith('image/')) { newErrors.push(`${file.name} is not an image`); return; }
      validFiles.push({ file, preview: URL.createObjectURL(file), name: file.name });
    });
    setSupportPhotos(prev => [...prev, ...validFiles].slice(0, 3));
    setPhotoErrors(newErrors);
    e.target.value = '';
  };

  const removePhoto = (index) => {
    setSupportPhotos(prev => {
      const removed = prev[index];
      if (removed?.preview) URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const submitSupport = async () => {
    if (!supportForm.category || !supportForm.message.trim()) {
      setSupportMsg({ text: 'Please select a category and write your message.', ok: false }); return;
    }
    setSendingSupport(true);
    setSupportMsg(null);
    const autoSubject = supportForm.tracking_number.trim()
      ? `${supportForm.category} — ${supportForm.tracking_number.trim()}`
      : supportForm.category;
    const photosAsBase64 = [];
    for (const photo of supportPhotos) {
      try {
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(photo.file);
        });
        photosAsBase64.push(base64);
      } catch {}
    }
    try {
      const res = await fetch(`${API}/api/profile/support`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          user_id: userId,
          tracking_number: supportForm.tracking_number,
          category: supportForm.category,
          subject: autoSubject,
          message: supportForm.message,
          images: photosAsBase64,
        }),
      });
      const data = await res.json();
      setSupportMsg({ text: data.message, ok: res.ok });
      if (res.ok) {
        setSupportForm({ tracking_number: '', category: '', message: '' });
        setSupportPhotos(prev => {
          prev.forEach(p => p.preview && URL.revokeObjectURL(p.preview));
          return [];
        });
        setFetchedStatus(null);
      }
    } catch { setSupportMsg({ text: 'Server error. Please try again.', ok: false }); }
    setSendingSupport(false);
  };

  const deleteParcel = async (parcelId) => {
    try {
      const res = await fetch(`${API}/api/parcels/delete/${parcelId}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) { fetchParcels(); showToast('Parcel removed successfully.'); }
      else showToast('Could not delete parcel.', 'error');
    } catch { showToast('Server error.', 'error'); }
  };

  const openTracking = async (parcel) => {
    setSelectedParcel(parcel); setLoadingEvents(true); setParcelEvents([]);
    try {
      const res = await fetch(`${API}/api/parcels/events/${parcel.parcel_id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setParcelEvents(Array.isArray(data) ? data : []);
    } catch {}
    setLoadingEvents(false);
  };

  const handleLogout = () => { localStorage.removeItem('token'); navigate('/login'); };

  const filteredParcels = parcels.filter(p => {
    const matchStatus = filterStatus === 'all' || norm(p.current_status).includes(filterStatus);
    const matchSearch = !search ||
      p.recipient_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.tracking_number?.toLowerCase().includes(search.toLowerCase()) ||
      p.recipient_address?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const s = {
    page: { minHeight: '100vh', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #f0fdf4 100%)', fontFamily: "'Inter', -apple-system, sans-serif" },
    nav: { background: 'white', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 100 },
    logo: { fontWeight: '900', fontSize: '1.2rem', color: '#1b4332', letterSpacing: '-0.5px' },
    navRight: { display: 'flex', alignItems: 'center', gap: '16px' },
    greeting: { fontSize: '0.875rem', color: '#64748b', fontWeight: '500' },
    logoutBtn: { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '7px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '0.8rem' },
    body: { maxWidth: '1000px', margin: '0 auto', padding: '28px 20px' },
    tabs: { display: 'flex', gap: '6px', marginBottom: '24px', flexWrap: 'wrap' },
    card: { background: 'white', borderRadius: '16px', padding: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
    sectionTitle: { fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: '0 0 4px' },
    sectionSub: { fontSize: '0.82rem', color: '#94a3b8', margin: '0 0 20px' },
    label: { display: 'block', fontSize: '0.72rem', fontWeight: '700', color: '#64748b', letterSpacing: '0.06em', marginBottom: '6px', textTransform: 'uppercase' },
    input: { width: '100%', padding: '11px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.15s', boxSizing: 'border-box', color: '#0f172a' },
    btnPrimary: { background: 'linear-gradient(135deg, #1b4332, #2d6a4f)', color: 'white', border: 'none', padding: '11px 24px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '0.88rem', boxShadow: '0 4px 12px rgba(27,67,50,0.25)' },
    divider: { border: 'none', borderTop: '1px solid #f1f5f9', margin: '28px 0' },
    msgOk: { background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600', marginTop: '12px' },
    msgErr: { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600', marginTop: '12px' },
  };

  const tabStyle = (id) => ({
    padding: '9px 18px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '0.83rem',
    background: activeTab === id ? 'linear-gradient(135deg, #1b4332, #2d6a4f)' : 'white',
    color: activeTab === id ? 'white' : '#64748b',
    boxShadow: activeTab === id ? '0 4px 12px rgba(27,67,50,0.25)' : '0 1px 3px rgba(0,0,0,0.07)',
    transition: 'all 0.15s',
  });

  if (loading) return (
    <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📦</div>
        <p style={{ color: '#64748b', fontWeight: '600' }}>Loading your dashboard...</p>
      </div>
    </div>
  );

  return (
    <div style={s.page}>
      <style>{`
        @keyframes slideIn { from { transform: translateX(20px); opacity:0; } to { transform: translateX(0); opacity:1; } }
        @keyframes slideFromRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:.5; transform:scale(1.3); } }
      `}</style>

      {toast && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
          background: toast.type === 'error' ? '#fef2f2' : '#f0fdf4',
          color: toast.type === 'error' ? '#dc2626' : '#166534',
          border: `1px solid ${toast.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
          padding: '12px 20px', borderRadius: '12px', fontWeight: '700',
          fontSize: '0.875rem', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          animation: 'slideIn 0.2s ease',
        }}>
          {toast.type === 'error' ? '❌ ' : '✅ '}{toast.msg}
        </div>
      )}

      {selectedParcel && (
        <TrackingPanel parcel={selectedParcel} events={parcelEvents} loading={loadingEvents} onClose={() => setSelectedParcel(null)} />
      )}

      <nav style={s.nav}>
        <div style={s.logo}>📦 PostalTrack</div>
        <div style={s.navRight}>
          {profile && <span style={s.greeting}>👋 {profile.full_name?.split(' ')[0]}</span>}
          <button onClick={() => setActiveTab('settings')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.3rem', color: '#64748b' }} title="Settings">⚙️</button>
          <button onClick={handleLogout} style={s.logoutBtn}>Log Out</button>
        </div>
      </nav>

      <div style={s.body}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '24px' }}>
          {[
            { label: 'Total Parcels', value: parcels.length, icon: '📦', color: '#6366f1' },
            { label: 'In Transit', value: parcels.filter(p => norm(p.current_status).includes('transit')).length, icon: '🚚', color: '#3b82f6' },
            { label: 'Delivered', value: parcels.filter(p => norm(p.current_status) === 'delivered').length, icon: '✅', color: '#10b981' },
            { label: 'Pending', value: parcels.filter(p => ['booked','picked_up','dispatched'].includes(norm(p.current_status))).length, icon: '⏳', color: '#f59e0b' },
          ].map(stat => (
            <div key={stat.label} style={{ ...s.card, padding: '18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: '1.6rem' }}>{stat.icon}</div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: '900', color: stat.color, lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600', marginTop: '2px' }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={s.tabs}>
          {[
            { id: 'parcels', label: '📦 My Parcels' },
            { id: 'book',    label: '➕ Book Parcel' },
            { id: 'settings',label: '⚙️ Settings' },
            { id: 'support', label: '🆘 Support' },
          ].map(tab => (
            <button key={tab.id} style={tabStyle(tab.id)} onClick={() => setActiveTab(tab.id)}>{tab.label}</button>
          ))}
        </div>

        {activeTab === 'parcels' && (
          <div style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
              <div>
                <h2 style={s.sectionTitle}>Shipment History</h2>
                <p style={{ ...s.sectionSub, margin: 0 }}>{filteredParcels.length} parcel{filteredParcels.length !== 1 ? 's' : ''} · Click any row to view full history</p>
              </div>
              <button onClick={() => setActiveTab('book')} style={{ ...s.btnPrimary, padding: '8px 16px', fontSize: '0.8rem' }}>➕ New Shipment</button>
            </div>
            {parcels.length > 0 && (
              <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                <input type="text" placeholder="🔍  Search by name, tracking no. or address..." value={search}
                  onChange={e => setSearch(e.target.value)} style={{ ...s.input, flex: 1, minWidth: 200, fontSize: '0.85rem', padding: '9px 14px' }} />
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                  style={{ padding: '9px 14px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: '0.85rem', color: '#475569', background: 'white', cursor: 'pointer' }}>
                  <option value="all">All Statuses</option>
                  <option value="book">Booked</option>
                  <option value="pick">Picked Up</option>
                  <option value="transit">In Transit</option>
                  <option value="out">Out for Delivery</option>
                  <option value="deliver">Delivered</option>
                  <option value="fail">Failed</option>
                </select>
              </div>
            )}
            {parcels.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '50px 20px' }}>
                <div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>📭</div>
                <p style={{ fontWeight: '700', color: '#475569', margin: '0 0 8px' }}>No parcels yet</p>
                <p style={{ color: '#94a3b8', margin: '0 0 20px', fontSize: '0.875rem' }}>Book your first parcel to get started!</p>
                <button onClick={() => setActiveTab('book')} style={s.btnPrimary}>➕ Book a Parcel</button>
              </div>
            ) : filteredParcels.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', background: '#f8fafc', borderRadius: 12 }}>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>🔍</div>
                <p style={{ fontWeight: '700', color: '#475569', margin: '0 0 6px' }}>No matches found</p>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>Try a different search or filter</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filteredParcels.map(parcel => (
                  <ParcelCard key={parcel.parcel_id} parcel={parcel} onOpen={openTracking} onDelete={deleteParcel} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'book' && (
          <div style={s.card}>
            <h2 style={s.sectionTitle}>Book a Parcel</h2>
            <p style={s.sectionSub}>Fill in the recipient details to create a new shipment</p>
            {bookedTracking && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '18px', marginBottom: '24px', textAlign: 'center' }}>
                <p style={{ margin: '0 0 4px', fontWeight: '800', color: '#166534', fontSize: '1rem' }}>✅ Parcel Booked!</p>
                <p style={{ margin: '0 0 8px', color: '#166534', fontSize: '0.875rem' }}>Your tracking number is:</p>
                <p style={{ margin: 0, fontFamily: 'monospace', fontWeight: '900', color: '#1b4332', fontSize: '1.1rem', letterSpacing: '1px' }}>{bookedTracking}</p>
                <button onClick={() => setBookedTracking(null)} style={{ marginTop: '12px', background: 'none', border: '1px solid #bbf7d0', color: '#166534', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700' }}>Book Another</button>
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              {[
                { label: 'Recipient Name *', key: 'recipient_name', type: 'text', placeholder: 'Full name' },
                { label: 'Recipient Phone *', key: 'recipient_phone', type: 'text', placeholder: '024XXXXXXX' },
                { label: 'Recipient Email', key: 'recipient_email', type: 'email', placeholder: 'email@example.com' },
                { label: 'Weight (kg)', key: 'weight_kg', type: 'number', placeholder: '0.0' },
                { label: 'Declared Value (GHS)', key: 'declared_value', type: 'number', placeholder: '0.00' },
              ].map(f => (
                <div key={f.key}>
                  <label style={s.label}>{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder} value={bookForm[f.key]}
                    onChange={e => setBookForm(p => ({ ...p, [f.key]: e.target.value }))} style={s.input} />
                </div>
              ))}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={s.label}>Delivery Address *</label>
                <textarea placeholder="Full delivery address" value={bookForm.recipient_address}
                  onChange={e => setBookForm(p => ({ ...p, recipient_address: e.target.value }))} rows={3} style={{ ...s.input, resize: 'vertical' }} />
              </div>
            </div>
            <div style={{ marginTop: '20px' }}>
              <button onClick={handleBook} disabled={booking} style={{ ...s.btnPrimary, opacity: booking ? 0.7 : 1, cursor: booking ? 'not-allowed' : 'pointer' }}>
                {booking ? '⏳ Booking...' : '📦 Book Parcel'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div style={s.card}>
            <h2 style={s.sectionTitle}>⚙️ Account Settings</h2>
            <p style={s.sectionSub}>Update your contact information and password</p>
            {profile && (
              <div style={{ background: "linear-gradient(135deg, #f0fdf4, #dcfce7)", borderRadius: "14px", padding: "20px", marginBottom: "28px", display: "flex", alignItems: "center", gap: "16px", border: "1px solid #bbf7d0" }}>
                <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "linear-gradient(135deg, #1b4332, #2d6a4f)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", fontWeight: "900", color: "white", flexShrink: 0 }}>
                  {profile.full_name?.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: "0 0 3px", fontWeight: "800", color: "#0f172a", fontSize: "1rem" }}>{profile.full_name}</p>
                  <p style={{ margin: "0 0 3px", fontSize: "0.83rem", color: "#475569" }}>✉️ {profile.email}</p>
                  <p style={{ margin: 0, fontSize: "0.78rem", color: "#64748b" }}>📱 {profile.phone_number || "No phone set yet"} · Member since {formatDate(profile.created_at)}</p>
                </div>
              </div>
            )}
            <h3 style={{ margin: '0 0 12px', fontSize: '0.95rem', fontWeight: '800', color: '#1b4332' }}>📱 Update Phone Number</h3>
            <label style={s.label}>Phone Number</label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <input type="tel" placeholder="e.g. 0244123456" value={phoneForm}
                onChange={e => { setPhoneForm(e.target.value); setPhoneMsg(null); }} autoComplete="off" style={{ ...s.input, maxWidth: '280px' }} />
              <button onClick={savePhone} disabled={savingPhone} style={{ ...s.btnPrimary, opacity: savingPhone ? 0.7 : 1 }}>
                {savingPhone ? '⏳ Saving...' : '💾 Save'}
              </button>
            </div>
            {phoneMsg && <div style={phoneMsg.ok ? s.msgOk : s.msgErr}>{phoneMsg.ok ? '✅ ' : '❌ '}{phoneMsg.text}</div>}
            <hr style={s.divider} />
            <h3 style={{ margin: '0 0 12px', fontSize: '0.95rem', fontWeight: '800', color: '#1b4332' }}>🔒 Change Password</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '16px' }}>
              {[{ label: 'Current Password', key: 'current' }, { label: 'New Password', key: 'new' }, { label: 'Confirm New Password', key: 'confirm' }].map(f => (
                <div key={f.key}>
                  <label style={s.label}>{f.label}</label>
                  <input type="password" value={passwordForm[f.key]}
                    onChange={e => { setPasswordForm(p => ({ ...p, [f.key]: e.target.value })); setPasswordMsg(null); }} style={s.input} />
                </div>
              ))}
            </div>
            <button onClick={savePassword} disabled={savingPassword} style={{ ...s.btnPrimary, opacity: savingPassword ? 0.7 : 1 }}>
              {savingPassword ? '⏳ Changing...' : '🔒 Change Password'}
            </button>
            {passwordMsg && <div style={passwordMsg.ok ? s.msgOk : s.msgErr}>{passwordMsg.ok ? '✅ ' : '❌ '}{passwordMsg.text}</div>}
          </div>
        )}

        {activeTab === 'support' && (
          <div style={s.card}>
            <h2 style={s.sectionTitle}>🆘 Support Center</h2>
            <p style={s.sectionSub}>Having an issue? We're here to help.</p>

            <a href="tel:+233247891234" style={{
              display: 'flex', alignItems: 'center', gap: 14,
              background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
              borderRadius: 14, padding: '16px 20px', marginBottom: 24,
              textDecoration: 'none', color: 'white',
              boxShadow: '0 4px 16px rgba(220,38,38,0.3)',
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0,
              }}>📞</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: 2 }}>Need urgent help? Call us now</div>
                <div style={{ fontSize: '0.82rem', opacity: 0.9 }}>+233 24 789 1234 · Mon–Fri, 8am–5pm</div>
              </div>
              <div style={{
                padding: '8px 16px', background: 'rgba(255,255,255,0.2)',
                borderRadius: 8, fontWeight: 700, fontSize: '0.85rem',
              }}>Call →</div>
            </a>

            <div style={{ background: '#f8fafc', borderRadius: 14, padding: '4px 20px', marginBottom: 28, border: '1px solid #e2e8f0' }}>
              <div style={{ padding: '14px 0 8px', fontSize: '0.8rem', fontWeight: 800, color: '#475569', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                💡 Frequently Asked Questions
              </div>
              {FAQ_DATA.map((item, i) => (
                <FAQItem key={i} item={item} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />
              ))}
            </div>

            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>📨 Submit a Support Ticket</div>
            <p style={{ ...s.sectionSub, marginBottom: 20 }}>Can't find your answer above? Fill out the form below.</p>

            <div style={{ marginBottom: 16 }}>
              <label style={s.label}>TRACKING NUMBER (OPTIONAL)</label>
              <input type="text" placeholder="e.g. PT-2024-XXXXX" value={supportForm.tracking_number}
                onChange={e => setSupportForm({ ...supportForm, tracking_number: e.target.value })} style={s.input} />
              {fetchingStatus && supportForm.tracking_number.trim().length >= 5 && (
                <div style={{ marginTop: 8, padding: '10px 14px', background: '#eff6ff', borderRadius: 8, fontSize: '0.82rem', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ animation: 'pulse 1s ease-in-out infinite' }}>⏳</span> Looking up parcel...
                </div>
              )}
              {fetchedStatus && !fetchingStatus && (
                <div style={{
                  marginTop: 8, padding: '12px 16px',
                  background: getSt(fetchedStatus.status).bg, border: `1px solid ${getSt(fetchedStatus.status).border}`,
                  borderRadius: 10, display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <span style={{ fontSize: '1.3rem' }}>{getSt(fetchedStatus.status).icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, color: getSt(fetchedStatus.status).color, fontSize: '0.85rem' }}>{getSt(fetchedStatus.status).label}</div>
                    {fetchedStatus.location && <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 1 }}>📍 {fetchedStatus.location}</div>}
                  </div>
                </div>
              )}
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={s.label}>ISSUE CATEGORY *</label>
              <select value={supportForm.category} onChange={e => setSupportForm({ ...supportForm, category: e.target.value })} style={s.input}>
                <option value="">Select category...</option>
                <option value="Delayed Delivery">⏰ Delayed Delivery</option>
                <option value="Lost Parcel">🔍 Lost Parcel</option>
                <option value="Damaged Item">📦 Damaged Item</option>
                <option value="Wrong Address">📍 Wrong Address Updated</option>
                <option value="Failed Delivery">❌ Failed Delivery</option>
                <option value="Billing Issue">💰 Billing / Pricing Issue</option>
                <option value="General Inquiry">💬 General Inquiry</option>
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={s.label}>DESCRIBE YOUR ISSUE *</label>
              <textarea placeholder="What happened? When did you notice it? Include any relevant details..."
                value={supportForm.message} onChange={e => setSupportForm({ ...supportForm, message: e.target.value })}
                rows="5" style={{ ...s.input, resize: 'vertical', fontFamily: 'inherit' }} />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={s.label}>PHOTOS (OPTIONAL — MAX 3, 5MB EACH)</label>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                {supportPhotos.map((photo, i) => (
                  <div key={i} style={{ position: 'relative', width: 80, height: 80 }}>
                    <img src={photo.preview} alt={photo.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10, border: '2px solid #e2e8f0' }} />
                    <button onClick={() => removePhoto(i)} style={{
                      position: 'absolute', top: -8, right: -8, width: 24, height: 24, borderRadius: '50%',
                      background: '#ef4444', color: 'white', border: '2px solid white', cursor: 'pointer',
                      fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                    }}>✕</button>
                    <div style={{ fontSize: '0.65rem', color: '#94a3b8', textAlign: 'center', marginTop: 4, maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{photo.name}</div>
                  </div>
                ))}
                {supportPhotos.length < 3 && (
                  <label style={{
                    width: 80, height: 80, borderRadius: 10, border: '2px dashed #cbd5e1', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: 4, transition: 'all 0.15s', background: '#f8fafc',
                  }}>
                    <span style={{ fontSize: '1.4rem' }}>📷</span>
                    <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600 }}>Add</span>
                    <input type="file" accept="image/*" multiple onChange={handlePhotoAdd} style={{ display: 'none' }} />
                  </label>
                )}
              </div>
              {photoErrors.length > 0 && (
                <div style={{ marginTop: 8, fontSize: '0.78rem', color: '#dc2626' }}>
                  {photoErrors.map((err, i) => <div key={i}>• {err}</div>)}
                </div>
              )}
            </div>

            <button onClick={submitSupport} disabled={sendingSupport} style={{
              ...s.btnPrimary, width: '100%', padding: '14px', fontSize: '0.95rem',
              opacity: sendingSupport ? 0.7 : 1, cursor: sendingSupport ? 'not-allowed' : 'pointer',
            }}>
              {sendingSupport ? '⏳ Submitting Ticket...' : '📨 Submit Support Ticket'}
            </button>
            <div style={{ textAlign: 'center', marginTop: 12, fontSize: '0.78rem', color: '#94a3b8' }}>
              ⏱ We typically respond within 2–4 hours during business hours
            </div>
            {supportMsg && (
              <div style={{ ...supportMsg.ok ? s.msgOk : s.msgErr, marginTop: '16px', textAlign: 'center' }}>
                {supportMsg.ok ? '✅ ' : '❌ '}{supportMsg.text}
              </div>
            )}

            <hr style={s.divider} />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              {[
                { icon: '📞', title: 'Phone', value: '+233 24 789 1234', sub: 'Mon–Fri, 8am–5pm' },
                { icon: '📧', title: 'Email', value: 'support@postal.com', sub: 'Response within 24hrs' },
                { icon: '🏢', title: 'Office', value: 'Accra, Ghana', sub: 'Mon–Fri, 8am–5pm' },
              ].map(c => (
                <div key={c.title} style={{ background: '#f8fafc', borderRadius: 12, padding: '16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1.3rem' }}>{c.icon}</span>
                  <div>
                    <p style={{ margin: '0 0 2px', fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}>{c.title}</p>
                    <p style={{ margin: '0 0 2px', color: '#475569', fontSize: '0.82rem' }}>{c.value}</p>
                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.75rem' }}>{c.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}