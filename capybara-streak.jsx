import { useState, useEffect } from "react";

const STORAGE_KEY = "capy-streak-v1";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function CapybaraFace({ happy, eating }) {
  return (
    <svg width="220" height="180" viewBox="0 0 220 180" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="110" cy="140" rx="75" ry="45" fill="#C8976E" />
      <ellipse cx="110" cy="95" rx="62" ry="54" fill="#D4A574" />
      <ellipse cx="110" cy="118" rx="32" ry="22" fill="#C8976E" />
      <ellipse cx="101" cy="113" rx="5" ry="6" fill="#8B5E3C" />
      <ellipse cx="119" cy="113" rx="5" ry="6" fill="#8B5E3C" />
      {happy ? (
        <>
          <path d="M 76 88 Q 85 78 94 88" stroke="#2C1810" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M 126 88 Q 135 78 144 88" stroke="#2C1810" strokeWidth="3" fill="none" strokeLinecap="round" />
          <text x="53" y="73" fontSize="15" fill="#FFD700">✦</text>
          <text x="151" y="73" fontSize="15" fill="#FFD700">✦</text>
          <path d="M 94 126 Q 110 138 126 126" stroke="#8B5E3C" strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <ellipse cx="85" cy="88" rx="11" ry="12" fill="#2C1810" />
          <ellipse cx="135" cy="88" rx="11" ry="12" fill="#2C1810" />
          <ellipse cx="89" cy="84" rx="4" ry="4" fill="white" />
          <ellipse cx="139" cy="84" rx="4" ry="4" fill="white" />
          <path d="M 96 128 Q 110 124 124 128" stroke="#8B5E3C" strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      )}
      <ellipse cx="58" cy="58" rx="16" ry="12" fill="#C8976E" />
      <ellipse cx="162" cy="58" rx="16" ry="12" fill="#C8976E" />
      <ellipse cx="58" cy="58" rx="10" ry="7" fill="#D4A574" />
      <ellipse cx="162" cy="58" rx="10" ry="7" fill="#D4A574" />
      <ellipse cx="55" cy="165" rx="22" ry="12" fill="#C8976E" />
      <ellipse cx="165" cy="165" rx="22" ry="12" fill="#C8976E" />
      {eating && (
        <g>
          <circle cx="170" cy="148" r="16" fill="#FF8C00" />
          <circle cx="170" cy="148" r="12" fill="#FFA500" />
          <circle cx="170" cy="148" r="8" fill="#FFB732" />
          <line x1="170" y1="132" x2="170" y2="137" stroke="#4A7C59" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 170 132 Q 176 128 180 130" stroke="#4A7C59" strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
}

export default function App() {
  const [streak, setStreak] = useState(0);
  const [oranges, setOranges] = useState(0);
  const [lastCheckin, setLastCheckin] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const [bouncing, setBouncing] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const result = await window.storage.get(STORAGE_KEY);
        if (result) {
          const d = JSON.parse(result.value);
          setStreak(d.streak ?? 0);
          setOranges(d.oranges ?? 0);
          setLastCheckin(d.lastCheckin ?? null);
          setHistory(d.history ?? []);
        }
      } catch (_) {}
      setLoading(false);
    }
    load();
  }, []);

  async function persist(updates) {
    const payload = { streak, oranges, lastCheckin, history, ...updates };
    try {
      await window.storage.set(STORAGE_KEY, JSON.stringify(payload));
    } catch (_) {}
  }

  const today = todayStr();
  const alreadyCheckedIn = lastCheckin === today;

  function handleHealthyDay() {
    if (alreadyCheckedIn) return;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().slice(0, 10);
    const newStreak = lastCheckin === yStr ? streak + 1 : 1;
    const newOranges = oranges + 1;
    const newHistory = [...history, today];
    setStreak(newStreak);
    setOranges(newOranges);
    setLastCheckin(today);
    setHistory(newHistory);
    persist({ streak: newStreak, oranges: newOranges, lastCheckin: today, history: newHistory });
    setBouncing(true);
    setShowCelebration(true);
    setTimeout(() => setBouncing(false), 1400);
    setTimeout(() => setShowCelebration(false), 3200);
  }

  function handleReset() {
    setStreak(0); setOranges(0); setLastCheckin(null); setHistory([]);
    persist({ streak: 0, oranges: 0, lastCheckin: null, history: [] });
  }

  const isHappy = alreadyCheckedIn && oranges > 0;

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#111c11", color: "#9DC08B", fontFamily: "sans-serif", fontSize: "18px" }}>
      Loading...
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #111c11 0%, #1e3320 50%, #162a20 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 16px",
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&family=Baloo+2:wght@400;600;800&display=swap');
        * { box-sizing: border-box; }
        @keyframes bounce {
          0%,100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-20px) rotate(-3deg); }
          60% { transform: translateY(-8px) rotate(2deg); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes celebPop {
          0%   { transform: translateX(-50%) scale(0.6); opacity: 0; }
          65%  { transform: translateX(-50%) scale(1.08); opacity: 1; }
          100% { transform: translateX(-50%) scale(1); opacity: 1; }
        }
        @keyframes celebFade {
          0%,75% { opacity: 1; }
          100%    { opacity: 0; }
        }
        @keyframes confetti {
          from { transform: translateY(-30px) rotate(0deg); opacity: 1; }
          to   { transform: translateY(105vh) rotate(600deg); opacity: 0; }
        }
        @keyframes popIn {
          from { transform: scale(0) rotate(-15deg); opacity: 0; }
          to   { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes glow {
          0%,100% { box-shadow: 0 0 16px rgba(255,165,0,0.25); }
          50%      { box-shadow: 0 0 36px rgba(255,165,0,0.6); }
        }
        .capy { animation: ${bouncing ? "bounce 0.7s ease 2" : "none"}; }
        .checkin-btn {
          font-family: 'Baloo 2', cursive;
          font-size: 17px;
          font-weight: 800;
          background: linear-gradient(135deg, #ff8c00, #ffc200);
          color: #1a0e00;
          border: none;
          border-radius: 50px;
          padding: 15px 32px;
          cursor: pointer;
          width: 100%;
          letter-spacing: 0.3px;
          transition: transform 0.15s, box-shadow 0.15s, opacity 0.2s;
          box-shadow: 0 4px 22px rgba(255,140,0,0.45);
        }
        .checkin-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(255,165,0,0.55);
        }
        .checkin-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      {showCelebration && Array.from({ length: 28 }).map((_, i) => (
        <div key={i} style={{
          position: "fixed",
          left: `${Math.random() * 100}%`,
          top: "-30px",
          fontSize: `${13 + Math.random() * 14}px`,
          pointerEvents: "none",
          zIndex: 999,
          animation: `confetti ${1.4 + Math.random() * 1.8}s ease-in ${Math.random() * 0.7}s forwards`,
        }}>
          {["🍊","🌿","⭐","✨","🎉","💚"][Math.floor(Math.random() * 6)]}
        </div>
      ))}

      {showCelebration && (
        <div style={{
          position: "fixed", top: "9%", left: "50%",
          background: "linear-gradient(135deg, #ff8c00, #ffd000)",
          color: "#1a0e00",
          padding: "14px 28px",
          borderRadius: "18px",
          fontFamily: "'Baloo 2', cursive",
          fontSize: "20px",
          fontWeight: "800",
          zIndex: 1000,
          pointerEvents: "none",
          boxShadow: "0 8px 40px rgba(255,140,0,0.55)",
          animation: "celebPop 0.45s ease forwards, celebFade 3.2s ease forwards",
          whiteSpace: "nowrap",
        }}>
          🍊 Day {streak} — orange delivered!
        </div>
      )}

      <div style={{ textAlign: "center", marginBottom: "10px", animation: "fadeUp 0.5s ease" }}>
        <h1 style={{
          fontFamily: "'Baloo 2', cursive",
          fontWeight: 800,
          fontSize: "clamp(26px, 7vw, 40px)",
          color: "#f5e6c8",
          margin: "0 0 2px",
          letterSpacing: "-0.5px",
        }}>
          Capy's Healthy Streak 🌿
        </h1>
        <p style={{
          fontFamily: "'Nunito', sans-serif",
          fontWeight: 400,
          color: "#78a87a",
          fontSize: "14px",
          margin: 0,
          fontStyle: "italic",
        }}>
          Skip the junk. Earn an orange. Make capy happy.
        </p>
      </div>

      <div style={{
        background: "rgba(255,255,255,0.055)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "28px",
        padding: "28px 24px",
        maxWidth: "360px",
        width: "100%",
        textAlign: "center",
        animation: "fadeUp 0.7s ease",
        boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
      }}>
        <div className="capy" style={{ marginBottom: "10px" }}>
          <CapybaraFace happy={isHappy} eating={alreadyCheckedIn} />
        </div>

        <p style={{
          fontFamily: "'Nunito', sans-serif",
          fontWeight: 700,
          color: isHappy ? "#FFD700" : "#78a87a",
          fontSize: "14px",
          margin: "0 0 20px",
          minHeight: "20px",
        }}>
          {alreadyCheckedIn
            ? "Mmm, juicy! Thank you! 🍊"
            : streak > 0
              ? "I'm waiting for today's orange... 👀"
              : "Stay healthy and give me an orange!"}
        </p>

        <div style={{ display: "flex", gap: "14px", marginBottom: "22px", justifyContent: "center" }}>
          {[
            { value: streak, label: "Day Streak", icon: "🔥", glow: streak > 0 },
            { value: oranges, label: "Oranges", icon: "🍊", glow: false },
          ].map(({ value, label, icon, glow }) => (
            <div key={label} style={{
              flex: 1,
              background: "rgba(255,140,0,0.12)",
              border: "1px solid rgba(255,140,0,0.22)",
              borderRadius: "16px",
              padding: "14px 10px",
              animation: glow ? "glow 2s ease infinite" : "none",
            }}>
              <div style={{ fontFamily: "'Baloo 2', cursive", fontWeight: 800, fontSize: "34px", color: "#FFD700", lineHeight: 1 }}>
                {value}
              </div>
              <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: "11px", color: "#c8976e", letterSpacing: "0.8px", textTransform: "uppercase", marginTop: "4px" }}>
                {icon} {label}
              </div>
            </div>
          ))}
        </div>

        {oranges > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", justifyContent: "center", marginBottom: "20px" }}>
            {Array.from({ length: Math.min(oranges, 14) }).map((_, i) => (
              <span key={i} style={{ fontSize: "18px", animation: "popIn 0.3s ease" }}>🍊</span>
            ))}
            {oranges > 14 && (
              <span style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: "12px", color: "#FF8C00", alignSelf: "center" }}>
                +{oranges - 14} more
              </span>
            )}
          </div>
        )}

        <button className="checkin-btn" onClick={handleHealthyDay} disabled={alreadyCheckedIn}>
          {alreadyCheckedIn ? "✓ Checked in today!" : "🥦 I ate healthy today!"}
        </button>

        {alreadyCheckedIn && (
          <p style={{ fontFamily: "'Nunito', sans-serif", color: "#78a87a", fontSize: "12px", marginTop: "10px", marginBottom: 0 }}>
            Come back tomorrow to keep the streak! 💚
          </p>
        )}
      </div>

      {history.length > 0 && (
        <div style={{ marginTop: "18px", textAlign: "center", animation: "fadeUp 1s ease" }}>
          <p style={{ fontFamily: "'Nunito', sans-serif", color: "rgba(255,255,255,0.35)", fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "8px" }}>
            Last {Math.min(history.length, 14)} healthy days
          </p>
          <div style={{ display: "flex", gap: "6px", justifyContent: "center", flexWrap: "wrap" }}>
            {history.slice(-14).map((d, i) => (
              <div key={i} title={d} style={{ width: "11px", height: "11px", borderRadius: "50%", background: "linear-gradient(135deg, #ff8c00, #ffd000)", boxShadow: "0 2px 6px rgba(255,140,0,0.4)" }} />
            ))}
          </div>
        </div>
      )}

      <button onClick={handleReset} style={{
        marginTop: "18px", background: "none", border: "none",
        color: "rgba(255,255,255,0.18)", fontSize: "11px", cursor: "pointer",
        fontFamily: "'Nunito', sans-serif", transition: "color 0.2s",
      }}
        onMouseEnter={e => e.target.style.color = "rgba(255,255,255,0.45)"}
        onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.18)"}
      >
        reset everything
      </button>
    </div>
  );
}
