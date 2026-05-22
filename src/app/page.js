"use client";

import React, { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import ImageUploader from "../components/ImageUploader";

// ==============================================================
// 1. MOCK & SEED DATA (For both Blog and Calendar)
// ==============================================================

const DEMO_USERS = {
  user: {
    id: "22222222-2222-2222-2222-222222222222",
    username: "user_kim",
    full_name: "김미선 회원",
    role: "user"
  },
  admin: {
    id: "11111111-1111-1111-1111-111111111111",
    username: "sitter_jeon",
    full_name: "전윤교 펫시터",
    role: "admin"
  }
};

const INITIAL_POSTS = [
  {
    id: 1,
    user_id: "11111111-1111-1111-1111-111111111111",
    author_name: "전윤교 펫시터 (관리자)",
    title: "치즈냥이 '보리'의 첫 방문 돌봄 일지 🐾",
    content: "겁이 많은 보리와 친해지기 위해 조심스럽게 다가갔던 첫 날의 기록입니다. 간식 하나로 마음을 열어준 보리... 낮춰서 눈인사를 하고 차분히 기다리자 마음을 열어주고 츄르를 받아 먹었답니다. 감자 2개 캐고 모래 정리 완료했습니다.",
    category: "돌봄 일지",
    created_at: "2026-05-18T03:00:00.000Z"
  },
  {
    id: 2,
    user_id: "11111111-1111-1111-1111-111111111111",
    author_name: "전윤교 펫시터 (관리자)",
    title: "외출 시 고양이 물그릇 배치 꿀팁 💧",
    content: "고양이가 물을 더 많이 마시게 하는 효율적인 배치 장소와 신선도 유지 방법 5가지를 소개합니다. 고양이는 흐르는 물과 넓은 그릇을 선호하며, 밥그릇과 물그릇은 최소 1m 이상 떨어뜨려 놓아야 물의 신선함을 느끼고 음수량이 늘어납니다.",
    category: "전문가 팁",
    created_at: "2026-05-17T08:30:00.000Z"
  },
  {
    id: 3,
    user_id: "22222222-2222-2222-2222-222222222222",
    author_name: "김미선 회원 (일반유저)",
    title: "오늘의 묘델: 우아한 샴 고양이 '코코' 😻",
    content: "모델 뺨치는 포즈를 보여준 코코의 인생샷들을 모았습니다. 푸른 눈이 매력적인 코코의 오후 일상. 카메라 셔터 소리에 귀를 쫑긋거리며 우아한 자태를 뽐냈습니다.",
    category: "사진첩",
    created_at: "2026-05-16T12:00:00.000Z"
  }
];

// Mock Time Slots for the Calendar
const TIME_SLOTS_POOL = [
  { id: "ts1", time: "오전 10:00 - 12:00", isBooked: true },  // Must: Fully booked is deactivated
  { id: "ts2", time: "오후 13:00 - 15:00", isBooked: false },
  { id: "ts3", time: "오후 16:00 - 18:00", isBooked: true },  // Must: Fully booked is deactivated
  { id: "ts4", time: "오후 19:00 - 21:00", isBooked: false }
];

export default function UnifiedPortal() {
  // Navigation State: 'blog' vs 'booking'
  const [activePortal, setActivePortal] = useState("booking"); // Default to the newly requested Booking Calendar

  // Global Auth / RLS States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeUser, setActiveUser] = useState(null);
  const [toast, setToast] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("user");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- A. BLOG PORTAL STATES ---
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [currentFilter, setCurrentFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("일반");
  const [expandedPostId, setExpandedPostId] = useState(null);

  // --- B. BOOKING CALENDAR PORTAL STATES ---
  const [currentDate, setCurrentDate] = useState(new Date("2026-05-18")); // Reference Today: 2026-05-18
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [petName, setPetName] = useState("");
  const [petAge, setPetAge] = useState("");
  const [serviceType, setServiceType] = useState("방문 돌봄");
  const [careMemo, setCareMemo] = useState("");
  
  // Custom Booking Controls (Network Error Simulator & Popup)
  const [forceNetworkError, setForceNetworkError] = useState(false);
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [showBookingSuccessModal, setShowBookingSuccessModal] = useState(false);
  const [bookingSummary, setBookingSummary] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // --- Supabase Realtime synchronization ---
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsLoggedIn(true);
        fetchUserProfile(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setIsLoggedIn(true);
        fetchUserProfile(session.user.id);
      } else {
        setIsLoggedIn(false);
        setActiveUser(null);
        fetchSupabasePosts();
      }
    });

    fetchSupabasePosts();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchSupabasePosts = async () => {
    try {
      const { data: fetchedPosts } = await supabase
        .from("posts")
        .select(`id, user_id, title, content, category, created_at, profiles(username, full_name, role)`)
        .order("created_at", { ascending: false });

      if (fetchedPosts) {
        const mapped = fetchedPosts.map(p => ({
          id: p.id,
          user_id: p.user_id,
          title: p.title,
          content: p.content,
          category: p.category,
          created_at: p.created_at,
          author_name: p.profiles?.full_name || p.profiles?.username || "알 수 없는 사용자"
        }));
        setPosts(mapped);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchUserProfile = async (userId) => {
    try {
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single();
      if (profile) {
        setActiveUser(profile);
        showToast(`'${profile.full_name}'님 (${profile.role.toUpperCase()}) 로그인 성공!`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // --- Auth Handlers ---
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword
      });
      setIsSubmitting(false);
      if (error) {
        showToast(`인증 에러: ${error.message}`);
      } else {
        setShowLoginModal(false);
      }
    } else {
      setTimeout(() => {
        setIsSubmitting(false);
        setIsLoggedIn(true);
        const selectedProfile = DEMO_USERS[selectedRole];
        setActiveUser(selectedProfile);
        setShowLoginModal(false);
        showToast(`[데모] '${selectedProfile.full_name}' (${selectedProfile.role.toUpperCase()}) 로그인 완료.`);
      }, 500);
    }
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    } else {
      setIsLoggedIn(false);
      setActiveUser(null);
      showToast("로그아웃 되었습니다.");
    }
  };

  // --- B. BOOKING CALENDAR SYSTEM LOGIC ---
  // Get days for calendar grid rendering
  const getDaysInMonthGrid = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days = [];

    // Fill preceding empty padding cells
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ day: null, date: null, isPast: true });
    }

    // Reference today: 2026-05-18
    const todayStr = "2026-05-18";
    const todayDateObj = new Date(todayStr);

    for (let i = 1; i <= totalDays; i++) {
      const dayDate = new Date(year, month, i);
      
      // Constraint: Past dates are disabled
      const isPast = dayDate < todayDateObj && dayDate.toDateString() !== todayDateObj.toDateString();

      days.push({
        day: i,
        date: dayDate,
        isPast: isPast
      });
    }

    return days;
  };

  const selectBookingDate = (dayObj) => {
    if (dayObj.isPast || !dayObj.day) return;
    setSelectedDate(dayObj.date);
    setSelectedTimeSlot(null); // Reset time slot choice on date toggle
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();

    if (!selectedDate || !selectedTimeSlot || !petName || !petAge) {
      showToast("필수 예약 양식을 모두 완성해 주세요.");
      return;
    }

    setIsBookingLoading(true);

    // Simulated network submit latency
    setTimeout(() => {
      // Constraint: If network error is toggled, raise alert and clear state safely
      if (forceNetworkError) {
        setIsBookingLoading(false);
        showToast("⚠️ 네트워크 오류가 발생하여 예약에 실패했습니다. 잠시 후 다시 시도해 주세요.");
        return;
      }

      // Success branch
      setIsBookingLoading(false);
      const summary = {
        date: selectedDate.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" }),
        time: selectedTimeSlot.time,
        petName,
        petAge,
        serviceType,
        careMemo: careMemo || "없음",
        sitterName: "전윤교 펫시터 (전문가)"
      };

      setBookingSummary(summary);
      setShowBookingSuccessModal(true); // Should: Renders 예약 완료 popup summary

      // Reset Form fields
      setSelectedDate(null);
      setSelectedTimeSlot(null);
      setPetName("");
      setPetAge("");
      setCareMemo("");
    }, 1200);
  };

  // --- A. BLOG CRUD HANDLERS ---
  const handleDeletePost = async (e, post) => {
    e.stopPropagation();
    const isOwner = activeUser && activeUser.id === post.user_id;
    const isAdmin = activeUser && activeUser.role === "admin";
    const canDelete = isOwner || isAdmin;

    if (!isLoggedIn) {
      showToast("🔒 삭제 권한이 없습니다. 로그인을 먼저 해주세요.");
      return;
    }
    if (!canDelete) {
      showToast("🔒 RLS 규정 위반: 작성자 본인 또는 관리자만 삭제 가능합니다.");
      return;
    }

    if (isSupabaseConfigured) {
      const { error } = await supabase.from("posts").delete().eq("id", post.id);
      if (error) {
        showToast(`삭제 실패 (RLS): ${error.message}`);
      } else {
        showToast("Supabase에서 삭제되었습니다.");
        if (expandedPostId === post.id) setExpandedPostId(null);
        fetchSupabasePosts();
      }
    } else {
      setPosts(prev => prev.filter(p => p.id !== post.id));
      if (expandedPostId === post.id) setExpandedPostId(null);
      showToast("🔒 [RLS 시뮬레이션 승인] 포스트가 삭제되었습니다.");
    }
  };

  const handleCreatePostClick = () => {
    if (!isLoggedIn) {
      showToast("🔒 RLS 정책 알림: 로그인 후에만 게시글 작성이 가능합니다.");
      setShowLoginModal(true);
    } else {
      setShowCreateModal(true);
    }
  };

  const handleCreatePostSubmit = async (e) => {
    e.preventDefault();
    if (!newTitle || !newContent) {
      showToast("내용을 채워주세요.");
      return;
    }
    setIsSubmitting(true);

    if (isSupabaseConfigured) {
      const { error } = await supabase.from("posts").insert([{
        user_id: activeUser.id,
        title: newTitle,
        content: newContent,
        category: newCategory
      }]);
      setIsSubmitting(false);
      if (error) {
        showToast(`실패 (RLS): ${error.message}`);
      } else {
        showToast("성공적으로 글이 등록되었습니다!");
        setShowCreateModal(false);
        fetchSupabasePosts();
      }
    } else {
      setTimeout(() => {
        setIsSubmitting(false);
        const newPost = {
          id: Date.now(),
          user_id: activeUser.id,
          author_name: `${activeUser.full_name} (${activeUser.role === 'admin' ? '관리자' : '일반유저'})`,
          title: newTitle,
          content: newContent,
          category: newCategory,
          created_at: new Date().toISOString()
        };
        setPosts(prev => [newPost, ...prev]);
        setShowCreateModal(false);
        showToast("🔒 [RLS 시뮬레이션 승인] 글이 등록되었습니다.");
      }, 500);
    }
  };

  const filteredPosts = currentFilter === "all" ? posts : posts.filter(p => p.category === currentFilter);
  const calendarGridDays = getDaysInMonthGrid();

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      
      {/* 1. Supabase 연동 알림 배너 */}
      {isSupabaseConfigured ? (
        <div style={{
          backgroundColor: "var(--success-mint-light)", color: "var(--success-mint)",
          padding: "10px 24px", textAlign: "center", fontSize: "0.85rem", fontWeight: "700",
          borderBottom: "1px solid var(--border-light)"
        }}>
          🛡️ Supabase 실시간 클라우드 DB 연동 중 | 블로그 RLS 및 업로더 기능 서버와 연계 완료!
        </div>
      ) : (
        <div style={{
          backgroundColor: "var(--primary-orange-light)", color: "var(--primary-orange)",
          padding: "10px 24px", textAlign: "center", fontSize: "0.85rem", fontWeight: "700",
          borderBottom: "1px solid var(--border-light)"
        }}>
          ⚠️ Supabase 설정 대기 중. 로컬 시뮬레이션 데모 모드로 가동되고 있습니다. (blog/.env.local에서 세팅 가능)
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="toast-container">
          <div className="toast">
            <span className="toast-icon">🛎️</span>
            <span>{toast}</span>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. AUTH LOGIN MODAL */}
      {/* ============================================================== */}
      {showLoginModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "rgba(22, 31, 56, 0.6)", display: "flex", alignItems: "center",
          justifyContent: "center", zIndex: 1000, backdropFilter: "blur(6px)"
        }}>
          <div className="premium-card animate-fade-in" style={{ maxWidth: "440px", width: "90%", padding: "36px 28px" }}>
            <div style={{ textAlign: "center", marginBottom: "28px" }}>
              <span style={{ fontSize: "2.4rem" }}>🔐</span>
              <h3 style={{ fontSize: "1.4rem", marginTop: "10px", color: "var(--text-main)", fontWeight: "800" }}>
                통합 인증 센터
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
                {isSupabaseConfigured ? "계정 정보로 로그인해 테스트하세요." : "데모 모드에서는 역할을 선택하여 즉시 로그인 가능합니다!"}
              </p>
            </div>

            <form onSubmit={handleAuthSubmit}>
              {!isSupabaseConfigured ? (
                <div className="form-group" style={{ marginBottom: "20px" }}>
                  <label className="form-label">체험용 역할(Role) 선택</label>
                  <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
                    <button
                      type="button"
                      onClick={() => setSelectedRole("user")}
                      style={{
                        flex: 1, padding: "12px", border: "1.5px solid var(--border-light)",
                        borderRadius: "var(--border-radius-sm)",
                        backgroundColor: selectedRole === "user" ? "var(--primary-orange-light)" : "transparent",
                        borderColor: selectedRole === "user" ? "var(--primary-orange)" : "var(--border-light)",
                        color: selectedRole === "user" ? "var(--primary-orange)" : "var(--text-muted)",
                        fontWeight: "700", cursor: "pointer"
                      }}
                    >
                      👤 일반 유저
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRole("admin")}
                      style={{
                        flex: 1, padding: "12px", border: "1.5px solid var(--border-light)",
                        borderRadius: "var(--border-radius-sm)",
                        backgroundColor: selectedRole === "admin" ? "var(--primary-orange-light)" : "transparent",
                        borderColor: selectedRole === "admin" ? "var(--primary-orange)" : "var(--border-light)",
                        color: selectedRole === "admin" ? "var(--primary-orange)" : "var(--text-muted)",
                        fontWeight: "700", cursor: "pointer"
                      }}
                    >
                      👑 관리자 (Admin)
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="form-group">
                    <label className="form-label">이메일</label>
                    <input
                      type="email"
                      className="form-input"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="sitter@yenu.com"
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: "20px" }}>
                    <label className="form-label">비밀번호</label>
                    <input
                      type="password"
                      className="form-input"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </>
              )}

              <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowLoginModal(false)} style={{ flex: 1 }}>
                  취소
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ flex: 2 }}>
                  {isSubmitting ? "인증 진행 중..." : "인증 로그인"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. 예약 완료 팝업 모달 (Should: Success Summary popup) */}
      {/* ============================================================== */}
      {showBookingSuccessModal && bookingSummary && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "rgba(22, 31, 56, 0.7)", display: "flex", alignItems: "center",
          justifyContent: "center", zIndex: 2000, backdropFilter: "blur(8px)"
        }}>
          <div className="premium-card animate-fade-in" style={{ maxWidth: "480px", width: "90%", padding: "40px 32px" }}>
            
            {/* Checked Success Icon */}
            <div style={{
              width: "70px", height: "70px", borderRadius: "50%",
              backgroundColor: "var(--success-mint-light)", display: "flex",
              alignItems: "center", justifyContent: "center", margin: "0 auto 24px"
            }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--success-mint)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>

            <div style={{ textAlign: "center", marginBottom: "28px" }}>
              <h3 style={{ fontSize: "1.5rem", color: "var(--text-main)", fontWeight: "800", marginBottom: "6px" }}>🎉 돌봄 예약 완료!</h3>
              <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
                예약이 무사히 접수되었습니다. 전윤교 펫시터님이 꼼꼼하게 일정을 준비하겠습니다.
              </p>
            </div>

            {/* Booking Summary parameters details */}
            <div style={{
              backgroundColor: "var(--bg-secondary)",
              padding: "20px",
              borderRadius: "var(--border-radius-md)",
              border: "1px solid var(--border-light)",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              marginBottom: "28px"
            }}>
              <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--primary-orange)", borderBottom: "1.5px solid var(--border-light)", paddingBottom: "8px", display: "block" }}>
                📝 예약 접수 상세 요약
              </span>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
                <span style={{ color: "var(--text-muted)" }}>신청 동물</span>
                <strong style={{ color: "var(--text-main)" }}>{bookingSummary.petName} ({bookingSummary.petAge}살)</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
                <span style={{ color: "var(--text-muted)" }}>서비스 구분</span>
                <strong style={{ color: "var(--text-main)" }}>💼 {bookingSummary.serviceType}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
                <span style={{ color: "var(--text-muted)" }}>예약 날짜</span>
                <strong style={{ color: "var(--text-main)" }}>📅 {bookingSummary.date}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
                <span style={{ color: "var(--text-muted)" }}>돌봄 시간</span>
                <strong style={{ color: "var(--text-main)" }}>⏰ {bookingSummary.time}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", borderTop: "1px solid var(--border-light)", paddingTop: "8px" }}>
                <span style={{ color: "var(--text-muted)" }}>담당 전문가</span>
                <strong style={{ color: "var(--text-main)" }}>{bookingSummary.sitterName}</strong>
              </div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
                <span style={{ display: "block", fontWeight: "700", color: "var(--text-main)", marginBottom: "2px" }}>💡 보호자 요청사항:</span>
                <p style={{ margin: 0, fontStyle: "italic", backgroundColor: "white", padding: "8px 12px", borderRadius: "4px", border: "1px solid var(--border-light)" }}>
                  "{bookingSummary.careMemo}"
                </p>
              </div>
            </div>

            <button className="btn btn-primary" onClick={() => setShowBookingSuccessModal(false)} style={{ width: "100%", padding: "14px" }}>
              확인 및 대시보드로 이동
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. 새 블로그 글 작성 모달 */}
      {/* ============================================================== */}
      {showCreateModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "rgba(22, 31, 56, 0.6)", display: "flex", alignItems: "center",
          justifyContent: "center", zIndex: 1000, backdropFilter: "blur(6px)"
        }}>
          <div className="premium-card animate-fade-in" style={{ maxWidth: "550px", width: "95%", padding: "36px 28px" }}>
            <div style={{ borderBottom: "1px solid var(--border-light)", paddingBottom: "12px", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "1.4rem", color: "var(--text-main)", fontWeight: "800" }}>📝 새 포스트 작성</h3>
            </div>

            <form onSubmit={handleCreatePostSubmit}>
              <div className="form-group">
                <label className="form-label">카테고리</label>
                <select
                  className="form-input"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  style={{ appearance: "auto" }}
                >
                  <option value="일반">일반</option>
                  <option value="돌봄 일지">돌봄 일지</option>
                  <option value="사진첩">사진첩</option>
                  <option value="전문가 팁">전문가 팁</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">제목</label>
                <input
                  type="text"
                  className="form-input"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="포스트 제목을 입력하세요"
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: "24px" }}>
                <label className="form-label">내용</label>
                <textarea
                  rows="5"
                  className="form-input"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="포스트의 상세 내용을 기입하세요"
                  style={{ resize: "vertical", minHeight: "120px" }}
                  required
                ></textarea>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)} style={{ flex: 1 }}>
                  취소
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ flex: 2 }}>
                  {isSubmitting ? "서버 저장 중..." : "포스트 등록 완료 🔓"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. HEADER BAR */}
      {/* ============================================================== */}
      <header style={{
        backgroundColor: "var(--bg-secondary)", borderBottom: "1px solid var(--border-light)",
        position: "sticky", top: 0, zIndex: 100
      }}>
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "80px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "1.6rem" }}>🐾</span>
            <div>
              <span style={{ fontSize: "1.25rem", fontWeight: "800", letterSpacing: "-0.5px", color: "var(--text-main)" }}>윤교품애</span>
              <span style={{ fontSize: "0.75rem", color: "var(--primary-orange)", fontWeight: "600", display: "block", marginTop: "-3px" }}>안심 예약 & 돌봄 허브</span>
            </div>
          </div>

          {/* Toggle pill buttons to switch between Blog and Calendar */}
          <div style={{
            display: "flex", backgroundColor: "var(--bg-primary)", padding: "5px",
            borderRadius: "var(--border-radius-full)", border: "1px solid var(--border-light)"
          }}>
            <button
              onClick={() => setActivePortal("booking")}
              style={{
                border: "none", background: activePortal === "booking" ? "var(--primary-orange)" : "transparent",
                color: activePortal === "booking" ? "white" : "var(--text-muted)",
                padding: "8px 16px", borderRadius: "var(--border-radius-full)",
                fontSize: "0.85rem", fontWeight: "700", cursor: "pointer", transition: "var(--transition-fast)"
              }}
            >
              📅 실시간 캘린더 예약
            </button>
            <button
              onClick={() => setActivePortal("blog")}
              style={{
                border: "none", background: activePortal === "blog" ? "var(--primary-orange)" : "transparent",
                color: activePortal === "blog" ? "white" : "var(--text-muted)",
                padding: "8px 16px", borderRadius: "var(--border-radius-full)",
                fontSize: "0.85rem", fontWeight: "700", cursor: "pointer", transition: "var(--transition-fast)"
              }}
            >
              📰 돌봄 블로그 & RLS 검증
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {isLoggedIn && activeUser ? (
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-main)", display: "none", display: "md-inline" }}>
                  👤 {activeUser.full_name} ({activeUser.role.toUpperCase()})
                </span>
                <button className="btn btn-secondary" onClick={handleLogout} style={{ padding: "8px 16px", fontSize: "0.85rem" }}>
                  로그아웃
                </button>
              </div>
            ) : (
              <button className="btn btn-primary" onClick={() => setShowLoginModal(true)} style={{ padding: "8px 16px", fontSize: "0.85rem" }}>
                인증 로그인 🔑
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 6. BOOKING CALENDAR PORTAL VIEW */}
      {/* ============================================================== */}
      {activePortal === "booking" && (
        <main className="animate-fade-in" style={{ flex: 1, padding: "40px 0" }}>
          <div className="container" style={{ maxWidth: "1000px" }}>
            
            {/* Portal Headline */}
            <div style={{ textAlign: "center", marginBottom: "36px" }}>
              <span style={{
                backgroundColor: "var(--primary-orange-light)", color: "var(--primary-orange)",
                fontSize: "0.8rem", fontWeight: "700", padding: "6px 14px", borderRadius: "20px"
              }}>
                윤교품애 보호자 전용 간편 예약 채널 📅
              </span>
              <h2 style={{ fontSize: "2rem", color: "var(--text-main)", fontWeight: "800", marginTop: "12px", marginBottom: "8px" }}>
                직관적인 캘린더 실시간 돌봄 예약
              </h2>
              <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", maxWidth: "600px", margin: "0 auto" }}>
                캘린더에서 원하시는 날짜와 여유 시간대를 선택해 주시면 전문 펫시터 전윤교님이 집으로 직접 찾아갑니다.
              </p>
            </div>

            {/* Main Reservation Split Panel */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "32px", alignItems: "flex-start" }}>
              
              {/* Left Side: Calendar and Time Selector */}
              <div style={{ flex: "1 1 500px", display: "flex", flexDirection: "column", gap: "24px" }}>
                
                {/* 캘린더 바디 (Must: Calendar Date Picker) */}
                <div className="premium-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <h3 style={{ fontSize: "1.15rem", fontWeight: "800" }}>
                      📅 2026년 5월 돌봄 일정표
                    </h3>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "600" }}>
                      * 오늘(5/18) 이전 날짜 선택 불가
                    </span>
                  </div>

                  {/* Calendar Grid Header */}
                  <div style={{
                    display: "grid", gridTemplateColumns: "repeat(7, 1fr)",
                    textAlign: "center", fontWeight: "700", fontSize: "0.8rem",
                    color: "var(--text-muted)", marginBottom: "10px"
                  }}>
                    {["일", "월", "화", "수", "목", "금", "토"].map(d => <span key={d}>{d}</span>)}
                  </div>

                  {/* Calendar Grid Cells */}
                  <div style={{
                    display: "grid", gridTemplateColumns: "repeat(7, 1fr)",
                    gap: "8px"
                  }}>
                    {calendarGridDays.map((dayObj, index) => {
                      const isSelected = selectedDate && dayObj.date && selectedDate.toDateString() === dayObj.date.toDateString();
                      
                      return (
                        <button
                          key={index}
                          disabled={dayObj.isPast || !dayObj.day}
                          onClick={() => selectBookingDate(dayObj)}
                          style={{
                            border: "none",
                            borderRadius: "var(--border-radius-sm)",
                            height: "52px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.95rem",
                            fontWeight: "700",
                            cursor: (dayObj.isPast || !dayObj.day) ? "not-allowed" : "pointer",
                            backgroundColor: isSelected 
                              ? "var(--primary-orange)" 
                              : (dayObj.isPast || !dayObj.day) ? "var(--bg-primary)" : "var(--bg-secondary)",
                            color: isSelected 
                              ? "white" 
                              : (dayObj.isPast || !dayObj.day) ? "var(--text-muted)" : "var(--text-main)",
                            opacity: dayObj.isPast ? 0.35 : 1,
                            transition: "var(--transition-fast)",
                            boxShadow: isSelected ? "0 4px 10px rgba(255, 112, 67, 0.25)" : "none"
                          }}
                        >
                          <span>{dayObj.day}</span>
                          {/* Reference Today visual helper */}
                          {dayObj.day === 18 && (
                            <span style={{ fontSize: "0.6rem", color: isSelected ? "white" : "var(--primary-orange)" }}>오늘</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 시간대 선택 영역 (Must: Time slot selector with booked state visually deactivated) */}
                {selectedDate && (
                  <div className="premium-card animate-fade-in">
                    <h4 style={{ fontSize: "1rem", fontWeight: "800", marginBottom: "12px", color: "var(--text-main)" }}>
                      ⏰ 돌봄을 진행할 시간대를 골라주세요
                    </h4>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "16px" }}>
                      선택하신 날짜: <strong>{selectedDate.toLocaleDateString("ko-KR", { month: "long", day: "numeric" })}</strong>
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {TIME_SLOTS_POOL.map(slot => (
                        <button
                          key={slot.id}
                          disabled={slot.isBooked}
                          onClick={() => setSelectedTimeSlot(slot)}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "16px 20px",
                            border: "1.5px solid var(--border-light)",
                            borderRadius: "var(--border-radius-sm)",
                            cursor: slot.isBooked ? "not-allowed" : "pointer",
                            backgroundColor: selectedTimeSlot?.id === slot.id 
                              ? "var(--primary-orange-light)" 
                              : slot.isBooked ? "var(--bg-primary)" : "var(--bg-secondary)",
                            borderColor: selectedTimeSlot?.id === slot.id 
                              ? "var(--primary-orange)" 
                              : "var(--border-light)",
                            color: slot.isBooked ? "var(--text-muted)" : "var(--text-main)",
                            transition: "var(--transition-fast)"
                          }}
                        >
                          <span style={{ fontWeight: "700" }}>⏰ {slot.time}</span>
                          <span style={{
                            fontSize: "0.75rem", fontWeight: "800",
                            backgroundColor: slot.isBooked ? "#e0e0e0" : "var(--success-mint-light)",
                            color: slot.isBooked ? "var(--text-muted)" : "var(--success-mint)",
                            padding: "4px 10px", borderRadius: "10px"
                          }}>
                            {slot.isBooked ? "예약 불가 ❌" : "예약 가능 🟢"}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Right Side: Booking detail forms */}
              <div className="premium-card" style={{ flex: "1 1 400px", display: "flex", flexDirection: "column", gap: "20px" }}>
                <h3 style={{ fontSize: "1.2rem", fontWeight: "800", borderBottom: "1.5px solid var(--border-light)", paddingBottom: "10px", margin: 0 }}>
                  📋 돌봄 예약 세부 사항 입력
                </h3>

                <form onSubmit={handleBookingSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div className="form-group">
                    <label className="form-label">반려동물 이름 (필수)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={petName}
                      onChange={(e) => setPetName(e.target.value)}
                      placeholder="예: 치즈, 루이"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">반려동물 나이 (필수)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={petAge}
                      onChange={(e) => setPetAge(e.target.value)}
                      placeholder="살 단위를 숫자로만 기입 (예: 14)"
                      min="0"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">돌봄 서비스 구분</label>
                    <select
                      className="form-input"
                      value={serviceType}
                      onChange={(e) => setServiceType(e.target.value)}
                      style={{ appearance: "auto" }}
                    >
                      <option value="방문 돌봄">방문 돌봄 (가정 내 투약/식사 관리)</option>
                      <option value="병원 동행">병원 동행 (이동 및 검진 지침 가이드)</option>
                      <option value="산책 케어">산책 케어 (노령동물 맞춤형 산책로)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">펫시터 상세 요청 사항</label>
                    <textarea
                      rows="3"
                      className="form-input"
                      value={careMemo}
                      onChange={(e) => setCareMemo(e.target.value)}
                      placeholder="투약 요청 사항, 산책 시 특이사항, 비밀번호 수칙 등 강조할 내용을 적어주세요."
                      style={{ resize: "vertical" }}
                    ></textarea>
                  </div>

                  {/* Network Error Simulator Control Toggle (Must: Network error testing) */}
                  <div style={{
                    backgroundColor: "var(--bg-primary)",
                    padding: "12px 16px",
                    borderRadius: "var(--border-radius-sm)",
                    border: "1px solid var(--border-light)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "8px"
                  }}>
                    <div>
                      <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-main)", display: "block" }}>
                        ⚠️ 네트워크 에러 강제 발생 시뮬레이션
                      </span>
                      <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                        에러 발생 시의 안전 탈출 안내 알림을 테스트합니다.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={forceNetworkError}
                      onChange={(e) => setForceNetworkError(e.target.checked)}
                      style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "var(--warning-coral)" }}
                    />
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isBookingLoading}
                    style={{ width: "100%", padding: "16px", fontSize: "1.1rem", marginTop: "12px" }}
                  >
                    {isBookingLoading ? (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                        <span style={{
                          display: "inline-block", width: "18px", height: "18px",
                          border: "2.5px solid white", borderTopColor: "transparent",
                          borderRadius: "50%", animation: "shake 0.8s linear infinite"
                        }}></span>
                        예약 신청 전송 중... (무한로딩 방지 활성)
                      </span>
                    ) : (
                      "돌봄 예약 확정하기 📝"
                    )}
                  </button>
                </form>
              </div>

            </div>

          </div>
        </main>
      )}

      {/* ============================================================== */}
      {/* 7. BLOG PORTAL VIEW */}
      {/* ============================================================== */}
      {activePortal === "blog" && (
        <main className="animate-fade-in" style={{ flex: 1, padding: "40px 0" }}>
          <div className="container">
            
            {/* Header info */}
            <div style={{
              display: "flex", flexWrap: "wrap", justifyContent: "space-between",
              alignItems: "center", gap: "20px", marginBottom: "32px",
              borderBottom: "1px solid var(--border-light)", paddingBottom: "20px"
            }}>
              <div style={{ display: "flex", gap: "8px", overflowX: "auto" }}>
                {[
                  { val: "all", label: "전체 목록" },
                  { val: "일반", label: "일반" },
                  { val: "돌봄 일지", label: "돌봄 일지" },
                  { val: "사진첩", label: "사진첩" },
                  { val: "전문가 팁", label: "전문가 팁" }
                ].map(cat => (
                  <button
                    key={cat.val}
                    onClick={() => setCurrentFilter(cat.val)}
                    style={{
                      padding: "8px 16px", border: "1.5px solid var(--border-light)",
                      backgroundColor: currentFilter === cat.val ? "var(--primary-orange)" : "var(--bg-secondary)",
                      color: currentFilter === cat.val ? "white" : "var(--text-main)",
                      fontWeight: "700", fontSize: "0.9rem", borderRadius: "var(--border-radius-full)",
                      cursor: "pointer", transition: "var(--transition-fast)", whiteSpace: "nowrap"
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <button className="btn btn-primary" onClick={handleCreatePostClick} style={{ padding: "10px 20px" }}>
                새 포스트 작성
              </button>
            </div>

            {/* Grid of Blog Posts */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {filteredPosts.map(post => {
                const isOwner = activeUser && activeUser.id === post.user_id;
                const isAdmin = activeUser && activeUser.role === "admin";
                const canDelete = isOwner || isAdmin;
                const isExpanded = expandedPostId === post.id;

                return (
                  <div
                    key={post.id}
                    onClick={() => toggleExpandCard(post.id)}
                    className="premium-card animate-fade-in"
                    style={{
                      cursor: "pointer", border: isExpanded ? "2px solid var(--primary-orange)" : "1px solid var(--border-light)",
                      transition: "var(--transition-smooth)", padding: "28px"
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{
                          backgroundColor: "var(--bg-primary)", color: "var(--text-main)",
                          fontSize: "0.75rem", fontWeight: "700", padding: "4px 10px",
                          borderRadius: "var(--border-radius-sm)", border: "1px solid var(--border-light)"
                        }}>
                          📌 {post.category}
                        </span>
                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 style={{ fontSize: "1.3rem", color: "var(--text-main)", fontWeight: "800", lineHeight: "1.4" }}>
                        {post.title}
                      </h3>

                      <p style={{
                        fontSize: "0.95rem", color: "var(--text-muted)", lineHeight: "1.6",
                        whiteSpace: isExpanded ? "pre-wrap" : "nowrap",
                        overflow: isExpanded ? "visible" : "hidden",
                        textOverflow: isExpanded ? "clip" : "ellipsis",
                        margin: 0
                      }}>
                        {post.content}
                      </p>
                    </div>

                    {isExpanded && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          animation: "fade-in 0.3s ease",
                          borderTop: "1.5px dashed var(--border-light)",
                          paddingTop: "20px",
                          marginTop: "10px"
                        }}
                      >
                        <ImageUploader
                          postId={post.id}
                          userId={activeUser?.id}
                          isOwnerOrAdmin={canDelete}
                        />
                      </div>
                    )}

                    <div style={{
                      borderTop: "1px solid var(--border-light)", paddingTop: "14px",
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      gap: "10px", marginTop: "10px"
                    }}>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>작성인</span>
                        <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-main)" }}>
                          👤 {post.author_name}
                        </span>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                          {isExpanded ? "▲ 접기" : "▼ 클릭하여 사진 올리기 & 내용 펼치기"}
                        </span>
                        
                        {isLoggedIn ? (
                          canDelete ? (
                            <button
                              className="btn"
                              onClick={(e) => handleDeletePost(e, post)}
                              style={{
                                backgroundColor: "var(--warning-coral-light)", color: "var(--warning-coral)",
                                padding: "6px 14px", fontSize: "0.8rem", fontWeight: "700"
                              }}
                            >
                              🗑️ 삭제
                            </button>
                          ) : (
                            <span style={{
                              fontSize: "0.75rem", color: "var(--text-muted)",
                              padding: "6px 12px", backgroundColor: "var(--bg-primary)",
                              borderRadius: "var(--border-radius-sm)", border: "1px solid var(--border-light)"
                            }}>
                              🔒 본인/관리자 전용
                            </span>
                          )
                        ) : (
                          <span style={{
                            fontSize: "0.75rem", color: "var(--text-muted)",
                            padding: "6px 12px", backgroundColor: "var(--bg-primary)",
                            borderRadius: "var(--border-radius-sm)", border: "1px solid var(--border-light)"
                          }}>
                            🔒 로그인 필요
                          </span>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        </main>
      )}

      {/* ============================================================== */}
      {/* 8. FOOTER */}
      {/* ============================================================== */}
      <footer style={{
        backgroundColor: "var(--text-main)", color: "rgba(255, 255, 255, 0.65)",
        padding: "30px 0", borderTop: "1px solid var(--border-light)", marginTop: "auto"
      }}>
        <div className="container" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
          <div>
            <strong style={{ color: "white", fontSize: "1.1rem", display: "block", marginBottom: "4px" }}>윤교품애 (Yoongyopoomae) Hub</strong>
            <span style={{ fontSize: "0.8rem" }}>사용자 지정 RLS & 실시간 캘린더 예약 스위트</span>
          </div>
          <div style={{ fontSize: "0.8rem", textAlign: "right" }}>
            <span>© 2026 Yoongyopoomae. All Rights Reserved.</span>
            <span style={{ display: "block", color: "var(--primary-orange)", marginTop: "2px", fontWeight: "600" }}>
              🔒 Supabase row-level-security & calendar reservation standard
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
