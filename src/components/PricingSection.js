/* eslint-disable */
"use client";

import React, { useState } from "react";

const BASIC_AREAS = ["고현", "장평", "상문", "수월", "중곡", "옥포", "아주", "사곡"];

const GENERAL_OPTIONS = [
  { key: "holiday",       label: "🥳 명절/공휴일 예약",   desc: "(추가금 적용)",  price: 5000  },
  { key: "medication",    label: "💊 1회성 투약 서비스",  desc: "",              price: 5000  },
  { key: "preMeeting",    label: "🤝 사전만남",        desc: "(1회)",         price: 10000 },
  { key: "forcedFeeding", label: "🍼 강제급여",        desc: "(전문케어 1회)", price: 10000 },
  { key: "hospital",      label: "🏥 병원 방문 동행",   desc: "(1회)",         price: 20000 },
];

const NURSING_OPTIONS = [
  { key: "preMeeting",    label: "🤝 사전만남",        desc: "(1회)",         price: 10000 },
  { key: "forcedFeeding", label: "🍼 강제급여",        desc: "(전문케어 1회)", price: 10000 },
  { key: "hospital",      label: "🏥 병원 방문 동행",   desc: "(1회)",         price: 20000 },
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
  isFullyBooked,
  serviceChoice = "general",
  setServiceChoice,
  nursingPlan = "basic",
  setNursingPlan
}) {

  let basePricePerDay = 17000;
  if (serviceChoice === "nursing") {
    if (nursingPlan === "basic") basePricePerDay = 30000;
    else if (nursingPlan === "intensive") basePricePerDay = 55000;
    else if (nursingPlan === "medication") basePricePerDay = 15000;
    else if (nursingPlan === "package") basePricePerDay = 0;
  }

  const basePrice  = basePricePerDay * days;
  const activeOptions = serviceChoice === "general" ? GENERAL_OPTIONS : NURSING_OPTIONS;
  const extraPrice =
    (area === "기타" ? 5000 : 0) +
    activeOptions.reduce((sum, o) => sum + (opts[o.key] ? o.price : 0), 0);
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
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
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

        {/* ── 서비스 예약 채널 탭 선택 ── */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            marginBottom: "36px",
            flexWrap: "wrap"
          }}
        >
          <button
            onClick={() => setServiceChoice("general")}
            style={{
              padding: "16px 36px",
              borderRadius: "var(--border-radius-md)",
              border: serviceChoice === "general"
                ? "2px solid var(--primary-orange)"
                : "2px solid hsl(266, 20%, 88%)",
              background: serviceChoice === "general"
                ? "var(--primary-orange)"
                : "hsl(266, 30%, 97%)",
              color: serviceChoice === "general" ? "white" : "var(--text-muted)",
              fontWeight: "900",
              fontSize: "1.05rem",
              cursor: "pointer",
              boxShadow: serviceChoice === "general" ? "0 6px 16px rgba(94, 43, 184, 0.25)" : "none",
              transition: "all 0.2s ease",
              letterSpacing: "0.3px",
              minWidth: "260px"
            }}
          >
            🐶🐱 일반 펫시팅 예약 채널
          </button>
          <button
            onClick={() => setServiceChoice("nursing")}
            style={{
              padding: "16px 36px",
              borderRadius: "var(--border-radius-md)",
              border: serviceChoice === "nursing"
                ? "2px solid var(--primary-orange)"
                : "2px solid hsl(266, 20%, 88%)",
              background: serviceChoice === "nursing"
                ? "var(--primary-orange)"
                : "hsl(266, 30%, 97%)",
              color: serviceChoice === "nursing" ? "white" : "var(--text-muted)",
              fontWeight: "900",
              fontSize: "1.05rem",
              cursor: "pointer",
              boxShadow: serviceChoice === "nursing" ? "0 6px 16px rgba(94, 43, 184, 0.25)" : "none",
              transition: "all 0.2s ease",
              letterSpacing: "0.3px",
              minWidth: "260px"
            }}
          >
            🏥✨ 방문 요양 케어 예약 채널
          </button>
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
              background: "linear-gradient(135deg, hsl(266,55%,16%) 0%, hsl(266,45%,24%) 100%)",
              color: "white",
              border: "1.5px solid rgba(243, 205, 93, 0.25)",
              margin: "0 auto",
              maxWidth: "520px",
              boxShadow: "0 12px 36px rgba(100, 40, 180, 0.25), 0 0 0 1px rgba(243, 205, 93, 0.1)",
            }}
          >
            <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#white", marginBottom: "4px" }}>
              🧮 실시간 예상 요금 계산기
            </h3>
            <p style={{ fontSize: "0.82rem", color: "hsl(266,60%,92%)", marginBottom: "24px", fontWeight: "500" }}>
              조건을 선택하면 예상 요금이 즉시 계산됩니다.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {/* 방문 일수 스테퍼 */}
              <div>
                <label style={{ display: "block", fontSize: "0.88rem", fontWeight: "800", color: "#ffffff", marginBottom: "8px" }}>
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
                  <span style={{ fontSize: "0.9rem", color: "hsl(266,60%,92%)", fontWeight: "700" }}>일</span>
                </div>
              </div>

              {/* 요양 서비스 플랜 선택 (방문 요양 선택 시에만 노출) */}
              {serviceChoice === "nursing" && (
                <div>
                  <label style={{ display: "block", fontSize: "0.88rem", fontWeight: "800", color: "#ffffff", marginBottom: "8px" }}>
                    🏥 요양 케어 플랜 선택
                  </label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {[
                      { val: "basic", label: "🏠 기본 방문 요양", price: "30,000원/일", desc: "1일 1회 방문 (30~40분) | 식사, 배변, 정서 교감, 투약" },
                      { val: "intensive", label: "🔁 집중 방문 요양", price: "55,000원/일", desc: "1일 2회 방문 | 고령 동물, 질병 회복기 전용" },
                      { val: "medication", label: "💊 투약 전용 서비스", price: "15,000원/일", desc: "단독 투약 방문 (약물, 점안 등)" },
                      { val: "package", label: "📅 주간/월간 패키지", price: "별도 안내", desc: "주 3회 이상 이용 시 할인 적용" }
                    ].map((p) => (
                      <button
                        key={p.val}
                        onClick={() => setNursingPlan(p.val)}
                        style={{
                          padding: "12px 14px",
                          borderRadius: "8px",
                          border: `1.5px solid ${nursingPlan === p.val ? "#F3CD5D" : "rgba(255,255,255,0.15)"}`,
                          background: nursingPlan === p.val ? "rgba(243, 205, 93, 0.2)" : "rgba(255,255,255,0.05)",
                          color: "white",
                          textAlign: "left",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          width: "100%"
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                          <span style={{ fontWeight: "800", fontSize: "0.88rem", color: nursingPlan === p.val ? "#F3CD5D" : "white" }}>{p.label}</span>
                          <strong style={{ fontSize: "0.88rem", color: "#F3CD5D" }}>{p.price}</strong>
                        </div>
                        <div style={{ fontSize: "0.74rem", color: "rgba(255,255,255,0.6)" }}>{p.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 지역 선택 */}
              <div>
                <label style={{ display: "block", fontSize: "0.88rem", fontWeight: "800", color: "#ffffff", marginBottom: "8px" }}>
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
                        border: `1.5px solid ${area === a.val ? "#F3CD5D" : "rgba(255,255,255,0.25)"}`,
                        background: area === a.val ? "#F3CD5D" : "rgba(255,255,255,0.08)",
                        color: area === a.val ? "hsl(270,40%,12%)" : "white",
                        fontWeight: "800", fontSize: "0.85rem", cursor: "pointer",
                        transition: "all 0.2s ease"
                      }}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
                <div style={{
                  fontSize: "0.76rem",
                  color: "#ffd98c",
                  backgroundColor: "rgba(255, 179, 64, 0.12)",
                  border: "1px solid rgba(255, 179, 64, 0.35)",
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
                  <div style={{ marginTop: "4px", fontSize: "0.72rem", color: "rgba(255, 255, 255, 0.95)", fontWeight: "500" }}>
                    * 기본 지역 외에는 동선과 이동 시간을 고려하여 <strong>5,000원의 거리 추가금</strong>이 발생합니다. ✨
                  </div>
                </div>
              </div>

              {/* 추가 옵션 체크박스 */}
              <div>
                <label style={{ display: "block", fontSize: "0.88rem", fontWeight: "800", color: "#ffffff", marginBottom: "8px" }}>
                  ➕ 추가 서비스
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {activeOptions.map((opt) => (
                    <label
                      key={opt.key}
                      style={{
                        display: "flex", alignItems: "center", gap: "10px",
                        padding: "8px 12px", borderRadius: "8px", cursor: "pointer",
                        border: `1.5px solid ${opts[opt.key] ? "var(--gold-border)" : "rgba(255,255,255,0.12)"}`,
                        background: opts[opt.key] ? "rgba(243, 205, 93, 0.15)" : "rgba(255,255,255,0.04)",
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        if (!opts[opt.key]) {
                          e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                          e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!opts[opt.key]) {
                          e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                          e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                        }
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={opts[opt.key] || false}
                        onChange={() => toggleOpt(opt.key)}
                        style={{ accentColor: "#F3CD5D", width: "16px", height: "16px", cursor: "pointer" }}
                      />
                      <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "#ffffff", display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center" }}>
                        <span>
                          {opt.label} {opt.desc && <span style={{ color: "hsl(266,60%,90%)", fontSize: "0.75rem", fontWeight: "500" }}>{opt.desc}</span>}
                        </span>
                        <span style={{ color: opts[opt.key] ? "#F3CD5D" : "hsl(266,60%,90%)", fontWeight: "800" }}>
                          +{opt.price.toLocaleString()}원
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
                {/* 명절/공휴일 기준 안내 문구 */}
                {serviceChoice === "general" && (
                  <div style={{
                    marginTop: "8px",
                    fontSize: "0.74rem",
                    color: "hsl(266,60%,92%)",
                    lineHeight: "1.4",
                    padding: "8px 10px",
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    borderRadius: "6px",
                    border: "1px solid rgba(255, 255, 255, 0.1)"
                  }}>
                    ℹ️ <strong>명절/공휴일 기준</strong>: 신정, 설날/추석 연휴, 크리스마스, 석가탄신일 및 법정 공휴일
                  </div>
                )}
              </div>

              {/* 요금 결과 박스 */}
              <div
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.2)",
                  borderRadius: "12px",
                  border: "1.5px solid rgba(243, 205, 93, 0.3)",
                  padding: "20px",
                  boxShadow: "inset 0 2px 8px rgba(0,0,0,0.2)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem", color: "hsl(266,60%,92%)", marginBottom: "8px", fontWeight: "600" }}>
                  <span>
                    {serviceChoice === "nursing" ? (
                      nursingPlan === "basic" ? `기본 방문 요양 (30,000원 × ${days}일)` :
                      nursingPlan === "intensive" ? `집중 방문 요양 (55,000원 × ${days}일)` :
                      nursingPlan === "medication" ? `투약 전용 서비스 (15,000원 × ${days}일)` :
                      `주간/월간 패키지 (상담 필요)`
                    ) : (
                      `기본요금 (17,000원 × ${days}일)`
                    )}
                  </span>
                  <span style={{ color: "#ffffff", fontWeight: "800" }}>
                    {serviceChoice === "nursing" && nursingPlan === "package" ? "별도 안내" : `${basePrice.toLocaleString()}원`}
                  </span>
                </div>
                {extraPrice > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem", color: "hsl(266,60%,92%)", marginBottom: "8px", fontWeight: "600" }}>
                    <span>추가 서비스 요금</span>
                    <span style={{ color: "#ffffff", fontWeight: "800" }}>+{extraPrice.toLocaleString()}원</span>
                  </div>
                )}
                <div
                  style={{
                    borderTop: "1.5px dashed rgba(243, 205, 93, 0.3)",
                    paddingTop: "14px",
                    marginTop: "10px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: "1.05rem", fontWeight: "850", color: "#F3CD5D", letterSpacing: "-0.3px" }}>예상 요금</span>
                  {serviceChoice === "nursing" && nursingPlan === "package" ? (
                    <strong style={{ fontSize: "1.5rem", fontWeight: "900", color: "#F3CD5D", textShadow: "0 2px 12px rgba(243, 205, 93, 0.45)", letterSpacing: "-0.5px" }}>
                      별도 안내 (상담 필요)
                    </strong>
                  ) : (
                    <strong style={{ fontSize: "2.1rem", fontWeight: "900", color: "#F3CD5D", textShadow: "0 2px 12px rgba(243, 205, 93, 0.45)", letterSpacing: "-0.5px" }}>
                      {totalPrice.toLocaleString()}원
                    </strong>
                  )}
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
