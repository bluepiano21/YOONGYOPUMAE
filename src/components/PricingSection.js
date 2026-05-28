/* eslint-disable */
"use client";

import React, { useState } from "react";

const BASIC_AREAS = ["고현", "장평", "상문", "수월", "중곡", "옥포", "아주", "사곡"];

const ADD_ON_OPTIONS = [
  { key: "medication",    label: "💊 투약",           desc: "(1회)",         price: 5000  },
  { key: "forcedFeeding", label: "🍼 강제급여",        desc: "(전문케어 1회)", price: 10000 },
  { key: "hospital",      label: "🏥 병원 방문 동행",   desc: "(1회)",         price: 20000 },
  { key: "twoVisits",     label: "🔁 1일 2회 방문",    desc: "",              price: 13000 },
  { key: "holiday",       label: "🎉 공휴일 / 명절",   desc: "",              price: 5000  },
];

export default function PricingSection({ onBookingClick }) {
  const [days, setDays]   = useState(1);
  const [area, setArea]   = useState("기본");
  const [opts, setOpts]   = useState({
    medication: false, forcedFeeding: false,
    hospital: false, twoVisits: false, holiday: false,
  });

  const toggleOpt = (key) =>
    setOpts((prev) => ({ ...prev, [key]: !prev[key] }));

  const basePrice  = 17000 * days;
  const extraPrice =
    (area === "기타" ? 5000 : 0) +
    ADD_ON_OPTIONS.reduce((sum, o) => sum + (opts[o.key] ? o.price : 0), 0);
  const totalPrice = basePrice + extraPrice;

  return (
    <section
      id="pricing"
      style={{
        padding: "80px 0",
        background:
          "linear-gradient(180deg, var(--bg-primary) 0%, hsl(38,50%,92%) 100%)",
        borderTop: "1.5px solid var(--border-light)",
      }}
    >
      <div className="container" style={{ maxWidth: "1100px" }}>
        {/* ── 섹션 헤더 ── */}
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <span
            style={{
              backgroundColor: "var(--success-mint-light)",
              color: "var(--success-mint)",
              fontSize: "0.8rem", fontWeight: "800",
              padding: "6px 14px", borderRadius: "20px",
              display: "inline-block", letterSpacing: "0.5px",
            }}
          >
            💰 투명한 요금 공개
          </span>
          <h2
            style={{
              fontSize: "2.2rem", fontWeight: "800",
              color: "var(--text-main)", marginTop: "14px", marginBottom: "10px",
            }}
          >
            서비스 &amp; 요금 안내
          </h2>
          <p style={{ fontSize: "1rem", color: "var(--text-muted)", lineHeight: "1.6" }}>
            숨겨진 비용 없이, 아래 계산기로 내 상황에 맞는 예상 요금을 바로 확인하세요.
          </p>
        </div>

        {/* ── 서비스 카드 3개 ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "24px", marginBottom: "56px",
          }}
        >
          {[
            {
              icon: "🏠", title: "방문 탁묘",
              desc: "보호자 댁으로 직접 방문해 급여·물·화장실·놀이를 케어합니다. 낯선 환경 스트레스 없이 집에서 편안하게 돌봄 받아요.",
              badge: "기본요금 (1회 ~30분)", badgeVal: "17,000원",
              accent: "var(--primary-orange)", accentLight: "var(--primary-orange-light)",
            },
            {
              icon: "💊", title: "요양보호 & 회복케어",
              desc: "노령묘·노령견, 수술 후 회복, 투약·강제급여가 필요한 아이 전문 케어. 10년 경험과 자격으로 의료적 필요를 안전하게 돌봅니다.",
              badge: "투약 추가 (1회)", badgeVal: "+5,000원",
              accent: "var(--success-mint)", accentLight: "var(--success-mint-light)",
            },
            {
              icon: "📷", title: "돌봄 일지 & 사진 공유",
              desc: "매 방문 후 사진·영상과 함께 돌봄 일지를 카카오톡 또는 문자로 전송해드립니다. 멀리서도 아이 상태를 생생하게 확인하세요.",
              badge: "일지 전송", badgeVal: "기본 포함",
              accent: "hsl(215,60%,35%)", accentLight: "hsl(215,60%,94%)",
            },
          ].map((s) => (
            <div
              key={s.title}
              className="premium-card"
              style={{ padding: "36px 28px", borderTop: `4px solid ${s.accent}` }}
            >
              <div style={{ fontSize: "2.2rem", marginBottom: "16px" }}>{s.icon}</div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--text-main)", marginBottom: "10px" }}>
                {s.title}
              </h3>
              <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", lineHeight: "1.65", marginBottom: "20px" }}>
                {s.desc}
              </p>
              <div
                style={{
                  backgroundColor: s.accentLight, borderRadius: "10px",
                  padding: "14px 18px", display: "flex",
                  justifyContent: "space-between", alignItems: "center",
                }}
              >
                <span style={{ fontSize: "0.82rem", fontWeight: "700", color: s.accent }}>{s.badge}</span>
                <strong style={{ fontSize: "1.25rem", fontWeight: "900", color: s.accent }}>{s.badgeVal}</strong>
              </div>
            </div>
          ))}
        </div>

        {/* ── 요금표 + 계산기 2열 ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: "32px", alignItems: "start",
          }}
        >
          {/* 왼쪽: 추가 서비스 요금표 */}
          <div className="premium-card" style={{ padding: "32px 28px" }}>
            <h3 style={{ fontSize: "1.05rem", fontWeight: "800", color: "var(--text-main)", marginBottom: "20px" }}>
              💼 추가 서비스 요금표
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                { icon: "🤝", name: "사전 만남 (상담 방문)",          price: "10,000원" },
                { icon: "💊", name: "투약 1회",                       price: "+5,000원" },
                { icon: "🍼", name: "강제급여 1회 (전문케어)",          price: "+10,000원" },
                { icon: "🏥", name: "병원 방문 동행 1회",              price: "+20,000원" },
                { icon: "📍", name: "기타 지역 (기본 8개 지역 외)",    price: "+5,000원" },
                { icon: "🐶", name: "강아지 1마리 추가",               price: "+8,000원" },
                { icon: "🔁", name: "1일 2회 방문",                    price: "+13,000원" },
                { icon: "🎉", name: "법정 공휴일 / 명절",              price: "+5,000원" },
              ].map((row, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "10px 14px", borderRadius: "8px",
                    backgroundColor: i % 2 === 0 ? "var(--bg-primary)" : "white",
                    border: "1px solid var(--border-light)",
                  }}
                >
                  <span style={{ fontSize: "0.84rem", fontWeight: "600", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "8px" }}>
                    {row.icon} {row.name}
                  </span>
                  <strong style={{ fontSize: "0.88rem", color: "var(--primary-orange)", fontWeight: "800", whiteSpace: "nowrap" }}>
                    {row.price}
                  </strong>
                </div>
              ))}
            </div>
            <div
              style={{
                marginTop: "16px", padding: "12px 14px",
                backgroundColor: "var(--warning-coral-light)",
                borderRadius: "8px", border: "1px solid var(--warning-coral)",
                fontSize: "0.78rem", color: "var(--warning-coral)", lineHeight: "1.6", fontWeight: "600",
              }}
            >
              ⚠️ 기본 방문 지역: 고현·장평·상문·수월·중곡·옥포·아주·사곡 (추가금 없음)
              <br />다묘가정 및 강아지 함께 돌봄은 난이도에 따라 추가요금 발생 가능
            </div>
          </div>

          {/* 오른쪽: 실시간 계산기 */}
          <div
            className="premium-card"
            style={{
              padding: "32px 28px",
              background: "linear-gradient(135deg, hsl(215,60%,18%) 0%, hsl(215,70%,26%) 100%)",
              color: "white", border: "none",
            }}
          >
            <h3 style={{ fontSize: "1.05rem", fontWeight: "800", color: "white", marginBottom: "4px" }}>
              🧮 실시간 예상 요금 계산기
            </h3>
            <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.6)", marginBottom: "24px" }}>
              조건을 선택하면 예상 요금이 즉시 계산됩니다.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {/* 방문 일수 스테퍼 */}
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "700", color: "rgba(255,255,255,0.8)", marginBottom: "8px" }}>
                  📅 방문 일수
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <button
                    onClick={() => setDays((d) => Math.max(1, d - 1))}
                    style={{ width: "36px", height: "36px", borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.1)", color: "white", fontSize: "1.2rem", cursor: "pointer" }}
                  >−</button>
                  <span style={{ fontSize: "1.5rem", fontWeight: "800", color: "white", minWidth: "36px", textAlign: "center" }}>{days}</span>
                  <button
                    onClick={() => setDays((d) => Math.min(30, d + 1))}
                    style={{ width: "36px", height: "36px", borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.1)", color: "white", fontSize: "1.2rem", cursor: "pointer" }}
                  >+</button>
                  <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.55)" }}>일</span>
                </div>
              </div>

              {/* 지역 선택 */}
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "700", color: "rgba(255,255,255,0.8)", marginBottom: "8px" }}>
                  📍 방문 지역
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  {[
                    { val: "기본", label: "🏠 기본 지역" },
                    { val: "기타", label: "🗺️ 기타 (+5,000)" },
                  ].map((a) => (
                    <button
                      key={a.val}
                      onClick={() => setArea(a.val)}
                      style={{
                        flex: 1, padding: "9px 8px", borderRadius: "8px",
                        border: `1.5px solid ${area === a.val ? "var(--primary-orange)" : "rgba(255,255,255,0.25)"}`,
                        background: area === a.val ? "var(--primary-orange)" : "rgba(255,255,255,0.08)",
                        color: "white", fontWeight: "700", fontSize: "0.8rem", cursor: "pointer",
                      }}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 추가 옵션 체크박스 */}
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "700", color: "rgba(255,255,255,0.8)", marginBottom: "8px" }}>
                  ➕ 추가 서비스
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {ADD_ON_OPTIONS.map((opt) => (
                    <label
                      key={opt.key}
                      style={{
                        display: "flex", alignItems: "center", gap: "10px",
                        padding: "8px 12px", borderRadius: "8px", cursor: "pointer",
                        border: `1px solid ${opts[opt.key] ? "var(--primary-orange)" : "rgba(255,255,255,0.15)"}`,
                        background: opts[opt.key] ? "rgba(255,127,63,0.2)" : "rgba(255,255,255,0.05)",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={opts[opt.key]}
                        onChange={() => toggleOpt(opt.key)}
                        style={{ accentColor: "var(--primary-orange)", width: "15px", height: "15px" }}
                      />
                      <span style={{ fontSize: "0.82rem", fontWeight: "600", color: "white" }}>
                        {opt.label} {opt.desc && <span style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.75rem" }}>{opt.desc}</span>} (+{opt.price.toLocaleString()}원)
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 요금 결과 박스 */}
              <div
                style={{
                  backgroundColor: "rgba(255,255,255,0.1)",
                  borderRadius: "12px", border: "1.5px solid rgba(255,255,255,0.2)",
                  padding: "20px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", color: "rgba(255,255,255,0.65)", marginBottom: "6px" }}>
                  <span>기본요금 (17,000 × {days}일)</span>
                  <span>{basePrice.toLocaleString()}원</span>
                </div>
                {extraPrice > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", color: "rgba(255,255,255,0.65)", marginBottom: "6px" }}>
                    <span>추가 서비스</span>
                    <span>+{extraPrice.toLocaleString()}원</span>
                  </div>
                )}
                <div
                  style={{
                    borderTop: "1px solid rgba(255,255,255,0.2)",
                    paddingTop: "12px", marginTop: "8px",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: "0.9rem", fontWeight: "700", color: "white" }}>예상 총 요금</span>
                  <strong style={{ fontSize: "1.9rem", fontWeight: "900", color: "var(--primary-orange)" }}>
                    {totalPrice.toLocaleString()}원
                  </strong>
                </div>
              </div>

              {/* CTA 버튼 */}
              <button
                onClick={onBookingClick}
                className="btn btn-primary"
                style={{ width: "100%", padding: "14px", fontSize: "0.95rem", fontWeight: "800" }}
              >
                📅 이 요금으로 예약 신청하기 →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
