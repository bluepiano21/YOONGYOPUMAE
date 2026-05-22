"use client";

import React, { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import ImageUploader from "../components/ImageUploader";

// ==============================================================
// 1. DUMMY & SEED DATA (Conforming to blog_schema & PRD)
// ==============================================================

const DEMO_USERS = {
  vip: {
    id: "22222222-2222-2222-2222-222222222222",
    username: "user_kim",
    full_name: "김미선 회원 (VIP)",
    role: "vip"
  },
  admin: {
    id: "11111111-1111-1111-1111-111111111111",
    username: "sitter_jeon",
    full_name: "전윤교 펫시터 (관리자)",
    role: "admin"
  }
};

// 6 Core posts from index.html (script.js) mapped with category & restriction flags
const STATIC_BLOG_POSTS = [
  {
    id: 1,
    title: "치즈냥이 '보리'의 첫 방문 돌봄 일지",
    excerpt: "겁이 많은 보리와 친해지기 위해 조심스럽게 다가갔던 첫 날의 기록입니다. 간식 하나로 마음을 열어준 보리...",
    content: "보리는 낯가림이 아주 심하고 소리에 예민한 아이였습니다. 몸을 웅크린 채 경계했으나, 1.5m 거리를 두고 낮게 앉아 눈인사를 주고 받으며 20분간 기다렸습니다. 다행히 츄르 냄새를 맡고 천천히 걸어나와 핥아 먹었으며, 감자 2개를 캐고 모래 뒤집기 정리까지 완료했습니다. 첫 만남 치고 아주 긍정적인 신호입니다.",
    category: "log", // 'log' = 돌봄 일지
    image_url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=800",
    is_restricted: true,
    author_name: "전윤교 펫시터",
    created_at: "2026-05-14T00:00:00.000Z"
  },
  {
    id: 2,
    title: "외출 시 고양이 물그릇 배치 꿀팁 💧",
    excerpt: "고양이가 물을 더 많이 마시게 하는 효율적인 배치 장소와 신선도 유지 방법 5가지를 소개합니다.",
    content: "고양이는 선천적으로 흐르는 깨끗한 물을 좋아하며, 자신의 사료 옆에 있는 물은 신선하지 않다고 여기는 야생 본능이 있습니다. 따라서 밥그릇과 물그릇은 최소 1.5미터 이상 떨어트려 집안의 길목(캣타워 밑, 거실 코너 등) 곳곳에 총 3개 이상 분산 배치해 주세요. 음수량이 최소 30% 이상 확연히 증가하게 됩니다.",
    category: "tip", // 'tip' = 전문가 팁
    image_url: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&q=80&w=800",
    is_restricted: false,
    author_name: "전윤교 펫시터",
    created_at: "2026-05-12T00:00:00.000Z"
  },
  {
    id: 3,
    title: "오늘의 묘델: 우아한 샴 고양이 '코코' 😻",
    excerpt: "모델 뺨치는 포즈를 보여준 코코의 인생샷들을 모았습니다. 푸른 눈이 매력적인 코코의 오후 일상.",
    content: "카메라 렌즈를 두려워하지 않고 오히려 웅장한 포즈를 뽐내며 쳐다보는 샴 고양이 코코입니다. 햇살이 내리쬐는 창가 캣폴 위에서 반짝이는 푸른 눈망울이 정말 매혹적이었던 오후였습니다. 보호자님이 가장 아끼시는 특제 깃털 장난감으로 활기 넘치는 사냥 활동도 완료했습니다.",
    category: "photo", // 'photo' = 사진첩
    image_url: "https://images.unsplash.com/photo-1513245543132-31f507417b26?auto=format&fit=crop&q=80&w=800",
    is_restricted: true,
    author_name: "전윤교 펫시터",
    created_at: "2026-05-10T00:00:00.000Z"
  },
  {
    id: 4,
    title: "노령묘 '먼지'의 건강 검진 동행기 🏥",
    excerpt: "15살 먼지의 병원 방문을 도와주었습니다. 노령묘 이동 시 주의사항과 스트레스 최소화 노하우 공유.",
    content: "나이가 많은 노령묘 먼지의 정기 피검사 날이었습니다. 고양이 켄넬 내부 공간에 보호자의 냄새가 짙게 밴 수건을 깔아 안정감을 제공했고, 이동할 때 켄넬 위를 담요로 씌워 시야를 가려 이동 중 스트레스를 대폭 최소화했습니다. 수의사 소견으로 관절 보조제 증량이 필요하다고 하여 보호자 지침판에 기록했습니다.",
    category: "log",
    image_url: "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?auto=format&fit=crop&q=80&w=800",
    is_restricted: false,
    author_name: "전윤교 펫시터",
    created_at: "2026-05-08T00:00:00.000Z"
  },
  {
    id: 5,
    title: "여름철 털갈이 시즌, 효율적인 빗질법 ✂️",
    excerpt: "죽은 털을 확실하게 제거하고 피부병을 예방하는 전문가의 빗질 기술을 확인하세요.",
    content: "고양이가 죽은 털을 핥아 먹어 위 내 헤어볼이 뭉치면 장폐색으로 이어질 수 있습니다. 빗질 시에는 먼저 실리콘 재질의 부드러운 브러시로 결 방향에 맞춰 전체적인 죽은 털을 긁어 모은 후, 금속 재질의 촘촘한 참빗으로 꼬리부터 머리 방향으로 거꾸로 빗겨 잔여 모근 속 가려움을 해소해 주세요. 마지막에 젖은 타월로 마무리하는 것이 좋습니다.",
    category: "tip",
    image_url: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=800",
    is_restricted: true,
    author_name: "전윤교 펫시터",
    created_at: "2026-05-05T00:00:00.000Z"
  },
  {
    id: 6,
    title: "장난꾸러기 '레오'의 사냥 놀이 현장 🎾",
    excerpt: "활동량이 어마어마한 레오를 위한 맞춤형 사냥 놀이! 30분 만에 기진맥진해서 잠든 레오의 모습.",
    content: "성묘 레오의 지칠 줄 모르는 사냥 욕구를 풀어주기 위해 카본 스틱 낚싯대 장난감을 사용했습니다. 마구 달아나는 사냥감의 불규칙한 회전을 재현해주니 공중제비 3바퀴를 성공하고 사냥에 성공해 웅장하게 그르렁거렸습니다. 30분 집중 놀이 후 꿀잠을 자며 휴식을 취하는 귀여운 모습입니다.",
    category: "photo",
    image_url: "https://images.unsplash.com/photo-1472491235688-bdc81a63246e?auto=format&fit=crop&q=80&w=800",
    is_restricted: false,
    author_name: "전윤교 펫시터",
    created_at: "2026-05-02T00:00:00.000Z"
  }
];

// Customer Profiles with Sensitive Security Codes (entrance_code, doorlock_code)
const CUSTOMERS_DB = [
  {
    id: 1,
    client_name: "김미선 회원",
    phone: "010-4422-9011",
    pet_name: "보리",
    pet_age: 3,
    address: "서울시 마포구 신수동 123-45 102호",
    entrance_code: "종1234#",
    doorlock_code: "2026*",
    specialties: "신부전 초기 냥이, 매일 15:00 신부전 유도 약물 0.5cc 사료 믹스 필수, 낯가림이 매우 심해 큰 소리에 놀람."
  },
  {
    id: 2,
    client_name: "이은주 회원",
    phone: "010-8877-3344",
    pet_name: "먼지",
    pet_age: 15,
    address: "서울시 서대문구 연희동 98-7 2층",
    entrance_code: "경비실 호출 후 통과",
    doorlock_code: "9988#",
    specialties: "15세 노령묘, 관절염으로 높은 곳 점프 금지, 안약 하루 2회 점적 수칙, 식욕 모니터링 필요."
  },
  {
    id: 3,
    client_name: "박태영 회원",
    phone: "010-1234-5678",
    pet_name: "레오",
    pet_age: 2,
    address: "서울시 용산구 한남동 45-12 401호",
    entrance_code: "열쇠 아이콘 터치 후 0401#",
    doorlock_code: "0401*",
    specialties: "활동량이 매우 많고 낚싯대 놀이 과격하게 30분 필요, 현관 나갈 때 탈출 충동 제어 주의."
  }
];

// Scheduled Bookings showing a warning 1 hour prior (Sitter confirming safety checklist)
const MOCK_RESERVATIONS = [
  {
    id: 101,
    customer_id: 1,
    client_name: "김미선 회원",
    pet_name: "보리",
    visit_time: "오늘 15:00 - 17:00 (방문 1시간 전)",
    mandatory_requirements: "💊 보리 15시 투약 지침: 신부전 약물 0.5cc 필수 급여 및 2차 주거 보안 코드 확인 준수",
    status: "confirmed",
    is_confirmed_by_sitter: false
  },
  {
    id: 102,
    customer_id: 2,
    client_name: "이은주 회원",
    pet_name: "먼지",
    visit_time: "내일 11:00 - 13:00",
    mandatory_requirements: "👁️ 관절염 보호 및 안약 점안, 소변 누적 횟수 모래통 점검",
    status: "confirmed",
    is_confirmed_by_sitter: false
  }
];

const TIME_SLOTS_POOL = [
  { id: "ts1", time: "오전 10:00 - 12:00", isBooked: true },
  { id: "ts2", time: "오후 13:00 - 15:00", isBooked: false },
  { id: "ts3", time: "오후 16:00 - 18:00", isBooked: true },
  { id: "ts4", time: "오후 19:00 - 21:00", isBooked: false }
];

export default function UnifiedPortal() {
  // Navigation: 'home' (Vibe Cat Care blog) vs 'booking' (Calendar) vs 'sitter' (Sitter Admin Panel)
  const [activePortal, setActivePortal] = useState("home"); 

  // Global Auth / RLS States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeUser, setActiveUser] = useState(null);
  const [toast, setToast] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("vip"); // 'vip' or 'admin'
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- A. HOME PORTAL / BLOG / LOCKED POST STATES ---
  const [posts, setPosts] = useState(STATIC_BLOG_POSTS);
  const [currentFilter, setCurrentFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("log");
  const [newIsRestricted, setNewIsRestricted] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [expandedPostId, setExpandedPostId] = useState(null);
  const [editingPostId, setEditingPostId] = useState(null);
  
  // Post restrictions locking modal
  const [showRestrictedModal, setShowRestrictedModal] = useState(false);
  const [restrictedPostTitle, setRestrictedPostTitle] = useState("");

  // --- B. BOOKING CALENDAR PORTAL STATES ---
  const [currentDate, setCurrentDate] = useState(new Date()); // Dynamic Current Date
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [petName, setPetName] = useState("");
  const [petAge, setPetAge] = useState("");
  const [serviceType, setServiceType] = useState("방문 돌봄");
  const [careMemo, setCareMemo] = useState("");
  const [forceNetworkError, setForceNetworkError] = useState(false);
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [showBookingSuccessModal, setShowBookingSuccessModal] = useState(false);
  const [bookingSummary, setBookingSummary] = useState(null);

  // --- C. 🔒 SITTER PORTAL (ADMIN EXCLUSIVE) STATES ---
  const [sitterReservations, setSitterReservations] = useState(MOCK_RESERVATIONS);
  const [activeReservationIndex, setActiveReservationIndex] = useState(0); // Default to Bori (ID 101, 1 hour prior)
  const [revealedEntranceIds, setRevealedEntranceIds] = useState({});
  const [revealedDoorlockIds, setRevealedDoorlockIds] = useState({});
  
  // Safety confirmation checklist states
  const [checklistReq1, setChecklistReq1] = useState(false);
  const [checklistReq2, setChecklistReq2] = useState(false);
  const [checklistReq3, setChecklistReq3] = useState(false);
  
  // Semi-automatic Care Journal generator states
  const [journalMeal, setJournalMeal] = useState("");
  const [journalActivity, setJournalActivity] = useState("");
  const [journalBowel, setJournalBowel] = useState("");
  const [journalCustomText, setJournalCustomText] = useState("");
  const [journalPreviewText, setJournalPreviewText] = useState("");

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

  // Timer Countdown loop for Masked Security Codes
  useEffect(() => {
    const interval = setInterval(() => {
      // Entrance codes timers
      setRevealedEntranceIds((prev) => {
        const next = { ...prev };
        let updated = false;
        Object.keys(next).forEach((id) => {
          if (next[id] > 0) {
            next[id] -= 1;
            updated = true;
          }
        });
        return updated ? next : prev;
      });

      // Doorlock codes timers
      setRevealedDoorlockIds((prev) => {
        const next = { ...prev };
        let updated = false;
        Object.keys(next).forEach((id) => {
          if (next[id] > 0) {
            next[id] -= 1;
            updated = true;
          }
        });
        return updated ? next : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Auto-generate care journal template text in real-time
  useEffect(() => {
    const mealText = journalMeal ? `[식사: ${journalMeal}]` : "[식사: 미기입]";
    const activityText = journalActivity ? `[활동: ${journalActivity}]` : "[활동: 미기입]";
    const bowelText = journalBowel ? `[배변: ${journalBowel}]` : "[배변: 미기입]";
    const custom = journalCustomText ? `\n💬 추가 메모: ${journalCustomText}` : "";
    
    const timeNow = new Date().toLocaleTimeString("ko-KR", { hour: "numeric", minute: "2-digit" });
    
    setJournalPreviewText(`🐾 Vibe Cat Care 돌봄 보고서 (${timeNow} 기준)\n-----------------------------\n${mealText} ${activityText} ${bowelText}${custom}\n\n전윤교 펫시터가 정성을 다해 아이를 보살폈습니다. 항상 믿고 맡겨주셔서 감사드립니다! ♥`);
  }, [journalMeal, journalActivity, journalBowel, journalCustomText]);

  const fetchSupabasePosts = async () => {
    try {
      const { data: fetchedPosts } = await supabase
        .from("posts")
        .select(`id, title, excerpt, content, category, image_url, is_restricted, author_name, created_at`)
        .order("created_at", { ascending: false });

      if (fetchedPosts && fetchedPosts.length > 0) {
        setPosts(fetchedPosts);
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

  // --- Authentication Handlers ---
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
        showToast(`[Vibe Cat Care] '${selectedProfile.full_name}' 역할로 로그인 완료!`);
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

  // --- B. CALENDAR BOOKING HANDLERS ---
  const getDaysInMonthGrid = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ day: null, date: null, isPast: true });
    }

    const todayDateObj = new Date();
    todayDateObj.setHours(0, 0, 0, 0);

    for (let i = 1; i <= totalDays; i++) {
      const dayDate = new Date(year, month, i);
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
    setSelectedTimeSlot(null);
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();

    if (!selectedDate || !selectedTimeSlot || !petName || !petAge) {
      showToast("필수 예약 양식을 모두 완성해 주세요.");
      return;
    }

    setIsBookingLoading(true);

    setTimeout(() => {
      if (forceNetworkError) {
        setIsBookingLoading(false);
        showToast("⚠️ 네트워크 오류가 발생하여 예약에 실패했습니다. 잠시 후 다시 시도해 주세요.");
        return;
      }

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
      setShowBookingSuccessModal(true);

      // Reset
      setSelectedDate(null);
      setSelectedTimeSlot(null);
      setPetName("");
      setPetAge("");
      setCareMemo("");
    }, 1200);
  };

  // --- C. SITTER PORTAL METHODS ---
  // Reveal codes with 30s timer
  const triggerRevealCode = (customerId, type) => {
    if (type === "entrance") {
      setRevealedEntranceIds((prev) => ({ ...prev, [customerId]: 30 }));
      showToast(`공동현관 비밀번호가 30초 동안 임시 노출됩니다.`);
    } else {
      setRevealedDoorlockIds((prev) => ({ ...prev, [customerId]: 30 }));
      showToast(`도어락 비밀번호가 30초 동안 임시 노출됩니다.`);
    }
  };

  const handleConfirmSafetyChecklist = () => {
    if (!checklistReq1 || !checklistReq2 || !checklistReq3) {
      showToast("모든 필수 안전 체크리스트를 완수하셔야 시작할 수 있습니다.");
      return;
    }

    setSitterReservations((prev) => {
      const next = [...prev];
      next[activeReservationIndex].status = "started";
      return next;
    });

    showToast("🟢 돌봄이 정식 승인되어 시작되었습니다. 현장 모니터링이 시작됩니다.");
  };

  const handleFinishCare = () => {
    setSitterReservations((prev) => {
      const next = [...prev];
      next[activeReservationIndex].status = "completed";
      return next;
    });
    showToast("🏁 돌봄이 종료되었습니다. 작성된 돌봄 일지를 보호자님께 공유할 수 있습니다.");
  };

  const handleCopyJournalLink = () => {
    const mockUrl = `https://vibecatcare.yenu.com/journal/share_id=${Date.now()}`;
    navigator.clipboard.writeText(mockUrl);
    showToast("📋 돌봄 보고서 공유 단축링크가 클립보드에 복사되었습니다!");
  };

  // --- A. BLOG PORTAL HANDLERS ---
  const handlePostCardClick = (post) => {
    // If restricted and not logged in (or logged in but not VIP/Admin)
    const isVip = activeUser && (activeUser.role === "vip" || activeUser.role === "admin");
    if (post.is_restricted && !isVip) {
      setRestrictedPostTitle(post.title);
      setShowRestrictedModal(true);
    } else {
      setExpandedPostId(expandedPostId === post.id ? null : post.id);
    }
  };

  const handleDeletePost = async (e, post) => {
    e.stopPropagation();
    const isOwner = activeUser && activeUser.role === "admin"; // Admin only for posts in blog_schema
    if (!isOwner) {
      showToast("🔒 RLS 권한 위반: 포스트 삭제 권한은 관리자(admin)만 갖습니다.");
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

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setEditingPostId(null);
    setNewTitle("");
    setNewContent("");
    setNewCategory("log");
    setNewIsRestricted(false);
    setNewImageUrl("");
  };

  const handleEditPostClick = (e, post) => {
    e.stopPropagation();
    setEditingPostId(post.id);
    setNewTitle(post.title);
    setNewContent(post.content);
    setNewCategory(post.category);
    setNewIsRestricted(post.is_restricted);
    setNewImageUrl(post.image_url || "");
    setShowCreateModal(true);
  };

  const handleCreatePostSubmit = async (e) => {
    e.preventDefault();
    if (!newTitle || !newContent) {
      showToast("제목과 내용을 입력해 주세요.");
      return;
    }
    setIsSubmitting(true);

    const imageUrl = newImageUrl || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800";

    if (editingPostId) {
      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from("posts")
          .update({
            title: newTitle,
            excerpt: newContent.slice(0, 80) + "...",
            content: newContent,
            category: newCategory,
            image_url: imageUrl,
            is_restricted: newIsRestricted
          })
          .eq("id", editingPostId);
        setIsSubmitting(false);
        if (error) {
          showToast(`수정 실패 (RLS): ${error.message}`);
        } else {
          showToast("포스트가 성공적으로 수정되었습니다!");
          closeCreateModal();
          fetchSupabasePosts();
        }
      } else {
        setTimeout(() => {
          setIsSubmitting(false);
          setPosts(prev =>
            prev.map(p =>
              p.id === editingPostId
                ? {
                    ...p,
                    title: newTitle,
                    excerpt: newContent.slice(0, 80) + "...",
                    content: newContent,
                    category: newCategory,
                    image_url: imageUrl,
                    is_restricted: newIsRestricted
                  }
                : p
            )
          );
          closeCreateModal();
          showToast("🔒 [RLS 시뮬레이션 승인] 포스트가 수정되었습니다.");
        }, 500);
      }
    } else {
      if (isSupabaseConfigured) {
        const { error } = await supabase.from("posts").insert([{
          title: newTitle,
          excerpt: newContent.slice(0, 80) + "...",
          content: newContent,
          category: newCategory,
          image_url: imageUrl,
          is_restricted: newIsRestricted
        }]);
        setIsSubmitting(false);
        if (error) {
          showToast(`실패 (RLS): ${error.message}`);
        } else {
          showToast("포스트가 저장되었습니다!");
          closeCreateModal();
          fetchSupabasePosts();
        }
      } else {
        setTimeout(() => {
          setIsSubmitting(false);
          const newPost = {
            id: Date.now(),
            title: newTitle,
            excerpt: newContent.slice(0, 80) + "...",
            content: newContent,
            category: newCategory,
            image_url: imageUrl,
            is_restricted: newIsRestricted,
            author_name: "전윤교 펫시터",
            created_at: new Date().toISOString()
          };
          setPosts(prev => [newPost, ...prev]);
          closeCreateModal();
          showToast("🔒 [RLS 시뮬레이션 승인] 새 포스트가 등록되었습니다.");
        }, 500);
      }
    }
  };

  const getCategoryName = (cat) => {
    const names = {
      log: "돌봄 일지 🐾",
      photo: "사진첩 📸",
      tip: "전문가 팁 💡"
    };
    return names[cat] || "기타";
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
          🛡️ Supabase 실시간 클라우드 DB 연동 중 | Vibe Cat Care RLS 정책 및 스토리지 연계 완수
        </div>
      ) : (
        <div style={{
          backgroundColor: "var(--primary-orange-light)", color: "var(--primary-orange)",
          padding: "10px 24px", textAlign: "center", fontSize: "0.85rem", fontWeight: "700",
          borderBottom: "1px solid var(--border-light)"
        }}>
          ⚠️ Supabase 설정 대기 중. 로컬 RLS 및 30초 보안 타이머 시뮬레이션 모드로 가동되고 있습니다. (blog/.env.local에서 세팅 가능)
        </div>
      )}

      {/* Global Toast */}
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
                {isSupabaseConfigured ? "등록된 계정으로 로그인해 주세요." : "데모 모드에서는 역할을 선택하여 즉시 로그인 가능합니다!"}
              </p>
            </div>

            <form onSubmit={handleAuthSubmit}>
              {!isSupabaseConfigured ? (
                <div className="form-group" style={{ marginBottom: "20px" }}>
                  <label className="form-label">체험용 회원 유형 선택</label>
                  <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
                    <button
                      type="button"
                      onClick={() => setSelectedRole("vip")}
                      style={{
                        flex: 1, padding: "12px", border: "1.5px solid var(--border-light)",
                        borderRadius: "var(--border-radius-sm)",
                        backgroundColor: selectedRole === "vip" ? "var(--primary-orange-light)" : "transparent",
                        borderColor: selectedRole === "vip" ? "var(--primary-orange)" : "var(--border-light)",
                        color: selectedRole === "vip" ? "var(--primary-orange)" : "var(--text-muted)",
                        fontWeight: "700", cursor: "pointer"
                      }}
                    >
                      👤 일반 회원 (VIP)
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
                      👑 펫시터 (Admin)
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
      {/* 3. RESTRICTED POST LOCK WARNING MODAL */}
      {/* ============================================================== */}
      {showRestrictedModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "rgba(22, 31, 56, 0.7)", display: "flex", alignItems: "center",
          justifyContent: "center", zIndex: 1200, backdropFilter: "blur(8px)"
        }}>
          <div className="premium-card animate-fade-in" style={{ maxWidth: "420px", width: "90%", padding: "40px 32px", textAlign: "center" }}>
            <div style={{ color: "var(--primary-orange)", fontSize: "4.5rem", marginBottom: "20px" }}>
              <i className="fas fa-lock"></i>
            </div>
            <h2 style={{ fontSize: "1.6rem", fontWeight: "800", color: "var(--text-main)", marginBottom: "12px" }}>
              멤버 전용 포스트
            </h2>
            <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", lineHeight: "1.6", marginBottom: "28px" }}>
              상세한 돌봄 일지와 고화질 사진은 회원님들께만 공개됩니다. 로그인을 해주세요!
            </p>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button className="btn btn-primary" onClick={() => {
                setShowRestrictedModal(false);
                setShowLoginModal(true);
              }} style={{ width: "100%" }}>
                인증 로그인하고 즉시 읽기 🔑
              </button>
              <button className="btn btn-secondary" onClick={() => setShowRestrictedModal(false)} style={{ width: "100%" }}>
                돌아가기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. BOOKING SUCCESS MODAL */}
      {/* ============================================================== */}
      {showBookingSuccessModal && bookingSummary && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "rgba(22, 31, 56, 0.7)", display: "flex", alignItems: "center",
          justifyContent: "center", zIndex: 2000, backdropFilter: "blur(8px)"
        }}>
          <div className="premium-card animate-fade-in" style={{ maxWidth: "480px", width: "90%", padding: "40px 32px" }}>
            
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

            <div style={{
              backgroundColor: "var(--bg-primary)",
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
              확인 및 일정표 돌아가기
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. CREATE POST MODAL (FOR ADMIN/SITTER) */}
      {/* ============================================================== */}
      {showCreateModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "rgba(22, 31, 56, 0.6)", display: "flex", alignItems: "center",
          justifyContent: "center", zIndex: 1000, backdropFilter: "blur(6px)"
        }}>
          <div className="premium-card animate-fade-in" style={{ maxWidth: "550px", width: "95%", padding: "36px 28px" }}>
            <div style={{ borderBottom: "1px solid var(--border-light)", paddingBottom: "12px", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "1.4rem", color: "var(--text-main)", fontWeight: "800" }}>
                {editingPostId ? "📝 포스트 수정 (Vibe Cat Care)" : "📝 새 포스트 작성 (Vibe Cat Care)"}
              </h3>
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
                  <option value="log">돌봄 일지</option>
                  <option value="photo">사진첩</option>
                  <option value="tip">전문가 팁</option>
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

              <div className="form-group">
                <label className="form-label">이미지 URL (선택)</label>
                <input
                  type="text"
                  className="form-input"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "16px 0" }}>
                <input
                  type="checkbox"
                  id="restrictCheckbox"
                  checked={newIsRestricted}
                  onChange={(e) => setNewIsRestricted(e.target.checked)}
                  style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "var(--primary-orange)" }}
                />
                <label htmlFor="restrictCheckbox" style={{ fontSize: "0.95rem", fontWeight: "600", color: "var(--text-main)", cursor: "pointer" }}>
                  🔒 VIP/멤버 전용 콘텐츠로 잠금 설정 (Restricted)
                </label>
              </div>

              <div className="form-group" style={{ marginBottom: "24px" }}>
                <label className="form-label">상세 본문 내용</label>
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
                <button type="button" className="btn btn-secondary" onClick={closeCreateModal} style={{ flex: 1 }}>
                  취소
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ flex: 2 }}>
                  {isSubmitting ? "서버 저장 중..." : editingPostId ? "포스트 수정 완료 🔓" : "포스트 등록 완료 🔓"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. HEADER BAR (Vibe Cat Care branding) */}
      {/* ============================================================== */}
      <header style={{
        backgroundColor: "var(--bg-secondary)", borderBottom: "1px solid var(--border-light)",
        position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(10px)",
        background: "rgba(255,255,255,0.85)"
      }}>
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "80px" }}>
          
          {/* Logo brand linked from index.html */}
          <div onClick={() => setActivePortal("home")} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
            <span style={{ fontSize: "1.8rem", color: "var(--primary-orange)" }}>
              <i className="fas fa-paw"></i>
            </span>
            <div>
              <span style={{ fontSize: "1.4rem", fontWeight: "800", letterSpacing: "-0.5px", color: "var(--text-main)", fontFamily: "Outfit" }}>
                Vibe Cat Care
              </span>
              <span style={{ fontSize: "0.75rem", color: "var(--success-mint)", fontWeight: "600", display: "block", marginTop: "-3px" }}>
                전윤교의 고양이 전문 돌봄 포털
              </span>
            </div>
          </div>

          {/* Top Tabs - Merged client HTML site & NextJS Portal */}
          <div style={{
            display: "flex", backgroundColor: "var(--bg-primary)", padding: "5px",
            borderRadius: "var(--border-radius-full)", border: "1px solid var(--border-light)"
          }}>
            <button
              onClick={() => setActivePortal("home")}
              style={{
                border: "none", background: activePortal === "home" ? "var(--primary-orange)" : "transparent",
                color: activePortal === "home" ? "white" : "var(--text-muted)",
                padding: "8px 18px", borderRadius: "var(--border-radius-full)",
                fontSize: "0.85rem", fontWeight: "700", cursor: "pointer", transition: "var(--transition-fast)"
              }}
            >
              🏠 Vibe Cat Care 홈
            </button>
            <button
              onClick={() => setActivePortal("booking")}
              style={{
                border: "none", background: activePortal === "booking" ? "var(--primary-orange)" : "transparent",
                color: activePortal === "booking" ? "white" : "var(--text-muted)",
                padding: "8px 18px", borderRadius: "var(--border-radius-full)",
                fontSize: "0.85rem", fontWeight: "700", cursor: "pointer", transition: "var(--transition-fast)"
              }}
            >
              📅 실시간 캘린더 예약
            </button>
            <button
              onClick={() => {
                if (!isLoggedIn) {
                  showToast("🔒 보안 수칙: 펫시터 관리 권한 확인을 위해 로그인이 필요합니다.");
                  setShowLoginModal(true);
                } else if (activeUser && activeUser.role !== "admin") {
                  showToast("🔒 보안 경고: 이 탭은 펫시터(관리자) 전용 공간입니다. 관리자로 재인증해주세요.");
                } else {
                  setActivePortal("sitter");
                }
              }}
              style={{
                border: "none", background: activePortal === "sitter" ? "var(--primary-orange)" : "transparent",
                color: activePortal === "sitter" ? "white" : "var(--text-muted)",
                padding: "8px 18px", borderRadius: "var(--border-radius-full)",
                fontSize: "0.85rem", fontWeight: "700", cursor: "pointer", transition: "var(--transition-fast)"
              }}
            >
              🔒 펫시터 대시보드
            </button>
          </div>

          {/* User Profile UI from index.html */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {isLoggedIn && activeUser ? (
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-main)" }}>
                  👤 {activeUser.full_name}
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
      {/* 7. PORTAL VIEW A: 🏠 VIBE CAT CARE HOME & BLOG */}
      {/* ============================================================== */}
      {activePortal === "home" && (
        <main className="animate-fade-in" style={{ flex: 1 }}>
          
          {/* Hero Section from index.html (Synthesized with Outfit styling) */}
          <section style={{
            padding: "80px 0",
            background: "linear-gradient(135deg, hsl(38, 100%, 95%) 0%, hsl(150, 50%, 96%) 100%)",
            borderBottom: "1px solid var(--border-light)"
          }}>
            <div className="container" style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "48px",
              alignItems: "center"
            }}>
              <div>
                <h1 style={{
                  fontSize: "3.2rem",
                  lineHeight: "1.15",
                  fontWeight: "800",
                  color: "var(--text-main)",
                  marginBottom: "20px"
                }}>
                  고양이들의 행복한<br />기록을 담습니다 🐾
                </h1>
                <p style={{ fontSize: "1.15rem", color: "var(--text-muted)", lineHeight: "1.6", marginBottom: "30px" }}>
                  전문 펫시터 전윤교가 들려주는 생생한 돌봄 이야기와 소중한 고객 고양이들의 일상을 만나보세요. 
                  주요 주거 안전 코드 보관과 반자동 일지 기록을 제공하는 프리미엄 연동 시스템입니다.
                </p>

                {/* Status Indicator from index.html */}
                <div style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "12px 20px",
                  backgroundColor: "var(--bg-secondary)",
                  borderRadius: "var(--border-radius-md)",
                  border: "1px solid var(--border-light)",
                  boxShadow: "var(--shadow-sm)"
                }}>
                  <span style={{
                    width: "10px", height: "10px", borderRadius: "50%",
                    backgroundColor: isLoggedIn ? "var(--success-mint)" : "var(--primary-orange)",
                    display: "inline-block"
                  }}></span>
                  <span style={{ fontSize: "0.9rem", fontWeight: "700", color: "var(--text-main)" }}>
                    {isLoggedIn && activeUser ? (
                      <>현재 <strong style={{ color: "var(--success-mint)" }}>{activeUser.full_name} ({activeUser.role.toUpperCase()})</strong> 로그인 상태입니다.</>
                    ) : (
                      <>현재 <strong style={{ color: "var(--primary-orange)" }}>비회원</strong> 상태입니다. (VIP 전용 글 잠금 작동)</>
                    )}
                  </span>
                </div>
              </div>

              {/* Dynamic rendering of hero.png */}
              <div style={{ display: "flex", justifyContent: "center" }}>
                <img
                  src="/hero.png"
                  alt="Vibe Cat Care"
                  style={{
                    maxWidth: "100%",
                    height: "auto",
                    borderRadius: "30px",
                    boxShadow: "var(--shadow-lg)",
                    border: "6px solid white"
                  }}
                  onError={(e) => {
                    // Fallback to high quality cat image if hero.png has server bundle fetch issue
                    e.target.src = "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800";
                  }}
                />
              </div>
            </div>
          </section>

          {/* Filter and Post lists */}
          <section style={{ padding: "60px 0" }}>
            <div className="container">
              
              <div style={{
                display: "flex", flexWrap: "wrap", justifyContent: "space-between",
                alignItems: "center", gap: "20px", marginBottom: "40px",
                borderBottom: "1.5px solid var(--border-light)", paddingBottom: "24px"
              }}>
                {/* Category Filtering Tab controls */}
                <div style={{ display: "flex", gap: "10px", overflowX: "auto" }}>
                  {[
                    { val: "all", label: "전체 목록" },
                    { val: "log", label: "돌봄 일지" },
                    { val: "photo", label: "사진첩" },
                    { val: "tip", label: "전문가 팁" }
                  ].map(cat => (
                    <button
                      key={cat.val}
                      onClick={() => setCurrentFilter(cat.val)}
                      style={{
                        padding: "10px 20px", border: "1.5px solid var(--border-light)",
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

                {/* Create post button for Admin */}
                {activeUser && activeUser.role === "admin" && (
                  <button className="btn btn-primary" onClick={() => setShowCreateModal(true)} style={{ padding: "10px 20px" }}>
                    ✍️ 새 포스트 작성 (Admin)
                  </button>
                )}
              </div>

              {/* Dynamic Posts Grid conforming to index.html layouts */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "30px"
              }}>
                {filteredPosts.map(post => {
                  const isVip = activeUser && (activeUser.role === "vip" || activeUser.role === "admin");
                  const isLocked = post.is_restricted && !isVip;
                  const isExpanded = expandedPostId === post.id;
                  const isAdmin = activeUser && activeUser.role === "admin";

                  return (
                    <div
                      key={post.id}
                      onClick={() => handlePostCardClick(post)}
                      className="premium-card animate-fade-in"
                      style={{
                        cursor: "pointer",
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                        border: isExpanded ? "2px solid var(--primary-orange)" : "1.5px solid var(--border-light)",
                        position: "relative"
                      }}
                    >
                      {/* Image Zone with lock banner if restricted */}
                      <div style={{ height: "200px", overflow: "hidden", position: "relative", backgroundColor: "#e2e8f0" }}>
                        <img
                          src={post.image_url}
                          alt={post.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "var(--transition-smooth)" }}
                        />
                        <span style={{
                          position: "absolute", top: "12px", right: "12px",
                          backgroundColor: "rgba(255, 255, 255, 0.9)", color: "var(--text-main)",
                          fontSize: "0.7rem", fontWeight: "800", padding: "4px 8px", borderRadius: "12px",
                          border: "1px solid var(--border-light)"
                        }}>
                          {getCategoryName(post.category)}
                        </span>

                        {isLocked && (
                          <div style={{
                            position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
                            backgroundColor: "rgba(22, 31, 56, 0.75)", display: "flex", flexDirection: "column",
                            alignItems: "center", justifyContent: "center", color: "white", gap: "8px"
                          }}>
                            <i className="fas fa-lock" style={{ fontSize: "2.2rem", color: "var(--primary-orange)" }}></i>
                            <span style={{ fontSize: "0.85rem", fontWeight: "700", letterSpacing: "0.5px" }}>
                              VIP 회원 전용
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content zone */}
                      <div style={{ padding: "20px", flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          <span>📅 {new Date(post.created_at).toLocaleDateString()}</span>
                          <span>👤 {post.author_name}</span>
                        </div>

                        <h3 style={{ fontSize: "1.15rem", fontWeight: "800", color: "var(--text-main)", lineHeight: "1.4" }}>
                          {post.title}
                          {post.is_restricted && <span style={{ marginLeft: "6px", color: "var(--primary-orange)" }}>🔒</span>}
                        </h3>

                        <p style={{
                          fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: "1.6",
                          whiteSpace: isExpanded ? "pre-wrap" : "normal",
                          display: isExpanded ? "block" : "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: isExpanded ? "visible" : "hidden",
                          margin: 0
                        }}>
                          {post.content}
                        </p>
                      </div>

                      {/* Sitter ImageUploader (Admin interface when expanded) */}
                      {isExpanded && isAdmin && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            padding: "0 20px 20px 20px",
                            borderTop: "1.5px dashed var(--border-light)",
                            paddingTop: "15px"
                          }}
                        >
                          <ImageUploader
                            postId={post.id}
                            userId={activeUser?.id}
                            isOwnerOrAdmin={true}
                          />
                        </div>
                      )}

                      {/* Card Footer action indicators */}
                      <div style={{
                        padding: "12px 20px",
                        backgroundColor: "var(--bg-primary)",
                        borderTop: "1px solid var(--border-light)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}>
                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                          {isLocked ? "🔒 클릭하여 회원권 로그인" : isExpanded ? "▲ 접기" : "▼ 클릭하여 전체 읽기"}
                        </span>

                        {isAdmin && (
                          <div style={{ display: "flex", gap: "6px" }} onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={(e) => handleEditPostClick(e, post)}
                              style={{
                                backgroundColor: "var(--primary-orange-light)", color: "var(--primary-orange)",
                                border: "none", padding: "4px 10px", borderRadius: "6px",
                                fontSize: "0.75rem", fontWeight: "700", cursor: "pointer"
                              }}
                            >
                              수정
                            </button>
                            <button
                              onClick={(e) => handleDeletePost(e, post)}
                              style={{
                                backgroundColor: "var(--warning-coral-light)", color: "var(--warning-coral)",
                                border: "none", padding: "4px 10px", borderRadius: "6px",
                                fontSize: "0.75rem", fontWeight: "700", cursor: "pointer"
                              }}
                            >
                              삭제
                            </button>
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          </section>

        </main>
      )}

      {/* ============================================================== */}
      {/* 8. PORTAL VIEW B: 📅 실시간 캘린더 예약 (보호자 채널) */}
      {/* ============================================================== */}
      {activePortal === "booking" && (
        <main className="animate-fade-in" style={{ flex: 1, padding: "40px 0" }}>
          <div className="container" style={{ maxWidth: "1000px" }}>
            
            <div style={{ textAlign: "center", marginBottom: "36px" }}>
              <span style={{
                backgroundColor: "var(--primary-orange-light)", color: "var(--primary-orange)",
                fontSize: "0.8rem", fontWeight: "700", padding: "6px 14px", borderRadius: "20px"
              }}>
                보호자 전용 실시간 돌봄 간편 예약 채널 📅
              </span>
              <h2 style={{ fontSize: "2rem", color: "var(--text-main)", fontWeight: "800", marginTop: "12px", marginBottom: "8px" }}>
                직관적인 캘린더 실시간 돌봄 예약
              </h2>
              <p style={{ fontSize: "0.95rem", color: "var(--text-muted)" }}>
                캘린더에서 원하시는 날짜와 여유 시간대를 선택해 주시면 전문 펫시터 전윤교님이 집으로 직접 찾아갑니다.
              </p>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "32px", alignItems: "flex-start" }}>
              
              {/* Left Column: Calendar & Times */}
              <div style={{ flex: "1 1 500px", display: "flex", flexDirection: "column", gap: "24px" }}>
                
                {/* 캘린더 그리드 */}
                <div className="premium-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <h3 style={{ fontSize: "1.15rem", fontWeight: "800" }}>
                      📅 {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월 돌봄 일정표
                    </h3>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "600" }}>
                      * 오늘({new Date().getMonth() + 1}/{new Date().getDate()}) 이전 날짜 선택 불가
                    </span>
                  </div>

                  <div style={{
                    display: "grid", gridTemplateColumns: "repeat(7, 1fr)",
                    textAlign: "center", fontWeight: "700", fontSize: "0.8rem",
                    color: "var(--text-muted)", marginBottom: "10px"
                  }}>
                    {["일", "월", "화", "수", "목", "금", "토"].map(d => <span key={d}>{d}</span>)}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px" }}>
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
                          {dayObj.date && dayObj.date.toDateString() === new Date().toDateString() && (
                            <span style={{ fontSize: "0.6rem", color: isSelected ? "white" : "var(--primary-orange)" }}>오늘</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 시간 선택 */}
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

              {/* Right Column: Detail Forms */}
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
                      placeholder="예: 치즈, 먼지, 레오"
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
                      placeholder="숫자 기입 (예: 14)"
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
                      placeholder="투약 지침, 산책 시 주의사항, 도어락 출입 수칙 등을 자세히 적어주세요."
                      style={{ resize: "vertical" }}
                    ></textarea>
                  </div>

                  {/* Network error simulator control */}
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
                        에러 발생 시의 무한로딩 탈출 안내문을 테스트합니다.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={forceNetworkError}
                      onChange={(e) => setForceNetworkError(e.target.checked)}
                      style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "var(--warning-coral)" }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isBookingLoading}
                    style={{ width: "100%", padding: "16px", fontSize: "1.1rem", marginTop: "12px" }}
                  >
                    {isBookingLoading ? "예약 신청 전송 중... (안전 복구 보호 활성)" : "돌봄 예약 확정하기 📝"}
                  </button>
                </form>
              </div>

            </div>
          </div>
        </main>
      )}

      {/* ============================================================== */}
      {/* 9. PORTAL VIEW C: 🔒 펫시터 전용 관리 대시보드 (Admin Panel) */}
      {/* ============================================================== */}
      {activePortal === "sitter" && activeUser && activeUser.role === "admin" && (
        <main className="animate-fade-in" style={{ flex: 1, padding: "40px 0" }}>
          <div className="container">
            
            {/* Header section */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1.5px solid var(--border-light)",
              paddingBottom: "20px",
              marginBottom: "32px"
            }}>
              <div>
                <span style={{
                  backgroundColor: "var(--warning-coral-light)", color: "var(--warning-coral)",
                  fontSize: "0.75rem", fontWeight: "800", padding: "4px 10px", borderRadius: "12px"
                }}>
                  펫시터 전용 관리자 보안 모듈 🔒
                </span>
                <h2 style={{ fontSize: "1.8rem", color: "var(--text-main)", fontWeight: "800", marginTop: "6px" }}>
                  고객 정보 및 보안 돌봄 대시보드
                </h2>
              </div>
              
              <div style={{ display: "flex", gap: "10px" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  현재 관리자: <strong>{activeUser.full_name}</strong>
                </span>
              </div>
            </div>

            {/* ========================================== */}
            {/* 3.2 방문 전 안전 배너 (Pre-visit Safety Dashboard) */}
            {/* ========================================== */}
            <div style={{ marginBottom: "32px" }}>
              <div style={{
                border: "2px solid var(--warning-coral)",
                backgroundColor: "var(--warning-coral-light)",
                borderRadius: "var(--border-radius-lg)",
                padding: "24px",
                boxShadow: "var(--shadow-md)"
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                  <span style={{ fontSize: "2rem", color: "var(--warning-coral)" }}>
                    <i className="fas fa-exclamation-triangle"></i>
                  </span>
                  <div style={{ flex: 1 }}>
                    <span style={{
                      backgroundColor: "var(--warning-coral)", color: "white",
                      fontSize: "0.7rem", fontWeight: "800", padding: "2px 8px", borderRadius: "8px",
                      textTransform: "uppercase"
                    }}>
                      긴급 알림 (방문 1시간 전 예약 감지)
                    </span>
                    <h3 style={{ fontSize: "1.25rem", color: "var(--text-main)", fontWeight: "850", marginTop: "6px", marginBottom: "4px" }}>
                      {sitterReservations[activeReservationIndex].visit_time} - {sitterReservations[activeReservationIndex].client_name}
                    </h3>
                    <p style={{ fontSize: "0.9rem", color: "var(--text-main)", fontWeight: "700", marginBottom: "16px" }}>
                      {sitterReservations[activeReservationIndex].mandatory_requirements}
                    </p>

                    {/* Status badge */}
                    <div style={{ marginBottom: "16px" }}>
                      <span style={{
                        fontSize: "0.8rem", fontWeight: "800",
                        padding: "6px 12px", borderRadius: "20px",
                        backgroundColor: sitterReservations[activeReservationIndex].status === "started" ? "var(--primary-orange-light)" : 
                                         sitterReservations[activeReservationIndex].status === "completed" ? "var(--success-mint-light)" : "#e2e8f0",
                        color: sitterReservations[activeReservationIndex].status === "started" ? "var(--primary-orange)" : 
                               sitterReservations[activeReservationIndex].status === "completed" ? "var(--success-mint)" : "var(--text-muted)"
                      }}>
                        상태: {sitterReservations[activeReservationIndex].status === "started" ? "⚡ 돌봄 진행 중 (Started)" :
                               sitterReservations[activeReservationIndex].status === "completed" ? "🏁 돌봄 완료 (Completed)" : "💤 대기 중 (Confirmed)"}
                      </span>
                    </div>

                    {sitterReservations[activeReservationIndex].status === "confirmed" ? (
                      <div style={{
                        backgroundColor: "white", padding: "18px", borderRadius: "var(--border-radius-md)",
                        border: "1px solid var(--border-light)", display: "flex", flexDirection: "column", gap: "10px"
                      }}>
                        <strong style={{ fontSize: "0.85rem", color: "var(--text-main)", display: "block", marginBottom: "4px" }}>
                          ⚠️ 인적 실수 예방 필수 확인 프로세스 (3가지 수칙 체크 필수)
                        </strong>
                        
                        <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.85rem", cursor: "pointer" }}>
                          <input type="checkbox" checked={checklistReq1} onChange={(e) => setChecklistReq1(e.target.checked)} />
                          <span>1. 신부전 약물(0.5cc) 급여 지침 및 식사 제공 수칙을 온전히 인지하였습니다.</span>
                        </label>
                        <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.85rem", cursor: "pointer" }}>
                          <input type="checkbox" checked={checklistReq2} onChange={(e) => setChecklistReq2(e.target.checked)} />
                          <span>2. 고객 개인정보 보안 카드를 통해 공동현관 및 도어락 비밀번호를 열람 확인하였습니다.</span>
                        </label>
                        <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.85rem", cursor: "pointer" }}>
                          <input type="checkbox" checked={checklistReq3} onChange={(e) => setChecklistReq3(e.target.checked)} />
                          <span>3. 탈출 예방을 위해 현관 출입 시 고양이 위치를 철저히 확인하고 진입하겠습니다.</span>
                        </label>

                        <button
                          className="btn btn-coral"
                          onClick={handleConfirmSafetyChecklist}
                          disabled={!checklistReq1 || !checklistReq2 || !checklistReq3}
                          style={{ marginTop: "12px", width: "fit-content" }}
                        >
                          모든 주의사항을 숙지하였으며, 돌봄을 시작합니다 🐾
                        </button>
                      </div>
                    ) : sitterReservations[activeReservationIndex].status === "started" ? (
                      <div style={{
                        backgroundColor: "white", padding: "18px", borderRadius: "var(--border-radius-md)",
                        border: "1px solid var(--border-light)"
                      }}>
                        <p style={{ fontSize: "0.85rem", color: "var(--success-mint)", fontWeight: "700", marginBottom: "8px" }}>
                          ✓ 안전 체크 완료 승인 시각: 오늘 14:58 | 현장 돌봄이 안전하게 기록 중입니다.
                        </p>
                        <button className="btn btn-primary" onClick={handleFinishCare} style={{ backgroundColor: "var(--success-mint)" }}>
                          돌봄 업무 완료 및 종료하기 🏁
                        </button>
                      </div>
                    ) : (
                      <div style={{
                        backgroundColor: "white", padding: "18px", borderRadius: "var(--border-radius-md)",
                        border: "1px solid var(--border-light)"
                      }}>
                        <p style={{ fontSize: "0.85rem", color: "var(--success-mint)", fontWeight: "700", margin: 0 }}>
                          🎉 오늘 보리네 돌봄 업무가 사고 없이 무사히 마무리되었습니다. 보호자님께 아래 일지를 공유해 주세요.
                        </p>
                      </div>
                    )}

                  </div>
                </div>
              </div>
            </div>

            {/* Split layout: Left Customer Security, Right Semi-automatic Care Journal */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "30px" }}>
              
              {/* Left Side: 3.1 고객 관리 및 개인정보 보안 저장 (Masked Codes with 30s timer) */}
              <div style={{ flex: "1 1 450px", display: "flex", flexDirection: "column", gap: "20px" }}>
                
                <h3 style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--text-main)", borderBottom: "1px solid var(--border-light)", paddingBottom: "8px", margin: 0 }}>
                  📂 등록 고객 보안 관리대장 (출입코드 30초 한시 공개)
                </h3>

                {CUSTOMERS_DB.map((customer) => {
                  const entranceTimer = revealedEntranceIds[customer.id] || 0;
                  const doorlockTimer = revealedDoorlockIds[customer.id] || 0;

                  return (
                    <div key={customer.id} className="premium-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
                      
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h4 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--text-main)" }}>
                          🐱 {customer.pet_name}네 ({customer.client_name}, {customer.pet_age}살)
                        </h4>
                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                          📞 {customer.phone}
                        </span>
                      </div>

                      <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        <span style={{ fontWeight: "700", color: "var(--text-main)", display: "block" }}>주소</span>
                        {customer.address}
                      </div>

                      <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        <span style={{ fontWeight: "700", color: "var(--text-main)", display: "block" }}>반려동물 특이사항</span>
                        <p style={{ margin: 0, fontStyle: "italic", color: "var(--warning-coral)" }}>
                          "{customer.specialties}"
                        </p>
                      </div>

                      {/* Security code masked blocks */}
                      <div style={{
                        marginTop: "10px",
                        padding: "16px",
                        backgroundColor: "var(--bg-primary)",
                        borderRadius: "var(--border-radius-md)",
                        border: "1.5px solid var(--border-light)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px"
                      }}>
                        
                        {/* 1. 공동현관 코드 */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--text-muted)", display: "block" }}>
                              공동현관 비밀번호
                            </span>
                            <strong style={{ fontSize: "1.05rem", color: entranceTimer > 0 ? "var(--warning-coral)" : "var(--text-main)", fontFamily: "monospace", letterSpacing: "1px" }}>
                              {entranceTimer > 0 ? customer.entrance_code : "••••••••"}
                            </strong>
                          </div>
                          <button
                            onClick={() => triggerRevealCode(customer.id, "entrance")}
                            className="btn"
                            disabled={entranceTimer > 0}
                            style={{
                              padding: "8px 14px", fontSize: "0.75rem", borderRadius: "8px",
                              backgroundColor: entranceTimer > 0 ? "transparent" : "var(--text-main)",
                              color: "white"
                            }}
                          >
                            {entranceTimer > 0 ? `잠금 해제 중 (${entranceTimer}초)` : "보안 열람 🔑"}
                          </button>
                        </div>

                        {/* 2. 도어락 비밀번호 */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-light)", paddingTop: "10px" }}>
                          <div>
                            <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--text-muted)", display: "block" }}>
                              세대 도어락 비밀번호
                            </span>
                            <strong style={{ fontSize: "1.05rem", color: doorlockTimer > 0 ? "var(--warning-coral)" : "var(--text-main)", fontFamily: "monospace", letterSpacing: "1px" }}>
                              {doorlockTimer > 0 ? customer.doorlock_code : "••••••••"}
                            </strong>
                          </div>
                          <button
                            onClick={() => triggerRevealCode(customer.id, "doorlock")}
                            className="btn"
                            disabled={doorlockTimer > 0}
                            style={{
                              padding: "8px 14px", fontSize: "0.75rem", borderRadius: "8px",
                              backgroundColor: doorlockTimer > 0 ? "transparent" : "var(--text-main)",
                              color: "white"
                            }}
                          >
                            {doorlockTimer > 0 ? `잠금 해제 중 (${doorlockTimer}초)` : "보안 열람 🔑"}
                          </button>
                        </div>

                      </div>

                    </div>
                  );
                })}
              </div>

              {/* Right Side: 3.3 간편 일지 작성 및 정리 (Easy Care Journal Generator) */}
              <div style={{ flex: "1 1 450px", display: "flex", flexDirection: "column", gap: "20px" }}>
                
                <h3 style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--text-main)", borderBottom: "1px solid var(--border-light)", paddingBottom: "8px", margin: 0 }}>
                  ✍️ AI 반자동 돌봄 일지 빌더
                </h3>

                <div className="premium-card" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  
                  {/* Category A: Meal options */}
                  <div>
                    <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-main)", display: "block", marginBottom: "8px" }}>
                      🍲 식사 급여 상태
                    </span>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {["완식", "일부 남김", "사료 거부", "약 복용 완료"].map((chip) => (
                        <button
                          key={chip}
                          onClick={() => setJournalMeal(chip)}
                          style={{
                            padding: "8px 14px", border: "1.5px solid var(--border-light)",
                            borderRadius: "var(--border-radius-sm)", fontSize: "0.8rem", fontWeight: "700",
                            backgroundColor: journalMeal === chip ? "var(--primary-orange)" : "white",
                            color: journalMeal === chip ? "white" : "var(--text-muted)",
                            cursor: "pointer", transition: "var(--transition-fast)"
                          }}
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Category B: Activity options */}
                  <div>
                    <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-main)", display: "block", marginBottom: "8px" }}>
                      🎾 활동 및 놀이 상태
                    </span>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {["실내 놀이 완료", "산책 완료 (20분)", "컨디션 좋음", "무기력함"].map((chip) => (
                        <button
                          key={chip}
                          onClick={() => setJournalActivity(chip)}
                          style={{
                            padding: "8px 14px", border: "1.5px solid var(--border-light)",
                            borderRadius: "var(--border-radius-sm)", fontSize: "0.8rem", fontWeight: "700",
                            backgroundColor: journalActivity === chip ? "var(--primary-orange)" : "white",
                            color: journalActivity === chip ? "white" : "var(--text-muted)",
                            cursor: "pointer", transition: "var(--transition-fast)"
                          }}
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Category C: Bowel options */}
                  <div>
                    <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-main)", display: "block", marginBottom: "8px" }}>
                      💩 배변 상태 점검
                    </span>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {["소변 양호", "대변 양호", "설사/묽은변", "배변 없음"].map((chip) => (
                        <button
                          key={chip}
                          onClick={() => setJournalBowel(chip)}
                          style={{
                            padding: "8px 14px", border: "1.5px solid var(--border-light)",
                            borderRadius: "var(--border-radius-sm)", fontSize: "0.8rem", fontWeight: "700",
                            backgroundColor: journalBowel === chip ? "var(--primary-orange)" : "white",
                            color: journalBowel === chip ? "white" : "var(--text-muted)",
                            cursor: "pointer", transition: "var(--transition-fast)"
                          }}
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Textarea for custom details */}
                  <div className="form-group">
                    <label className="form-label">✍️ 펫시터 수동 코멘트 추가</label>
                    <textarea
                      rows="3"
                      className="form-input"
                      value={journalCustomText}
                      onChange={(e) => setJournalCustomText(e.target.value)}
                      placeholder="특이사항이나 아이에게 해주고 싶은 말을 적으세요. 실시간으로 조합되어 완성됩니다."
                      style={{ resize: "vertical" }}
                    ></textarea>
                  </div>

                  {/* Dynamic Journal Template Output */}
                  <div style={{
                    backgroundColor: "var(--bg-primary)",
                    padding: "20px",
                    borderRadius: "var(--border-radius-md)",
                    border: "1.5px solid var(--border-light)"
                  }}>
                    <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--primary-orange)", display: "block", marginBottom: "10px" }}>
                      📱 보호자 전송용 보고서 실시간 미리보기 (키워드 조합형)
                    </span>
                    <pre style={{
                      whiteSpace: "pre-wrap",
                      fontFamily: "var(--font-outfit)",
                      fontSize: "0.85rem",
                      color: "var(--text-main)",
                      lineHeight: "1.6",
                      margin: 0,
                      backgroundColor: "white",
                      padding: "16px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-light)"
                    }}>
                      {journalPreviewText}
                    </pre>
                  </div>

                  {/* Copy Link Share Clipboard button */}
                  <button
                    className="btn btn-primary"
                    onClick={handleCopyJournalLink}
                    style={{ width: "100%", padding: "14px 20px" }}
                  >
                    🔗 카카오톡/문자 공유 링크 클립보드 복사
                  </button>

                </div>

              </div>

            </div>

          </div>
        </main>
      )}

      {/* ============================================================== */}
      {/* 10. FOOTER */}
      {/* ============================================================== */}
      <footer style={{
        backgroundColor: "var(--text-main)", color: "rgba(255, 255, 255, 0.65)",
        padding: "30px 0", borderTop: "1px solid var(--border-light)", marginTop: "auto"
      }}>
        <div className="container" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
          <div>
            <strong style={{ color: "white", fontSize: "1.1rem", display: "block", marginBottom: "4px" }}>Vibe Cat Care (Yoongyopoomae) Hub</strong>
            <span style={{ fontSize: "0.8rem" }}>사용자 지정 RLS & 30초 암호 마스킹 & 캘린더 예약 스위트</span>
          </div>
          <div style={{ fontSize: "0.8rem", textAlign: "right" }}>
            <span>© 2026 Vibe Cat Care. All Rights Reserved.</span>
            <span style={{ display: "block", color: "var(--primary-orange)", marginTop: "2px", fontWeight: "600" }}>
              🔒 Supabase row-level-security & double-pass security timer standard
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
