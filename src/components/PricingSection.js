/* eslint-disable */
"use client";

import React, { useState } from "react";

const BASIC_AREAS = ["고현", "장평", "상문", "수월", "중곡", "옥포", "아주", "사곡"];

const ADD_ON_OPTIONS = [
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
            marginBottom: "48px",
            flexWrap: "wrap"
          }}
        >
          <button
            onClick={() => setServiceChoice("general")}
            style={{
              padding: "14px 28px",
              borderRadius: "var(--border-radius-md)",
              border: `2px solid ${serviceChoice === "general" ? "var(--gold-border)" : "var(--border-light)"}`,
              background: serviceChoice === "general" ? "hsl(43, 100%, 95%)" : "white",
              color: serviceChoice === "general" ? "var(--gold)" : "var(--text-muted)",
              fontWeight: "900",
              fontSize: "0.95rem",
              cursor: "pointer",
              boxShadow: serviceChoice === "general" ? "0 4px 12px rgba(180, 130, 0, 0.15)" : "none",
              transition: "all 0.2s ease"
            }}
          >
            🐶🐱 일반 펫시팅 예약 채널
          </button>
          <button
            onClick={() => setServiceChoice("nursing")}
            style={{
              padding: "14px 28px",
              borderRadius: "var(--border-radius-md)",
              border: `2px solid ${serviceChoice === "nursing" ? "var(--primary-orange)" : "var(--border-light)"}`,
              background: serviceChoice === "nursing" ? "var(--primary-orange-light)" : "white",
              color: serviceChoice === "nursing" ? "var(--primary-orange)" : "var(--text-muted)",
              fontWeight: "900",
              fontSize: "0.95rem",
              cursor: "pointer",
              boxShadow: serviceChoice === "nursing" ? "0 4px 12px rgba(100, 40, 180, 0.15)" : "none",
              transition: "all 0.2s ease"
            }}
          >
            🏥✨ 방문 요양 케어 예약 채널
          </button>
        </div>

        {/* ── 서비스 카드 3개 (일반 펫시팅 선택 시 노출) ── */}
        {serviceChoice === "general" && (
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
        )}

        {/* ── [방문형 요양 서비스] 요금표 컴포넌트 (요양 케어 선택 시 노출) ── */}
        {serviceChoice === "nursing" && (
          <div
            style={{
              background: "linear-gradient(135deg, hsl(268, 40%, 97%) 0%, hsl(265, 30%, 94%) 100%)",
              border: "1.5px solid hsl(265, 30%, 88%)",
              borderRadius: "20px",
              padding: "30px 24px",
              marginBottom: "48px",
              boxShadow: "0 8px 30px rgba(100, 40, 180, 0.05)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <span style={{ fontSize: "1.6rem" }}>💜</span>
              <div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: "900", color: "hsl(268, 40%, 20%)", margin: 0 }}>
                  방문형 요양 서비스 요금표
                </h3>
                <p style={{ fontSize: "0.8rem", color: "hsl(268, 20%, 45%)", margin: "4px 0 0 0", fontWeight: "600" }}>
                  노령묘·노령견 및 회복기 아이를 위한 맞춤 전문 케어 플랜
                </p>
              </div>
            </div>

            {/* 리스트/테이블 영역 */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                {
                  title: "🏠 기본 방문 요양",
                  duration: "1일 1회 방문 (30~40분)",
                  desc: "식사 급여, 배변 정리, 정서 교감, 기본 복약 지도",
                  price: "30,000원",
                  isHot: false
                },
                {
                  title: "🔁 집중 방문 요양",
                  duration: "1일 2회 방문",
                  desc: "고령 동물 맞춤 돌봄, 수술 후 회복기 반려동물 전용 집중 케어",
                  price: "55,000원",
                  isHot: true
                },
                {
                  title: "💊 투약 전용 서비스",
                  duration: "단독 투약 방문",
                  desc: "안약 점안, 구강약/가루약 복용, 주사 등 전문 투약 관리",
                  price: "15,000원",
                  isHot: false
                },
                {
                  title: "📅 주간/월간 패키지",
                  duration: "장기 및 정기권 이용",
                  desc: "주 3회 이상 꾸준한 요양 관리 필요 시 특별 할인 적용",
                  price: "별도 안내",
                  isHot: false
                }
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "12px",
                    padding: "16px 20px",
                    backgroundColor: "rgba(255, 255, 255, 0.75)",
                    border: item.isHot ? "1.5px solid var(--gold-border)" : "1px solid hsl(265, 30%, 90%)",
                    borderRadius: "12px",
                    transition: "all 0.2s ease-in-out",
                    boxShadow: item.isHot ? "0 4px 12px rgba(180, 140, 0, 0.1)" : "none"
                  }}
                >
                  <div style={{ flex: "1 1 280px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <strong style={{ fontSize: "0.95rem", color: "var(--text-main)", fontWeight: "800" }}>
                        {item.title}
                      </strong>
                      <span
                        style={{
                          fontSize: "0.72rem",
                          backgroundColor: "hsl(265, 40%, 90%)",
                          color: "hsl(268, 50%, 35%)",
                          padding: "3px 8px",
                          borderRadius: "12px",
                          fontWeight: "700"
                        }}
                      >
                        {item.duration}
                      </span>
                      {item.isHot && (
                        <span
                          style={{
                            fontSize: "0.72rem",
                            backgroundColor: "var(--gold-light)",
                            color: "var(--gold)",
                            border: "1px solid var(--gold-border)",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            fontWeight: "800"
                          }}
                        >
                          추천
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: "6px 0 0 0", lineHeight: "1.4" }}>
                      {item.desc}
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: "120px", justifyContent: "flex-end" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600" }}>이용요금</span>
                    <strong style={{ fontSize: "1.15rem", fontWeight: "900", color: item.isHot ? "hsl(268, 50%, 35%)" : "var(--text-main)" }}>
                      {item.price}
                    </strong>
                  </div>
                </div>
              ))}
            </div>

            {/* 주의사항 */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
                marginTop: "16px",
                padding: "12px 16px",
                backgroundColor: "rgba(255, 255, 255, 0.5)",
                border: "1px dashed hsl(265, 30%, 85%)",
                borderRadius: "10px"
              }}
            >
              <span style={{ fontSize: "1rem" }}>📢</span>
              <p style={{ fontSize: "0.78rem", color: "hsl(268, 20%, 40%)", margin: 0, lineHeight: "1.5", fontWeight: "600" }}>
                거제 전 지역 기본 운영되며, 외곽 지역(장승포 등)은 교통비 5,000원~ 별도 부과됩니다.
              </p>
            </div>
          </div>
        )}

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
                  {ADD_ON_OPTIONS.map((opt) => (
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
                        checked={opts[opt.key]}
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
