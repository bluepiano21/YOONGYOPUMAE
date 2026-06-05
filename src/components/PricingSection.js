/* eslint-disable */
"use client";

import React, { useState } from "react";

const BASIC_AREAS = ["고현", "장평", "상문", "수월", "중곡", "옥포", "아주", "사곡"];

const ADD_ON_OPTIONS = [
  { key: "preMeeting",    label: "🤝 사전만남",        desc: "(1회)",         price: 10000 },
  { key: "medication",    label: "💊 투약",           desc: "(1회)",         price: 5000  },
  { key: "forcedFeeding", label: "🍼 강제급여",        desc: "(전문케어 1회)", price: 10000 },
  { key: "hospital",      label: "🏥 병원 방문 동행",   desc: "(1회)",         price: 20000 },
  { key: "twoVisits",     label: "🔁 1일 2회 방문",    desc: "",              price: 13000 },
  { key: "holiday",       label: "🎉 공휴일 / 명절",   desc: "",              price: 5000  },
];

export default function PricingSection({
  onBookingClick,
  days,
  setDays,
  area,
  setArea,
  opts,
  toggleOpt,
  leftContent,
  isFullyBooked
}) {

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
      <div className="container" style={{ maxWidth: "1200px" }}>
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
            className="text-2xl md:text-3xl"
            style={{
              fontWeight: "800",
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
              className="premium-card p-6 md:p-8"
              style={{ borderTop: `4px solid ${s.accent}` }}
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
        <div className="pricing-grid-container">
          {/* 왼쪽: 실시간 예약 현황 달력 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%" }}>
            {leftContent}
          </div>

          <div
            className="premium-card p-4 md:p-8 w-full"
            style={{
              background: "linear-gradient(135deg, hsl(215,60%,18%) 0%, hsl(215,70%,26%) 100%)",
              color: "white", border: "none",
              margin: "0 auto",
              maxWidth: "520px",
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
                    onClick={() => setDays(Math.max(1, days - 1))}
                    style={{ width: "36px", height: "36px", borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.1)", color: "white", fontSize: "1.2rem", cursor: "pointer" }}
                  >−</button>
                  <span style={{ fontSize: "1.5rem", fontWeight: "800", color: "white", minWidth: "36px", textAlign: "center" }}>{days}</span>
                  <button
                    onClick={() => setDays(Math.min(30, days + 1))}
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
                    { val: "기본", label: "🏠 기본 지역", tooltip: "기본 방문 가능 지역 (추가금 없음)" },
                    { val: "기타", label: "🗺️ 기타 (+5,000)", tooltip: "기본 8개 지역 외 거리 추가금 발생" },
                  ].map((a) => (
                    <button
                      key={a.val}
                      id={a.val === "기본" ? "demo-basic-area-btn" : "demo-other-area-btn"}
                      onClick={() => setArea(a.val)}
                      title={a.tooltip}
                      style={{
                        flex: 1, padding: "9px 8px", borderRadius: "8px",
                        border: `1.5px solid ${area === a.val ? "var(--primary-orange)" : "rgba(255,255,255,0.25)"}`,
                        background: area === a.val ? "var(--primary-orange)" : "rgba(255,255,255,0.08)",
                        color: "white", fontWeight: "700", fontSize: "0.8rem", cursor: "pointer",
                        transition: "all 0.2s ease"
                      }}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
                <div style={{
                  fontSize: "0.76rem",
                  color: "#ffd98c", // 선명하고 따뜻한 금색/노란색 톤
                  backgroundColor: "rgba(255, 179, 64, 0.12)", // 연한 엠버 배경
                  border: "1px solid rgba(255, 179, 64, 0.35)", // 엠버 테두리
                  padding: "10px 14px",
                  borderRadius: "8px",
                  marginTop: "10px",
                  lineHeight: "1.5",
                  fontWeight: "600"
                }}>
                  📢 <strong style={{ color: "#ffd98c" }}>기본 8개 지역 안내</strong>: 
                  <span style={{ color: "#ffffff", marginLeft: "4px" }}>
                    고현동, 장평동, 상문동, 수월동, 중곡동, 옥포동, 아주동, 사곡리
                  </span>
                  <div style={{ marginTop: "4px", fontSize: "0.72rem", color: "rgba(255, 255, 255, 0.8)", fontWeight: "500" }}>
                    * 기본 지역 외에는 동선과 이동 시간을 고려하여 <strong>5,000원의 거리 추가금</strong>이 발생합니다. ✨
                  </div>
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
                        padding: "8px 10px", borderRadius: "8px", cursor: "pointer",
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

              {/* 마감 안내 메세지 */}
              {isFullyBooked && (
                <div style={{
                  color: "#ef4444",
                  backgroundColor: "#fee2e2",
                  border: "1.5px solid #fca5a5",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  fontSize: "0.85rem",
                  fontWeight: "800",
                  textAlign: "center",
                  lineHeight: "1.5",
                  marginBottom: "12px"
                }}>
                  죄송합니다. 해당 날짜는 예약이 마감되었습니다. 🐾
                </div>
              )}

              {/* CTA 버튼 */}
              {onBookingClick && (
                <button
                  id="demo-submit-btn"
                  onClick={onBookingClick}
                  disabled={isFullyBooked}
                  style={{
                    width: "100%", 
                    padding: "16px 20px", 
                    fontSize: "1.05rem", 
                    fontWeight: "850", 
                    marginTop: "20px",
                    backgroundColor: isFullyBooked ? "#9ca3af" : "var(--primary-orange)",
                    color: "white",
                    border: "none",
                    borderRadius: "12px",
                    cursor: isFullyBooked ? "not-allowed" : "pointer",
                    boxShadow: isFullyBooked ? "none" : "0 6px 20px rgba(255, 112, 67, 0.3)",
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    opacity: isFullyBooked ? 0.7 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!isFullyBooked) {
                      e.currentTarget.style.backgroundColor = "var(--primary-orange-hover)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 8px 24px rgba(255, 112, 67, 0.4)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isFullyBooked) {
                      e.currentTarget.style.backgroundColor = "var(--primary-orange)";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 6px 20px rgba(255, 112, 67, 0.3)";
                    }
                  }}
                >
                  📅 예약하러 가기 ➔
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
