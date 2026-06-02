"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const paymentKey = searchParams.get("paymentKey");
  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");

  const [bookingData, setBookingData] = useState(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPending = localStorage.getItem("pending_booking_data");
      if (savedPending) {
        try {
          const parsed = JSON.parse(savedPending);
          setBookingData(parsed);

          // Save to local reservations to persist it!
          const savedReservations = localStorage.getItem("yoongyopoomae_local_reservations");
          let currentRes = [];
          if (savedReservations) {
            currentRes = JSON.parse(savedReservations);
          }

          // Avoid duplicate insertion
          const duplicate = currentRes.some(r => parsed.reservations.some(pr => pr.id === r.id));
          if (!duplicate) {
            const updatedRes = [...currentRes, ...parsed.reservations];
            localStorage.setItem("yoongyopoomae_local_reservations", JSON.stringify(updatedRes));
          }

          // Save customer record as well
          const savedCustomers = localStorage.getItem("yoongyopoomae_local_customers");
          let currentCust = [];
          if (savedCustomers) {
            currentCust = JSON.parse(savedCustomers);
          }
          const dupCust = currentCust.some(c => c.id === parsed.customerRecord.id);
          if (!dupCust) {
            const updatedCust = [...currentCust, parsed.customerRecord];
            localStorage.setItem("yoongyopoomae_local_customers", JSON.stringify(updatedCust));
          }

          setIsSaved(true);
          // Clean up pending data so we don't double insert on refresh
          localStorage.removeItem("pending_booking_data");
        } catch (e) {
          console.error("로컬 예약 저장 에러:", e);
        }
      } else {
        // Fallback or refresh load
        setIsSaved(true);
      }
    }
  }, []);

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
        maxWidth: "600px",
        width: "100%",
        borderRadius: "var(--border-radius-lg, 20px)",
        boxShadow: "var(--shadow-lg, 0 16px 40px rgba(22, 31, 56, 0.12))",
        padding: "40px 30px",
        textAlign: "center"
      }}>
        {/* Success Icon */}
        <div style={{
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          backgroundColor: "var(--success-mint-light, hsl(150, 50%, 93%))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 24px"
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--success-mint, hsl(150, 45%, 40%))" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>

        <h2 style={{ fontSize: "1.8rem", fontWeight: "800", marginBottom: "8px" }}>🎉 결제 및 예약 완료!</h2>
        <p style={{ fontSize: "0.95rem", color: "var(--text-muted, hsl(215, 20%, 45%))", marginBottom: "32px" }}>
          토스페이먼츠 안전 결제가 완료되었으며 예약 정보가 공식 등록되었습니다.
        </p>

        {/* Toss Payment Details */}
        <div style={{
          backgroundColor: "var(--bg-primary, hsl(38, 45%, 96%))",
          padding: "20px",
          borderRadius: "var(--border-radius-md, 14px)",
          border: "1px solid var(--border-light, hsl(38, 20%, 88%))",
          textAlign: "left",
          marginBottom: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "10px"
        }}>
          <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--primary-orange, hsl(28, 95%, 58%))", borderBottom: "1px solid var(--border-light, hsl(38, 20%, 88%))", paddingBottom: "6px", display: "block" }}>
            💳 토스페이먼츠 결제 승인 정보
          </span>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
            <span style={{ color: "var(--text-muted)" }}>결제 금액</span>
            <strong style={{ color: "var(--primary-orange)" }}>{amount ? parseInt(amount).toLocaleString() : "0"}원</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
            <span style={{ color: "var(--text-muted)" }}>주문 ID (OrderId)</span>
            <span style={{ fontWeight: "600", fontSize: "0.85rem" }}>{orderId}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
            <span style={{ color: "var(--text-muted)" }}>결제 키 (PaymentKey)</span>
            <span style={{ fontWeight: "500", fontSize: "0.75rem", color: "var(--text-muted)", wordBreak: "break-all", maxWidth: "60%" }}>{paymentKey}</span>
          </div>
        </div>

        {/* Booking Summary Details */}
        {bookingData && bookingData.summary && (
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
            <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-main)", borderBottom: "1px solid var(--border-light, hsl(38, 20%, 88%))", paddingBottom: "6px", display: "block" }}>
              🐾 예약 접수 상세 내용
            </span>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
              <span style={{ color: "var(--text-muted)" }}>반려동물</span>
              <strong>{bookingData.summary.petName} ({bookingData.summary.petAge})</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
              <span style={{ color: "var(--text-muted)" }}>예약 일정</span>
              <strong style={{ textAlign: "right", maxWidth: "70%" }}>{bookingData.summary.date}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
              <span style={{ color: "var(--text-muted)" }}>방문 시간대</span>
              <strong>{bookingData.summary.time}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
              <span style={{ color: "var(--text-muted)" }}>방문 지역</span>
              <strong>{bookingData.summary.visitArea}</strong>
            </div>
            {bookingData.summary.selectedOptions && bookingData.summary.selectedOptions.length > 0 && (
              <div style={{ borderTop: "1px dashed var(--border-light)", paddingTop: "8px", marginTop: "4px" }}>
                <span style={{ color: "var(--text-muted)", fontSize: "0.85rem", display: "block", marginBottom: "6px" }}>선택된 추가 옵션</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {bookingData.summary.selectedOptions.map((opt, idx) => (
                    <span key={idx} style={{
                      backgroundColor: "var(--primary-orange-light, hsl(28, 100%, 94%))",
                      color: "var(--primary-orange, hsl(28, 95%, 58%))",
                      fontSize: "0.75rem",
                      padding: "4px 8px",
                      borderRadius: "12px",
                      fontWeight: "600"
                    }}>{opt}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Buttons */}
        <button
          onClick={() => router.push("/")}
          style={{
            width: "100%",
            padding: "16px",
            fontSize: "1.05rem",
            fontWeight: "800",
            backgroundColor: "var(--primary-orange, hsl(28, 95%, 58%))",
            color: "white",
            border: "none",
            borderRadius: "var(--border-radius-md, 14px)",
            cursor: "pointer",
            boxShadow: "0 6px 20px rgba(249, 115, 22, 0.2)",
            transition: "all 0.2s ease"
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = "var(--primary-orange-hover, hsl(28, 95%, 50%))"}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = "var(--primary-orange, hsl(28, 95%, 58%))"}
        >
          돌봄 달력 및 예약 포탈로 돌아가기 🏠
        </button>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", backgroundColor: "hsl(38, 45%, 96%)" }}>
        <h3>결제 성공 정보 로드 중...</h3>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
