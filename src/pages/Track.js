import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Track() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [parcel, setParcel] = useState(null);
  const [events, setEvents] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const isMobile = window.innerWidth < 768;

  const handleTrack = async () => {
    if (!trackingNumber.trim()) {
      setMessage('Please enter a tracking number.');
      return;
    }
    setLoading(true);
    setParcel(null);
    setEvents([]);
    setMessage('');

    try {
      const res = await fetch('https://postaltrack-backend.onrender.com/api/parcels/track/' + trackingNumber);
      const data = await res.json();
      if (data.error) {
        setMessage(data.error);
        setParcel(null);
      } else {
        setParcel(data);
        setMessage('');
        fetchEvents(data.parcel_id);
      }
    } catch (err) {
      setMessage('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  const fetchEvents = async (parcel_id) => {
    try {
      const res = await fetch('https://postaltrack-backend.onrender.com/api/parcels/events/' + parcel_id);
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      console.log(err);
    }
  };

  // Status steps for progress bar
  const statusSteps = [
    'Parcel Booked',
    'Dispatched',
    'In Transit',
    'Out for Delivery',
    'Delivered',
  ];

  const getCurrentStep = (status) => {
    if (!status) return 0;
    const s = status.toLowerCase();
    if (s.includes('delivered') && !s.includes('out')) return 4;
    if (s.includes('out')) return 3;
    if (s.includes('transit')) return 2;
    if (s.includes('dispatch')) return 1;
    return 0;
  };

  const currentStep = parcel ? getCurrentStep(parcel.current_status) : -1;

  return (
    <div
      style={{
        fontFamily: "'Segoe UI', sans-serif",
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #d8f3dc 0%, #f5f7fb 45%, #caf0f8 100%)',
      }}
    >
      {/* NAVBAR */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          padding: isMobile ? '15px 20px' : '18px 70px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(15px)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <Link to="/" style={{ textDecoration: 'none' }}>
          <div
            style={{
              color: '#1b4332',
              fontSize: isMobile ? '1.4rem' : '1.7rem',
              fontWeight: '800',
            }}
          >
            Postal<span style={{ color: '#52b788' }}>Track</span>
          </div>
        </Link>

        <Link to="/" style={{ textDecoration: 'none' }}>
          <button
            style={{
              padding: '10px 22px',
              borderRadius: '8px',
              border: '2px solid #52b788',
              background: 'white',
              color: '#2d6a4f',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '0.9rem',
            }}
          >
            ← Back to Home
          </button>
        </Link>
      </nav>

      {/* MAIN CONTENT */}
      <div
        style={{
          paddingTop: '100px',
          paddingBottom: '60px',
          paddingLeft: isMobile ? '20px' : '0',
          paddingRight: isMobile ? '20px' : '0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* PAGE TITLE */}
        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
          <div
            style={{
              display: 'inline-block',
              padding: '8px 18px',
              borderRadius: '30px',
              background: 'rgba(82,183,136,0.15)',
              border: '1px solid rgba(82,183,136,0.3)',
              color: '#2d6a4f',
              fontSize: '0.85rem',
              marginBottom: '15px',
              fontWeight: '600',
            }}
          >
            🚚 Real-Time Parcel Tracking
          </div>

          <h1
            style={{
              color: '#081c15',
              fontSize: isMobile ? '2rem' : '2.8rem',
              fontWeight: '900',
              margin: '0 0 10px 0',
            }}
          >
            Track Your Parcel
          </h1>

          <p style={{ color: '#4f5d75', fontSize: '1rem' }}>
            Enter your tracking number below to get live updates
          </p>
        </div>

        {/* SEARCH BOX */}
        <div
          style={{
            width: isMobile ? '100%' : '580px',
            background: 'rgba(255,255,255,0.9)',
            borderRadius: '20px',
            padding: '30px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.08)',
            border: '1px solid rgba(0,0,0,0.05)',
            marginBottom: '30px',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '12px',
              flexDirection: isMobile ? 'column' : 'row',
            }}
          >
            <input
              placeholder="e.g. TRK177889329"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
              style={{
                flex: 1,
                padding: '14px 18px',
                borderRadius: '10px',
                border: '2px solid #d8f3dc',
                fontSize: '1rem',
                outline: 'none',
                fontFamily: "'Segoe UI', sans-serif",
                color: '#081c15',
                background: '#f8fffe',
              }}
            />

            <button
              onClick={handleTrack}
              disabled={loading}
              style={{
                padding: '14px 28px',
                borderRadius: '10px',
                border: 'none',
                background: loading ? '#95d5b2' : '#52b788',
                color: 'white',
                fontWeight: '700',
                fontSize: '1rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: '0 8px 20px rgba(82,183,136,0.35)',
              }}
            >
              {loading ? 'Searching...' : '🔍 Track'}
            </button>
          </div>

          {/* ERROR MESSAGE */}
          {message && (
            <div
              style={{
                marginTop: '15px',
                padding: '12px 16px',
                borderRadius: '10px',
                background: '#fff0f0',
                border: '1px solid #ffcccc',
                color: '#c1121f',
                fontWeight: '600',
                fontSize: '0.9rem',
              }}
            >
              ⚠️ {message}
            </div>
          )}
        </div>

        {/* PARCEL RESULT */}
        {parcel && (
          <div
            style={{
              width: isMobile ? '100%' : '580px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            {/* STATUS CARD */}
            <div
              style={{
                background: 'rgba(255,255,255,0.95)',
                borderRadius: '20px',
                padding: '28px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.08)',
                border: '1px solid rgba(0,0,0,0.05)',
              }}
            >
              {/* Tracking header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '25px',
                }}
              >
                <div>
                  <p
                    style={{
                      color: '#6c757d',
                      margin: 0,
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                    }}
                  >
                    Tracking Number
                  </p>
                  <h2
                    style={{
                      color: '#081c15',
                      margin: '5px 0 0 0',
                      fontSize: '1.3rem',
                      fontWeight: '800',
                    }}
                  >
                    {parcel.tracking_number}
                  </h2>
                </div>

                <div
                  style={{
                    background: currentStep === 4 ? '#52b788' : '#fff3cd',
                    color: currentStep === 4 ? 'white' : '#856404',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontWeight: '700',
                    fontSize: '0.8rem',
                  }}
                >
                  {currentStep === 4 ? '✅ Delivered' : '🔄 In Progress'}
                </div>
              </div>

              {/* Progress Steps */}
              <div style={{ marginBottom: '25px' }}>
                {statusSteps.map((step, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      marginBottom: '14px',
                    }}
                  >
                    {/* Circle */}
                    <div
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        background: i <= currentStep ? '#52b788' : '#e9ecef',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        fontSize: '0.7rem',
                        color: 'white',
                        fontWeight: '700',
                      }}
                    >
                      {i <= currentStep ? '✓' : ''}
                    </div>

                    {/* Label */}
                    <span
                      style={{
                        color: i <= currentStep ? '#081c15' : '#adb5bd',
                        fontWeight: i <= currentStep ? '700' : '500',
                        fontSize: '0.95rem',
                      }}
                    >
                      {step}
                    </span>

                    {/* Active badge */}
                    {i === currentStep && (
                      <span
                        style={{
                          marginLeft: 'auto',
                          background: 'rgba(82,183,136,0.15)',
                          color: '#2d6a4f',
                          padding: '3px 10px',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                        }}
                      >
                        Current
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div
                style={{
                  height: '1px',
                  background: '#f0f0f0',
                  marginBottom: '20px',
                }}
              />

              {/* Parcel Details Grid */}
              <h3
                style={{
                  color: '#1b4332',
                  marginBottom: '15px',
                  fontSize: '1rem',
                  fontWeight: '700',
                }}
              >
                📦 Parcel Details
              </h3>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '14px',
                }}
              >
                {[
                  { label: 'Recipient', value: parcel.recipient_name },
                  { label: 'Address', value: parcel.recipient_address },
                  { label: 'Weight', value: `${parcel.weight_kg} kg` },
                  {
                    label: 'Booked On',
                    value: new Date(parcel.created_at).toLocaleDateString(
                      'en-GB',
                      { day: 'numeric', month: 'short', year: 'numeric' }
                    ),
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    style={{
                      background: '#f8fffe',
                      padding: '12px 15px',
                      borderRadius: '10px',
                      border: '1px solid #e8f5e9',
                    }}
                  >
                    <p
                      style={{
                        color: '#6c757d',
                        margin: 0,
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      {item.label}
                    </p>
                    <p
                      style={{
                        color: '#081c15',
                        margin: '4px 0 0 0',
                        fontWeight: '600',
                        fontSize: '0.9rem',
                      }}
                    >
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* TRACKING HISTORY */}
            {events.length > 0 && (
              <div
                style={{
                  background: 'rgba(255,255,255,0.95)',
                  borderRadius: '20px',
                  padding: '28px',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.08)',
                  border: '1px solid rgba(0,0,0,0.05)',
                }}
              >
                <h3
                  style={{
                    color: '#1b4332',
                    marginBottom: '20px',
                    fontSize: '1rem',
                    fontWeight: '700',
                  }}
                >
                  📍 Tracking History
                </h3>

                {events.map((event, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      gap: '15px',
                      marginBottom: index < events.length - 1 ? '20px' : '0',
                    }}
                  >
                    {/* Timeline dot */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          background: index === 0 ? '#52b788' : '#d8f3dc',
                          border: '2px solid #52b788',
                          flexShrink: 0,
                          marginTop: '4px',
                        }}
                      />
                      {index < events.length - 1 && (
                        <div
                          style={{
                            width: '2px',
                            flex: 1,
                            background: '#d8f3dc',
                            marginTop: '4px',
                            minHeight: '30px',
                          }}
                        />
                      )}
                    </div>

                    {/* Event details */}
                    <div style={{ paddingBottom: '8px' }}>
                      <p
                        style={{
                          margin: 0,
                          fontWeight: '700',
                          color: '#081c15',
                          fontSize: '0.9rem',
                        }}
                      >
                        {event.status_code}
                      </p>
                      <p
                        style={{
                          margin: '3px 0',
                          color: '#4f5d75',
                          fontSize: '0.85rem',
                        }}
                      >
                        📍 {event.location}
                      </p>
                      <p
                        style={{
                          margin: '3px 0',
                          color: '#4f5d75',
                          fontSize: '0.85rem',
                        }}
                      >
                        {event.event_description}
                      </p>
                      <p
                        style={{
                          margin: '3px 0',
                          color: '#adb5bd',
                          fontSize: '0.8rem',
                        }}
                      >
                        🕐 {new Date(event.event_timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Track;