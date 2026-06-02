"use client";

import React, { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function FailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const code = searchParams.get("code") || "UNKNOWN_ERROR";
  const message = searchParams.get("message") || "결제 진행 중 알 수 없는 오류가 발생했습니다.";

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "var(--bg-primary, hsl(38, 45%, 96%))",
      fontFamily: "var(--font-outfit, 'Outfit', 'Noto Sans KR', sans-serif)",
      color: "var(--text-main, hsl(215, 60%, 16%))",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 20px"
    }}>
      <div style={{
        backgroundColor: "var(--bg-secondary, #ffffff)",
        maxWidth: "500px",
        width: "100%",
        borderRadius: "var(--border-radius-lg, 20px)",
        boxShadow: "var(--shadow-lg, 0 16px 40px rgba(22, 31, 56, 0.12))",
        padding: "40px 30px",
        textAlign: "center"
      }}>
        {/* Fail Icon */}
        <div style={{
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          backgroundColor: "var(--warning-coral-light, hsl(12, 100%, 95%))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 24px"
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--warning-coral, hsl(12, 85%, 60%))" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </div>

        <h2 style={{ fontSize: "1.8rem", fontWeight: "800", marginBottom: "8px" }}>❌ 결제에 실패했습니다</h2>
        <p style={{ fontSize: "0.95rem", color: "var(--text-muted, hsl(215, 20%, 45%))", marginBottom: "32px" }}>
          요청 처리 중 오류가 발생했습니다. 아래 내용을 확인한 후 다시 시도해 주세요.
        </p>

        {/* Error Details */}
        <div style={{
          backgroundColor: "var(--bg-primary, hsl(38, 45%, 96%))",
          padding: "20px",
          borderRadius: "var(--border-radius-md, 14px)",
          border: "1px solid var(--border-light, hsl(38, 20%, 88%))",
          textAlign: "left",
          marginBottom: "32px",
          display: "flex",
          flexDirection: "column",
          gap: "10px"
        }}>
          <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--warning-coral)", borderBottom: "1px solid var(--border-light, hsl(38, 20%, 88%))", paddingBottom: "6px", display: "block" }}>
            🔍 에러 상세 정보
          </span>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
            <span style={{ color: "var(--text-muted)", minWidth: "80px" }}>에러 코드</span>
            <strong style={{ color: "var(--text-main)", wordBreak: "break-all" }}>{code}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", flexDirection: "column", gap: "4px" }}>
            <span style={{ color: "var(--text-muted)" }}>에러 메시지</span>
            <span style={{ fontWeight: "600", fontSize: "0.9rem", color: "var(--text-main)", lineHeight: "1.4" }}>{message}</span>
          </div>
        </div>

        {/* Buttons */}
        <button
          onClick={() => router.push("/")}
          style={{
            width: "100%",
            padding: "16px",
            fontSize: "1.05rem",
            fontWeight: "800",
            backgroundColor: "var(--text-main, hsl(215, 60%, 16%))",
            color: "white",
            border: "none",
            borderRadius: "var(--border-radius-md, 14px)",
            cursor: "pointer",
            boxShadow: "0 6px 20px rgba(22, 31, 56, 0.15)",
            transition: "all 0.2s ease"
          }}
        >
          예약 페이지로 돌아가기
        </button>
      </div>
    </div>
  );
}

export default function FailPage() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", backgroundColor: "hsl(38, 45%, 96%)" }}>
        <h3>결제 실패 정보 로드 중...</h3>
      </div>
    }>
      <FailContent />
    </Suspense>
  );
}
