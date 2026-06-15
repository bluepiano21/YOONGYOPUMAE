/* eslint-disable */
"use client";

import React, { useState, useEffect, useRef } from "react";
import Script from "next/script";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import ImageUploader from "../components/ImageUploader";
import JournalMediaUploader from "../components/JournalMediaUploader";
import PricingSection from "../components/PricingSection";

// Safety sanitization utility to prevent XSS and raw HTML/script code execution
const sanitizeInputText = (str) => {
  if (typeof str !== "string") return "";
  // Strip HTML and script tags (e.g. <svg onload=...>) to ensure raw text rendering
  return str.replace(/<[^>]*>?/gm, "");
};

// ==============================================================
// 1. DUMMY & SEED DATA (Conforming to blog_schema & PRD)
// ==============================================================

const DEMO_USERS = {
  member: {
    id: "22222222-2222-2222-2222-222222222222",
    username: "user_kim",
    full_name: "김미선 회원 (일반회원)",
    role: "member"
  },
  sitter: {
    id: "33333333-3333-3333-3333-333333333333",
    username: "sitter_jeon",
    full_name: "전윤교 펫시터 (펫시터)",
    role: "sitter"
  },
  admin: {
    id: "11111111-1111-1111-1111-111111111111",
    username: "admin_yenu",
    full_name: "예누 관리자 (Admin)",
    role: "admin"
  }
};

const FAQ_LIST = [
  {
    id: "faq_difference",
    question: "Q1. 일반 펫시터 서비스와 '윤교품애'는 어떤 점이 다른가요? 🐱",
    answer: "👉 '윤교품애'는 단순한 시간 때우기식 돌봄이 아닌, 아이의 삶의 질을 높이는 프리미엄 요양 케어에 집중합니다. 노령펫 케어, 반려동물 식품관리사, 펫시터 1급, 펫푸드 스타일리스트, 아로마 기초 강사 등 전문 자격증을 보유한 전문가가 아이의 상태(수술 후 회복, 노령 케어, 약 복용 등)에 맞춰 1:1 맞춤형 케어를 제공합니다. 🎓",
    keywords: ["차이", "다른 점", "차별", "일반 펫시터", "다르", "전문성", "자격증"]
  },
  {
    id: "faq_recovery",
    question: "Q2. 수술을 마친 지 얼마 안 되었거나 매일 약을 먹어야 하는데 케어가 가능한가요? 💊",
    answer: "👉 네, 당연히 가능합니다! 수술 후 안정이 필요한 아이, 격리 및 스트레스 케어가 필요한 아이, 정해진 시간에 약 복용 및 영양 관리가 필요한 아이들을 위한 전문 케어 프로그램을 갖추고 있습니다. 아이의 기존 처방과 주의사항을 전달해 주시면 스케줄에 맞춰 안전하게 관리합니다. 🏥",
    keywords: ["수술", "약", "복용", "투약", "의료", "요양", "환자", "아픈", "처방"]
  },
  {
    id: "faq_checking",
    question: "Q3. 돌봄 시간 동안 아이가 어떻게 지내고 있는지 확인할 수 있나요? 📸",
    answer: "👉 보호자님의 불안한 마음을 잘 알고 있습니다. '윤교품애'는 돌봄이 시작되면 실시간으로 아이의 상태, 식사 및 약 복용 여부, 컨디션 등을 사진/동영상과 함께 정기적으로 메시지를 통해 공유해 드립니다. 출근이나 여행 중에도 안심하고 확인하실 수 있습니다. 📱",
    keywords: ["확인", "실시간", "일지", "사진", "동영상", "연락", "공유", "메시지"]
  },
  {
    id: "faq_process",
    question: "Q4. 예약은 어떻게 진행되나요? 당일 예약도 가능한가요? 📅",
    answer: "👉 예약은 [상담 신청] ➡️ [아이 성향 및 건강 상태 확인] ➡️ [스케줄 확정 및 결제] 순으로 진행됩니다. 아이 맞춤형 케어를 위한 사전 준비가 필요하므로 최소 2~3일 전에 예약해 주시는 것을 권장해 드립니다. 당일 예약의 경우 스케줄 가능 여부에 따라 제한될 수 있으니 챗봇 상담을 통해 먼저 문의해 주세요! 🔔",
    keywords: ["예약", "당일", "신청", "절차", "방법", "스케줄"]
  },
  {
    id: "faq_cancel_change",
    question: "Q5. 예약을 취소하거나 일정을 변경하고 싶을 때는 어떻게 하나요? 🛠️",
    answer: "👉 일정 변경 및 취소는 예약일 기준 3일 전까지 홈페이지 내 '나의 예약' 메뉴 또는 챗봇을 통해 수수료 없이 가능합니다. 당일 취소나 하루 전 취소의 경우, 다른 아이들의 예약 기회와 스케줄 조율을 위해 소정의 취소 수수료가 발생할 수 있으니 양해 부탁드립니다. ⚠️",
    keywords: ["취소", "변경", "수수료", "환불", "일정 변경", "나의 예약"]
  },
  {
    id: "faq_shyness",
    question: "Q6. 첫 이용인데, 아이가 낯가림이 심해요. 적응 기간이나 사전 미팅이 있나요? 🤝",
    answer: "👉 낯선 환경이나 사람에게 스트레스를 많이 받는 아이들을 위해, 본격적인 돌봄 전 아이의 성향을 파악하는 사전 상담 및 성향 파악 과정을 거칩니다. 아이가 가장 좋아하는 장난감, 간식, 평소 습관 등을 미리 말씀해 주시면 아이가 편안함을 느낄 수 있도록 최선을 다해 배려하겠습니다. 💕",
    keywords: ["낯가림", "사전", "미팅", "적응", "만남", "성향", "스트레스"]
  },
  {
    id: "faq_nursing_rates",
    question: "Q7. 방문형 요양 서비스 항목과 요금이 어떻게 되나요? 💰",
    answer: "윤교품애의 프리미엄 [방문형 요양 서비스] 요금 안내입니다. 🐾\n\n🔸 기본 방문 요양 (30,000원)\n1일 1회 방문 (30~40분)\n식사, 배변 케어, 정서 교감, 투약 포함\n\n🔸 집중 방문 요양 (55,000원)\n1일 2회 방문\n고령 동물 및 수술 후 질병 회복기 아이 전용\n\n🔸 투약 전용 서비스 (15,000원)\n단독 투약 방문 (가루약/알약 복용, 안약 점안 등)\n\n🔸 주간/월간 패키지 (별도 안내)\n주 3회 이상 정기 이용 시 특별 할인 적용\n\n📍 거제 전 지역 기본 운영되나, 외곽 지역(장승포 등)은 거리별 교통비(5,000원~)가 별도 부과되는 점 양해 부탁드립니다.\n\n우리 아이 맞춤형 상담을 원하시면 언제든 말씀해 주세요",
    keywords: ["요금", "가격", "방문형 요양", "항목", "요금표", "비용"]
  }
];

// 6 Core posts from index.html (script.js) mapped with category & restriction flags
const STATIC_BLOG_POSTS = [
  {
    id: 1,
    title: "치즈냥이 '보리'의 첫 방문 돌봄 일지",
    excerpt: "겁이 많은 보리와 친해지기 위해 조심스럽게 다가갔던 첫 날의 기록입니다. 간식 하나로 마음을 열어준 보리...",
    content: "보리는 낯가림이 아주 심하고 소리에 예민한 아이였습니다. 몸을 웅크린 채 경계했으나, 1.5m 거리를 두고 낮게 앉아 눈인사를 주고 받으며 20분간 기다렸습니다. 다행히 츄르 냄새를 맡고 천천히 걸어나와 핥아 먹었으며, 감자 2개를 캐고 모래 뒤집기 정리까지 완료했습니다. 첫 만남 치고 아주 긍정적인 신호입니다.",
    category: "log", // 'log' = 돌봄 일지
    image_url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=max&q=80&w=800",
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
    image_url: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=max&q=80&w=800",
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
    image_url: "https://images.unsplash.com/photo-1513245543132-31f507417b26?auto=format&fit=max&q=80&w=800",
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
    image_url: "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?auto=format&fit=max&q=80&w=800",
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
    image_url: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=max&q=80&w=800",
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
    image_url: "https://images.unsplash.com/photo-1472491235688-bdc81a63246e?auto=format&fit=max&q=80&w=800",
    is_restricted: false,
    author_name: "전윤교 펫시터",
    created_at: "2026-05-02T00:00:00.000Z"
  }
];

// Customer Profiles with Sensitive Security Codes (entrance_code, doorlock_code)
const CUSTOMERS_DB = [
  {
    id: 1,
    client_name: "김미선 (샘플)",
    phone: "010-0000-0001",
    pet_name: "보리",
    pet_age: 3,
    address: "경상남도 거제시 고현동 가상아파트 101동 101호 (기본 지역)",
    entrance_code: "#1010*",
    doorlock_code: "1010*",
    entry_method_detail: "공동현관 키패드에서 비밀번호 #1010*을 차례대로 입력해 주세요.",
    parking_option: "free",
    photo_video_preference: "many",
    sns_agreement: true,
    specialties: "신부전 초기 냥이, 매일 15:00 신부전 약물 0.5cc 급여 요망, 소리에 예민하므로 노크 주의."
  },
  {
    id: 2,
    client_name: "이은주 (샘플)",
    phone: "010-0000-0002",
    pet_name: "먼지",
    pet_age: 15,
    address: "경상남도 거제시 아주동 가상빌라 201호 (기본 지역)",
    entrance_code: "경비실 호출 후 통과",
    doorlock_code: "2010*",
    entry_method_detail: "경비실 호출 벨을 누르고 방문 돌봄 펫시터라고 말씀하신 뒤 통과해 주세요.",
    parking_option: "register",
    photo_video_preference: "many",
    sns_agreement: false,
    specialties: "15세 노령묘, 관절염으로 높은 곳 점프 금지, 안약 하루 2회 점적 수칙 준수 요망."
  },
  {
    id: 3,
    client_name: "박태영 (샘플)",
    phone: "010-0000-0003",
    pet_name: "레오",
    pet_age: 2,
    address: "경상남도 거제시 하청면 가상주택 1층 (기타 지역 - 추가금 +5,000원 적용)",
    entrance_code: "없음",
    doorlock_code: "3010*",
    entry_method_detail: "현관 도어락에 3010*를 입력한 후 손잡이를 돌려 입장해 주세요.",
    parking_option: "impossible",
    photo_video_preference: "confirmation",
    sns_agreement: true,
    specialties: "활동량이 매우 많아 장난감 놀이 30분 필요, 현관 나갈 때 고양이가 탈출하지 않도록 주의."
  }
];

// ──────────────────────────────────────────────────────────────────
// ⚙️  [설정] Supabase 예약 테이블명 - 실제 테이블명이 다를 경우 여기만 수정하세요.
// ──────────────────────────────────────────────────────────────────
const RESERVATIONS_TABLE = "reservations";

// Scheduled Bookings showing a warning 1 hour prior (Sitter confirming safety checklist)
const MOCK_RESERVATIONS = [
  {
    id: 101,
    customer_id: 1,
    client_name: "김미선 (샘플)",
    pet_name: "보리",
    visit_time: "오늘 15:00 - 17:00 (방문 1시간 전)",
    visit_date_string: new Date().toDateString(),
    mandatory_requirements: "💊 보리 15시 투약 지침: 약물 0.5cc 필수 급여 및 가상 보안 코드 확인 준수",
    status: "confirmed",
    is_confirmed_by_sitter: false,
    visit_area: "고현동",
    additional_fee: 5000,
    total_price: 22000,
    selected_options: ["투약 1회 (+5,000원)"]
  },
  {
    id: 102,
    customer_id: 2,
    client_name: "이은주 (샘플)",
    pet_name: "먼지",
    visit_time: "내일 11:00 - 13:00",
    visit_date_string: new Date(Date.now() + 24 * 3600 * 1000).toDateString(),
    mandatory_requirements: "👁️ 관절염 보호 및 안약 점안, 소변 누적 횟수 모래통 점검",
    status: "confirmed",
    is_confirmed_by_sitter: false,
    visit_area: "아주동",
    additional_fee: 5000,
    total_price: 22000,
    selected_options: ["투약 1회 (+5,000원)"]
  }
];

const TIME_SLOTS_POOL = [
  { id: "ts1",  time: "10:00 ~ 10:30", isBooked: false },
  { id: "ts2",  time: "11:00 ~ 11:30", isBooked: true  },
  { id: "ts3",  time: "12:00 ~ 12:30", isBooked: false },
  { id: "ts4",  time: "13:00 ~ 13:30", isBooked: false },
  { id: "ts5",  time: "14:00 ~ 14:30", isBooked: true  },
  { id: "ts6",  time: "15:00 ~ 15:30", isBooked: false },
  { id: "ts7",  time: "16:00 ~ 16:30", isBooked: false },
  { id: "ts8",  time: "17:00 ~ 17:30", isBooked: true  },
  { id: "ts9",  time: "18:00 ~ 18:30", isBooked: false },
  { id: "ts10", time: "19:00 ~ 19:30", isBooked: false },
  { id: "ts11", time: "20:00 ~ 20:30", isBooked: false },
];

export default function UnifiedPortal() {
  // Navigation: 'home' (Yoongyopoomae blog) vs 'booking' (Calendar) vs 'sitter' (Sitter Admin Panel)
  const [activePortal, setActivePortal] = useState("home"); 
  const [bookingSubView, setBookingSubView] = useState("calculator"); // 'calculator' or 'form'
  const [bookingServiceChoice, setBookingServiceChoice] = useState("general"); // 'general' or 'nursing'
  const [nursingPlan, setNursingPlan] = useState("basic"); // 'basic', 'intensive', 'medication', 'package'
  const [pricingInfoTab, setPricingInfoTab] = useState("general"); // 'general' or 'nursing'
  const [isChatOpen, setIsChatOpen] = useState(false);

  // --- AI Chatbot Drag: ref 기반 직접 DOM 조작 (React state 미사용 → 60fps 부드러운 드래그) ---
  const chatWindowRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  // 챗봇 창 초기 위치 (화면 우하단 기준)
  const chatInitPos = useRef({ right: 24, bottom: 92 }); // fixed 기준 초기값

  const handleDragStart = (e) => {
    // 닫기 버튼 등 button 클릭 시 드래그 무시
    if (e.target.tagName === "BUTTON" || e.target.closest("button")) return;
    e.preventDefault();

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const win = chatWindowRef.current;
    if (!win) return;

    const rect = win.getBoundingClientRect();
    isDraggingRef.current = true;
    dragOffsetRef.current = {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };

    const onMove = (ev) => {
      if (!isDraggingRef.current) return;
      ev.preventDefault();
      const cx = ev.touches ? ev.touches[0].clientX : ev.clientX;
      const cy = ev.touches ? ev.touches[0].clientY : ev.clientY;
      const newLeft = cx - dragOffsetRef.current.x;
      const newTop  = cy - dragOffsetRef.current.y;
      // 화면 경계 제한
      const maxLeft = window.innerWidth  - win.offsetWidth;
      const maxTop  = window.innerHeight - win.offsetHeight;
      win.style.left   = `${Math.max(0, Math.min(newLeft, maxLeft))}px`;
      win.style.top    = `${Math.max(0, Math.min(newTop,  maxTop))}px`;
      win.style.right  = "auto";
      win.style.bottom = "auto";
    };

    const onUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup",   onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend",  onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onUp);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend",  onUp);
  };

  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: "bot", text: "안녕하세요! 프리미엄 반려동물 돌봄 포털 '윤교품애'의 마스코트 미키 도우미입니다. 🐾 무엇을 도와드릴까요?", time: new Date() }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const chatBodyRef = useRef(null);

  useEffect(() => {
    if (isChatOpen && chatMessages.length > 0) {
      const lastMsg = chatMessages[chatMessages.length - 1];
      setTimeout(() => {
        const container = chatBodyRef.current;
        const el = document.getElementById(`chat-message-${lastMsg.id}`);
        if (container && el) {
          if (lastMsg.sender === "bot") {
            const targetScrollTop = el.offsetTop - 10;
            container.scrollTo({ top: targetScrollTop, behavior: "smooth" });
          } else {
            container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
          }
        }
      }, 150);
    }
  }, [chatMessages, isChatOpen]);

  const handleSendChatMessage = (e, customQuery) => {
    if (e) e.preventDefault();
    const query = customQuery || chatInput.trim();
    if (!query) return;

    const userMsgId = Date.now();
    const newMsg = { id: userMsgId, sender: "user", text: query, time: new Date() };
    setChatMessages(prev => [...prev, newMsg]);
    if (!customQuery) setChatInput("");
    setIsBotTyping(true);

    // Determine bot response based on FAQ_LIST
    let responseText = "👉 죄송합니다. 아직 학습 중인 질문입니다. 😢 더 자세한 문의 사항은 고객센터나 1:1 문의를 이용해 주시면 친절하게 안내해 드리겠습니다.";
    const queryLower = query.toLowerCase();

    // Check for dog related questions
    const dogKeywords = ["강아지", "댕댕이", "견주", "독", "dog", "산책"];
    const isDogRelated = dogKeywords.some(keyword => queryLower.includes(keyword));

    if (isDogRelated) {
      responseText = "🐾 현재 '윤교품애'는 고양이 전문 돌봄 서비스를 우선 제공하고 있으며, 더욱 많은 아이들과 만나기 위해 강아지를 위한 프리미엄 케어 서비스도 열심히 준비 중에 있습니다! 조금만 기다려 주세요.";
    } else {
      // 1. First try direct matching on the question text (ideal for button clicks)
      let matchedFaq = FAQ_LIST.find(faq =>
        queryLower.includes(faq.question.toLowerCase()) ||
        faq.question.toLowerCase().includes(queryLower)
      );

      // 2. If not matched, fall back to keyword checking with safe boundaries
      if (!matchedFaq) {
        matchedFaq = FAQ_LIST.find(faq =>
          faq.keywords.some(keyword => {
            if (!queryLower.includes(keyword)) return false;

            // Special case: prevent "약" in "예약" from triggering "투약/약" FAQ (Q2)
            if (keyword === "약") {
              const yeyakCount = (queryLower.match(/예약/g) || []).length;
              const yakCount = (queryLower.match(/약/g) || []).length;
              return yakCount > yeyakCount;
            }

            return true;
          })
        );
      }

      if (matchedFaq) {
        responseText = matchedFaq.answer;
      }
    }

    // Mock response after 800ms to feel natural and responsive
    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: "bot",
        text: responseText,
        time: new Date()
      }]);
      setIsBotTyping(false);
    }, 800);
  };

  const handleGoToBooking = () => {
    setActivePortal("booking");
    setBookingSubView("form");
    if (bookingServiceChoice === "nursing") {
      if (nursingPlan === "basic") setServiceType("방문 요양 (기본)");
      else if (nursingPlan === "intensive") setServiceType("방문 요양 (집중)");
      else if (nursingPlan === "medication") setServiceType("방문 요양 (투약 전용)");
      else if (nursingPlan === "package") setServiceType("방문 요양 (패키지)");
    } else {
      setServiceType("방문 돌봄");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }; 

  // Global Auth / RLS States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeUser, setActiveUser] = useState(null);
  const [toast, setToast] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState("member"); // 'member', 'sitter' or 'admin' for demo simulation
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
  const [detailPostId, setDetailPostId] = useState(null);
  const [selectedDetailPost, setSelectedDetailPost] = useState(null);
  const [lightboxImgUrl, setLightboxImgUrl] = useState(null);
  const [editingPostId, setEditingPostId] = useState(null);
  const [heroImageSrc, setHeroImageSrc] = useState("/hero.png");
  
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
  const [visitArea, setVisitArea] = useState("고현");
  const [customArea, setCustomArea] = useState("");
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [showBookingSuccessModal, setShowBookingSuccessModal] = useState(false);
  const [bookingSummary, setBookingSummary] = useState(null);
  const [tempBookingData, setTempBookingData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("bank"); // 'card', 'bank', 'zeropay'
  const [bookingStep, setBookingStep] = useState(1); // 1 = 기본정보, 2 = 건강상태, 3 = 돌봄상세/예약
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // New multi-day and questionnaire fields
  const [bookingType, setBookingType] = useState("single"); // "single" | "multi"
  const [bookingStartDate, setBookingStartDate] = useState("");
  const [bookingEndDate, setBookingEndDate] = useState("");
  const [bookingFrequency, setBookingFrequency] = useState("daily"); // "daily" | "every_other" | "custom"
  const [bookingDateText, setBookingDateText] = useState("");
  const [bookingTimeText, setBookingTimeText] = useState("");
  const [petCount, setPetCount] = useState("1");
  const [petDetailsText, setPetDetailsText] = useState("");
  const [calculatorDays, setCalculatorDays] = useState(1);

  const [isHoliday, setIsHoliday] = useState(false);
  const [optPreMeet, setOptPreMeet] = useState(false);
  const [optMedication, setOptMedication] = useState(false);
  const [optForcedFeeding, setOptForcedFeeding] = useState(false);
  const [optHospital, setOptHospital] = useState(false);
  const [optDogAdd, setOptDogAdd] = useState(false);
  const [optTwoVisits, setOptTwoVisits] = useState(false);

  const [recentHospitalVisit, setRecentHospitalVisit] = useState("");
  const [recentHospitalDetail, setRecentHospitalDetail] = useState("");
  const [infectiousDisease, setInfectiousDisease] = useState("");
  const [healthAgreement, setHealthAgreement] = useState(false);

  const [petPersonality, setPetPersonality] = useState([]);
  const [petPersonalityOther, setPetPersonalityOther] = useState("");

  const [feedingInfo, setFeedingInfo] = useState("");
  const [litterInfo, setLitterInfo] = useState("");

  const [isReturningCustomer, setIsReturningCustomer] = useState(false);
  const [customers, setCustomers] = useState(CUSTOMERS_DB);

  const [clientPhone, setClientPhone] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [entranceCode, setEntranceCode] = useState("");
  const [doorlockCode, setDoorlockCode] = useState("");
  const [entryMethodDetail, setEntryMethodDetail] = useState("");
  const [parkingOption, setParkingOption] = useState("free");
  const [photoVideoPreference, setPhotoVideoPreference] = useState("many");
  const [snsAgreement, setSnsAgreement] = useState(false);
  const [privacyAgreement, setPrivacyAgreement] = useState(false);

  // 재신청 고객 조회 상태
  const [returningSearchPhone, setReturningSearchPhone] = useState("");
  const [returningFoundCustomer, setReturningFoundCustomer] = useState(null);
  const [returningSearchDone, setReturningSearchDone] = useState(false);

  // --- 로그인 모달 세부 상태 ---
  const [activeLoginTab, setActiveLoginTab] = useState("client"); // 'client' or 'admin'
  const [simpleLoginName, setSimpleLoginName] = useState("");
  const [simpleLoginPhone, setSimpleLoginPhone] = useState("");

  // --- 내 예약 관리 모달 상태 ---
  const [showMyReservationModal, setShowMyReservationModal] = useState(false);
  const [myReservationTarget, setMyReservationTarget] = useState(null); // 선택된 예약 객체
  const [isEditingReservation, setIsEditingReservation] = useState(false); // 수정 모드 여부
  const [editResVisitTime, setEditResVisitTime] = useState("");
  const [editResVisitArea, setEditResVisitArea] = useState("");
  const [editResOptions, setEditResOptions] = useState([]); // 선택 옵션 배열
  const [editResMandatoryRequirements, setEditResMandatoryRequirements] = useState("");
  const [editResIsSaving, setEditResIsSaving] = useState(false);

  // 재신청 고객이 이전에 저장한 정보 (실제 서비스에서는 DB에서 불러옴 - 여기서는 모의 데이터)
  const MOCK_PREVIOUS_BOOKING = {
    visitArea: "고현동",
    feedingInfo: "식기 위치 싱크대 아래 가상 보관함, 건식 사료 급여",
    litterInfo: "화장실 모래 비우기 및 뭉친 모래 수거 제거",
    petPersonality: "낯가림 있음, 겁이 많음",
    clientPhone: "010-0000-0001",
    clientAddress: "경상남도 거제시 고현동 가상아파트 101동 101호 (기본 지역)",
    entranceCode: "#1010*",
    doorlockCode: "1010*",
    entryMethodDetail: "공동현관 키패드에서 비밀번호 #1010*을 차례대로 입력해 주세요.",
    parkingOption: "free",
    photoVideoPreference: "many",
    snsAgreement: true,
    privacyAgreement: true,
    petName: "로니",
    petAge: "3",
    petCount: "1",
    bookingDateText: "5월 27일 ~ 5월 30일 매일",
    bookingTimeText: "오후 2시 선호",
    petDetailsText: "1. 로니 (3살, 남아, 중성화 완료) - 소심하지만 온순하고 장난감을 좋아하는 고양이입니다."
  };

  // 재신청 / 신규 선택 시 폼 필드 초기화 함수
  const handleCustomerTypeChange = (isReturning) => {
    setIsReturningCustomer(isReturning);
    setReturningSearchPhone(""); setReturningSearchDone(false); setReturningFoundCustomer(null);
    if (!isReturning) {
      setFeedingInfo(""); setLitterInfo(""); setPetPersonality([]); setPetPersonalityOther("");
      setPetName(""); setPetAge(""); setPetCount("1"); setBookingDateText(""); setBookingTimeText(""); setPetDetailsText("");
      setClientPhone(""); setClientAddress(""); setEntranceCode(""); setDoorlockCode("");
      setEntryMethodDetail(""); setPrivacyAgreement(false); setSnsAgreement(false);
    }
  };

  // 재신청 고객 연락처 조회 함수
  const handleReturningCustomerSearch = () => {
    if (!returningSearchPhone.trim()) { showToast("연락처를 입력해 주세요."); return; }
    const norm = (s) => s.replace(/[\s-]/g, "");
    const found = customers.find(c => norm(c.phone) === norm(returningSearchPhone));
    setReturningSearchDone(true);
    if (found) {
      setReturningFoundCustomer(found);
      setPetName(found.pet_name || ""); setPetAge(String(found.pet_age || ""));
      setPetDetailsText(found.specialties || "");
      setClientPhone(found.phone || ""); setClientAddress(found.address || "");
      setEntranceCode(found.entrance_code || ""); setDoorlockCode(found.doorlock_code || "");
      setEntryMethodDetail(found.entry_method_detail || "");
      setParkingOption(found.parking_option || "free");
      setPhotoVideoPreference(found.photo_video_preference || "many");
      setSnsAgreement(found.sns_agreement || false); setPrivacyAgreement(true);
      // 휴대폰 번호 매칭으로 최신 예약 정보(사료/화장실 등) 가져오기
      const matchingRes = sitterReservations.filter(res => res.phone && norm(res.phone) === norm(found.phone));
      let hasFilled = false;
      if (matchingRes.length > 0) {
        matchingRes.sort((a, b) => b.id - a.id);
        const latest = matchingRes[0];
        const feed = latest.feeding_info || latest.feedingInfo;
        const litter = latest.litter_info || latest.litterInfo;
        if (feed) { setFeedingInfo(feed); hasFilled = true; }
        if (litter) { setLitterInfo(litter); hasFilled = true; }
      }

      if (!hasFilled && norm(found.phone) === norm(MOCK_PREVIOUS_BOOKING.clientPhone)) {
        setFeedingInfo(MOCK_PREVIOUS_BOOKING.feedingInfo); setLitterInfo(MOCK_PREVIOUS_BOOKING.litterInfo);
        const traits = MOCK_PREVIOUS_BOOKING.petPersonality.split(", ").map(t => t.trim());
        const std = ["사람 좋아함","낯가림 있음","겁이 많음","공격성 있음","만지는 거 싫어함"];
        setPetPersonality(traits.filter(t => std.includes(t)));
        setPetPersonalityOther(traits.filter(t => !std.includes(t)).join(", "));
      }
      showToast(`✅ ${found.client_name} 고객님 정보를 불러왔습니다.`);
    }
  };


  // 특정 시간대 예약 여부 확인 함수
  const isSlotBooked = (slot) => {
    if (slot.isBooked) return true;
    if (!selectedDate) return false;
    
    const dateString = selectedDate.toDateString();
    return sitterReservations.some(res => 
      res.visit_date_string === dateString && res.visit_time.includes(slot.time)
    );
  };

  // --- 내 예약 관리 모달 핸들러 ---
  const openMyReservationModal = (reservation) => {
    setMyReservationTarget(reservation);
    setIsEditingReservation(false);
    setEditResVisitTime(reservation.visit_time || "");
    setEditResVisitArea(reservation.visit_area || "");
    setEditResOptions([...(reservation.selected_options || [])]);
    setEditResMandatoryRequirements(reservation.mandatory_requirements || "");
    setShowMyReservationModal(true);
  };

  const closeMyReservationModal = () => {
    setShowMyReservationModal(false);
    setMyReservationTarget(null);
    setIsEditingReservation(false);
    setEditResMandatoryRequirements("");
    setEditResIsSaving(false);
  };

  const handleSaveReservationEdit = async () => {
    if (!myReservationTarget) return;
    setEditResIsSaving(true);

    const updatedReservation = {
      ...myReservationTarget,
      visit_time: editResVisitTime,
      visit_area: editResVisitArea,
      selected_options: editResOptions,
      mandatory_requirements: editResMandatoryRequirements,
    };

    // Supabase 실시간 저장 (연동 시)
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from(RESERVATIONS_TABLE)
          .update({
            visit_time: editResVisitTime,
            visit_area: editResVisitArea,
            selected_options: editResOptions,
            mandatory_requirements: editResMandatoryRequirements,
          })
          .eq("id", myReservationTarget.id);

        if (error) throw error;
        showToast("✅ 예약 정보가 Supabase에 업데이트되었습니다.");
      } catch (err) {
        showToast(`❌ 저장 실패: ${err.message}`);
        setEditResIsSaving(false);
        return;
      }
    }

    // 로컬 상태 업데이트 (Mock 모드 및 Supabase 연동 모두 적용)
    setSitterReservations((prev) =>
      prev.map((r) => (r.id === myReservationTarget.id ? updatedReservation : r))
    );
    setMyReservationTarget(updatedReservation);
    setIsEditingReservation(false);
    setEditResIsSaving(false);
    showToast("✅ 예약 정보가 수정되었습니다.");
  };

  const handleCancelReservation = async () => {
    if (!myReservationTarget) return;

    if (!confirm("정말로 이 예약을 취소하시겠습니까? 취소 후에는 복구할 수 없습니다.")) {
      return;
    }

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from(RESERVATIONS_TABLE)
          .delete()
          .eq("id", myReservationTarget.id);

        if (error) throw error;
        showToast("✅ 예약이 정상적으로 취소 및 삭제되었습니다.");
      } catch (err) {
        showToast(`❌ 예약 취소 실패: ${err.message}`);
        return;
      }
    }

    setSitterReservations(prev => prev.filter(r => r.id !== myReservationTarget.id));
    closeMyReservationModal();
  };

  // Sync selected time slot text to bookingTimeText
  useEffect(() => {
    if (selectedTimeSlot) {
      setBookingTimeText(selectedTimeSlot.time);
    }
  }, [selectedTimeSlot]);

  // 여러 날 연속/정기 요금 일수 계산기
  const getMultiDaysCount = () => {
    if (bookingType !== "multi" || !bookingStartDate || !bookingEndDate) return 1;
    const start = new Date(bookingStartDate);
    const end = new Date(bookingEndDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return 1;

    let count = 0;
    let curr = new Date(start);
    while (curr <= end) {
      count++;
      if (bookingFrequency === "every_other") {
        curr.setDate(curr.getDate() + 2);
      } else {
        curr.setDate(curr.getDate() + 1);
      }
    }
    return count || 1;
  };

  // Dynamic price calculator based on new pricing policies
  const calculateBookingPrice = () => {
    let base = 17000;
    if (bookingServiceChoice === "nursing") {
      if (nursingPlan === "basic") base = 30000;
      else if (nursingPlan === "intensive") base = 55000;
      else if (nursingPlan === "medication") base = 15000;
      else if (nursingPlan === "package") base = 0;
    }
    let extra = 0;
    
    if (isHoliday) extra += 5000;
    if (optPreMeet) extra += 10000;
    if (optForcedFeeding) extra += 10000;
    if (optHospital) extra += 20000;
    if (bookingServiceChoice === "general" && optMedication) extra += 5000;
    if (optDogAdd) extra += 8000;
    if (visitArea === "기타") extra += 5000;
    
    const daysMultiplier = bookingType === "multi" ? getMultiDaysCount() : 1;
    
    return {
      basePrice: base * daysMultiplier,
      additionalFee: extra, // 추가 요금은 일수를 곱하지 않고 1회성으로 계산
      totalPrice: (base * daysMultiplier) + extra, // 기본료에만 선택일수를 곱하고 추가요금은 합산
      daysCount: daysMultiplier
    };
  };

  // Sync calculator days with booking form dates
  useEffect(() => {
    const dCount = bookingType === "multi" ? getMultiDaysCount() : 1;
    setCalculatorDays(dCount);
  }, [bookingType, bookingStartDate, bookingEndDate, bookingFrequency]);

  const handleCalculatorDaysChange = (newDays) => {
    setCalculatorDays(newDays);
    if (newDays > 1) {
      setBookingType("multi");
      
      let start = bookingStartDate ? new Date(bookingStartDate) : new Date();
      if (isNaN(start.getTime())) {
        start = new Date();
      }
      
      const end = new Date(start);
      if (bookingFrequency === "every_other") {
        end.setDate(start.getDate() + (newDays - 1) * 2);
      } else {
        end.setDate(start.getDate() + (newDays - 1));
      }
      
      const year = start.getFullYear();
      const month = String(start.getMonth() + 1).padStart(2, "0");
      const day = String(start.getDate()).padStart(2, "0");
      
      const fYear = end.getFullYear();
      const fMonth = String(end.getMonth() + 1).padStart(2, "0");
      const fDay = String(end.getDate()).padStart(2, "0");
      
      setBookingStartDate(`${year}-${month}-${day}`);
      setBookingEndDate(`${fYear}-${fMonth}-${fDay}`);
      setBookingDateText(`${year}년 ${month}월 ${day}일 ~ ${fYear}년 ${fMonth}월 ${fDay}일 (${bookingFrequency === "daily" ? "매일" : "격일"} 방문 | 총 ${newDays}일)`);
    } else {
      setBookingType("single");
    }
  };

  const toggleCalculatorOpt = (key) => {
    if (key === "preMeeting") setOptPreMeet((prev) => !prev);
    else if (key === "forcedFeeding") setOptForcedFeeding((prev) => !prev);
    else if (key === "hospital") setOptHospital((prev) => !prev);
    else if (key === "holiday") setIsHoliday((prev) => !prev);
    else if (key === "medication") setOptMedication((prev) => !prev);
  };

  const handleCalculatorAreaChange = (newArea) => {
    if (newArea === "기타") {
      setVisitArea("기타");
    } else {
      setVisitArea("고현"); // default to 고현
    }
  };

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
  const [journalMeals, setJournalMeals] = useState([]);
  const [journalActivities, setJournalActivities] = useState([]);
  const [journalBowels, setJournalBowels] = useState([]);

  const toggleJournalMeal = (chip) => {
    setJournalMeals(prev => prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip]);
  };
  const toggleJournalActivity = (chip) => {
    setJournalActivities(prev => prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip]);
  };
  const toggleJournalBowel = (chip) => {
    setJournalBowels(prev => prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip]);
  };
  const [journalCustomText, setJournalCustomText] = useState("");
  const [journalPreviewText, setJournalPreviewText] = useState("");
  const [careJournals, setCareJournals] = useState([]);
  const [localCreatedPosts, setLocalCreatedPosts] = useState([]);
  const [currentJournalMedia, setCurrentJournalMedia] = useState([]);
  const [isCareJournalTableMissing, setIsCareJournalTableMissing] = useState(false);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // 로컬 저장 포스트, 돌봄일지, 예약 및 고객 정보 초기화 로드
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPosts = localStorage.getItem("yoongyopoomae_local_posts");
      if (savedPosts) {
        try {
          setLocalCreatedPosts(JSON.parse(savedPosts));
        } catch (e) {
          console.error("로컬 포스트 파싱 오류:", e);
        }
      }

      const savedJournals = localStorage.getItem("yoongyopoomae_local_journals");
      if (savedJournals) {
        try {
          const parsed = JSON.parse(savedJournals);
          setCareJournals(prev => {
            // 중복되지 않은 저널만 병합하거나 대체
            const prevIds = prev.map(j => j.id);
            const nonDup = parsed.filter(j => !prevIds.includes(j.id));
            return [...nonDup, ...prev];
          });
        } catch (e) {
          console.error("로컬 돌봄일지 파싱 오류:", e);
        }
      }

      const savedReservations = localStorage.getItem("yoongyopoomae_local_reservations");
      if (savedReservations) {
        try {
          setSitterReservations(JSON.parse(savedReservations));
        } catch (e) {
          console.error("로컬 예약 파싱 오류:", e);
        }
      } else {
        localStorage.setItem("yoongyopoomae_local_reservations", JSON.stringify(MOCK_RESERVATIONS));
      }

      const savedCustomers = localStorage.getItem("yoongyopoomae_local_customers");
      if (savedCustomers) {
        try {
          setCustomers(JSON.parse(savedCustomers));
        } catch (e) {
          console.error("로컬 고객 파싱 오류:", e);
        }
      } else {
        localStorage.setItem("yoongyopoomae_local_customers", JSON.stringify(CUSTOMERS_DB));
      }
    }
  }, []);

  // 예약 및 고객 정보 변경 시 localStorage 동기화
  useEffect(() => {
    if (typeof window !== "undefined" && sitterReservations && sitterReservations.length > 0) {
      localStorage.setItem("yoongyopoomae_local_reservations", JSON.stringify(sitterReservations));
    }
  }, [sitterReservations]);

  useEffect(() => {
    if (typeof window !== "undefined" && customers && customers.length > 0) {
      localStorage.setItem("yoongyopoomae_local_customers", JSON.stringify(customers));
    }
  }, [customers]);

  // 로그인한 회원의 최근 예약 데이터를 조회하여 사료/화장실 정보 자동완성
  useEffect(() => {
    const autoFillPreviousBooking = async () => {
      if (!isLoggedIn || !activeUser || !isReturningCustomer) return;

      console.log("[AutoFill] 로그인 사용자 ID 기반 최근 예약 조회 시도:", activeUser.id);

      // 1. Supabase가 연동된 경우 DB 조회
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from(RESERVATIONS_TABLE)
            .select("feeding_info, litter_info")
            .eq("user_id", activeUser.id)
            .order("created_at", { ascending: false })
            .limit(1);

          // 404 = 테이블 미존재: 에러를 throw하지 않고 조용히 로컬 폴백으로 전환
          if (error && (error.code === "PGRST116" || error.message?.includes("does not exist"))) {
            console.warn(`[AutoFill] 테이블 '${RESERVATIONS_TABLE}'이 Supabase에 존재하지 않습니다. 로컬 데이터로 전환합니다. (파일 상단의 RESERVATIONS_TABLE 상수를 실제 테이블명으로 변경하세요.)`);
            // throw 없이 바로 로컬 폴백으로 진행
          } else if (error) {
            throw error;
          }

          if (data && data.length > 0) {
            const latest = data[0];
            const feed = latest.feeding_info || latest.feedingInfo;
            const litter = latest.litter_info || latest.litterInfo;

            if (feed) setFeedingInfo(feed);
            if (litter) setLitterInfo(litter);
            showToast("✨ 이전 완료된 예약의 돌봄 방법 안내를 자동으로 불러왔습니다.");
            console.log("[AutoFill] Supabase로부터 최근 사료/화장실 정보를 연동했습니다.");
            return;
          }
        } catch (e) {
          console.warn("[AutoFill] Supabase 조회 실패 (로컬 스토리지로 전환):", e);
        }
      }

      // 2. Supabase 미연동 또는 데이터가 없을 때 로컬 상태/스토리지 조회
      try {
        const matchingReservations = sitterReservations.filter(res => 
          res.user_id === activeUser.id || 
          res.client_name === activeUser.full_name
        );

        if (matchingReservations.length > 0) {
          // id(생성 타임스탬프) 기준 내림차순 정렬하여 가장 최근 예약 가져오기
          matchingReservations.sort((a, b) => b.id - a.id);
          const latest = matchingReservations[0];
          const feed = latest.feeding_info || latest.feedingInfo;
          const litter = latest.litter_info || latest.litterInfo;

          if (feed) setFeedingInfo(feed);
          if (litter) setLitterInfo(litter);
          showToast("✨ 이전 완료된 예약의 돌봄 방법 안내를 자동으로 불러왔습니다.");
          console.log("[AutoFill] 로컬 예약 목록으로부터 최근 사료/화장실 정보를 연동했습니다.");
        }
      } catch (e) {
        console.error("[AutoFill] 로컬 예약 조회 실패:", e);
      }
    };

    autoFillPreviousBooking();
  }, [isLoggedIn, activeUser, isReturningCustomer, sitterReservations]);

  // --- Supabase Realtime synchronization ---
  useEffect(() => {
    // Restore simple login cache
    const savedSimpleUser = localStorage.getItem("yenu_simple_user");
    if (savedSimpleUser) {
      try {
        const parsed = JSON.parse(savedSimpleUser);
        setIsLoggedIn(true);
        setActiveUser(parsed);
      } catch (e) {
        console.error(e);
      }
    }

    if (!isSupabaseConfigured) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsLoggedIn(true);
        fetchUserProfile(session.user.id);
        fetchSupabaseReservations();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setIsLoggedIn(true);
        fetchUserProfile(session.user.id);
        fetchSupabaseReservations();
      } else {
        const hasSimpleUser = localStorage.getItem("yenu_simple_user");
        if (!hasSimpleUser) {
          setIsLoggedIn(false);
          setActiveUser(null);
          fetchSupabasePosts();
          fetchSupabaseJournals();
          fetchSupabaseReservations();
        }
      }
    });

    fetchSupabasePosts();
    fetchSupabaseJournals();
    fetchSupabaseReservations();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // URL에서 post_id 감지하여 상세 페이지 전용 뷰 띄우기
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const pid = params.get("post_id");
      if (pid) {
        setDetailPostId(pid);
      }
    }
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

  // Auto-generate care journal template text in real-time or load from existing
  useEffect(() => {
    const reservation = sitterReservations[activeReservationIndex];
    if (!reservation) return;
    
    const existingJournal = careJournals.find(j => Number(j.reservation_id) === Number(reservation.id));
    if (existingJournal) {
      setJournalPreviewText(existingJournal.additional_notes || "");
      return;
    }

    const mealText = journalMeals.length > 0 ? `[식사: ${journalMeals.join(", ")}]` : "[식사: 미기입]";
    const activityText = journalActivities.length > 0 ? `[활동: ${journalActivities.join(", ")}]` : "[활동: 미기입]";
    const bowelText = journalBowels.length > 0 ? `[배변: ${journalBowels.join(", ")}]` : "[배변: 미기입]";
    const custom = journalCustomText ? `\n💬 추가 메모: ${journalCustomText}` : "";
    
    const timeNow = new Date().toLocaleTimeString("ko-KR", { hour: "numeric", minute: "2-digit" });
    
    setJournalPreviewText(`🐾 윤교품애 돌봄 보고서 (${timeNow} Guide)\n-----------------------------\n${mealText} ${activityText} ${bowelText}${custom}\n\n전윤교 펫시터가 정성을 다해 아이를 보살폈습니다. 항상 믿고 맡겨주셔서 감사드립니다! ♥`);
  }, [journalMeals, journalActivities, journalBowels, journalCustomText, activeReservationIndex, careJournals, sitterReservations]);

  // Load or reset the form states when the active reservation index shifts
  useEffect(() => {
    const reservation = sitterReservations[activeReservationIndex];
    if (!reservation) return;

    const existingJournal = careJournals.find(j => Number(j.reservation_id) === Number(reservation.id));
    if (existingJournal) {
      const kw = existingJournal.keywords || [];
      const mealChips = ["완식", "일부 남김", "사료 거부", "약 복용 완료"];
      const actChips = ["실내 놀이 완료", "산책 완료 (20분)", "컨디션 좋음", "무기력함"];
      const bowelChips = ["소변 양호", "대변 양호", "설사/묽은변", "배변 없음"];

      const mealVals = kw.filter(k => mealChips.includes(k));
      const actVals = kw.filter(k => actChips.includes(k));
      const bowelVals = kw.filter(k => bowelChips.includes(k));

      setJournalMeals(mealVals);
      setJournalActivities(actVals);
      setJournalBowels(bowelVals);
      setCurrentJournalMedia(existingJournal.photos || []);
      setJournalCustomText("");
    } else {
      setJournalMeals([]);
      setJournalActivities([]);
      setJournalBowels([]);
      setJournalCustomText("");
      setCurrentJournalMedia([]);
    }
  }, [activeReservationIndex, careJournals, sitterReservations]);

  // 포탈 탭 변경 시 화면 스크롤을 항상 맨 위로 이동
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [activePortal]);

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

  const fetchSupabaseJournals = async () => {
    try {
      const { data: fetchedJournals, error } = await supabase
        .from("care_journals")
        .select(`*`)
        .order("created_at", { ascending: false });

      if (error) {
        if (error.code === "PGRST116" || error.code === "PGRST205" || error.message?.includes("does not exist") || error.message?.includes("not found") || error.status === 404) {
          setIsCareJournalTableMissing(true);
        }
        throw error;
      }

      if (fetchedJournals) {
        setCareJournals(fetchedJournals);
        setIsCareJournalTableMissing(false);
      }
    } catch (e) {
      console.error("돌봄일지 가져오기 실패 (임시 로컬 저장 모드 활성화):", e);
    }
  };

  const fetchSupabaseReservations = async () => {
    if (!isSupabaseConfigured) return;
    try {
      const { data: fetchedRes, error } = await supabase
        .from(RESERVATIONS_TABLE)
        .select(`*`)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      if (fetchedRes) {
        setSitterReservations(prev => {
          const merged = [...prev];
          fetchedRes.forEach(dbRes => {
            const idx = merged.findIndex(r => Number(r.id) === Number(dbRes.id));
            if (idx > -1) {
              merged[idx] = { ...merged[idx], ...dbRes };
            } else {
              merged.push(dbRes);
            }
          });
          return merged;
        });
      }
    } catch (e) {
      console.error("Supabase 예약 목록 가져오기 실패:", e);
    }
  };

  const handleConfirmPaymentReceived = async (resId) => {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from(RESERVATIONS_TABLE)
          .update({ status: "confirmed" })
          .eq("id", resId);
        
        if (error) throw error;
        showToast("✅ Supabase 예약이 확정('confirmed') 상태로 전환되었습니다.");
      } catch (err) {
        console.error("DB update failed:", err);
        showToast(`❌ DB 예약 확정 실패: ${err.message}`);
      }
    }

    setSitterReservations(prev =>
      prev.map(r => Number(r.id) === Number(resId) ? { ...r, status: "confirmed" } : r)
    );
    showToast("🏦 입금이 확인되어 예약이 확정되었습니다!");
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

  const triggerSmsNotification = async (reservationObj, totalPrice) => {
    try {
      const response = await fetch("/api/send-sms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          to: reservationObj.phone,
          petName: reservationObj.pet_name,
          visitTime: reservationObj.visit_time,
          totalPrice: totalPrice || reservationObj.total_price
        })
      });
      const data = await response.json();
      if (data.success) {
        console.log("SMS notification successfully triggered.", data);
      } else {
        console.warn("SMS sending bypassed or failed:", data.error || data.message);
      }
    } catch (e) {
      console.error("Failed to trigger SMS API call:", e);
    }
  };

  // --- Authentication Handlers ---
  const handleSimpleLogin = async (name, phone) => {
    if (!name || !name.trim() || !phone || !phone.trim()) {
      showToast("이름과 전화번호를 모두 입력해 주세요.");
      return;
    }
    
    setIsSubmitting(true);
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    if (cleanPhone.length < 9) {
      showToast("올바른 전화번호를 입력해 주세요.");
      setIsSubmitting(false);
      return;
    }

    const email = `${cleanPhone}@yenu-simple.com`;

    if (isSupabaseConfigured) {
      try {
        // 1. Supabase auth API 호출을 일절 배제하고, profiles 테이블을 직접 select로 조회
        const { data: matchedProfiles, error: selectError } = await supabase
          .from("profiles")
          .select("*")
          .eq("full_name", name)
          .eq("email", email);

        if (selectError) {
          throw selectError;
        }

        let userRecord = null;

        if (matchedProfiles && matchedProfiles.length > 0) {
          userRecord = matchedProfiles[0];
          showToast(`'${name}'님 간편 로그인 성공!`);
        } else {
          // 테이블에 없다면 그 자리에서 insert로 이름과 전화번호 정보 추가
          // profiles 테이블의 id 필드는 UUID 형식이므로, 안전한 임의 UUID를 생성합니다.
          const dummyUuid = typeof crypto !== "undefined" && crypto.randomUUID 
            ? crypto.randomUUID() 
            : `00000000-0000-4000-a000-${cleanPhone.padEnd(12, "0")}`;

          const newProfile = {
            id: dummyUuid,
            email: email,
            username: `user_${cleanPhone}`,
            full_name: name,
            role: "member"
          };

          const { error: insertError } = await supabase
            .from("profiles")
            .insert([newProfile]);

          if (insertError) {
            console.warn("Profiles insert failed (possibly due to auth.users reference constraint), falling back to client session:", insertError);
            // 외래키 혹은 RLS 제약조건 실패 시에도, 비회원 간편 로그인 세션은 정상 유지할 수 있도록 fall back
          }
          
          userRecord = newProfile;
          showToast(`'${name}'님 신규 등록 및 간편 로그인 완료!`);
        }

        // 3. 로컬 세션 강제 유지 및 모달 닫기
        if (userRecord) {
          setIsLoggedIn(true);
          setActiveUser(userRecord);
          localStorage.setItem("yenu_simple_user", JSON.stringify(userRecord));
          
          alert(`🎉 ${name} 집사님, 환영합니다!`);
          setShowLoginModal(false);
          fetchSupabaseReservations();
        } else {
          throw new Error("유저 정보를 연동하지 못했습니다.");
        }
      } catch (err) {
        console.error("Simple login error details:", err);
        alert(`로그인 처리 중 오류가 발생했습니다: ${err.message}`);
        showToast(`❌ 간편 로그인 실패: ${err.message}`);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Mock / Demo Simulation Mode
      setTimeout(() => {
        setIsSubmitting(false);
        setIsLoggedIn(true);
        const mockUser = {
          id: `demo_${cleanPhone}`,
          full_name: name,
          email: email,
          role: "member",
          username: `user_${cleanPhone}`
        };
        setActiveUser(mockUser);
        localStorage.setItem("yenu_simple_user", JSON.stringify(mockUser));
        setShowLoginModal(false);
        alert(`🎉 ${name} 집사님, 환영합니다! (시뮬레이션)`);
        showToast(`[시뮬레이션] '${name}'님으로 간편 로그인 완료!`);
      }, 800);
    }
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: typeof window !== "undefined" ? `${window.location.origin}` : "",
          }
        });
        if (error) {
          showToast(`Google 로그인 에러: ${error.message}`);
          setIsSubmitting(false);
        }
      } catch (err) {
        showToast(`Google 로그인 오류: ${err.message}`);
        setIsSubmitting(false);
      }
    } else {
      // Demo Simulation Mode
      setTimeout(() => {
        setIsSubmitting(false);
        setIsLoggedIn(true);
        const selectedProfile = DEMO_USERS[selectedRole];
        setActiveUser(selectedProfile);
        setShowLoginModal(false);
        showToast(`[윤교품애] Google 계정(시뮬레이션: ${selectedProfile.full_name})으로 로그인 완료!`);
      }, 600);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem("yenu_simple_user");
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
      setIsLoggedIn(false);
      setActiveUser(null);
      showToast("로그아웃 되었습니다.");
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

  const getReservationCountForDate = (date) => {
    if (!date) return 0;
    const dateStr = date.toDateString();
    return sitterReservations.filter(res => {
      if (res.visit_date_string !== dateStr) return false;
      const statusLower = (res.status || "").toLowerCase();
      return statusLower === "예약대기" || statusLower === "confirmed" || statusLower === "예약확정";
    }).length;
  };

  const isDateFullyBooked = (date) => {
    if (!date) return false;
    return getReservationCountForDate(date) >= 8;
  };

  const renderLeftCalendarColumn = () => {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%" }}>
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
            display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
            textAlign: "center", fontWeight: "700", fontSize: "0.8rem",
            color: "var(--text-muted)", marginBottom: "10px"
          }}>
            {["일", "월", "화", "수", "목", "금", "토"].map(d => <span key={d}>{d}</span>)}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: "clamp(3px, 1vw, 8px)" }}>
            {calendarGridDays.map((dayObj, index) => {
              const isSelected = selectedDate && dayObj.date && selectedDate.toDateString() === dayObj.date.toDateString();
              const fullyBooked = dayObj.date ? isDateFullyBooked(dayObj.date) : false;
              
              return (
                <button
                  key={index}
                  disabled={dayObj.isPast || !dayObj.day}
                  onClick={() => selectBookingDate(dayObj)}
                  style={{
                    border: "none",
                    borderRadius: "var(--border-radius-sm)",
                    minHeight: "clamp(40px, 8vw, 56px)",
                    height: "auto",
                    padding: "clamp(4px, 1vw, 6px) clamp(1px, 0.5vw, 2px)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "clamp(0.75rem, 1.8vw, 0.95rem)",
                    fontWeight: "700",
                    cursor: (dayObj.isPast || !dayObj.day) ? "not-allowed" : "pointer",
                    backgroundColor: isSelected 
                      ? "var(--primary-orange)" 
                      : (fullyBooked 
                          ? "#e5e7eb" 
                          : ((dayObj.isPast || !dayObj.day) ? "var(--bg-primary)" : "var(--bg-secondary)")),
                    color: isSelected 
                      ? "white" 
                      : (fullyBooked 
                          ? "#9ca3af" 
                          : ((dayObj.isPast || !dayObj.day) ? "var(--text-muted)" : "var(--text-main)")),
                    opacity: dayObj.isPast ? 0.35 : 1,
                    transition: "var(--transition-fast)",
                    boxShadow: isSelected ? "0 4px 10px rgba(255, 112, 67, 0.25)" : "none"
                  }}
                >
                  <span style={{
                    fontSize: "clamp(0.75rem, 1.5vw, 0.85rem)",
                    fontWeight: "800",
                    color: "inherit",
                    flexShrink: 0,
                    marginBottom: "2px"
                  }}>
                    {dayObj.day}
                  </span>
                  {dayObj.date && dayObj.date.toDateString() === new Date().toDateString() && !fullyBooked && (
                    <span style={{ fontSize: "0.6rem", color: isSelected ? "white" : "var(--primary-orange)", marginBottom: "2px" }}>오늘</span>
                  )}
                  {fullyBooked && (
                    <span style={{ fontSize: "0.65rem", color: "#ef4444", fontWeight: "800", marginTop: "2px" }}>마감</span>
                  )}
                  {/* Display reservation badge(s) */}
                  {dayObj.date && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px", width: "100%", alignItems: "center", marginTop: "2px" }}>
                      {sitterReservations
                        .filter(res => res.visit_date_string === dayObj.date.toDateString())
                        .filter(res => {
                          // 보안 필터: 시터/관리자는 모든 예약을 조회 가능
                          if (activeUser && (activeUser.role === "sitter" || activeUser.role === "admin")) {
                            return true;
                          }
                          // 일반 보호자는 오직 본인 예약만 조회 가능
                          if (!isLoggedIn || !activeUser) return false;
                          
                          const userPhoneClean = activeUser.email?.includes("@yenu-simple.com")
                            ? activeUser.email.split("@")[0]
                            : "";
                          const resPhoneClean = (res.phone || "").replace(/[^0-9]/g, "");

                          return res.user_id === activeUser.id || 
                                 res.client_name === activeUser.full_name || 
                                 (userPhoneClean && resPhoneClean === userPhoneClean);
                        })
                        .map((res, i) => {
                          const userPhoneClean = activeUser.email?.includes("@yenu-simple.com")
                            ? activeUser.email.split("@")[0]
                            : "";
                          const resPhoneClean = (res.phone || "").replace(/[^0-9]/g, "");

                          const isMyReservation = isLoggedIn && activeUser && (
                            res.user_id === activeUser.id ||
                            res.client_name === activeUser.full_name ||
                            (userPhoneClean && resPhoneClean === userPhoneClean)
                          );

                          // Determine colors and label based on status
                          let bgStyle = "var(--primary-orange-light)";
                          let textStyle = "var(--primary-orange)";
                          let borderStyle = "none";
                          let labelPrefix = "📅";

                          const statusLower = (res.status || "").toLowerCase();
                          if (statusLower === "예약대기") {
                            bgStyle = "hsl(35, 100%, 94%)"; // 연한 주황/노랑 계열
                            textStyle = "hsl(35, 95%, 45%)";
                            borderStyle = "1px solid hsl(35, 90%, 80%)";
                            labelPrefix = "🕒 [대기]";
                          } else if (statusLower === "confirmed" || statusLower === "예약확정") {
                            bgStyle = "var(--success-mint-light)"; // 연한 초록 계열
                            textStyle = "var(--success-mint)";
                            borderStyle = "1px solid hsl(150, 40%, 85%)";
                            labelPrefix = "✅ [확정]";
                          } else if (statusLower === "started") {
                            bgStyle = "var(--warning-coral-light)";
                            textStyle = "var(--warning-coral)";
                            borderStyle = "1px solid hsl(12, 85%, 90%)";
                            labelPrefix = "🟢 [돌봄중]";
                          } else if (statusLower === "completed") {
                            bgStyle = "#f1f5f9";
                            textStyle = "var(--text-muted)";
                            borderStyle = "1px solid #e2e8f0";
                            labelPrefix = "🏁 [완료]";
                          }

                          // Override when the day cell itself is selected
                          if (isSelected) {
                            bgStyle = "rgba(255, 255, 255, 0.9)";
                            textStyle = "var(--primary-orange)";
                            borderStyle = "1px solid rgba(255, 255, 255, 0.9)";
                          }

                          return (
                            <span
                              key={i}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isMyReservation) {
                                  openMyReservationModal(res);
                                }
                              }}
                              title={isMyReservation ? "클릭하여 내 예약 상세보기/수정" : `${labelPrefix} ${res.pet_name}`}
                              style={{
                                fontSize: "0.65rem",
                                backgroundColor: bgStyle,
                                color: textStyle,
                                border: borderStyle,
                                padding: "2px 6px",
                                borderRadius: "4px",
                                fontWeight: "800",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                maxWidth: "95%",
                                display: "block",
                                cursor: isMyReservation ? "pointer" : "default",
                                marginTop: "3px",
                                transition: "all 0.15s ease"
                              }}
                            >
                              {labelPrefix} {res.pet_name}
                            </span>
                          );
                        })}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 내 예약 현황 카드 (로그인한 보호자 전용) ── */}
        {isLoggedIn && activeUser && (() => {
          const myReservations = sitterReservations.filter(res => {
            const userPhoneClean = activeUser.email?.includes("@yenu-simple.com")
              ? activeUser.email.split("@")[0]
              : "";
            const resPhoneClean = (res.phone || "").replace(/[^0-9]/g, "");
            
            return res.user_id === activeUser.id || 
                   res.client_name === activeUser.full_name || 
                   (userPhoneClean && resPhoneClean === userPhoneClean);
          });
          if (myReservations.length === 0) return null;
          return (
            <div className="premium-card animate-fade-in" style={{
              border: "2px solid var(--success-mint)",
              backgroundColor: "var(--success-mint-light)",
            }}>
              <h4 style={{ fontSize: "1rem", fontWeight: "800", color: "var(--success-mint)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                📋 내 예약 현황
                <span style={{ fontSize: "0.75rem", backgroundColor: "var(--success-mint)", color: "white", padding: "2px 8px", borderRadius: "12px" }}>
                  {myReservations.length}건
                </span>
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {myReservations.map((res) => (
                  <div
                    key={res.id}
                    onClick={() => openMyReservationModal(res)}
                    style={{
                      backgroundColor: "white",
                      border: "1.5px solid var(--success-mint)",
                      borderRadius: "var(--border-radius-sm)",
                      padding: "14px 16px",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "12px",
                      transition: "var(--transition-fast)",
                    }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(38,198,145,0.18)"}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: "800", fontSize: "0.9rem", color: "var(--text-main)", marginBottom: "4px" }}>
                        🐾 {res.pet_name}
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                        📍 {res.visit_area} &nbsp;|&nbsp; ⏰ {res.visit_time}
                      </div>
                      {res.selected_options && res.selected_options.length > 0 && (
                        <div style={{ fontSize: "0.72rem", color: "var(--success-mint)", marginTop: "4px", fontWeight: "700" }}>
                          ＋ {res.selected_options.join(", ")}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: "1.1rem", fontWeight: "900", color: "var(--primary-orange)" }}>
                        {(res.total_price || 0).toLocaleString()}원
                      </div>
                      <div style={{ 
                        fontSize: "0.7rem", 
                        backgroundColor: res.status === "started" 
                          ? "var(--warning-coral-light)" 
                          : res.status === "예약대기"
                            ? "var(--primary-orange-light)"
                            : "var(--success-mint-light)", 
                        color: res.status === "started" 
                          ? "var(--warning-coral)" 
                          : res.status === "예약대기"
                            ? "var(--primary-orange)"
                            : "var(--success-mint)", 
                        padding: "2px 8px", 
                        borderRadius: "10px", 
                        fontWeight: "700", 
                        marginTop: "4px" 
                      }}>
                        {res.status === "started" 
                          ? "돌봄 중 🟢" 
                          : res.status === "예약대기"
                            ? "예약 대기 ⏳"
                            : "예약 확정 ✅"}
                      </div>
                      <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginTop: "4px" }}>
                        클릭하여 상세보기/수정
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {bookingType === "multi" && (
          <div className="premium-card animate-fade-in" style={{ backgroundColor: "var(--primary-orange-light)", border: "1.5px solid var(--primary-orange)" }}>
            <h4 style={{ fontSize: "1rem", fontWeight: "800", marginBottom: "8px", color: "var(--primary-orange)" }}>
              📅 여러 날 신청 진행 중
            </h4>
            <p style={{ fontSize: "0.85rem", color: "var(--text-main)", lineHeight: "1.5", margin: 0, fontWeight: "500" }}>
              여러 날 예약을 신청하실 때는 개별 타임슬롯을 선택하지 않습니다. <br />
              우측 입력 폼에서 <strong>원하시는 시작일/종료일 및 구체적인 시간대</strong>를 기재해 주시면 펫시터가 조율을 진행합니다.
            </p>
          </div>
        )}
      </div>
    );
  };

  const selectBookingDate = (dayObj) => {
    if (dayObj.isPast || !dayObj.day) return;
    setSelectedDate(dayObj.date);
    setSelectedTimeSlot(null);
  };

  const handleNextStep = () => {
    // Validation based on reservation type
    if (bookingType === "single") {
      if (!selectedDate) {
        showToast("방문 원하시는 날짜를 달력에서 클릭해 선택해 주세요. 📅");
        return;
      }
      if (!bookingTimeText.trim()) {
        showToast("방문 원하시는 시간대를 적어주세요. 🕒");
        return;
      }
      if (!petName.trim()) {
        showToast("대표 반려동물 이름을 입력해 주세요. 🐾");
        return;
      }
      if (!petAge.trim()) {
        showToast("대표 반려동물 나이를 입력해 주세요. 🎂");
        return;
      }
    } else {
      if (!bookingStartDate) {
        showToast("방문 시작일을 입력해 주세요. 📅");
        return;
      }
      if (!bookingEndDate) {
        showToast("방문 종료일을 입력해 주세요. 📅");
        return;
      }
      if (!bookingDateText.trim()) {
        showToast("방문 원하시는 날짜 기재(필수)를 작성해 주세요. ✍️");
        return;
      }
      if (!bookingTimeText.trim()) {
        showToast("방문 원하시는 시간 적어주세요(필수)를 작성해 주세요. 🕒");
        return;
      }
      if (!petName.trim()) {
        showToast("대표 반려동물 이름을 입력해 주세요. 🐾");
        return;
      }
      if (!petDetailsText.trim()) {
        showToast("아이들 세부 정보(마릿수, 이름, 나이 등 필수)를 작성해 주세요. 📋");
        return;
      }
    }

    setBookingStep(2);
    // Smooth scroll to the top of the booking form start
    const portalElement = document.getElementById("booking-form-start");
    if (portalElement) {
      portalElement.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNextStep2 = () => {
    // 30일 이내 병원 방문 여부, 전염성 질환 여부, 동의 항목 필수 체크 검증
    if (!recentHospitalVisit || !infectiousDisease || !healthAgreement) {
      showToast("필수 항목을 모두 확인해 주세요");
      return;
    }

    if (infectiousDisease === "yes") {
      showToast("전염성 질환이 있는 경우 예약이 불가합니다. 완치 후 다시 신청해 주세요.");
      return;
    }

    setBookingStep(3);
    // Smooth scroll to the top of the booking form start
    const portalElement = document.getElementById("booking-form-start");
    if (portalElement) {
      portalElement.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();

    // Validation based on reservation type
    if (bookingType === "single") {
      if (!selectedDate || !bookingTimeText.trim() || !petName || !petAge) {
        showToast("필수 예약 양식을 모두 완성해 주세요. (날짜 선택, 방문 시간 기재, 대표 동물 이름, 나이 기입 필수)");
        return;
      }
    } else {
      if (!bookingStartDate || !bookingEndDate || !bookingDateText.trim() || !bookingTimeText.trim() || !petName || !petDetailsText.trim()) {
        showToast("여러 날 연속/정기 신청 양식을 완성해 주세요. (시작일, 종료일, 방문 날짜 기재, 시간대 기재, 대표 동물 이름, 상세 정보 필수)");
        return;
      }
    }

    if (!isReturningCustomer && visitArea === "기타" && !customArea.trim()) {
      showToast("기타 방문 지역명을 입력해 주세요.");
      return;
    }

    // 신규 고객의 경우, 개인정보 및 출입/동의 필수 검증
    if (!isReturningCustomer) {
      if (!clientPhone.trim()) {
        showToast("연락처를 입력해 주세요.");
        return;
      }
      if (!clientAddress.trim()) {
        showToast("방문 상세 주소를 입력해 주세요.");
        return;
      }
      if (!entranceCode.trim()) {
        showToast("공동현관 출입번호를 입력해 주세요. (없을 시 '없음')");
        return;
      }
      if (!doorlockCode.trim()) {
        showToast("세대 현관 도어락 비밀번호를 입력해 주세요.");
        return;
      }

      if (!privacyAgreement) {
        showToast("개인정보 수집 및 이용(방문탁묘 용도) 동의는 필수입니다.");
        return;
      }
    }

    if (!recentHospitalVisit || !infectiousDisease) {
      showToast("건강 상태 체크를 완료해 주세요.");
      return;
    }

    if (infectiousDisease === "yes") {
      showToast("⚠️ 전염성 질환이 있을 경우 돌봄이 불가합니다.");
      return;
    }

    if (!healthAgreement) {
      showToast("방문 돌봄 면책 동의를 체크해 주세요.");
      return;
    }

    setIsBookingLoading(true);

    setTimeout(() => {
      setIsBookingLoading(false);

      // 재신청 고객의 경우 이전 예약 데이터를 참조
      const effectiveVisitArea = isReturningCustomer ? MOCK_PREVIOUS_BOOKING.visitArea : (
        visitArea === "기타" ? customArea : (visitArea + (visitArea === "사곡" ? "리" : "동"))
      );
      const effectiveFeedingInfo = feedingInfo || "미입력";
      const effectiveLitterInfo = litterInfo || "미입력";
      const effectivePersonalityList = [...petPersonality, ...(petPersonalityOther ? [`기타: ${petPersonalityOther}`] : [])].join(", ") || "미입력";

      // 개인정보/출입정보 해결
      const effectiveClientPhone = isReturningCustomer ? MOCK_PREVIOUS_BOOKING.clientPhone : clientPhone;
      const effectiveClientAddress = isReturningCustomer ? MOCK_PREVIOUS_BOOKING.clientAddress : clientAddress;
      const effectiveEntranceCode = isReturningCustomer ? MOCK_PREVIOUS_BOOKING.entranceCode : entranceCode;
      const effectiveDoorlockCode = isReturningCustomer ? MOCK_PREVIOUS_BOOKING.doorlockCode : doorlockCode;
      const effectiveEntryMethodDetail = isReturningCustomer ? MOCK_PREVIOUS_BOOKING.entryMethodDetail : entryMethodDetail;
      const effectiveParkingOption = isReturningCustomer ? MOCK_PREVIOUS_BOOKING.parkingOption : parkingOption;
      const effectivePhotoVideoPreference = isReturningCustomer ? MOCK_PREVIOUS_BOOKING.photoVideoPreference : photoVideoPreference;
      const effectiveSnsAgreement = isReturningCustomer ? MOCK_PREVIOUS_BOOKING.snsAgreement : snsAgreement;

      const { basePrice, additionalFee, totalPrice } = calculateBookingPrice();

      const selectedOptions = [];
      if (isHoliday) selectedOptions.push("공휴일/명절 할증 (+5,000원)");
      if (optPreMeet) selectedOptions.push("사전 만남 (+10,000원)");
      if (optForcedFeeding) selectedOptions.push("급여도움(강제급여) (+10,000원)");
      if (optHospital) selectedOptions.push("병원 방문 1회 (+20,000원)");
      if (bookingServiceChoice === "general" && optMedication) selectedOptions.push("1회성 투약 서비스 (+5,000원)");
      if (optDogAdd) selectedOptions.push("강아지 1마리 추가 (+8,000원)");
      if (!isReturningCustomer && visitArea === "기타") selectedOptions.push("외 지역 추가요금 (+5,000원)");

      // Resolve multi-date list
      let bookingDates = [selectedDate];
      if (bookingType === "multi") {
        bookingDates = [];
        const start = new Date(bookingStartDate);
        const end = new Date(bookingEndDate);
        let curr = new Date(start);
        while (curr <= end) {
          bookingDates.push(new Date(curr));
          if (bookingFrequency === "every_other") {
            curr.setDate(curr.getDate() + 2);
          } else {
            curr.setDate(curr.getDate() + 1);
          }
        }
      }

      const summary = {
        date: bookingType === "single"
          ? selectedDate.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })
          : `${bookingStartDate} ~ ${bookingEndDate} (${bookingFrequency === "daily" ? "매일" : "격일"} 방문 | 총 ${bookingDates.length}일)`,
        time: bookingType === "single"
          ? bookingTimeText
          : `${bookingTimeText} (방문 조율 가능)`,
        petName: petName,
        petAge: bookingType === "single" ? `${petAge}살` : `${petCount}마리`,
        serviceType: bookingServiceChoice === "nursing" ? (
          nursingPlan === "basic" ? "방문 요양 (기본)" :
          nursingPlan === "intensive" ? "방문 요양 (집중)" :
          nursingPlan === "medication" ? "방문 요양 (투약 전용)" :
          "방문 요양 (패키지)"
        ) : "기본 돌봄 (1일 1회 약 30분)",
        visitArea: effectiveVisitArea,
        additionalFee,
        basePrice,
        totalPrice,
        selectedOptions,
        careMemo: bookingType === "single" ? (careMemo || "없음") : `[희망 날짜]: ${bookingDateText}\n[희망 시간]: ${bookingTimeText}\n[상세 내용]: ${petDetailsText}`,
        sitterName: "전윤교 펫시터 (전문가)",
        isReturningCustomer,
        recentHospitalVisit: recentHospitalVisit === "yes" ? `있음 - ${recentHospitalDetail || "내용 미기재"}` : "없음",
        infectiousDisease: infectiousDisease === "yes" ? "있음" : "없음",
        petPersonality: effectivePersonalityList,
        feedingInfo: effectiveFeedingInfo,
        litterInfo: effectiveLitterInfo,
        clientPhone: effectiveClientPhone,
        clientAddress: effectiveClientAddress,
        entranceCode: effectiveEntranceCode,
        doorlockCode: effectiveDoorlockCode,
        entryMethodDetail: effectiveEntryMethodDetail,
        parkingOption: effectiveParkingOption,
        photoVideoPreference: effectivePhotoVideoPreference,
        snsAgreement: effectiveSnsAgreement
      };

      setBookingSummary(summary);
      setShowBookingSuccessModal(true);

      const newCustId = Date.now() + 10;

      // Add dynamic reservations for each date
      const reservationsToAdd = bookingDates.map((dateObj, idx) => {
        const dateStr = dateObj.toDateString();
        const visitTimeDisplay = bookingType === "single"
          ? `${dateObj.toLocaleDateString("ko-KR", { month: "long", day: "numeric" })} ${bookingTimeText}`
          : `${dateObj.toLocaleDateString("ko-KR", { month: "long", day: "numeric" })} ${bookingTimeText} (조정 가능)`;

        return {
          id: Date.now() + idx,
          user_id: activeUser && !String(activeUser.id).startsWith("simple_") && !String(activeUser.id).startsWith("demo_") ? activeUser.id : null,
          customer_id: newCustId,
          client_name: activeUser ? activeUser.full_name : "보호자 회원",
          pet_name: petName,
          is_returning_customer: isReturningCustomer,
          visit_time: visitTimeDisplay,
          visit_date_string: dateStr,
          mandatory_requirements: bookingType === "single"
            ? `[${bookingServiceChoice === "nursing" ? "방문 요양" : "일반 돌봄"}] 🐾 ${petName} (${petAge}살) ${isReturningCustomer ? "[재신청]" : "[신규]"} | 옵션: ${selectedOptions.join(", ") || '없음'} | 요청: ${careMemo || '없음'}`
            : `[${bookingServiceChoice === "nursing" ? "방문 요양" : "일반 돌봄"}] 🐾 ${petName} (${petCount}마리) | 상세: ${petDetailsText.substring(0, 100)}... | 기간: ${bookingStartDate} ~ ${bookingEndDate} | [옵션]: ${selectedOptions.join(", ")}`,
          status: "confirmed",
          is_confirmed_by_sitter: false,
          visit_area: effectiveVisitArea,
          additional_fee: additionalFee / bookingDates.length,
          total_price: totalPrice / bookingDates.length,
          selected_options: selectedOptions,
          pet_personality: effectivePersonalityList,
          feeding_info: effectiveFeedingInfo,
          litter_info: effectiveLitterInfo,
          recent_hospital: recentHospitalVisit === "yes" ? `있음 - ${recentHospitalDetail || "내용 미기재"}` : "없음",
          infectious_disease: infectiousDisease === "yes" ? "있음" : "없음",
          phone: effectiveClientPhone,
          address: effectiveClientAddress,
          entrance_code: effectiveEntranceCode,
          doorlock_code: effectiveDoorlockCode,
          entry_method_detail: effectiveEntryMethodDetail,
          parking_option: effectiveParkingOption,
          photo_video_preference: effectivePhotoVideoPreference,
          sns_agreement: effectiveSnsAgreement
        };
      });

      // Add to customers state list dynamically
      const newCustomerRecord = {
        id: newCustId,
        client_name: activeUser ? activeUser.full_name : "보호자 회원",
        phone: effectiveClientPhone,
        pet_name: petName,
        pet_age: bookingType === "single" ? parseInt(petAge) : parseInt(petCount),
        address: effectiveClientAddress,
        entrance_code: effectiveEntranceCode,
        doorlock_code: effectiveDoorlockCode,
        entry_method_detail: effectiveEntryMethodDetail,
        parking_option: effectiveParkingOption,
        photo_video_preference: effectivePhotoVideoPreference,
        sns_agreement: effectiveSnsAgreement,
        specialties: bookingType === "single"
          ? `요청사항: ${careMemo || "없음"} | 성격: ${effectivePersonalityList}`
          : `마릿수/상세: ${petDetailsText.substring(0, 150)}... | 성격: ${effectivePersonalityList}`
      };

      setTempBookingData({
        reservations: reservationsToAdd,
        customerRecord: newCustomerRecord
      });
    }, 1200);
  };

  // 예약확정 최종 커밋 및 폼 초기화 함수
  const handleConfirmReservation = () => {
    if (tempBookingData) {
      setSitterReservations((prev) => [...prev, ...tempBookingData.reservations]);
      setCustomers((prev) => [...prev, tempBookingData.customerRecord]);
      setTempBookingData(null);

      // Reset all booking input states
      setSelectedTimeSlot(null);
      setSelectedDate(null);
      setPetName("");
      setPetAge("");
      setVisitArea("고현");
      setCustomArea("");
      setCareMemo("");
      setIsHoliday(false);
      setOptPreMeet(false);
      setOptMedication(false);
      setOptForcedFeeding(false);
      setOptHospital(false);
      setOptDogAdd(false);
      setOptTwoVisits(false);
      setRecentHospitalVisit("");
      setRecentHospitalDetail("");
      setInfectiousDisease("");
      setHealthAgreement(false);
      setPetPersonality([]);
      setPetPersonalityOther("");
      setFeedingInfo("");
      setLitterInfo("");
      setIsReturningCustomer(false);
      setBookingStartDate("");
      setBookingEndDate("");
      setBookingDateText("");
      setBookingTimeText("");
      setPetDetailsText("");

      setClientPhone("");
      setClientAddress("");
      setEntranceCode("");
      setDoorlockCode("");
      setEntryMethodDetail("");
      setParkingOption("free");
      setPhotoVideoPreference("many");
      setSnsAgreement(false);
      setPrivacyAgreement(false);

      setShowBookingSuccessModal(false);
      setBookingSubView("calculator");
      showToast("📅 예약 신청 정보가 돌봄달력에 즉시 적용되었습니다.");
    }
  };

  // Toss Payments 결제창 호출 및 예약 임시 저장 함수
  const handleConfirmPayment = async () => {
    // ── 디버그 진단 블록 ──────────────────────────────────────
    console.group("[💳 handleConfirmPayment] 결제 흐름 진단 시작");
    console.log("tempBookingData:", tempBookingData);
    console.log("bookingSummary:", bookingSummary);
    console.log("paymentMethod:", paymentMethod);
    console.log("window.TossPayments 존재 여부:", typeof window !== "undefined" ? typeof window.TossPayments : "SSR");
    console.log("NEXT_PUBLIC_TOSS_CLIENT_KEY:", (process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || "").slice(0, 14) + "...");
    console.groupEnd();
    // ─────────────────────────────────────────────────────────

    let effectiveTempBookingData = tempBookingData;
    let effectiveBookingSummary = bookingSummary;

    if (!effectiveTempBookingData || !effectiveBookingSummary) {
      console.log("🧪 데모 테스트 환경 감지: 비어있는 임시 예약 데이터를 강제로 매칭합니다.");
      const dummyPrice = 17000;
      const dummyPetName = "먼지(데모)";
      const dummyCustId = Date.now();
      
      effectiveBookingSummary = {
        totalPrice: dummyPrice,
        petName: dummyPetName,
        petAge: "3살",
        serviceType: "기본 돌봄 (1일 1회 약 30분)",
        date: new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" }),
        time: "오후 2시 (조정 가능)",
        visitArea: "고현동",
        basePrice: dummyPrice,
        additionalFee: 0,
        selectedOptions: ["사전 만남 (+10,000원)"],
        sitterName: "전윤교 펫시터 (전문가)",
        careMemo: "데모 예약 신청입니다.",
        recentHospitalVisit: "없음",
        petPersonality: "친근함",
        clientPhone: "010-1234-5678",
        clientAddress: "경상남도 거제시 고현동 123",
        entranceCode: "없음",
        doorlockCode: "1234",
        entryMethodDetail: "경비실 경유",
        parkingOption: "free",
        photoVideoPreference: "many",
        snsAgreement: true
      };

      effectiveTempBookingData = {
        reservations: [{
          id: Date.now(),
          user_id: activeUser ? activeUser.id : null,
          customer_id: dummyCustId,
          client_name: activeUser ? activeUser.full_name : "보호자(데모)",
          pet_name: dummyPetName,
          is_returning_customer: true,
          visit_time: "오후 2시",
          visit_date_string: new Date().toDateString(),
          mandatory_requirements: `🐾 ${dummyPetName} | 데모 테스트 예약 건`,
          status: "confirmed",
          is_confirmed_by_sitter: false,
          visit_area: "고현동",
          additional_fee: 0,
          total_price: dummyPrice,
          selected_options: ["사전 만남 (+10,000원)"],
          pet_personality: "친근함",
          feeding_info: "자율 급식",
          litter_info: "두부모래",
          recent_hospital: "없음",
          infectious_disease: "없음",
          phone: "010-1234-5678",
          address: "경상남도 거제시 고현동 123",
          entrance_code: "없음",
          doorlock_code: "1234",
          entry_method_detail: "경비실 경유",
          parking_option: "free",
          photo_video_preference: "many",
          sns_agreement: true
        }],
        customerRecord: {
          id: dummyCustId,
          client_name: activeUser ? activeUser.full_name : "보호자(데모)",
          phone: "010-1234-5678",
          pet_name: dummyPetName,
          pet_age: 3,
          address: "경상남도 거제시 고현동 123",
          entrance_code: "없음",
          doorlock_code: "1234",
          entry_method_detail: "경비실 경유",
          parking_option: "free",
          photo_video_preference: "many",
          sns_agreement: true,
          specialties: "데모 테스트"
        }
      };

      // React 상태에도 싱크하여 화면을 정상 갱신
      setTempBookingData(effectiveTempBookingData);
      setBookingSummary(effectiveBookingSummary);
    }

    // 1. 무통장 입금 및 제로페이 처리
    if (paymentMethod === "bank" || paymentMethod === "zeropay") {
      const orderId = `order_${Date.now()}`;
      const manualPaymentKey = `manual_${paymentMethod}_${Date.now()}`;
      
      // Update reservations array status to '예약대기'
      const reservationsWithStatus = effectiveTempBookingData.reservations.map(res => ({
        ...res,
        status: "예약대기",
        payment_method: paymentMethod === "bank" ? "무통장" : "제로페이"
      }));

      if (isSupabaseConfigured) {
        try {
          // First attempt to insert with payment_method column
          const { error } = await supabase
            .from(RESERVATIONS_TABLE)
            .insert(reservationsWithStatus);

          if (error) {
            console.warn("First insert attempt failed, retrying without payment_method column...", error);
            // Retry without payment_method column
            const fallbackReservations = reservationsWithStatus.map(({ payment_method, ...rest }) => rest);
            const { error: retryError } = await supabase
              .from(RESERVATIONS_TABLE)
              .insert(fallbackReservations);

            if (retryError) throw retryError;
          }
          showToast("✅ 예약 신청 정보가 Supabase에 정상 등록되었습니다.");

          // 예약 접수 자동 문자 발송 API 호출
          if (reservationsWithStatus && reservationsWithStatus.length > 0) {
            triggerSmsNotification(reservationsWithStatus[0], effectiveBookingSummary.totalPrice);
          }
        } catch (dbErr) {
          console.error("Supabase insert failed for manual payment:", dbErr);
          showToast("⚠️ Supabase 저장 실패 (로컬 메모리에 임시 저장됩니다): " + dbErr.message);
        }
      } else {
        // 로컬 시뮬레이션 모드에서도 문자 발송 API 호출 테스트 지원
        if (reservationsWithStatus && reservationsWithStatus.length > 0) {
          triggerSmsNotification(reservationsWithStatus[0], effectiveBookingSummary.totalPrice);
        }
      }

      // Save to local reservations memory
      const savedReservations = localStorage.getItem("yoongyopoomae_local_reservations");
      let currentRes = [];
      if (savedReservations) {
        currentRes = JSON.parse(savedReservations);
      }
      const updatedRes = [...currentRes, ...reservationsWithStatus];
      localStorage.setItem("yoongyopoomae_local_reservations", JSON.stringify(updatedRes));

      // Save customer details
      const savedCustomers = localStorage.getItem("yoongyopoomae_local_customers");
      let currentCust = [];
      if (savedCustomers) {
        currentCust = JSON.parse(savedCustomers);
      }
      const dupCust = currentCust.some(c => c.id === effectiveTempBookingData.customerRecord.id);
      if (!dupCust) {
        const updatedCust = [...currentCust, effectiveTempBookingData.customerRecord];
        localStorage.setItem("yoongyopoomae_local_customers", JSON.stringify(updatedCust));
      }

      // Save to pending so that /success can show it correctly
      try {
        localStorage.setItem("pending_booking_data", JSON.stringify({
          reservations: reservationsWithStatus,
          customerRecord: effectiveTempBookingData.customerRecord,
          summary: effectiveBookingSummary
        }));
      } catch (e) {
        console.error("로컬스토리지 저장 실패:", e);
      }

      // Redirect to success page with query parameters
      window.location.href = `${window.location.origin}/success?paymentMethod=${paymentMethod}&amount=${effectiveBookingSummary.totalPrice}&orderId=${orderId}&paymentKey=${manualPaymentKey}`;
      return;
    }

    // 2. 카드 결제 (Toss Payments) 처리
    if (typeof window !== "undefined" && window.TossPayments) {
      // 결제 성공 후 예약을 데이터베이스/로컬에 추가하기 위해 임시 저장
      try {
        localStorage.setItem("pending_booking_data", JSON.stringify({
          reservations: effectiveTempBookingData.reservations,
          customerRecord: effectiveTempBookingData.customerRecord,
          summary: effectiveBookingSummary
        }));
      } catch (e) {
        console.error("로컬스토리지 저장 실패:", e);
      }

      // .trim()으로 환경변수 값의 앞뒤 공백/개행 제거 → 401 인증 오류 방지
      const envKey = (process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || "").trim();
      const clientKey = envKey || "test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq"; // 공식 기본 테스트 클라이언트 키 폴백
      
      console.log(`[Toss Payments] 결제창 호출 키 확인: ${clientKey.slice(0, 14)}... (환경 변수 적용 여부: ${!!envKey})`);
      
      if (!envKey) {
        console.warn(
          "⚠️ [Toss Payments Warning] NEXT_PUBLIC_TOSS_CLIENT_KEY 환경 변수가 설정되지 않아 기본 문서용 공용 키로 폴백되었습니다.\n" +
          "공용 키는 토스페이먼츠 보안 정책(도메인/오리진 제한)에 의해 localhost:3000 환경에서 401 Unauthorized 에러가 발생할 수 있습니다.\n" +
          "이 문제를 해결하려면 토스페이먼츠 개발자센터(https://developers.tosspayments.com)에서 발급받은 본인 상점의 테스트 클라이언트 키를 .env.local에 설정하고 개발 서버를 재시작해 주세요."
        );
      }

      // SDK 로드 재검증: afterInteractive 전략 사용 중이므로 window.TossPayments가 없다면 안내
      if (typeof window.TossPayments !== "function") {
        console.error("[❌ Toss SDK] window.TossPayments가 function이 아닙니다. SDK 스크립트 로드 실패 또는 아직 미완료 상태입니다.");
        showToast("결제 모듈을 로딩 중입니다. 잠시 후 다시 시도해 주세요.");
        return;
      }

      console.log("[✅ Toss SDK] window.TossPayments 확인됨. 결제창 호출 시작...");

      try {
        const tossPayments = window.TossPayments(clientKey);
        await tossPayments.requestPayment("카드", {
          amount: effectiveBookingSummary.totalPrice,
          orderId: `order_${Date.now()}`,
          orderName: `윤교품애 펫케어 예약 - ${effectiveBookingSummary.petName}`,
          customerName: activeUser ? activeUser.full_name : "보호자 회원",
          successUrl: `${window.location.origin}/success`,
          failUrl: `${window.location.origin}/fail`,
        });
        console.log("[✅ Toss Payments] requestPayment 호출 완료 (결제창 팝업 대기 중)");
      } catch (error) {
        console.error("[❌ Toss Payments] requestPayment 실패:", error);
        console.error("에러 코드:", error.code);
        console.error("에러 메시지:", error.message);
        if (error.code === "USER_CANCEL") {
          showToast("결제를 취소하셨습니다.");
        } else {
          showToast(`결제창 열기 실패: ${error.message || JSON.stringify(error)}`);
        }
      }
    } else {
      console.error(
        "[❌ Toss SDK] window.TossPayments가 undefined입니다.\n" +
        "→ 가능한 원인: 네트워크 오류로 SDK 스크립트 미로드, CSP(Content Security Policy) 차단, 또는 Next.js Script 컴포넌트 strategy가 올바르지 않음.\n" +
        "→ 개발자 도구 Network 탭에서 'js.tosspayments.com/v1/payment' 요청 상태를 확인해 주세요."
      );
      showToast("❌ 결제 모듈이 로드되지 않았습니다. 네트워크 연결 및 브라우저 콘솔을 확인해 주세요.");
    }
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

  const handleFinishCare = async () => {
    const reservation = sitterReservations[activeReservationIndex];
    if (!reservation) return;

    // 1. 중복 제출 체크 (Frontend duplicate submission prevent check)
    const alreadyExistsLocal = careJournals.some(j => Number(j.reservation_id) === Number(reservation.id));
    if (alreadyExistsLocal) {
      showToast("❌ [중복 방지] 이미 해당 예약에 대한 돌봄 일지가 제출되었습니다.");
      return;
    }

    const keywords = [...journalMeals, ...journalActivities, ...journalBowels];
    const firstImage = currentJournalMedia && currentJournalMedia.length > 0 
      ? currentJournalMedia[0] 
      : "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=max&q=80&w=800";

    const newPostData = {
      title: sanitizeInputText(`[돌봄 일지] ${reservation.client_name} 보호자님의 ${reservation.pet_name} 돌봄 일지 🐾`),
      excerpt: sanitizeInputText(`펫시터 전윤교가 작성한 ${reservation.pet_name}의 실시간 돌봄 기록입니다. (회원 전용)`),
      content: sanitizeInputText(journalPreviewText),
      category: "log",
      image_url: firstImage,
      is_restricted: true,
      author_name: "전윤교 펫시터",
      user_id: activeUser ? activeUser.id : null,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      try {
        // Double check on DB to prevent race condition
        const { data: dbCheck, error: checkError } = await supabase
          .from("care_journals")
          .select("id")
          .eq("reservation_id", reservation.id);
        
        if (checkError) throw checkError;
        if (dbCheck && dbCheck.length > 0) {
          showToast("❌ [DB 중복 방지] 이미 해당 예약에 대한 돌봄 일지가 데이터베이스에 존재합니다.");
          return;
        }

        const { data: insertJournalData, error: insertJournalError } = await supabase
          .from("care_journals")
          .insert([
            {
              reservation_id: reservation.id,
              photos: currentJournalMedia,
              keywords: keywords,
              additional_notes: journalPreviewText,
            }
          ])
          .select();

        if (insertJournalError) throw insertJournalError;

        // 홈화면 게시글(posts)로 회원전용 자동 등록
        const { error: insertPostError } = await supabase
          .from("posts")
          .insert([newPostData]);

        if (insertPostError) {
          console.error("포스트 자동 등록 실패:", insertPostError);
          showToast("🏁 돌봄 일지는 저장되었으나 홈화면 포스트 등록에 실패했습니다.");
        } else {
          showToast("🏁 돌봄 일지 및 회원 전용 홈화면 포스트가 연동되어 자동 등록되었습니다!");
        }
        
        fetchSupabaseJournals();
        fetchSupabasePosts();
      } catch (err) {
        console.error("돌봄일지 DB 저장 실패 (임시 로컬 저장 전환):", err);
        showToast("⚠️ Supabase 연동 오류로 로컬 메모리에 일지 및 포스트가 임시 등록되었습니다. (SQL 스키마 적용 필요)");
        setIsCareJournalTableMissing(true);
        
        // Local state fallback
        const newJournal = {
          id: Date.now(),
          reservation_id: reservation.id,
          photos: currentJournalMedia,
          keywords: keywords,
          additional_notes: journalPreviewText,
          created_at: new Date().toISOString()
        };

        setCareJournals(prev => {
          const next = [newJournal, ...prev];
          if (typeof window !== "undefined") {
            localStorage.setItem("yoongyopoomae_local_journals", JSON.stringify(next));
          }
          return next;
        });

        const newLocalPost = {
          id: Date.now() + 1,
          ...newPostData
        };
        setLocalCreatedPosts(prev => {
          const next = [newLocalPost, ...prev];
          if (typeof window !== "undefined") {
            localStorage.setItem("yoongyopoomae_local_posts", JSON.stringify(next));
          }
          return next;
        });
      }
    } else {
      // Simulation mode
      const newJournal = {
        id: Date.now(),
        reservation_id: reservation.id,
        photos: currentJournalMedia,
        keywords: keywords,
        additional_notes: journalPreviewText,
        created_at: new Date().toISOString()
      };

      setCareJournals(prev => {
        const next = [newJournal, ...prev];
        if (typeof window !== "undefined") {
          localStorage.setItem("yoongyopoomae_local_journals", JSON.stringify(next));
        }
        return next;
      });

      const newLocalPost = {
        id: Date.now() + 1,
        ...newPostData
      };
      setLocalCreatedPosts(prev => {
        const next = [newLocalPost, ...prev];
        if (typeof window !== "undefined") {
          localStorage.setItem("yoongyopoomae_local_posts", JSON.stringify(next));
        }
        return next;
      });
      
      showToast("🏁 [데모 시뮬레이션] 돌봄 일지 등록 및 회원 전용 홈화면 포스트가 자동 등록되었습니다.");
    }

    setSitterReservations((prev) => {
      const next = [...prev];
      next[activeReservationIndex].status = "completed";
      return next;
    });
  };

  const handleCopyJournalLink = () => {
    const mockUrl = `https://yoongyopoomae.yenu.com/journal/share_id=${Date.now()}`;
    navigator.clipboard.writeText(mockUrl);
    showToast("📋 돌봄 보고서 공유 단축링크가 클립보드에 복사되었습니다!");
  };

  // --- A. BLOG PORTAL HANDLERS ---
  const handlePostCardClick = (post) => {
    // Normalize image url properties to guarantee data flow under all properties (image_url, imageUrl, imgUrl, image)
    const normalizedPost = {
      ...post,
      image_url: post.image_url || post.imageUrl || post.imgUrl || post.image || ""
    };
    // If restricted and not logged in (or logged in but not VIP/Admin/Member)
    const hasAccess = activeUser && (activeUser.role === "member" || activeUser.role === "vip" || activeUser.role === "sitter" || activeUser.role === "admin");
    if (post.is_restricted && !hasAccess) {
      setRestrictedPostTitle(sanitizeInputText(post.title));
      setShowRestrictedModal(true);
    } else {
      setSelectedDetailPost(normalizedPost);
    }
  };

  const handleDeletePost = async (e, post) => {
    e.stopPropagation();
    const isOwner = activeUser && (
      activeUser.role === "admin" || 
      (post.user_id && post.user_id === activeUser.id)
    );
    if (!isOwner) {
      showToast("🔒 RLS 권한 위반: 포스트 삭제 권한은 글 작성자 또는 관리자(admin)만 갖습니다.");
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

    const imageUrl = newImageUrl || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=max&q=80&w=800";

    if (editingPostId) {
      // 1) 대상 포스트 가져오기
      const targetPost = posts.find(p => p.id === editingPostId);
      const isOwner = activeUser && (
        activeUser.role === "admin" || 
        (targetPost && targetPost.user_id && targetPost.user_id === activeUser.id)
      );
      if (!isOwner) {
        showToast("🔒 RLS 권한 위반: 포스트 수정 권한은 글 작성자 또는 관리자(admin)만 갖습니다.");
        setIsSubmitting(false);
        return;
      }

      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from("posts")
          .update({
            title: sanitizeInputText(newTitle),
            excerpt: sanitizeInputText(newContent).slice(0, 80) + "...",
            content: sanitizeInputText(newContent),
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
                    title: sanitizeInputText(newTitle),
                    excerpt: sanitizeInputText(newContent).slice(0, 80) + "...",
                    content: sanitizeInputText(newContent),
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
          title: sanitizeInputText(newTitle),
          excerpt: sanitizeInputText(newContent).slice(0, 80) + "...",
          content: sanitizeInputText(newContent),
          category: newCategory,
          image_url: imageUrl,
          is_restricted: newIsRestricted,
          user_id: activeUser ? activeUser.id : null,
          author_name: activeUser ? activeUser.full_name : "전윤교 펫시터"
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
            title: sanitizeInputText(newTitle),
            excerpt: sanitizeInputText(newContent).slice(0, 80) + "...",
            content: sanitizeInputText(newContent),
            category: newCategory,
            image_url: imageUrl,
            is_restricted: newIsRestricted,
            author_name: activeUser ? activeUser.full_name : "전윤교 펫시터",
            user_id: activeUser ? activeUser.id : null,
            created_at: new Date().toISOString()
          };
          setLocalCreatedPosts(prev => {
            const next = [newPost, ...prev];
            if (typeof window !== "undefined") {
              localStorage.setItem("yoongyopoomae_local_posts", JSON.stringify(next));
            }
            return next;
          });
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

  const allPosts = [...localCreatedPosts, ...posts];
  const filteredPosts = currentFilter === "all" ? allPosts : allPosts.filter(p => p.category === currentFilter);
  const calendarGridDays = getDaysInMonthGrid();

  const getDynamicChecklist1Text = () => {
    const reservation = sitterReservations[activeReservationIndex];
    if (!reservation) return "1. 반려동물 급여 지침 및 돌봄 수칙을 온전히 인지하였습니다.";

    const customer = customers.find(c => Number(c.id) === Number(reservation.customer_id));
    if (customer && customer.specialties && customer.specialties !== "미입력" && customer.specialties.trim() !== "") {
      return `1. 보호자 특별 지침: ${reservation.pet_name} - ${customer.specialties} 사항을 온전히 인지하였습니다.`;
    }

    if (reservation.mandatory_requirements && reservation.mandatory_requirements.trim() !== "") {
      return `1. 돌봄 필수 수칙: ${reservation.mandatory_requirements} 사항을 온전히 인지하였습니다.`;
    }

    return `1. ${reservation.pet_name} 사료/물 급여 수칙 및 아이 맞춤형 기본 돌봄 지침을 온전히 인지하였습니다.`;
  };

  // 10. 만약 URL 쿼리 파라미터로 특정 포스트가 선택되었다면 독립적인 상세 글 보기 페이지 제공
  if (detailPostId) {
    const detailPost = allPosts.find(p => String(p.id) === String(detailPostId));
    
    // 브라우저 타이틀 변경
    if (typeof document !== "undefined" && detailPost) {
      document.title = `${sanitizeInputText(detailPost.title)} - 윤교품애 블로그`;
    }

    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "var(--bg-primary)",
        color: "var(--text-main)",
        fontFamily: "'Outfit', 'Inter', sans-serif"
      }}>
        {/* 상단 띠 배너 */}
        <div style={{
          backgroundColor: "var(--success-mint-light)", color: "var(--success-mint)",
          padding: "10px 24px", textAlign: "center", fontSize: "0.85rem", fontWeight: "700",
          borderBottom: "1px solid var(--border-light)"
        }}>
          🛡️ 윤교품애 블로그 공식 포스트 상세 보기
        </div>

        {/* Global Toast */}
        {toast && (
          <div className="toast-container">
            <div className="toast">
              <span className="toast-icon">🛎️</span>
              <span>{toast}</span>
            </div>
          </div>
        )}

        {/* 메인 상세 컨테이너 */}
        <main style={{
          flex: 1,
          maxWidth: "800px",
          width: "100%",
          margin: "40px auto",
          padding: "0 24px",
          display: "flex",
          flexDirection: "column",
          gap: "24px"
        }}>
          {detailPost ? (
            <div className="premium-card animate-fade-in" style={{
              padding: "40px",
              backgroundColor: "white",
              borderRadius: "var(--border-radius-lg)",
              border: "1px solid var(--border-light)",
              boxShadow: "var(--shadow-md)"
            }}>
              {/* 카테고리 태그 및 정보 */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <span className="badge badge-tag" style={{
                  backgroundColor: "var(--primary-orange-light)",
                  color: "var(--primary-orange)",
                  fontSize: "0.8rem",
                  padding: "6px 12px",
                  borderRadius: "100px",
                  fontWeight: "750"
                }}>
                  {getCategoryName(detailPost.category)}
                </span>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "600" }}>
                  {detailPost.created_at ? new Date(detailPost.created_at).toLocaleDateString("ko-KR", {
                    year: "numeric", month: "long", day: "numeric"
                  }) : "작성일 미상"}
                </span>
              </div>

              {/* 제목 */}
              <h1 style={{
                fontSize: "2.2rem",
                fontWeight: "900",
                color: "var(--text-main)",
                lineHeight: "1.3",
                marginBottom: "24px",
                wordBreak: "keep-all"
              }}>
                {sanitizeInputText(detailPost.title)}
              </h1>

              {detailPost.image_url && (() => {
                const imgUrl = (detailPost.image_url || "").replace("fit=crop", "fit=max");
                return (
                  <div 
                    onClick={() => setLightboxImgUrl(imgUrl)}
                    style={{
                      width: "100%",
                      borderRadius: "var(--border-radius-md)",
                      marginBottom: "32px",
                      border: "1px solid var(--border-light)",
                      backgroundColor: "var(--bg-secondary)",
                      overflow: "hidden",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      flexShrink: 0,
                      cursor: "pointer",
                      position: "relative"
                    }}
                  >
                    <img
                      src={imgUrl}
                      alt={sanitizeInputText(detailPost.title)}
                      style={{
                        width: "100%",
                        height: "auto",
                        maxHeight: "550px",
                        objectFit: "contain",
                        display: "block"
                      }}
                    />
                    {/* Lightbox Badge Indicator */}
                    <div style={{
                      position: "absolute",
                      bottom: "12px",
                      right: "12px",
                      backgroundColor: "rgba(22, 31, 56, 0.7)",
                      backdropFilter: "blur(4px)",
                      color: "white",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      fontSize: "0.75rem",
                      fontWeight: "600",
                      pointerEvents: "none",
                      border: "1px solid rgba(255, 255, 255, 0.15)"
                    }}>
                      🔍 원본 이미지 (클릭 시 전체크기)
                    </div>
                  </div>
                );
              })()}

              {/* 본문 텍스트 */}
              <div style={{
                fontSize: "1.05rem",
                color: "var(--text-main)",
                lineHeight: "1.8",
                whiteSpace: "pre-wrap",
                textAlign: "left",
                wordBreak: "keep-all",
                marginBottom: "40px"
              }}>
                {sanitizeInputText(detailPost.content)}
              </div>

              {/* 닫기 / 이전 화면으로 가기 */}
              <div style={{ display: "flex", justifyContent: "center", borderTop: "1px solid var(--border-light)", paddingTop: "24px" }}>
                <button
                  onClick={() => window.close()}
                  className="btn btn-primary"
                  style={{ padding: "12px 32px", fontSize: "0.95rem" }}
                >
                  창 닫기 ✕
                </button>
              </div>
            </div>
          ) : (
            <div className="premium-card animate-fade-in" style={{
              padding: "40px",
              backgroundColor: "white",
              borderRadius: "var(--border-radius-lg)",
              border: "1px solid var(--border-light)",
              boxShadow: "var(--shadow-md)",
              textAlign: "center"
            }}>
              <span style={{ fontSize: "3rem", display: "block", marginBottom: "16px" }}>🔍</span>
              <h3 style={{ fontSize: "1.4rem", color: "var(--text-main)", fontWeight: "800", marginBottom: "10px" }}>
                포스트를 찾을 수 없습니다
              </h3>
              <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "24px" }}>
                요청하신 블로그 글의 ID가 존재하지 않거나 삭제되었을 수 있습니다.
              </p>
              <button
                onClick={() => window.close()}
                className="btn btn-primary"
                style={{ padding: "10px 24px" }}
              >
                창 닫기 ✕
              </button>
            </div>
          )}
        </main>

        {/* 하단 카피라이트 */}
        <footer style={{
          padding: "24px",
          backgroundColor: "var(--bg-secondary)",
          borderTop: "1px solid var(--border-light)",
          textAlign: "center",
          fontSize: "0.8rem",
          color: "var(--text-muted)"
        }}>
          © 2026 윤교품애. All Rights Reserved.
        </footer>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", paddingTop: "110px" }}>
      
      {/* Fixed header wrapper: 배너 + 네비게이션 상단 고정 */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)"
      }}>

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
      {/* 1-B. 내 예약 상세보기 / 수정 모달 (보호자 전용) */}
      {/* ============================================================== */}
      {showMyReservationModal && myReservationTarget && (
        <div
          onClick={closeMyReservationModal}
          style={{
            position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
            backgroundColor: "rgba(22, 31, 56, 0.65)", display: "flex", alignItems: "center",
            justifyContent: "center", zIndex: 1050, backdropFilter: "blur(6px)"
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="premium-card animate-fade-in"
            style={{
              width: "90%", maxWidth: "580px", maxHeight: "90vh",
              overflowY: "auto", padding: "36px 32px",
              backgroundColor: "white", borderRadius: "var(--border-radius-lg)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              border: "2px solid var(--success-mint)",
              position: "relative",
            }}
          >
            {/* 헤더 */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
              <div>
                <span style={{ fontSize: "0.75rem", backgroundColor: "var(--success-mint-light)", color: "var(--success-mint)", padding: "4px 10px", borderRadius: "12px", fontWeight: "800", display: "inline-block", marginBottom: "8px" }}>
                  📋 내 예약 상세
                </span>
                <h3 style={{ fontSize: "1.4rem", fontWeight: "900", color: "var(--text-main)", margin: 0 }}>
                  🐾 {myReservationTarget.pet_name}의 예약
                </h3>
              </div>
              <button
                onClick={closeMyReservationModal}
                style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "var(--text-muted)", lineHeight: 1 }}
              >✕</button>
            </div>

            {/* 예약 정보 읽기 모드 */}
            {!isEditingReservation ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {[
                  { icon: "📅", label: "방문 일시", value: myReservationTarget.visit_time },
                  { icon: "📍", label: "방문 지역", value: myReservationTarget.visit_area },
                  { icon: "💰", label: "총 요금", value: `${(myReservationTarget.total_price || 0).toLocaleString()}원` },
                  { icon: "🐾", label: "반려동물", value: myReservationTarget.pet_name },
                  { icon: "👤", label: "보호자명", value: myReservationTarget.client_name },
                  { icon: "✨", label: "요청 사항", value: myReservationTarget.mandatory_requirements },
                ].map(row => (
                  <div key={row.label} style={{ display: "flex", gap: "12px", padding: "12px 16px", backgroundColor: "var(--bg-secondary)", borderRadius: "var(--border-radius-sm)", alignItems: "flex-start" }}>
                    <span style={{ fontSize: "1rem", flexShrink: 0 }}>{row.icon}</span>
                    <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: "700", width: "70px", flexShrink: 0 }}>{row.label}</span>
                    <span style={{ fontSize: "0.88rem", color: "var(--text-main)", fontWeight: "600", flex: 1 }}>{row.value || "—"}</span>
                  </div>
                ))}

                {/* 선택 옵션 */}
                <div style={{ padding: "12px 16px", backgroundColor: "var(--bg-secondary)", borderRadius: "var(--border-radius-sm)" }}>
                  <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                    <span style={{ fontSize: "1rem" }}>➕</span>
                    <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: "700", width: "70px", flexShrink: 0 }}>추가 옵션</span>
                    <div style={{ flex: 1 }}>
                      {myReservationTarget.selected_options && myReservationTarget.selected_options.length > 0
                        ? myReservationTarget.selected_options.map((opt, i) => (
                          <span key={i} style={{ display: "inline-block", fontSize: "0.78rem", backgroundColor: "var(--primary-orange-light)", color: "var(--primary-orange)", padding: "3px 8px", borderRadius: "8px", fontWeight: "700", marginRight: "6px", marginBottom: "4px" }}>
                            {opt}
                          </span>
                        ))
                        : <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>없음</span>
                      }
                    </div>
                  </div>
                </div>

                {/* 예약 상태 배지 */}
                <div style={{ textAlign: "center", padding: "10px", borderRadius: "var(--border-radius-sm)", backgroundColor: myReservationTarget.status === "started" ? "var(--warning-coral-light)" : "var(--success-mint-light)" }}>
                  <span style={{ fontWeight: "800", fontSize: "0.9rem", color: myReservationTarget.status === "started" ? "var(--warning-coral)" : "var(--success-mint)" }}>
                    {myReservationTarget.status === "started" ? "🟢 현재 돌봄이 진행 중입니다." : "✅ 예약이 확정된 상태입니다."}
                  </span>
                </div>

                {/* 수정 및 취소 버튼 (돌봄 중/완료가 아닐 때만) */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "8px" }}>
                  <div style={{ display: "flex", gap: "10px" }}>
                    {myReservationTarget.status !== "started" && myReservationTarget.status !== "completed" && (
                      <>
                        <button
                          onClick={() => setIsEditingReservation(true)}
                          style={{
                            flex: 1, padding: "14px", fontSize: "0.92rem", fontWeight: "800",
                            backgroundColor: "var(--primary-orange)", color: "white",
                            border: "none", borderRadius: "var(--border-radius-sm)", cursor: "pointer",
                            transition: "var(--transition-fast)",
                          }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--primary-orange-hover)"}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = "var(--primary-orange)"}
                        >
                          ✏️ 돌봄 정보 수정하기
                        </button>
                        <button
                          onClick={handleCancelReservation}
                          style={{
                            flex: 1, padding: "14px", fontSize: "0.92rem", fontWeight: "800",
                            backgroundColor: "var(--warning-coral-light)", color: "var(--warning-coral)",
                            border: "1.5px solid var(--warning-coral)", borderRadius: "var(--border-radius-sm)", cursor: "pointer",
                            transition: "var(--transition-fast)",
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.backgroundColor = "var(--warning-coral)";
                            e.currentTarget.style.color = "white";
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.backgroundColor = "var(--warning-coral-light)";
                            e.currentTarget.style.color = "var(--warning-coral)";
                          }}
                        >
                          ❌ 예약 취소하기
                        </button>
                      </>
                    )}
                  </div>
                  <button
                    onClick={closeMyReservationModal}
                    style={{
                      width: "100%", padding: "14px", fontSize: "0.95rem", fontWeight: "800",
                      backgroundColor: "var(--bg-secondary)", color: "var(--text-main)",
                      border: "1.5px solid var(--border-light)", borderRadius: "var(--border-radius-sm)", cursor: "pointer",
                    }}
                  >
                    닫기
                  </button>
                </div>
              </div>
            ) : (
              /* 수정 모드 */
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ padding: "10px 14px", backgroundColor: "var(--warning-coral-light)", borderRadius: "var(--border-radius-sm)", border: "1px solid var(--warning-coral)" }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--warning-coral)", fontWeight: "700" }}>
                    ⚠️ 수정 후 [수정 완료]를 눌러야 저장됩니다. 돌봄 날짜 변경은 펫시터와 직접 협의해 주세요.
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label">📅 방문 일시 / 희망 시간</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editResVisitTime}
                    onChange={e => setEditResVisitTime(e.target.value)}
                    placeholder="예: 6월 15일 오후 2시~2시 30분"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">✨ 기타 요청 사항 (선호 시간 및 요청 메모)</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    value={editResMandatoryRequirements}
                    onChange={e => setEditResMandatoryRequirements(e.target.value)}
                    placeholder="예: 사료 급여나 조율 사항을 자유롭게 적어주세요."
                    style={{ resize: "vertical", fontFamily: "inherit" }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">📍 방문 지역</label>
                  <select
                    className="form-input"
                    value={editResVisitArea.includes("기타") || !["고현동","장평동","상문동","수월동","중곡동","옥포동","아주동","사곡리"].includes(editResVisitArea) ? "기타" : editResVisitArea}
                    onChange={e => setEditResVisitArea(e.target.value === "기타" ? "기타 지역" : e.target.value)}
                  >
                    {["고현동","장평동","상문동","수월동","중곡동","옥포동","아주동","사곡리"].map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                    <option value="기타">기타 지역 (+5,000원)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">➕ 추가 옵션 수정</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", backgroundColor: "var(--bg-secondary)", padding: "12px", borderRadius: "var(--border-radius-sm)" }}>
                    {[
                      "공휴일/명절 할증 (+5,000원)",
                      "사전 만남 (+10,000원)",
                      "투약 1회 (+5,000원)",
                      "급여도움(강제급여) (+10,000원)",
                      "병원 방문 1회 (+20,000원)",
                      "강아지 1마리 추가 (+8,000원)",
                      "1일 2회 방문 (+13,000원)",
                    ].map(opt => (
                      <label key={opt} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", cursor: "pointer", fontWeight: "600" }}>
                        <input
                          type="checkbox"
                          checked={editResOptions.includes(opt)}
                          onChange={e => {
                            if (e.target.checked) {
                              setEditResOptions(prev => [...prev, opt]);
                            } else {
                              setEditResOptions(prev => prev.filter(o => o !== opt));
                            }
                          }}
                          style={{ accentColor: "var(--primary-orange)" }}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                  <button
                    onClick={handleSaveReservationEdit}
                    disabled={editResIsSaving}
                    style={{
                      flex: 1, padding: "14px", fontSize: "0.95rem", fontWeight: "800",
                      backgroundColor: editResIsSaving ? "var(--text-muted)" : "var(--success-mint)",
                      color: "white", border: "none", borderRadius: "var(--border-radius-sm)",
                      cursor: editResIsSaving ? "not-allowed" : "pointer",
                      transition: "var(--transition-fast)",
                    }}
                  >
                    {editResIsSaving ? "저장 중..." : "✅ 수정 완료"}
                  </button>
                  <button
                    onClick={() => setIsEditingReservation(false)}
                    style={{
                      flex: 1, padding: "14px", fontSize: "0.95rem", fontWeight: "800",
                      backgroundColor: "var(--bg-secondary)", color: "var(--text-main)",
                      border: "1.5px solid var(--border-light)", borderRadius: "var(--border-radius-sm)", cursor: "pointer",
                    }}
                  >
                    취소
                  </button>
                </div>
              </div>
            )}
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
          <div className="premium-card animate-fade-in" style={{ 
            maxWidth: "460px", 
            width: "90%", 
            padding: "40px 32px",
            backgroundColor: "white",
            borderRadius: "var(--border-radius-lg)",
            boxShadow: "var(--shadow-lg)",
            border: "1px solid var(--border-light)",
            textAlign: "center"
          }}>
            <div style={{ position: "relative", marginBottom: "24px" }}>
              <button 
                onClick={() => setShowLoginModal(false)}
                style={{
                  position: "absolute",
                  top: "-20px",
                  right: "-12px",
                  background: "transparent",
                  border: "none",
                  fontSize: "1.4rem",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  transition: "var(--transition-fast)"
                }}
                onMouseEnter={(e) => e.target.style.color = "var(--text-main)"}
                onMouseLeave={(e) => e.target.style.color = "var(--text-muted)"}
              >
                ✕
              </button>
              
              <div style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                backgroundColor: "var(--primary-orange-light)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 12px"
              }}>
                <span style={{ fontSize: "1.6rem" }}>🔐</span>
              </div>
              <h3 style={{ fontSize: "1.35rem", color: "var(--text-main)", fontWeight: "800", margin: "0 0 4px" }}>
                윤교품애 인증 센터
              </h3>
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: 0 }}>
                보호자님의 편리한 예약 관리를 지원합니다. ✨
              </p>
            </div>

            {/* 탭 헤더 */}
            <div style={{
              display: "flex",
              backgroundColor: "var(--bg-secondary)",
              padding: "4px",
              borderRadius: "var(--border-radius-sm)",
              marginBottom: "24px",
              border: "1.5px solid var(--border-light)"
            }}>
              <button
                type="button"
                onClick={() => setActiveLoginTab("client")}
                style={{
                  flex: 1,
                  padding: "10px",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "0.85rem",
                  fontWeight: "800",
                  cursor: "pointer",
                  backgroundColor: activeLoginTab === "client" ? "white" : "transparent",
                  color: activeLoginTab === "client" ? "var(--primary-orange)" : "var(--text-muted)",
                  boxShadow: activeLoginTab === "client" ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
                  transition: "all 0.15s ease"
                }}
              >
                👤 집사님 간편로그인
              </button>
              <button
                type="button"
                onClick={() => setActiveLoginTab("admin")}
                style={{
                  flex: 1,
                  padding: "10px",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "0.85rem",
                  fontWeight: "800",
                  cursor: "pointer",
                  backgroundColor: activeLoginTab === "admin" ? "white" : "transparent",
                  color: activeLoginTab === "admin" ? "var(--primary-orange)" : "var(--text-muted)",
                  boxShadow: activeLoginTab === "admin" ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
                  transition: "all 0.15s ease"
                }}
              >
                👑 관리자 로그인
              </button>
            </div>

            {/* 탭 내용 분기 */}
            {activeLoginTab === "client" ? (
              /* [집사님 간편로그인 탭] */
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", textAlign: "left" }}>
                <div style={{
                  padding: "10px 14px",
                  backgroundColor: "var(--primary-orange-light)",
                  borderRadius: "var(--border-radius-sm)",
                  fontSize: "0.78rem",
                  color: "var(--primary-orange)",
                  fontWeight: "750",
                  lineHeight: "1.4"
                }}>
                  💡 별도의 가입 없이, 이름과 전화번호만으로 즉시 예약 상황을 확인 및 관리하실 수 있습니다!
                </div>
                
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: "0.82rem", fontWeight: "800", color: "var(--text-main)", marginBottom: "6px", display: "block" }}>
                    이름
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={simpleLoginName}
                    onChange={(e) => setSimpleLoginName(e.target.value)}
                    placeholder="홍길동"
                    style={{ width: "100%" }}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: "0.82rem", fontWeight: "800", color: "var(--text-main)", marginBottom: "6px", display: "block" }}>
                    전화번호
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={simpleLoginPhone}
                    onChange={(e) => setSimpleLoginPhone(e.target.value)}
                    placeholder="01012345678"
                    style={{ width: "100%" }}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleSimpleLogin(simpleLoginName, simpleLoginPhone)}
                  disabled={isSubmitting}
                  style={{
                    width: "100%",
                    padding: "14px",
                    backgroundColor: "var(--primary-orange)",
                    color: "white",
                    border: "none",
                    borderRadius: "var(--border-radius-sm)",
                    fontSize: "0.95rem",
                    fontWeight: "800",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    transition: "var(--transition-fast)",
                    marginTop: "8px",
                    boxShadow: "0 4px 12px rgba(255, 112, 67, 0.2)"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--primary-orange-hover)"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "var(--primary-orange)"}
                >
                  {isSubmitting ? "간편 로그인 중..." : "🚀 1초 만에 간편 로그인/조회"}
                </button>
              </div>
            ) : (
              /* [관리자 로그인 탭] */
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: "4px 0 8px", lineHeight: "1.4" }}>
                  관리자 및 펫시터용 구글 원클릭 로그인 채널입니다.
                </p>

                {/* Google Login Button */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isSubmitting}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "12px",
                    width: "100%",
                    padding: "14px 20px",
                    backgroundColor: "white",
                    color: "#3c4043",
                    border: "1.5px solid var(--border-light)",
                    borderRadius: "var(--border-radius-md)",
                    fontSize: "0.95rem",
                    fontWeight: "700",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    transition: "all 0.2s ease-in-out",
                    boxShadow: "var(--shadow-sm)"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--bg-primary)";
                    e.currentTarget.style.borderColor = "var(--text-muted)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "white";
                    e.currentTarget.style.borderColor = "var(--border-light)";
                  }}
                >
                  {isSubmitting ? (
                    <span>로그인 진행 중...</span>
                  ) : (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.53-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-8.81z"/>
                        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.11 0-5.74-2.11-6.68-4.96H1.21v3.15C3.18 21.88 7.39 24 12 24z"/>
                        <path fill="#FBBC05" d="M5.32 14.24c-.24-.72-.38-1.5-.38-2.3s.14-1.58.38-2.3V6.49H1.21C.44 8.04 0 9.77 0 11.62s.44 3.58 1.21 5.13l4.11-3.15C5.18 15.1 5.25 14.66 5.32 14.24z"/>
                        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.39 0 3.18 2.12 1.21 5.62l4.11 3.15c.94-2.85 3.57-4.96 6.68-4.96z"/>
                      </svg>
                      <span>Google 계정으로 로그인</span>
                    </>
                  )}
                </button>

                {/* Demo Mode Role Switcher */}
                {!isSupabaseConfigured ? (
                  <div style={{ 
                    marginTop: "16px", 
                    padding: "16px 20px", 
                    backgroundColor: "var(--bg-primary)", 
                    borderRadius: "var(--border-radius-md)",
                    border: "1px solid var(--border-light)",
                    textAlign: "left"
                  }}>
                    <label className="form-label" style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-main)", display: "block", marginBottom: "8px" }}>
                      ⚙️ 시뮬레이션 로그인 역할 선택
                    </label>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        type="button"
                        onClick={() => setSelectedRole("member")}
                        style={{
                          flex: 1, padding: "10px", border: "1.5px solid var(--border-light)",
                          borderRadius: "var(--border-radius-sm)",
                          backgroundColor: selectedRole === "member" ? "var(--primary-orange-light)" : "white",
                          borderColor: selectedRole === "member" ? "var(--primary-orange)" : "var(--border-light)",
                          color: selectedRole === "member" ? "var(--primary-orange)" : "var(--text-muted)",
                          fontWeight: "700", cursor: "pointer", fontSize: "0.8rem"
                        }}
                      >
                        👤 일반 회원 (Member)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedRole("sitter")}
                        style={{
                          flex: 1, padding: "10px", border: "1.5px solid var(--border-light)",
                          borderRadius: "var(--border-radius-sm)",
                          backgroundColor: selectedRole === "sitter" ? "var(--primary-orange-light)" : "white",
                          borderColor: selectedRole === "sitter" ? "var(--primary-orange)" : "var(--border-light)",
                          color: selectedRole === "sitter" ? "var(--primary-orange)" : "var(--text-muted)",
                          fontWeight: "700", cursor: "pointer", fontSize: "0.8rem"
                        }}
                      >
                        ⚡ 펫시터 (Sitter)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedRole("admin")}
                        style={{
                          flex: 1, padding: "10px", border: "1.5px solid var(--border-light)",
                          borderRadius: "var(--border-radius-sm)",
                          backgroundColor: selectedRole === "admin" ? "var(--primary-orange-light)" : "white",
                          borderColor: selectedRole === "admin" ? "var(--primary-orange)" : "var(--border-light)",
                          color: selectedRole === "admin" ? "var(--primary-orange)" : "var(--text-muted)",
                          fontWeight: "700", cursor: "pointer", fontSize: "0.8rem"
                        }}
                      >
                        👑 관리자 (Admin)
                      </button>
                    </div>
                    <span style={{ display: "block", fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "8px", lineHeight: "1.3" }}>
                      * 로컬 환경 시뮬레이션 로그인입니다. 선택한 역할로 Google 로그인이 시뮬레이션됩니다.
                    </span>
                  </div>
                ) : (
                  <div style={{ 
                    marginTop: "16px", 
                    padding: "16px 20px", 
                    backgroundColor: "var(--bg-primary)", 
                    borderRadius: "var(--border-radius-md)",
                    border: "1px solid var(--border-light)",
                    textAlign: "left"
                  }}>
                    <span style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", lineHeight: "1.4" }}>
                      💡 <strong>관리자(admin) 권한 테스트 안내:</strong><br />
                      실제 Google 로그인 시 <code>sitter@yenu.com</code> 이메일 계정으로 접속하시면 펫시터 관리자 모드가 활성화됩니다.
                    </span>
                  </div>
                )}
              </div>
            )}

            <div style={{ marginTop: "28px", display: "flex", justifyContent: "center" }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setShowLoginModal(false)} 
                style={{ width: "100%", padding: "12px", fontWeight: "800" }}
              >
                닫기
              </button>
            </div>
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
      {/* 3.5. BLOG POST DETAIL MODAL */}
      {/* ============================================================== */}
      {selectedDetailPost && (
        <div 
          onClick={() => setSelectedDetailPost(null)}
          style={{
            position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
            backgroundColor: "rgba(22, 31, 56, 0.7)", display: "flex", alignItems: "center",
            justifyContent: "center", zIndex: 1200, backdropFilter: "blur(8px)"
          }}
        >
          <div 
            className="premium-card animate-fade-in" 
            onClick={(e) => e.stopPropagation()}
            style={{ 
              maxWidth: "650px", 
              width: "90%", 
              maxHeight: "85vh", 
              overflowY: "auto", 
              padding: "clamp(20px, 5vw, 32px)", 
              position: "relative",
              backgroundColor: "white",
              display: "flex",
              flexDirection: "column",
              gap: "20px"
            }}
          >
            {/* Close Button X on top-right */}
            <button
              onClick={() => setSelectedDetailPost(null)}
              style={{
                position: "absolute",
                top: "clamp(12px, 3vw, 20px)",
                right: "clamp(12px, 3vw, 20px)",
                background: "none",
                border: "none",
                fontSize: "1.5rem",
                cursor: "pointer",
                color: "var(--text-muted)",
                zIndex: 10,
                transition: "color 0.2s"
              }}
              onMouseEnter={(e) => e.target.style.color = "var(--primary-orange)"}
              onMouseLeave={(e) => e.target.style.color = "var(--text-muted)"}
            >
              ✕
            </button>

            {/* Premium Top Image with Fallback handling */}
            {(() => {
              const rawImgUrl = selectedDetailPost.image_url || selectedDetailPost.imageUrl || selectedDetailPost.imgUrl || selectedDetailPost.image;
              const imgUrl = rawImgUrl ? rawImgUrl.replace("fit=crop", "fit=max") : "";
              if (imgUrl) {
                return (
                  <div 
                    onClick={() => setLightboxImgUrl(imgUrl)}
                    style={{
                      width: "100%",
                      borderRadius: "var(--border-radius-md)",
                      border: "1px solid var(--border-light)",
                      marginTop: "10px",
                      backgroundColor: "var(--bg-secondary)",
                      overflow: "hidden",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      flexShrink: 0,
                      cursor: "pointer",
                      position: "relative"
                    }}
                  >
                    <img
                      src={imgUrl}
                      alt={sanitizeInputText(selectedDetailPost.title)}
                      style={{
                        width: "100%",
                        height: "auto",
                        maxHeight: "500px",
                        objectFit: "contain",
                        display: "block"
                      }}
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=max&q=80&w=800";
                      }}
                    />
                    {/* Lightbox Badge Indicator */}
                    <div style={{
                      position: "absolute",
                      bottom: "12px",
                      right: "12px",
                      backgroundColor: "rgba(22, 31, 56, 0.7)",
                      backdropFilter: "blur(4px)",
                      color: "white",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      fontSize: "0.75rem",
                      fontWeight: "600",
                      pointerEvents: "none",
                      border: "1px solid rgba(255, 255, 255, 0.15)"
                    }}>
                      🔍 원본 이미지 (클릭 시 전체크기)
                    </div>
                  </div>
                );
              }
              // Beautiful solid/gradient placeholder bar when image is absent
              return (
                <div style={{
                  width: "100%",
                  height: "8px",
                  background: "linear-gradient(to right, var(--primary-orange), var(--warning-coral))",
                  borderRadius: "var(--border-radius-full)",
                  marginTop: "10px"
                }} />
              );
            })()}

            {/* Category and Date */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="badge badge-tag" style={{
                backgroundColor: "var(--primary-orange-light)",
                color: "var(--primary-orange)",
                fontSize: "0.8rem",
                padding: "6px 12px",
                borderRadius: "100px",
                fontWeight: "750"
              }}>
                {getCategoryName(selectedDetailPost.category)}
              </span>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "600" }}>
                📅 {selectedDetailPost.created_at ? new Date(selectedDetailPost.created_at).toLocaleDateString("ko-KR", {
                  year: "numeric", month: "long", day: "numeric"
                }) : "작성일 미상"}
              </span>
            </div>

            {/* Title */}
            <h2 style={{
              fontSize: "clamp(1.25rem, 4vw, 1.6rem)",
              fontWeight: "900",
              color: "var(--text-main)",
              lineHeight: "1.4",
              margin: 0,
              wordBreak: "keep-all",
              paddingRight: "24px"
            }}>
              {sanitizeInputText(selectedDetailPost.title)}
              {selectedDetailPost.is_restricted && <span style={{ marginLeft: "6px", color: "var(--primary-orange)" }}>🔒</span>}
            </h2>

            {/* Author */}
            <div style={{ 
              fontSize: "0.9rem", 
              color: "var(--text-muted)", 
              fontWeight: "600",
              borderBottom: "1px solid var(--border-light)",
              paddingBottom: "12px"
            }}>
              👤 작성자: {selectedDetailPost.author_name || "전윤교 펫시터"}
            </div>

            {/* Content text */}
            <div style={{
              fontSize: "1rem",
              color: "var(--text-main)",
              lineHeight: "1.75",
              whiteSpace: "pre-wrap",
              textAlign: "left",
              wordBreak: "keep-all"
            }}>
              {sanitizeInputText(selectedDetailPost.content)}
            </div>

            {/* Footer with close button */}
            <div style={{ display: "flex", borderTop: "1px solid var(--border-light)", paddingTop: "16px" }}>
              <button
                onClick={() => setSelectedDetailPost(null)}
                className="btn btn-secondary"
                style={{ width: "100%", padding: "14px 20px", fontSize: "1rem" }}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3.1 IMAGE LIGHTBOX OVERLAY */}
      {lightboxImgUrl && (
        <div
          onClick={() => setLightboxImgUrl(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(22, 31, 56, 0.9)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
            backdropFilter: "blur(8px)"
          }}
        >
          {/* Close Button X on top-right of screen */}
          <button
            onClick={() => setLightboxImgUrl(null)}
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              background: "rgba(255, 255, 255, 0.15)",
              border: "none",
              borderRadius: "50%",
              width: "44px",
              height: "44px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
              cursor: "pointer",
              color: "white",
              zIndex: 10,
              backdropFilter: "blur(4px)",
              transition: "var(--transition-fast)",
              border: "1px solid rgba(255, 255, 255, 0.2)"
            }}
            onMouseEnter={(e) => e.target.style.background = "rgba(255, 255, 255, 0.3)"}
            onMouseLeave={(e) => e.target.style.background = "rgba(255, 255, 255, 0.15)"}
          >
            ✕
          </button>

          <div style={{
            position: "relative",
            width: "90%",
            maxWidth: "90vw",
            maxHeight: "85vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}>
            <img
              src={lightboxImgUrl}
              alt="원본 이미지"
              style={{
                maxWidth: "100%",
                maxHeight: "85vh",
                objectFit: "contain",
                borderRadius: "var(--border-radius-md)",
                boxShadow: "var(--shadow-lg)",
                border: "1px solid rgba(255, 255, 255, 0.1)"
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div style={{
            color: "rgba(255, 255, 255, 0.7)",
            fontSize: "0.85rem",
            marginTop: "16px",
            textAlign: "center",
            fontWeight: "500",
            pointerEvents: "none"
          }}>
            바깥 영역을 클릭하면 닫힙니다.
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. BOOKING SUCCESS MODAL */}
      {/* ============================================================== */}
      {/* ============================================================== */}
      {/* 4. BOOKING SUCCESS MODAL */}
      {/* ============================================================== */}
      <div style={{
        position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
        backgroundColor: "rgba(22, 31, 56, 0.7)", display: (showBookingSuccessModal && bookingSummary) ? "flex" : "none", alignItems: "center",
        justifyContent: "center", zIndex: 2000, backdropFilter: "blur(8px)"
      }}>
        <div className="premium-card animate-fade-in" style={{
          maxWidth: "480px",
          width: "90%",
          padding: "32px 24px",
          maxHeight: "90vh",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column"
        }}>
          
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
              <strong style={{ color: "var(--text-main)" }}>{bookingSummary?.petName || ""} ({bookingSummary?.petAge || ""})</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
              <span style={{ color: "var(--text-muted)" }}>서비스 구분</span>
              <strong style={{ color: "var(--text-main)" }}>💼 {bookingSummary?.serviceType || ""}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
              <span style={{ color: "var(--text-muted)" }}>예약 날짜</span>
              <strong style={{ color: "var(--text-main)" }}>📅 {bookingSummary?.date || ""}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
              <span style={{ color: "var(--text-muted)" }}>돌봄 시간</span>
              <strong style={{ color: "var(--text-main)" }}>⏰ {bookingSummary?.time || ""}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
              <span style={{ color: "var(--text-muted)" }}>방문 지역</span>
              <strong style={{ color: "var(--text-main)" }}>📍 {bookingSummary?.visitArea || ""}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", borderTop: "1px solid var(--border-light)", paddingTop: "8px" }}>
              <span style={{ color: "var(--text-muted)" }}>기본 돌봄 요금 (30분)</span>
              <strong style={{ color: "var(--text-main)" }}>{bookingSummary?.basePrice ? bookingSummary.basePrice.toLocaleString() : "0"}원</strong>
            </div>

            {bookingSummary?.selectedOptions && bookingSummary.selectedOptions.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "0.85rem", borderTop: "1px solid var(--border-light)", paddingTop: "8px" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: "700" }}>선택된 추가 옵션</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "2px" }}>
                  {bookingSummary.selectedOptions.map((opt, idx) => (
                    <span key={idx} style={{
                      backgroundColor: "var(--primary-orange-light)",
                      color: "var(--primary-orange)",
                      fontSize: "0.75rem",
                      padding: "4px 8px",
                      borderRadius: "12px",
                      fontWeight: "600"
                    }}>
                      {opt}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {bookingSummary?.additionalFee > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", color: "var(--warning-coral)" }}>
                <span>추가 요금 합계</span>
                <strong>+{bookingSummary.additionalFee.toLocaleString()}원</strong>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.95rem", fontWeight: "800", color: "var(--primary-orange)", borderTop: "1.5px dashed var(--border-light)", paddingTop: "8px" }}>
              <span>총 예상 결제 요금</span>
              <span>{bookingSummary?.totalPrice ? bookingSummary.totalPrice.toLocaleString() : "0"}원</span>
            </div>
            <div style={{
              backgroundColor: "var(--warning-coral-light)",
              color: "var(--warning-coral)",
              padding: "8px 12px",
              borderRadius: "6px",
              fontSize: "0.8rem",
              fontWeight: "700",
              textAlign: "center",
              marginTop: "4px"
            }}>
              💳 선불결제이며, 결제 완료 시 예약 확정됩니다. (미결제 시 방문 불가)
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", borderTop: "1px solid var(--border-light)", paddingTop: "8px" }}>
              <span style={{ color: "var(--text-muted)" }}>담당 전문가</span>
              <strong style={{ color: "var(--text-main)" }}>{bookingSummary?.sitterName || ""}</strong>
            </div>

            {/* 건강 상태 요약 */}
            {bookingSummary?.recentHospitalVisit && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", borderTop: "1px solid var(--border-light)", paddingTop: "8px" }}>
                <span style={{ color: "var(--text-muted)" }}>🏥 최근 병원 방문</span>
                <strong style={{ color: "var(--text-main)", textAlign: "right", maxWidth: "60%" }}>{bookingSummary.recentHospitalVisit}</strong>
              </div>
            )}
            {bookingSummary?.petPersonality && bookingSummary.petPersonality !== "미입력" && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                <span style={{ color: "var(--text-muted)" }}>🐾 성격</span>
                <strong style={{ color: "var(--text-main)", textAlign: "right", maxWidth: "60%" }}>{bookingSummary.petPersonality}</strong>
              </div>
            )}

            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
              <span style={{ display: "block", fontWeight: "700", color: "var(--text-main)", marginBottom: "2px" }}>💡 보호자 요청사항:</span>
              <p style={{ margin: 0, fontStyle: "italic", backgroundColor: "white", padding: "8px 12px", borderRadius: "4px", border: "1px solid var(--border-light)" }}>
                &ldquo;{bookingSummary?.careMemo || ""}&rdquo;
              </p>
            </div>
          </div>

          {/* 결제 수단 선택 섹션 */}
          <div style={{
            marginTop: "20px",
            borderTop: "1.5px solid var(--border-light)",
            paddingTop: "16px",
            marginBottom: "20px"
          }}>
            <span style={{
              display: "block",
              fontWeight: "800",
              fontSize: "0.9rem",
              color: "var(--text-main)",
              marginBottom: "12px"
            }}>
              💳 결제 수단 선택
            </span>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "8px",
              marginBottom: "16px"
            }}>
              <button
                type="button"
                disabled={true}
                style={{
                  padding: "12px 8px",
                  borderRadius: "10px",
                  border: "1.5px solid var(--border-light)",
                  backgroundColor: "hsl(268, 10%, 96%)",
                  color: "hsl(268, 10%, 65%)",
                  fontWeight: "800",
                  fontSize: "0.8rem",
                  cursor: "not-allowed",
                  opacity: 0.5,
                  transition: "all 0.15s ease",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                <span style={{ fontSize: "1.2rem" }}>💳</span>
                <span>카드 결제</span>
                <span style={{ fontSize: "0.65rem", color: "hsl(268, 10%, 50%)", fontWeight: "600", marginTop: "2px" }}>(서비스 준비 중)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("bank")}
                style={{
                  padding: "12px 8px",
                  borderRadius: "10px",
                  border: paymentMethod === "bank" ? "2.5px solid var(--primary-orange)" : "1.5px solid var(--border-light)",
                  backgroundColor: paymentMethod === "bank" ? "var(--primary-orange-light)" : "white",
                  color: paymentMethod === "bank" ? "var(--primary-orange)" : "var(--text-muted)",
                  fontWeight: "800",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                <span style={{ fontSize: "1.2rem" }}>🏦</span>
                <span>무통장 입금</span>
              </button>

              <button
                type="button"
                disabled={true}
                style={{
                  padding: "12px 8px",
                  borderRadius: "10px",
                  border: "1.5px solid var(--border-light)",
                  backgroundColor: "hsl(268, 10%, 96%)",
                  color: "hsl(268, 10%, 65%)",
                  fontWeight: "800",
                  fontSize: "0.8rem",
                  cursor: "not-allowed",
                  opacity: 0.5,
                  transition: "all 0.15s ease",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                <span style={{ fontSize: "1.2rem" }}>📱</span>
                <span>거제 제로페이</span>
                <span style={{ fontSize: "0.65rem", color: "hsl(268, 10%, 50%)", fontWeight: "600", marginTop: "2px" }}>(서비스 준비 중)</span>
              </button>
            </div>

            {/* 수단별 안내 문구 */}
            {paymentMethod === "card" && (
              <div style={{
                padding: "12px 14px",
                borderRadius: "8px",
                backgroundColor: "var(--bg-primary)",
                border: "1px solid var(--border-light)",
                fontSize: "0.82rem",
                color: "var(--text-muted)",
                lineHeight: "1.4"
              }}>
                ℹ️ 토스페이먼츠의 안전한 카드 결제창으로 연결됩니다.
              </div>
            )}

            {paymentMethod === "bank" && (
              <div style={{
                padding: "12px 14px",
                borderRadius: "8px",
                backgroundColor: "var(--primary-orange-light)",
                border: "1.5px solid var(--primary-orange)",
                fontSize: "0.82rem",
                color: "var(--text-main)",
                lineHeight: "1.5"
              }}>
                👉 계좌번호: <strong style={{ color: "var(--primary-orange)" }}>카카오뱅크 3333-05-0634796 전윤교</strong><br />
                💡 입금 확인 후 1시간 이내에 예약이 최종 확정됩니다.
              </div>
            )}

            {paymentMethod === "zeropay" && (
              <div style={{
                padding: "12px 14px",
                borderRadius: "8px",
                backgroundColor: "var(--success-mint-light)",
                border: "1.5px solid var(--success-mint)",
                fontSize: "0.82rem",
                color: "var(--text-main)",
                lineHeight: "1.5"
              }}>
                👉 모바일 거제사랑상품권(거제시 제로페이) 결제를 원하시는 경우, 우선 아래 <strong>[예약 신청하기]</strong> 버튼을 눌러 접수를 완료해 주세요! 동선 및 일정 조율을 위해 개별 연락드릴 때, 상품권 결제 방법을 별도로 친절하게 안내해 드리겠습니다. ✨
              </div>
            )}
          </div>

          <button
            id="demo-confirm-payment-btn"
            onClick={handleConfirmPayment}
            style={{
              width: "100%",
              padding: "14px",
              fontWeight: "800",
              fontSize: "0.95rem",
              backgroundColor: paymentMethod === "card" ? "var(--primary-orange)" : "var(--success-mint)",
              color: "white",
              border: "none",
              borderRadius: "var(--border-radius-md, 14px)",
              cursor: "pointer",
              boxShadow: paymentMethod === "card" 
                ? "0 4px 12px rgba(255, 112, 67, 0.2)" 
                : "0 4px 12px rgba(46, 125, 50, 0.2)",
              transition: "all 0.2s ease"
            }}
          >
            {paymentMethod === "card" ? "💳 결제 및 예약 확정" : "📝 예약 신청하기"}
          </button>
        </div>
      </div>

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
                {editingPostId ? "📝 포스트 수정 (윤교품애)" : "📝 새 포스트 작성 (윤교품애)"}
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
      {/* 6. HEADER BAR (Yoongyopoomae branding) */}
      {/* ============================================================== */}
      <header style={{
        backgroundColor: "var(--bg-secondary)", borderBottom: "3px solid var(--primary-orange)",
        backdropFilter: "blur(10px)",
        background: "rgba(255,255,255,0.95)",
        position: "relative"
      }}>
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "80px", position: "relative" }}>
          
          {/* Logo brand linked from index.html */}
          <div onClick={() => { setActivePortal("home"); setMobileMenuOpen(false); }} style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", zIndex: 1001 }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundImage: "url('/miki_icon.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                border: "2.5px solid var(--gold)",
                boxShadow: "0 2px 8px rgba(197, 160, 89, 0.25)"
              }}
              aria-label="윤교품애 마스코트 미키 로고"
            />
            <div>
              <span style={{ fontSize: "1.4rem", fontWeight: "800", letterSpacing: "-0.5px", color: "var(--text-main)", fontFamily: "Outfit" }}>
                윤교품애
              </span>
              <span style={{ fontSize: "0.75rem", color: "var(--success-mint)", fontWeight: "600", display: "block", marginTop: "-3px" }}>
                전윤교의 프리미엄 반려동물 돌봄 포털
              </span>
            </div>
          </div>

          {/* Mobile Hamburger toggle button */}
          <button
            className="mobile-nav-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="메뉴 토글"
            style={{
              background: "none",
              border: "none",
              fontSize: "1.8rem",
              color: "var(--text-main)",
              cursor: "pointer",
              padding: "8px",
              zIndex: 1001,
              display: "none", /* Shown on mobile via CSS media query */
              transition: "var(--transition-fast)"
            }}
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>

          {/* Desktop Navigation Tabs & Profile */}
          <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            {/* Top Tabs - Merged client HTML site & NextJS Portal */}
            <div style={{
              display: "flex",
              backgroundColor: "var(--primary-orange-light)",
              padding: "5px",
              borderRadius: "var(--border-radius-full)",
              border: "1.5px solid var(--gold-border)",
              boxShadow: "0 6px 20px rgba(100,40,180,0.10), 0 1px 0 var(--gold-light) inset"
            }}>
              <button
                id="demo-home-tab-btn"
                onClick={() => setActivePortal("home")}
                style={{
                  border: "none", background: activePortal === "home" ? "var(--primary-orange)" : "transparent",
                  color: activePortal === "home" ? "white" : "var(--gold)",
                  padding: "8px 18px", borderRadius: "var(--border-radius-full)",
                  fontSize: "0.85rem", fontWeight: "750", cursor: "pointer", transition: "var(--transition-fast)"
                }}
              >
                🏠 홈
              </button>
              <button
                id="demo-posts-tab-btn"
                onClick={() => setActivePortal("posts")}
                style={{
                  border: "none", background: activePortal === "posts" ? "var(--primary-orange)" : "transparent",
                  color: activePortal === "posts" ? "white" : "var(--gold)",
                  padding: "8px 18px", borderRadius: "var(--border-radius-full)",
                  fontSize: "0.85rem", fontWeight: "750", cursor: "pointer", transition: "var(--transition-fast)"
                }}
              >
                📝 돌봄 후기/일지
              </button>
              <button
                id="demo-booking-tab-btn"
                onClick={() => {
                  setActivePortal("booking");
                  setBookingSubView("calculator");
                }}
                style={{
                  border: "none", background: activePortal === "booking" ? "var(--primary-orange)" : "transparent",
                  color: activePortal === "booking" ? "white" : "var(--gold)",
                  padding: "8px 18px", borderRadius: "var(--border-radius-full)",
                  fontSize: "0.85rem", fontWeight: "750", cursor: "pointer", transition: "var(--transition-fast)"
                }}
              >
                📅 실시간 예약
              </button>
              <button
                onClick={() => {
                  if (!isLoggedIn) {
                    showToast("🔒 보안 수칙: 펫시터 관리 권한 확인을 위해 로그인이 필요합니다.");
                    setShowLoginModal(true);
                  } else if (activeUser && activeUser.role !== "admin" && activeUser.role !== "sitter") {
                    showToast("🔒 보안 경고: 이 탭은 펫시터 및 관리자 전용 공간입니다. 펫시터 또는 관리자로 재인증해주세요.");
                  } else {
                    setActivePortal("sitter");
                  }
                }}
                style={{
                  border: "none", background: activePortal === "sitter" ? "var(--primary-orange)" : "transparent",
                  color: activePortal === "sitter" ? "white" : "var(--gold)",
                  padding: "8px 18px", borderRadius: "var(--border-radius-full)",
                  fontSize: "0.85rem", fontWeight: "750", cursor: "pointer", transition: "var(--transition-fast)"
                }}
              >
                🔒 대시보드
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

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div
              className="mobile-nav-menu"
              style={{
                position: "absolute",
                top: "80px",
                left: 0,
                right: 0,
                backgroundColor: "white",
                borderBottom: "1.5px solid var(--border-light)",
                boxShadow: "var(--shadow-md)",
                padding: "20px 24px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                zIndex: 1000,
                animation: "fadeIn 0.2s ease-out"
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <button
                  onClick={() => { setActivePortal("home"); setMobileMenuOpen(false); }}
                  style={{
                    border: "none",
                    background: activePortal === "home" ? "var(--primary-orange)" : "var(--bg-primary)",
                    color: activePortal === "home" ? "white" : "var(--text-main)",
                    padding: "12px 20px",
                    borderRadius: "var(--border-radius-md)",
                    fontSize: "1rem",
                    fontWeight: "750",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "var(--transition-fast)"
                  }}
                >
                  🏠 윤교품애 홈
                </button>
                <button
                  onClick={() => {
                    setActivePortal("posts");
                    setMobileMenuOpen(false);
                  }}
                  style={{
                    border: "none",
                    background: activePortal === "posts" ? "var(--primary-orange)" : "var(--bg-primary)",
                    color: activePortal === "posts" ? "white" : "var(--text-main)",
                    padding: "12px 20px",
                    borderRadius: "var(--border-radius-md)",
                    fontSize: "1rem",
                    fontWeight: "750",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "var(--transition-fast)"
                  }}
                >
                  📝 돌봄 후기/일지
                </button>
                <button
                  onClick={() => {
                    setActivePortal("booking");
                    setBookingSubView("calculator");
                    setMobileMenuOpen(false);
                  }}
                  style={{
                    border: "none",
                    background: activePortal === "booking" ? "var(--primary-orange)" : "var(--bg-primary)",
                    color: activePortal === "booking" ? "white" : "var(--text-main)",
                    padding: "12px 20px",
                    borderRadius: "var(--border-radius-md)",
                    fontSize: "1rem",
                    fontWeight: "750",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "var(--transition-fast)"
                  }}
                >
                  📅 실시간 캘린더 예약
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (!isLoggedIn) {
                      showToast("🔒 보안 수칙: 펫시터 관리 권한 확인을 위해 로그인이 필요합니다.");
                      setShowLoginModal(true);
                    } else if (activeUser && activeUser.role !== "admin" && activeUser.role !== "sitter") {
                      showToast("🔒 보안 경고: 이 탭은 펫시터 및 관리자 전용 공간입니다. 펫시터 또는 관리자로 재인증해주세요.");
                    } else {
                      setActivePortal("sitter");
                    }
                  }}
                  style={{
                    border: "none",
                    background: activePortal === "sitter" ? "var(--primary-orange)" : "var(--bg-primary)",
                    color: activePortal === "sitter" ? "white" : "var(--text-main)",
                    padding: "12px 20px",
                    borderRadius: "var(--border-radius-md)",
                    fontSize: "1rem",
                    fontWeight: "750",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "var(--transition-fast)"
                  }}
                >
                  🔒 펫시터 대시보드
                </button>
              </div>

              <div style={{ height: "1px", backgroundColor: "var(--border-light)", margin: "4px 0" }}></div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {isLoggedIn && activeUser ? (
                  <>
                    <span style={{ fontSize: "0.95rem", fontWeight: "700", color: "var(--text-main)" }}>
                      👤 {activeUser.full_name}
                    </span>
                    <button className="btn btn-secondary" onClick={() => { handleLogout(); setMobileMenuOpen(false); }} style={{ padding: "10px 18px", fontSize: "0.9rem" }}>
                      로그아웃
                    </button>
                  </>
                ) : (
                  <button className="btn btn-primary" onClick={() => { setShowLoginModal(true); setMobileMenuOpen(false); }} style={{ width: "100%", padding: "12px", fontSize: "0.95rem" }}>
                    인증 로그인 🔑
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </header>
      </div> {/* /Fixed header wrapper */}

      {/* ============================================================== */}
      {/* 7. PORTAL VIEW A: 🏠 YOONGYOPOOMAE HOME & BLOG */}
      {/* ============================================================== */}
      <main className="animate-fade-in" style={{ flex: 1, display: activePortal === "home" ? "block" : "none" }}>
          
          {/* Hero Section from index.html (Synthesized with Outfit styling) */}
          <section className="p-6 md:p-12" style={{
            background: "linear-gradient(135deg, hsl(270,30%,97%) 0%, hsl(266,30%,94%) 50%, hsl(43,60%,97%) 100%)",
            borderBottom: "2px solid var(--gold-border)"
          }}>
            <div className="container hero-container" style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "48px",
              alignItems: "center"
            }}>
              <div className="hero-text">
                <h1 className="hero-title" style={{
                  fontWeight: "800",
                  color: "var(--text-deep-purple)",
                  marginBottom: "20px"
                }}>
                  고양이들의 행복한 기록을 담습니다 <span style={{ color: "var(--gold)", display: "inline-block" }}>🐾</span>
                </h1>
                <p className="hero-paragraph" style={{ textAlign: "center" }}>
                  전문 펫시터 전윤교가 들려주는<br />
                  생생한 돌봄 이야기와<br />
                  소중한 고객 고양이들의 일상을 만나보세요.<br />
                  주요 주거 안전 코드 보관과<br />
                  반자동 일지 기록을 제공하는<br />
                  프리미엄 연동 시스템입니다.
                </p>

                {/* Status Indicator from index.html */}
                <div className="hero-status">
                  <span className="hero-status-dot" style={{
                    backgroundColor: "var(--gold)",
                    boxShadow: "0 0 6px 2px rgba(197,160,89,0.45)"
                  }}></span>
                  <span className="hero-status-text">
                    {isLoggedIn && activeUser ? (
                      <>현재 <strong style={{ color: "var(--gold)" }}>{activeUser.full_name} ({activeUser.role.toUpperCase()})</strong> 로그인 상태입니다.</>
                    ) : (
                      <>현재 <strong style={{ color: "var(--primary-orange)" }}>비회원</strong> 상태입니다. (VIP 전용 글 잠금 작동)</>
                    )}
                  </span>
                </div>
              </div>

              {/* Dynamic rendering of hero.png */}
              <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
                <div
                  style={{
                    width: "100%",
                    maxWidth: "500px",
                    aspectRatio: "4/3",
                    borderRadius: "30px",
                    boxShadow: "var(--shadow-lg)",
                    border: "6px solid white",
                    backgroundImage: `url(${heroImageSrc})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat"
                  }}
                  aria-label="윤교품애"
                />
              </div>
            </div>
          </section>

          {/* ============================================================== */}
          {/* 윤교품애 브랜드 소개 & 요양 케어 전문 서비스 안내 */}
          {/* ============================================================== */}
          <section className="p-6 md:p-12" style={{
            backgroundColor: "var(--bg-secondary)",
            borderTop: "1.5px solid var(--border-light)",
            borderBottom: "1.5px solid var(--border-light)"
          }}>
            <div className="container" style={{ maxWidth: "1000px" }}>
              <div style={{ textAlign: "center", marginBottom: "48px" }}>
                <span className="brand-badge">
                  반려동물 방문 탁묘 및 요양보호 & 회복 케어 전문
                </span>
                <h2 className="text-2xl md:text-3xl" style={{
                  fontWeight: "800",
                  color: "var(--text-main)",
                  marginTop: "16px",
                  marginBottom: "12px"
                }}>
                  윤교품애
                </h2>
                <p className="text-lg md:text-xl" style={{
                  fontWeight: "700",
                  color: "var(--primary-orange)",
                  fontStyle: "italic",
                  margin: 0
                }}>
                  "사랑은 손길에서 시작됩니다."
                </p>
              </div>

              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "32px",
                marginBottom: "48px"
              }}>
                {/* 브랜드 스토리 카드 */}
                <div className="premium-card p-6 md:p-8" style={{
                  backgroundColor: "white",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center"
                }}>
                  <p style={{
                    fontSize: "1.05rem",
                    lineHeight: "1.75",
                    color: "var(--text-main)",
                    fontWeight: "600",
                    margin: 0
                  }}>
                    수술 후 회복이 필요한 아이들,<br />
                    나이가 들어 조금 더 천천히, 더 가까이 돌봄이 필요한 아이들,<br />
                    혼자 두기 불안했던 마음…<br />
                    이제 <strong>윤교품애</strong>가 함께할게요.
                  </p>
                  <div style={{
                    marginTop: "24px",
                    borderTop: "1.5px solid var(--border-light)",
                    paddingTop: "20px"
                  }}>
                    <p style={{
                      fontSize: "0.92rem",
                      lineHeight: "1.65",
                      color: "var(--text-muted)",
                      margin: 0
                    }}>
                      전윤교 대표는 고양이 8마리의 집사 이면서 10년 가까이 거제 유사모에서 300여 마리 고양이 임시보호 & 돌봄 봉사 경험을 바탕으로 아이마다 다른 성격, 속도, 마음의 크기를 잘 알고 있어요. 그동안의 노하우 + 포근한 손길 + 진심 어린 케어로 아이의 몸과 마음을 함께 돌봅니다.
                    </p>
                  </div>
                </div>

                {/* 자격증 정보 카드 */}
                <div className="premium-card p-6 md:p-8" style={{
                  backgroundColor: "white"
                }}>
                  <h4 style={{
                    fontSize: "1.1rem",
                    fontWeight: "800",
                    color: "var(--text-main)",
                    marginBottom: "18px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}>
                    🐾 전문 자격 보유
                  </h4>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px",
                    marginBottom: "20px"
                  }}>
                    {[
                      "노령펫 케어 자격증",
                      "반려동물 식품관리사",
                      "펫시터 1급",
                      "펫푸드 스타일리스트 1급",
                      "반려동물 장례지도사 1급",
                      "반려동물 아로마 기초 강사"
                    ].map((cert, idx) => (
                      <div key={idx} style={{
                        backgroundColor: "var(--bg-secondary)",
                        border: "1px solid var(--border-light)",
                        borderRadius: "8px",
                        padding: "10px 12px",
                        fontSize: "0.82rem",
                        fontWeight: "750",
                        color: "var(--text-main)",
                        textAlign: "center",
                        wordBreak: "keep-all",
                        overflowWrap: "break-word"
                      }}>
                        ✅ {cert}
                      </div>
                    ))}
                  </div>
                  <div style={{
                    backgroundColor: "var(--primary-orange-light)",
                    borderRadius: "8px",
                    padding: "12px",
                    fontSize: "0.85rem",
                    fontWeight: "800",
                    color: "var(--primary-orange)",
                    textAlign: "center",
                    lineHeight: "1.4",
                    wordBreak: "keep-all",
                    overflowWrap: "break-word"
                  }}>
                    단순한 돌봄이 아닌,<br />
                    아이의 삶의 질을 돌보는 요양 케어에 집중합니다.
                  </div>
                </div>
              </div>

              {/* 대상 및 마음 요약 */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "32px",
                marginBottom: "40px"
              }}>
                {/* 대상 안내 카드 */}
                <div className="premium-card p-6 md:p-8" style={{
                  backgroundColor: "white"
                }}>
                  <h4 style={{
                    fontSize: "1.1rem",
                    fontWeight: "800",
                    color: "var(--text-main)",
                    marginBottom: "16px"
                  }}>
                    🐶🐱 이런 아이들에게 특히 좋습니다
                  </h4>
                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px"
                  }}>
                    {[
                      "수술 후 회복 기간 돌봄이 필요한 아이",
                      "노령견 / 노령묘",
                      "약 복용, 영양 관리가 필요한 아이",
                      "격리/안정/스트레스 케어가 필요한 아이",
                      "보호자가 출근/여행으로 곁을 지키기 어려울 때"
                    ].map((target, idx) => (
                      <div key={idx} style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        fontSize: "0.88rem",
                        fontWeight: "600",
                        color: "var(--text-main)"
                      }}>
                        <span style={{ color: "var(--primary-orange)", fontSize: "1.1rem" }}>•</span>
                        {target}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 마음가짐 카드 */}
                <div className="premium-card p-6 md:p-8" style={{
                  backgroundColor: "white",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between"
                }}>
                  <div>
                    <h4 style={{
                      fontSize: "1.1rem",
                      fontWeight: "800",
                      color: "var(--text-main)",
                      marginBottom: "12px"
                    }}>
                      ☁️ 윤교품애의 마음
                    </h4>
                    <p style={{
                      fontSize: "0.9rem",
                      lineHeight: "1.65",
                      color: "var(--text-muted)",
                      margin: 0
                    }}>
                      아이들은 “환자”가 아니라 나의 가족, 나의 친구입니다. 그래서 더 천천히, 조심스럽게 아이의 눈을 보고, 숨을 느끼고 필요를 함께 찾아갑니다.
                    </p>
                  </div>
                  <div style={{
                    marginTop: "20px",
                    borderTop: "1.5px dashed var(--border-light)",
                    paddingTop: "16px"
                  }}>
                    <p style={{
                      fontSize: "0.82rem",
                      fontWeight: "750",
                      color: "var(--primary-orange)",
                      margin: "0 0 4px 0",
                      textAlign: "center"
                    }}>
                      “내 아이를 부탁할 수 있는 단 한 곳, 윤교품애.”
                    </p>
                    <p style={{
                      fontSize: "0.82rem",
                      fontWeight: "750",
                      color: "var(--text-muted)",
                      margin: 0,
                      textAlign: "center"
                    }}>
                      “품 안의 온기 그대로, 마음까지 안아주는 케어.”
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── [방문형 요양 서비스] 요금표 컴포넌트 & 예약 CTA 카드 ── */}
          <section
            style={{
              padding: "60px 0",
              background: "linear-gradient(180deg, white 0%, hsl(268, 30%, 96%) 100%)",
              borderTop: "1.5px solid var(--border-light)",
            }}
          >
            <div className="container" style={{ maxWidth: "1000px" }}>
              {/* 요금표 */}
              <div
                style={{
                  background: pricingInfoTab === "general"
                    ? "linear-gradient(135deg, hsl(268, 30%, 99%) 0%, hsl(265, 20%, 97%) 100%)"
                    : "linear-gradient(135deg, hsl(268, 40%, 98%) 0%, hsl(265, 30%, 95%) 100%)",
                  border: pricingInfoTab === "general"
                    ? "1.5px solid hsl(265, 20%, 90%)"
                    : "1.5px solid hsl(265, 30%, 88%)",
                  borderRadius: "20px",
                  padding: "32px 24px",
                  marginBottom: "48px",
                  boxShadow: "0 10px 30px rgba(100, 40, 180, 0.04)",
                  transition: "all 0.3s ease",
                }}
              >
                {/* ── 서비스 요금 안내 탭 선택 ── */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "12px",
                    marginBottom: "28px",
                    borderBottom: "1px solid rgba(100, 40, 180, 0.1)",
                    paddingBottom: "16px"
                  }}
                >
                  <button
                    onClick={() => setPricingInfoTab("general")}
                    style={{
                      padding: "10px 22px",
                      borderRadius: "30px",
                      border: pricingInfoTab === "general"
                        ? "1.5px solid hsl(266, 60%, 70%)"
                        : "1.5px solid transparent",
                      background: pricingInfoTab === "general"
                        ? "hsl(266, 60%, 94%)"
                        : "transparent",
                      color: pricingInfoTab === "general" ? "hsl(266, 60%, 45%)" : "var(--text-muted)",
                      fontWeight: "900",
                      fontSize: "0.95rem",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    🐶🐱 일반 펫시팅 안내
                  </button>
                  <button
                    onClick={() => setPricingInfoTab("nursing")}
                    style={{
                      padding: "10px 22px",
                      borderRadius: "30px",
                      border: pricingInfoTab === "nursing"
                        ? "1.5px solid var(--primary-orange)"
                        : "1.5px solid transparent",
                      background: pricingInfoTab === "nursing"
                        ? "var(--primary-orange-light)"
                        : "transparent",
                      color: pricingInfoTab === "nursing" ? "var(--primary-orange)" : "var(--text-muted)",
                      fontWeight: "900",
                      fontSize: "0.95rem",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    🏥✨ 방문 요양 케어 안내
                  </button>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px", justifyContent: "center" }}>
                  <span style={{ fontSize: "1.8rem" }}>{pricingInfoTab === "general" ? "🐾" : "💜"}</span>
                  <div style={{ textAlign: "center" }}>
                    <h3 style={{ fontSize: "1.3rem", fontWeight: "900", color: "hsl(268, 40%, 20%)", margin: 0 }}>
                      {pricingInfoTab === "general" ? "일반 펫시팅 서비스 요금 안내" : "방문형 요양 서비스 요금 안내"}
                    </h3>
                    <p style={{ fontSize: "0.85rem", color: "hsl(268, 20%, 45%)", margin: "4px 0 0 0", fontWeight: "600" }}>
                      {pricingInfoTab === "general"
                        ? "반려동물 방문 탁묘 및 맞춤형 기본 돌봄 서비스"
                        : "노령묘·노령견 및 회복기 아이를 위한 맞춤 전문 케어"}
                    </p>
                  </div>
                </div>

                {/* 반응형 카드 스타일 테이블 */}
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {(pricingInfoTab === "general"
                    ? [
                        {
                          title: "🏠 기본 방문 펫시팅 (1회 30분)",
                          desc: "배변 정리, 급여, 실내 놀이, 가벼운 빗질 등 기본 돌봄 포함",
                          price: "17,000원",
                          tag: "기본 돌봄"
                        },
                        {
                          title: "⏳ 시간 연장 펫시팅 (1회 60분)",
                          desc: "장시간 돌봄이 필요하거나 다묘·다견 가정을 위한 여유로운 케어 플랜",
                          price: "25,000원",
                          tag: "시간 연장",
                          isHot: true
                        },
                        {
                          title: "💊 1회성 투약 서비스",
                          desc: "정기 케어가 아닌, 해당 돌봄 차수에 필요한 알약, 가루약, 안약 등의 단발성 투약 케어 서비스입니다.",
                          price: "5,000원",
                          tag: "투약 케어"
                        },
                        {
                          title: "📅 명절 및 공휴일 추가금 패키지",
                          desc: "명절 및 빨간 날(공휴일) 돌봄 시 기본 요금에 추가금이 적용되는 패키지입니다. (예약 시 필수 확인!)\n※ 해당일: 신정, 구정(설날 연휴), 추석 연휴, 크리스마스, 석가탄신일 및 법정 공휴일",
                          price: "+5,000원",
                          tag: "공휴일 할증"
                        }
                      ]
                    : [
                        {
                          title: "🏠 기본 방문 요양",
                          desc: "1일 1회 방문 (30~40분) / 식사, 배변, 정서 교감, 투약 포함",
                          price: "30,000원",
                          tag: "기본 케어"
                        },
                        {
                          title: "🔁 집중 방문 요양",
                          desc: "1일 2회 방문 / 고령 동물 및 수술 후 질병 회복기 아이 전용 집중 돌봄",
                          price: "55,000원",
                          tag: "집중 관리",
                          isHot: true
                        },
                        {
                          title: "💊 투약 전용 서비스",
                          desc: "단독 투약 방문 (가루약/알약 복용, 안약 점안 등 전문 복약)",
                          price: "15,000원",
                          tag: "투약 단독"
                        },
                        {
                          title: "📅 주간/월간 패키지",
                          desc: "주 3회 이상 꾸준히 정기 이용 시 특별 할인 혜택 제공",
                          price: "별도 안내",
                          tag: "정기 할인"
                        }
                      ]
                  ).map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "14px",
                        padding: "18px 20px",
                        backgroundColor: "white",
                        border: item.isHot ? "1.5px solid var(--gold-border)" : "1px solid hsl(265, 30%, 90%)",
                        borderRadius: "14px",
                        boxShadow: item.isHot ? "0 4px 14px rgba(180, 140, 0, 0.08)" : "0 2px 6px rgba(0,0,0,0.02)",
                        transition: "transform 0.2s ease"
                      }}
                    >
                      <div style={{ flex: "1 1 280px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          <strong style={{ fontSize: "1rem", color: "var(--text-main)", fontWeight: "850" }}>
                            {item.title}
                          </strong>
                          <span
                            style={{
                              fontSize: "0.72rem",
                              backgroundColor: pricingInfoTab === "general"
                                ? "hsl(266, 40%, 93%)"
                                : "hsl(265, 40%, 92%)",
                              color: pricingInfoTab === "general"
                                ? "hsl(266, 50%, 50%)"
                                : "hsl(268, 50%, 35%)",
                              padding: "2px 8px",
                              borderRadius: "10px",
                              fontWeight: "700"
                            }}
                          >
                            {item.tag}
                          </span>
                          {item.isHot && (
                            <span
                              style={{
                                fontSize: "0.72rem",
                                backgroundColor: "var(--gold-light)",
                                color: "var(--gold)",
                                border: "1px solid var(--gold-border)",
                                padding: "1px 5px",
                                borderRadius: "4px",
                                fontWeight: "800"
                              }}
                            >
                              추천
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: "6px 0 0 0", lineHeight: "1.5", whiteSpace: "pre-line" }}>
                          {item.desc}
                        </p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: "120px", justifyContent: "flex-end" }}>
                        <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: "600" }}>이용요금</span>
                        <strong style={{
                          fontSize: "1.2rem",
                          fontWeight: "900",
                          color: item.isHot
                            ? (pricingInfoTab === "general" ? "hsl(266, 50%, 50%)" : "hsl(268, 50%, 35%)")
                            : "var(--text-main)"
                        }}>
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
                    marginTop: "20px",
                    padding: "14px 18px",
                    backgroundColor: "rgba(255, 255, 255, 0.6)",
                    border: "1px dashed hsl(265, 30%, 84%)",
                    borderRadius: "10px"
                  }}
                >
                  <span style={{ fontSize: "1.1rem" }}>📢</span>
                  <p style={{ fontSize: "0.82rem", color: "hsl(268, 20%, 40%)", margin: 0, lineHeight: "1.5", fontWeight: "600" }}>
                    거제 전 지역 기본 운영되며, 외곽 지역(장승포 등)은 교통비 5,000원~ 별도 부과됩니다.
                  </p>
                </div>
              </div>

              {/* 예약 CTA 카드 섹션 */}
              <div style={{ textAlign: "center", marginBottom: "28px" }}>
                <span style={{
                  backgroundColor: "var(--gold-light)",
                  color: "var(--gold)",
                  fontSize: "0.8rem", fontWeight: "800",
                  padding: "5px 12px", borderRadius: "20px",
                  display: "inline-block", letterSpacing: "0.5px",
                }}>
                  📅 쉽고 빠른 실시간 예약 신청
                </span>
                <h3 style={{ fontSize: "1.4rem", fontWeight: "800", color: "var(--text-main)", marginTop: "10px", marginBottom: "6px" }}>
                  목적에 맞는 예약을 선택해 주세요
                </h3>
                <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", margin: 0 }}>
                  클릭하시면 전용 예약 채널 및 실시간 요금 계산기로 즉시 연결됩니다.
                </p>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "20px",
                }}
              >
                {/* 카드 1: 일반 펫시팅 예약하기 */}
                <div
                  onClick={() => {
                    setBookingServiceChoice("general");
                    setActivePortal("booking");
                    setBookingSubView("calculator");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  style={{
                    cursor: "pointer",
                    padding: "24px",
                    borderRadius: "16px",
                    border: "2px solid hsl(265, 30%, 91%)",
                    background: "linear-gradient(135deg, hsl(43, 100%, 98%) 0%, hsl(43, 100%, 96%) 100%)",
                    boxShadow: "0 6px 18px rgba(100, 40, 180, 0.05)",
                    transition: "all 0.2s ease-in-out",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 10px 24px rgba(100, 40, 180, 0.12)";
                    e.currentTarget.style.borderColor = "var(--gold-border)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow = "0 6px 18px rgba(100, 40, 180, 0.05)";
                    e.currentTarget.style.borderColor = "hsl(265, 30%, 91%)";
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                      <span style={{ fontSize: "2rem" }}>🐶🐱</span>
                      <span style={{
                        backgroundColor: "var(--gold-light)",
                        color: "var(--gold)",
                        fontSize: "0.72rem",
                        fontWeight: "800",
                        padding: "3px 8px",
                        borderRadius: "12px"
                      }}>
                        일반 돌봄
                      </span>
                    </div>
                    <h4 style={{ fontSize: "1.15rem", fontWeight: "900", color: "var(--text-main)", marginBottom: "8px" }}>
                      일반 펫시팅 예약하기
                    </h4>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: "1.5", margin: 0 }}>
                      기본 돌봄, 산책, 식사 및 배변 케어가 필요할 때 추천합니다.
                    </p>
                  </div>
                  <div style={{
                    marginTop: "20px",
                    padding: "12px",
                    borderRadius: "10px",
                    backgroundColor: "white",
                    border: "1px solid hsl(43, 100%, 92%)",
                    textAlign: "center",
                    fontWeight: "800",
                    fontSize: "0.88rem",
                    color: "var(--gold)"
                  }}>
                    실시간 요금 조회 &amp; 예약 ➡️
                  </div>
                </div>

                {/* 카드 2: 방문 요양 케어 예약하기 */}
                <div
                  onClick={() => {
                    setBookingServiceChoice("nursing");
                    setNursingPlan("basic");
                    setActivePortal("booking");
                    setBookingSubView("calculator");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  style={{
                    cursor: "pointer",
                    padding: "24px",
                    borderRadius: "16px",
                    border: "2px solid hsl(265, 50%, 82%)",
                    background: "linear-gradient(135deg, hsl(265, 55%, 96%) 0%, hsl(265, 40%, 89%) 100%)",
                    boxShadow: "0 6px 18px rgba(100, 40, 180, 0.06)",
                    transition: "all 0.2s ease-in-out",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 10px 24px rgba(100, 40, 180, 0.14)";
                    e.currentTarget.style.borderColor = "hsl(265, 55%, 70%)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow = "0 6px 18px rgba(100, 40, 180, 0.06)";
                    e.currentTarget.style.borderColor = "hsl(265, 50%, 82%)";
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                      <span style={{ fontSize: "2rem" }}>🏥✨</span>
                      <span style={{
                        backgroundColor: "var(--primary-orange-light)",
                        color: "var(--primary-orange)",
                        fontSize: "0.72rem",
                        fontWeight: "800",
                        padding: "3px 8px",
                        borderRadius: "12px"
                      }}>
                        프리미엄 요양
                      </span>
                    </div>
                    <h4 style={{ fontSize: "1.15rem", fontWeight: "900", color: "var(--text-main)", marginBottom: "8px" }}>
                      방문 요양 케어 예약하기
                    </h4>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: "1.5", margin: 0 }}>
                      노령묘/노령견, 수술 후 회복, 집중 투약 관리가 필요할 때 전문 1:1 케어 서비스를 선택해 주세요.
                    </p>
                  </div>
                  <div style={{
                    marginTop: "20px",
                    padding: "12px",
                    borderRadius: "10px",
                    backgroundColor: "white",
                    border: "1px solid hsl(265, 30%, 92%)",
                    textAlign: "center",
                    fontWeight: "800",
                    fontSize: "0.88rem",
                    color: "hsl(268, 60%, 42%)"
                  }}>
                    요양 플랜 조회 &amp; 예약 ➡️
                  </div>
                </div>
              </div>
            </div>
          </section>

        </main>

      {/* ============================================================== */}
      {/* 7.5. PORTAL VIEW A-2: 📝 YOONGYOPOOMAE POSTS & BLOG */}
      {/* ============================================================== */}
      <main className="animate-fade-in" style={{ flex: 1, display: activePortal === "posts" ? "block" : "none" }}>
        
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

              {/* Create post button for Admin & Member */}
              {activeUser && (activeUser.role === "admin" || activeUser.role === "member") && (
                <button className="btn btn-primary" onClick={() => setShowCreateModal(true)} style={{ padding: "10px 20px" }}>
                  ✍️ 새 포스트 작성
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
                const hasAccess = activeUser && (activeUser.role === "member" || activeUser.role === "vip" || activeUser.role === "sitter" || activeUser.role === "admin");
                const isLocked = post.is_restricted && !hasAccess;
                const isExpanded = expandedPostId === post.id;
                const isAdmin = activeUser && activeUser.role === "admin";
                const isOwner = activeUser && (
                  activeUser.role === "admin" || 
                  (post.user_id && post.user_id === activeUser.id)
                );

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
                    <div
                      style={{
                        height: "200px",
                        position: "relative",
                        backgroundColor: "#e2e8f0",
                        backgroundImage: `url(${post.image_url})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                        transition: "var(--transition-smooth)"
                      }}
                      aria-label={sanitizeInputText(post.title)}
                    >
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
                          alignItems: "center", justifyContent: "center", gap: "8px"
                        }}>
                          <i className="fas fa-lock" style={{ fontSize: "2.2rem", color: "var(--gold-border)" }}></i>
                          <span style={{ fontSize: "0.85rem", fontWeight: "800", letterSpacing: "0.5px", color: "var(--gold-border)" }}>
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
                        {sanitizeInputText(post.title)}
                        {post.is_restricted && <span style={{ marginLeft: "6px", color: "var(--primary-orange)" }}>🔒</span>}
                      </h3>

                      <p style={{
                        fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: "1.6",
                        whiteSpace: isExpanded ? "pre-wrap" : "normal",
                        display: isExpanded ? "block" : "-webkit-box",
                        WebkitLineClamp: isExpanded ? "none" : 2,
                        WebkitBoxOrient: "vertical",
                        overflow: isExpanded ? "auto" : "hidden",
                        maxHeight: isExpanded ? "200px" : "none",
                        paddingRight: isExpanded ? "6px" : "0",
                        margin: 0
                      }}>
                        {sanitizeInputText(post.content)}
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
                      <span 
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePostCardClick(post);
                        }}
                        style={{ 
                          fontSize: "0.8rem", 
                          color: "var(--text-muted)",
                          cursor: "pointer",
                          fontWeight: "700"
                        }}
                      >
                        {isLocked ? "🔒 클릭하여 회원권 로그인" : isExpanded ? "▲ 접기" : "▼ 클릭하여 전체 읽기"}
                      </span>

                      {isOwner && (
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

      {/* ============================================================== */}
      {/* 8. PORTAL VIEW B: 📅 실시간 캘린더 예약 (보호자 채널) */}
      {/* ============================================================== */}
      <main className="animate-fade-in" style={{ flex: 1, padding: "40px 0", display: activePortal === "booking" ? "block" : "none" }}>
          <div className="container" style={{ maxWidth: bookingSubView === "calculator" ? "1200px" : "1000px" }}>
            
            {bookingSubView === "calculator" ? (
              <>
                <div style={{ textAlign: "center", marginBottom: "36px" }}>
                  <span style={{
                    backgroundColor: "var(--primary-orange-light)", color: "var(--primary-orange)",
                    fontSize: "0.8rem", fontWeight: "700", padding: "6px 14px", borderRadius: "20px"
                  }}>
                    보호자 전용 실시간 돌봄 간편 예약 채널 📅
                  </span>
                  <h2 style={{ fontSize: "2rem", color: "var(--text-main)", fontWeight: "800", marginTop: "12px", marginBottom: "8px" }}>
                    실시간 돌봄 예약 - 예상 요금 계산
                  </h2>
                  <p style={{ fontSize: "0.95rem", color: "var(--text-muted)" }}>
                    옵션을 선택하여 최종 예상 요금을 실시간으로 조회하고 예약 단계로 진행하실 수 있습니다.
                  </p>
                </div>

                <PricingSection 
                  leftContent={renderLeftCalendarColumn()}
                  isFullyBooked={selectedDate ? isDateFullyBooked(selectedDate) : false}
                  onBookingClick={handleGoToBooking}
                  days={calculatorDays}
                  setDays={handleCalculatorDaysChange}
                  area={visitArea === "기타" ? "기타" : "기본"}
                  setArea={handleCalculatorAreaChange}
                  opts={{
                    preMeeting: optPreMeet,
                    forcedFeeding: optForcedFeeding,
                    hospital: optHospital,
                    holiday: isHoliday,
                    medication: optMedication
                  }}
                  toggleOpt={toggleCalculatorOpt}
                  serviceChoice={bookingServiceChoice}
                  setServiceChoice={setBookingServiceChoice}
                  nursingPlan={nursingPlan}
                  setNursingPlan={setNursingPlan}
                />
              </>
            ) : (
              <>
                {/* 뒤로가기 버튼 */}
                <div style={{ marginBottom: "24px" }}>
                  <button
                    onClick={() => {
                      setBookingSubView("calculator");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    style={{
                      border: "none",
                      color: "hsl(150, 50%, 25%)",
                      padding: "8px 16px",
                      borderRadius: "var(--border-radius-full)",
                      fontSize: "0.85rem",
                      fontWeight: "750",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      border: "1.5px solid hsl(150, 30%, 75%)",
                      backgroundColor: "var(--success-mint-light)",
                      transition: "var(--transition-fast)",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "hsl(150, 30%, 88%)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--success-mint-light)";
                    }}
                  >
                    ⬅️ 예상 요금 계산기로 돌아가기
                  </button>
                </div>

                <div style={{ textAlign: "center", marginBottom: "36px" }}>
                  <span style={{
                    backgroundColor: "var(--primary-orange-light)", color: "var(--primary-orange)",
                    fontSize: "0.8rem", fontWeight: "700", padding: "6px 14px", borderRadius: "20px"
                  }}>
                    보호자 전용 실시간 돌봄 간편 예약 채널 📅
                  </span>
                  <h2 style={{ fontSize: "2rem", color: "var(--text-main)", fontWeight: "800", marginTop: "12px", marginBottom: "8px" }}>
                    돌봄 예약 세부 사항 입력
                  </h2>
                  <p style={{ fontSize: "0.95rem", color: "var(--text-muted)" }}>
                    캘린더에서 원하시는 날짜와 여유 시간대를 선택해 주시면 전문 펫시터 전윤교님이 집으로 직접 찾아갑니다.
                  </p>
                </div>

                <div id="booking-form-start" className="pricing-grid-container">
              
              {/* Left Column: Calendar & Times */}
              <div style={{ display: "flex", flexDirection: "column", gap: "24px", width: "100%" }}>
                {renderLeftCalendarColumn()}
              </div>

              {/* Right Column: Detail Forms */}
              <div id="booking-details-column" className="premium-card" style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
                <h3 style={{ fontSize: "1.2rem", fontWeight: "800", borderBottom: "1.5px solid var(--border-light)", paddingBottom: "10px", margin: 0 }}>
                  📋 돌봄 예약 세부 사항 입력
                </h3>

                <form onSubmit={handleBookingSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

                  {/* ===== Step Indicator ===== */}
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0",
                    marginBottom: "8px"
                  }}>
                    {/* Tab 1 */}
                    <div style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      padding: "10px 8px",
                      borderRadius: "10px 0 0 10px",
                      backgroundColor: bookingStep === 1 ? "var(--primary-orange)" : "var(--bg-secondary)",
                      color: bookingStep === 1 ? "white" : "var(--text-muted)",
                      fontWeight: "800",
                      fontSize: "0.8rem",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      borderTop: bookingStep === 1 ? "1.5px solid var(--primary-orange)" : "1.5px solid var(--border-light)",
                      borderBottom: bookingStep === 1 ? "1.5px solid var(--primary-orange)" : "1.5px solid var(--border-light)",
                      borderLeft: bookingStep === 1 ? "1.5px solid var(--primary-orange)" : "1.5px solid var(--border-light)",
                      borderRight: "none"
                    }}
                      onClick={() => setBookingStep(1)}
                    >
                      <span style={{
                        width: "20px", height: "20px", borderRadius: "50%",
                        backgroundColor: bookingStep === 1 ? "white" : "var(--border-light)",
                        color: bookingStep === 1 ? "var(--primary-orange)" : "var(--text-muted)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.7rem", fontWeight: "900", flexShrink: 0
                      }}>1</span>
                      기본 정보
                    </div>

                    {/* Tab 2 */}
                    <div style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      padding: "10px 8px",
                      backgroundColor: bookingStep === 2 ? "var(--primary-orange)" : "var(--bg-secondary)",
                      color: bookingStep === 2 ? "white" : "var(--text-muted)",
                      fontWeight: "800",
                      fontSize: "0.8rem",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      borderTop: bookingStep === 2 ? "1.5px solid var(--primary-orange)" : "1.5px solid var(--border-light)",
                      borderBottom: bookingStep === 2 ? "1.5px solid var(--primary-orange)" : "1.5px solid var(--border-light)",
                      borderLeft: "1px solid var(--border-light)",
                      borderRight: "1px solid var(--border-light)"
                    }}
                      onClick={() => {
                        if (bookingStep === 1) {
                          handleNextStep();
                        } else {
                          setBookingStep(2);
                        }
                      }}
                    >
                      <span style={{
                        width: "20px", height: "20px", borderRadius: "50%",
                        backgroundColor: bookingStep === 2 ? "white" : "var(--border-light)",
                        color: bookingStep === 2 ? "var(--primary-orange)" : "var(--text-muted)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.7rem", fontWeight: "900", flexShrink: 0
                      }}>2</span>
                      건강 상태
                    </div>

                    {/* Tab 3 */}
                    <div style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      padding: "10px 8px",
                      borderRadius: "0 10px 10px 0",
                      backgroundColor: bookingStep === 3 ? "var(--primary-orange)" : "var(--bg-secondary)",
                      color: bookingStep === 3 ? "white" : "var(--text-muted)",
                      fontWeight: "800",
                      fontSize: "0.8rem",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      borderTop: bookingStep === 3 ? "1.5px solid var(--primary-orange)" : "1.5px solid var(--border-light)",
                      borderBottom: bookingStep === 3 ? "1.5px solid var(--primary-orange)" : "1.5px solid var(--border-light)",
                      borderRight: bookingStep === 3 ? "1.5px solid var(--primary-orange)" : "1.5px solid var(--border-light)",
                      borderLeft: "none"
                    }}
                      onClick={() => {
                        if (bookingStep === 1) {
                          handleNextStep();
                        } else if (bookingStep === 2) {
                          handleNextStep2();
                        }
                      }}
                    >
                      <span style={{
                        width: "20px", height: "20px", borderRadius: "50%",
                        backgroundColor: bookingStep === 3 ? "white" : "var(--border-light)",
                        color: bookingStep === 3 ? "var(--primary-orange)" : "var(--text-muted)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.7rem", fontWeight: "900", flexShrink: 0
                      }}>3</span>
                      돌봄 상세
                    </div>
                  </div>

                  {/* ===== PAGE 1: 예약 기본 정보 ===== */}
                  {bookingStep === 1 && (
                    <>
                  {/* ===== 신규 / 재신청 고객 선택 ===== */}
                  <div className="form-group">
                    <label className="form-label">👤 신청 유형 선택 (필수)</label>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        type="button"
                        onClick={() => handleCustomerTypeChange(false)}
                        style={{
                          flex: 1,
                          padding: "14px 10px",
                          borderRadius: "10px",
                          border: !isReturningCustomer ? "2px solid var(--primary-orange)" : "1.5px solid var(--border-light)",
                          backgroundColor: !isReturningCustomer ? "var(--primary-orange-light)" : "white",
                          color: !isReturningCustomer ? "var(--primary-orange)" : "var(--text-muted)",
                          fontWeight: "800",
                          fontSize: "0.9rem",
                          cursor: "pointer",
                          transition: "all 0.2s ease"
                        }}
                      >
                        🆕 신규 고객
                        <div style={{ fontSize: "0.72rem", fontWeight: "500", marginTop: "3px", opacity: 0.8 }}>
                          처음 신청하는 분
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCustomerTypeChange(true)}
                        style={{
                          flex: 1,
                          padding: "14px 10px",
                          borderRadius: "10px",
                          border: isReturningCustomer ? "2px solid var(--primary-orange)" : "1.5px solid var(--border-light)",
                          backgroundColor: isReturningCustomer ? "var(--primary-orange-light)" : "white",
                          color: isReturningCustomer ? "var(--primary-orange)" : "var(--text-muted)",
                          fontWeight: "800",
                          fontSize: "0.9rem",
                          cursor: "pointer",
                          transition: "all 0.2s ease"
                        }}
                      >
                        🔄 재신청 고객
                        <div style={{ fontSize: "0.72rem", fontWeight: "500", marginTop: "3px", opacity: 0.8 }}>
                          이전 예약 정보 자동 적용
                        </div>
                      </button>
                    </div>
                    {isReturningCustomer && (
                      <div style={{
                        marginTop: "8px",
                        backgroundColor: "var(--success-mint-light)",
                        border: "1px solid var(--success-mint)",
                        borderRadius: "8px",
                        padding: "10px 12px",
                        fontSize: "0.8rem",
                        color: "var(--success-mint)",
                        fontWeight: "700"
                      }} className="animate-fade-in">
                        ✅ 이전 예약 정보(방문 지역, 사료 급여법, 화장실 관리법)가 자동으로 적용됩니다. 변경이 필요한 경우 신규 고객으로 신청해 주세요.
                      </div>
                    )}
                  </div>


                  {/* ===== 예약 방식 선택 (단일 날짜 vs 여러 날 연속/정기) ===== */}
                  <div className="form-group">
                    <label className="form-label">📅 예약 방식 선택 (필수)</label>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        type="button"
                        onClick={() => {
                          setBookingType("single");
                          setSelectedDate(null);
                        }}
                        style={{
                          flex: 1,
                          padding: "14px 10px",
                          borderRadius: "10px",
                          border: bookingType === "single" ? "2px solid var(--primary-orange)" : "1.5px solid var(--border-light)",
                          backgroundColor: bookingType === "single" ? "var(--primary-orange-light)" : "white",
                          color: bookingType === "single" ? "var(--primary-orange)" : "var(--text-muted)",
                          fontWeight: "800",
                          fontSize: "0.9rem",
                          cursor: "pointer",
                          transition: "all 0.2s ease"
                        }}
                      >
                        📅 단일 날짜 예약
                        <div style={{ fontSize: "0.72rem", fontWeight: "500", marginTop: "3px", opacity: 0.8 }}>
                          하루만 지정하여 예약
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setBookingType("multi");
                          setSelectedDate(null);
                        }}
                        style={{
                          flex: 1,
                          padding: "14px 10px",
                          borderRadius: "10px",
                          border: bookingType === "multi" ? "2px solid var(--primary-orange)" : "1.5px solid var(--border-light)",
                          backgroundColor: bookingType === "multi" ? "var(--primary-orange-light)" : "white",
                          color: bookingType === "multi" ? "var(--primary-orange)" : "var(--text-muted)",
                          fontWeight: "800",
                          fontSize: "0.9rem",
                          cursor: "pointer",
                          transition: "all 0.2s ease"
                        }}
                      >
                        📅 여러 날 신청
                        <div style={{ fontSize: "0.72rem", fontWeight: "500", marginTop: "3px", opacity: 0.8 }}>
                          시작일~종료일, 매일/격일 등
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* ===== 날짜 상세 입력 필드 ===== */}
                  <div className="form-group">
                    {bookingType === "multi" ? (
                      <div style={{
                        backgroundColor: "var(--bg-secondary)",
                        padding: "16px",
                        borderRadius: "12px",
                        border: "1px solid var(--border-light)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "14px"
                      }} className="animate-fade-in">
                        <div style={{ display: "flex", gap: "10px" }}>
                          <div style={{ flex: 1 }}>
                            <label className="form-label" style={{ fontSize: "0.8rem", fontWeight: "700" }}>시작일 선택 📅</label>
                            <input
                              type="date"
                              className="form-input"
                              value={bookingStartDate}
                              min={new Date().toISOString().split("T")[0]}
                              onChange={(e) => setBookingStartDate(e.target.value)}
                              required={bookingType === "multi"}
                            />
                          </div>
                          <div style={{ flex: 1 }}>
                            <label className="form-label" style={{ fontSize: "0.8rem", fontWeight: "700" }}>종료일 선택 📅</label>
                            <input
                              type="date"
                              className="form-input"
                              value={bookingEndDate}
                              min={bookingStartDate || new Date().toISOString().split("T")[0]}
                              onChange={(e) => setBookingEndDate(e.target.value)}
                              required={bookingType === "multi"}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="form-label" style={{ fontSize: "0.8rem", fontWeight: "700" }}>방문 주기 선택</label>
                          <select
                            className="form-input"
                            value={bookingFrequency}
                            onChange={(e) => setBookingFrequency(e.target.value)}
                          >
                            <option value="daily">매일 (Daily)</option>
                            <option value="every_other">격일 (Every other day)</option>
                            <option value="custom">직접 지정/기타</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label className="form-label" style={{ fontSize: "0.85rem", color: "var(--warning-coral)", fontWeight: "750" }}>
                            * 1. 방문 원하시는 날짜를 적어 주세요 (필수)
                          </label>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "4px" }}>
                            시작일.종료일.매일.격일 등 상세히 적어주세요.
                          </div>
                          <input
                            type="text"
                            className="form-input"
                            value={bookingDateText}
                            onChange={(e) => setBookingDateText(e.target.value)}
                            placeholder="예: 5/27~5/30 매일 방문 희망 (최대 100자)"
                            maxLength={100}
                            required={bookingType === "multi"}
                            lang="ko"
                            autoCapitalize="none"
                            autoCorrect="off"
                            spellCheck={false}
                          />
                        </div>
                      </div>
                    ) : (
                      <div style={{
                        backgroundColor: "var(--primary-orange-light)",
                        padding: "12px 14px",
                        borderRadius: "10px",
                        border: "1.5px solid var(--primary-orange)",
                        color: "var(--primary-orange)",
                        fontSize: "0.85rem",
                        fontWeight: "750"
                      }} className="animate-fade-in">
                        👉 <strong>왼쪽 돌봄 일정표</strong>에서 원하시는 날짜를 클릭하여 선택해 주세요.
                        {selectedDate && (
                          <div style={{ marginTop: "6px", color: "var(--text-main)", fontSize: "0.9rem" }}>
                            선택된 날짜: <strong>{selectedDate.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}</strong>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* ===== 방문 희망 시간 입력 필드 ===== */}
                  <div className="form-group">
                    <label className="form-label" style={{ color: "var(--warning-coral)", fontWeight: "750" }}>
                      * 2. 방문 원하시는 시간 적어주세요 (필수)
                    </label>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "8px" }}>
                      ※ 다른 돌봄 일정이 있을 시 방문 시간이 다소 조정될 수 있습니다.
                    </div>
                    <div style={{
                      backgroundColor: "var(--primary-orange-light)",
                      border: "1.5px dashed var(--primary-orange)",
                      borderRadius: "10px",
                      padding: "12px 14px",
                      color: "var(--text-main)",
                      fontSize: "0.82rem",
                      fontWeight: "700",
                      lineHeight: "1.5",
                      marginBottom: "12px"
                    }} className="animate-fade-in">
                      👉 원하시는 선호 시간을 적어주시면, 다른 돌봄 일정 및 동선을 고려하여 조율 후 개별적으로 연락드리겠습니다. ✨
                    </div>
                    <input
                      type="text"
                      className="form-input"
                      value={bookingTimeText}
                      onChange={(e) => setBookingTimeText(e.target.value)}
                      placeholder="예: 오후 2시 선호합니다, 또는 오전 11시 ~ 오후 1시 사이 (최대 100자)"
                      maxLength={100}
                      required
                      lang="ko"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                    />
                  </div>

                  {/* ===== 반려동물 마릿수 & 세부 정보 필드 ===== */}
                  <div style={{
                    backgroundColor: "var(--bg-secondary)",
                    padding: "16px",
                    borderRadius: "12px",
                    border: "1px solid var(--border-light)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px"
                  }}>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <div style={{ flex: 1 }}>
                        <label className="form-label" style={{ fontSize: "0.8rem", fontWeight: "700" }}>대표 반려동물 이름 (달력 표기용)</label>
                        <input
                          type="text"
                          className="form-input"
                          value={petName}
                          onChange={(e) => setPetName(e.target.value)}
                          placeholder="예: 치즈, 먼지, 로니"
                          required
                          lang="ko"
                          autoCapitalize="none"
                          autoCorrect="off"
                          spellCheck={false}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label className="form-label" style={{ fontSize: "0.8rem", fontWeight: "700" }}>반려동물 마릿수 (필수)</label>
                        <select
                          className="form-input"
                          value={petCount}
                          onChange={(e) => setPetCount(e.target.value)}
                        >
                          <option value="1">1마리</option>
                          <option value="2">2마리</option>
                          <option value="3">3마리</option>
                          <option value="4">4마리</option>
                          <option value="5+">5마리 이상</option>
                        </select>
                      </div>
                    </div>

                    {bookingType === "single" && (
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: "0.8rem", fontWeight: "700" }}>대표 반려동물 나이 (필수)</label>
                        <input
                          type="number"
                          className="form-input"
                          value={petAge}
                          onChange={(e) => setPetAge(e.target.value)}
                          placeholder="숫자 기입 (예: 14)"
                          min="0"
                          required={bookingType === "single"}
                        />
                      </div>
                    )}

                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ color: "var(--warning-coral)", fontWeight: "750" }}>
                        * 3. 아이들 마릿수, 이름, 나이, 성별, 중성화 여부, 특징 등 (필수)
                      </label>
                      <textarea
                        className="form-input"
                        style={{ minHeight: "120px", resize: "vertical", fontFamily: "inherit" }}
                        value={petDetailsText}
                        onChange={(e) => setPetDetailsText(e.target.value)}
                        placeholder="예:&#13;1. 치즈 (5살, 남아, 중성화 완료) - 신부전 약 급여 필요, 사람을 아주 좋아함&#13;2. 먼지 (2살, 여아, 중성화 완료) - 겁이 많아 숨어있을 수 있으니 기본케어 위주로 해주세요.&#13;(최대 2000자)"
                        maxLength={2000}
                        required
                        lang="ko"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">🕒 기본 서비스 안내</label>
                    <div style={{
                      backgroundColor: "var(--primary-orange-light)",
                      padding: "12px 16px",
                      borderRadius: "8px",
                      border: "1.5px solid var(--primary-orange)",
                      color: "var(--text-main)",
                      fontSize: "0.85rem",
                      fontWeight: "750",
                      marginBottom: "8px"
                    }}>
                      ⏱️ 1일 1회 약 30분 기본 방문 : <span style={{ color: "var(--primary-orange)", fontSize: "1rem", fontWeight: "900" }}>17,000원</span>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px", fontWeight: "500" }}>
                        ※ 선불결제이며, 결제 완료 시 예약 확정됩니다. 미결제 시 방문이 불가합니다.
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">🧾 추가 서비스 선택</label>
                    <div style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                      backgroundColor: "var(--bg-secondary)",
                      padding: "16px",
                      borderRadius: "var(--border-radius-sm)",
                      border: "1px solid var(--border-light)"
                    }}>
                      <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.85rem", cursor: "pointer", fontWeight: "600" }}>
                        <input type="checkbox" checked={isHoliday} onChange={(e) => setIsHoliday(e.target.checked)} />
                        <span>명절 / 공휴일 방문 (+5,000원)</span>
                      </label>

                      {bookingServiceChoice === "general" && (
                        <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.85rem", cursor: "pointer", fontWeight: "600" }}>
                          <input type="checkbox" checked={optMedication} onChange={(e) => setOptMedication(e.target.checked)} />
                          <span>1회성 투약 서비스 (+5,000원)</span>
                        </label>
                      )}

                      <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.85rem", cursor: "pointer", fontWeight: "600" }}>
                        <input type="checkbox" checked={optPreMeet} onChange={(e) => setOptPreMeet(e.target.checked)} />
                        <span>사전 만남 (+10,000원)</span>
                      </label>

                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.85rem", cursor: "pointer", fontWeight: "600" }}>
                          <input type="checkbox" checked={optForcedFeeding} onChange={(e) => setOptForcedFeeding(e.target.checked)} />
                          <span>급여도움 (강제급여) 1회 (+10,000원)</span>
                        </label>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginLeft: "24px", fontStyle: "italic" }}>
                          ※ 강제급여는 일반 투약보다 시간이 더 소요되며 아이 안전을 위해 세심한 케어가 필요한 전문 케어입니다.
                        </span>
                      </div>

                      <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.85rem", cursor: "pointer", fontWeight: "600" }}>
                        <input type="checkbox" checked={optHospital} onChange={(e) => setOptHospital(e.target.checked)} />
                        <span>병원 방문 1회 (+20,000원)</span>
                      </label>

                      <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.85rem", cursor: "pointer", fontWeight: "600" }}>
                        <input type="checkbox" checked={optDogAdd} onChange={(e) => setOptDogAdd(e.target.checked)} />
                        <span>강아지 1마리 추가 (+8,000원)</span>
                      </label>



                      <div style={{ fontSize: "0.72rem", color: "var(--warning-coral)", borderTop: "1px dashed var(--border-light)", paddingTop: "8px", marginTop: "4px" }}>
                        ※ 다묘가정 및 강아지가 함께 있는 가정의 경우 돌봄 난이도에 따라 추가요금이 발생할 수 있습니다.
                      </div>
                    </div>
                  </div>

                  {/* Next Step Button for Step 1 */}
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="btn btn-primary animate-fade-in"
                    style={{
                      width: "100%",
                      padding: "16px",
                      fontSize: "1.05rem",
                      marginTop: "16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      boxShadow: "0 4px 12px rgba(255, 112, 67, 0.15)"
                    }}
                  >
                    다음으로 ➔
                  </button>
                    </>
                  )}

                  {/* ===== PAGE 2: 건강 상태 체크 (필수) ===== */}
                  {bookingStep === 2 && (
                    <>
                      {/* Page 2 → Page 1 Back Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setBookingStep(1);
                          const portalElement = document.getElementById("booking-form-start");
                          if (portalElement) {
                            portalElement.scrollIntoView({ behavior: "smooth" });
                          } else {
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }
                        }}
                        style={{
                          width: "100%",
                          padding: "12px",
                          fontSize: "0.9rem",
                          backgroundColor: "var(--bg-secondary)",
                          border: "1.5px solid var(--border-light)",
                          borderRadius: "10px",
                          color: "var(--text-muted)",
                          fontWeight: "700",
                          cursor: "pointer",
                          marginBottom: "16px",
                          transition: "all 0.2s ease"
                        }}
                      >
                        ← 이전 단계로 돌아가기 (예약 기본 정보)
                      </button>

                      {/* ===== 건강 상태 체크 섹션 ===== */}
                      <div className="form-group" style={{ borderTop: "1.5px dashed var(--border-light)", paddingTop: "16px" }}>
                        <label className="form-label">🏥 건강 상태 체크 (필수)</label>
                        <div style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "14px",
                          backgroundColor: "var(--bg-secondary)",
                          padding: "16px",
                          borderRadius: "var(--border-radius-sm)",
                          border: "1px solid var(--border-light)"
                        }}>
                          {/* 30일 이내 병원 방문 */}
                          <div>
                            <p style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-main)", marginBottom: "8px" }}>
                              30일 이내 병원 방문 여부
                            </p>
                            <div style={{ display: "flex", gap: "10px" }}>
                              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", cursor: "pointer", fontWeight: "600" }}>
                                <input type="radio" name="recentHospital" value="yes" checked={recentHospitalVisit === "yes"} onChange={() => setRecentHospitalVisit("yes")} />
                                <span>있음</span>
                              </label>
                              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", cursor: "pointer", fontWeight: "600" }}>
                                <input type="radio" name="recentHospital" value="no" checked={recentHospitalVisit === "no"} onChange={() => setRecentHospitalVisit("no")} />
                                <span>없음</span>
                              </label>
                            </div>
                            {recentHospitalVisit === "yes" && (
                              <div style={{ marginTop: "8px" }} className="animate-fade-in">
                                <input
                                  type="text"
                                  className="form-input"
                                  value={recentHospitalDetail}
                                  onChange={(e) => setRecentHospitalDetail(e.target.value)}
                                  placeholder="방문 날짜 및 진료 내용을 간략히 기재해 주세요 (예: 5/20 정기검진, 신부전 관리)"
                                />
                              </div>
                            )}
                          </div>

                          {/* 전염성 질환 여부 */}
                          <div>
                            <p style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-main)", marginBottom: "4px" }}>
                              전염성 질환 여부
                            </p>
                            <p style={{ fontSize: "0.75rem", color: "var(--warning-coral)", marginBottom: "8px", fontWeight: "600" }}>
                              ※ 전염성 질환이 있을 시 돌봄이 불가합니다.
                            </p>
                            <div style={{ display: "flex", gap: "10px" }}>
                              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", cursor: "pointer", fontWeight: "600" }}>
                                <input type="radio" name="infectiousDisease" value="yes" checked={infectiousDisease === "yes"} onChange={() => setInfectiousDisease("yes")} />
                                <span>있음</span>
                              </label>
                              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", cursor: "pointer", fontWeight: "600" }}>
                                <input type="radio" name="infectiousDisease" value="no" checked={infectiousDisease === "no"} onChange={() => setInfectiousDisease("no")} />
                                <span>없음</span>
                              </label>
                            </div>
                            {infectiousDisease === "yes" && (
                              <div style={{
                                marginTop: "8px",
                                backgroundColor: "var(--warning-coral-light)",
                                border: "1.5px solid var(--warning-coral)",
                                borderRadius: "6px",
                                padding: "10px 12px",
                                fontSize: "0.82rem",
                                color: "var(--warning-coral)",
                                fontWeight: "700"
                              }} className="animate-fade-in">
                                🚫 전염성 질환이 있는 경우 예약이 불가합니다. 완치 후 다시 신청해 주세요.
                              </div>
                            )}
                          </div>

                          {/* 면책 동의 */}
                          <div style={{
                            backgroundColor: "white",
                            borderRadius: "8px",
                            padding: "14px",
                            border: "1px solid var(--border-light)"
                          }}>
                            <p style={{ fontSize: "0.82rem", color: "var(--text-main)", lineHeight: "1.7", marginBottom: "10px" }}>
                              <strong>📋 다음 내용을 확인하고 동의하십니까?</strong><br />
                              방문탁묘는 외부인이 출입하는 서비스 특성상<br />
                              <strong>질병 잠복기 (3~14일)</strong> 또는 <strong>기존 건강 상태(스트레스)</strong>에 의해<br />
                              방문 이후 질병이 발생할 수 있습니다.<br />
                              보호자는 해당 사실을 이해하며<br />
                              <strong>펫시터에게 감염 책임을 묻지 않음</strong>에 동의합니다.
                            </p>
                            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "10px", fontStyle: "italic" }}>
                              ※ 질병 미고지로 인한 문제 발생 시 펫시터는 책임지지 않습니다.
                            </p>
                            <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer" }}>
                              <input
                                type="checkbox"
                                checked={healthAgreement}
                                onChange={(e) => setHealthAgreement(e.target.checked)}
                                style={{ marginTop: "2px", width: "16px", height: "16px", flexShrink: 0 }}
                              />
                              <span style={{ fontSize: "0.85rem", fontWeight: "700", color: healthAgreement ? "var(--success-mint)" : "var(--text-main)" }}>
                                위 내용을 모두 확인하였으며 동의합니다.
                              </span>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Next Step Button for Step 2 */}
                      <button
                        type="button"
                        onClick={handleNextStep2}
                        className="btn btn-primary animate-fade-in"
                        style={{
                          width: "100%",
                          padding: "16px",
                          fontSize: "1.05rem",
                          marginTop: "16px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                          boxShadow: "0 4px 12px rgba(255, 112, 67, 0.15)"
                        }}
                      >
                        다음 단계로 ➔
                      </button>
                    </>
                  )}

                  {/* ===== PAGE 3: 돌봄 상세 및 예약 ===== */}
                  {bookingStep === 3 && (
                    <>
                      {/* Page 3 → Page 2 Back Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setBookingStep(2);
                          const portalElement = document.getElementById("booking-form-start");
                          if (portalElement) {
                            portalElement.scrollIntoView({ behavior: "smooth" });
                          } else {
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }
                        }}
                        style={{
                          width: "100%",
                          padding: "12px",
                          fontSize: "0.9rem",
                          backgroundColor: "var(--bg-secondary)",
                          border: "1.5px solid var(--border-light)",
                          borderRadius: "10px",
                          color: "var(--text-muted)",
                          fontWeight: "700",
                          cursor: "pointer",
                          marginBottom: "16px",
                          transition: "all 0.2s ease"
                        }}
                      >
                        ← 이전 단계로 돌아가기 (건강 상태 체크)
                      </button>

                      {/* 방문 지역 & 개인정보 수집: 신규 고객만 입력, 재신청은 자동 적용 */}
                      {!isReturningCustomer ? (
                        <>
                          <div className="form-group" style={{ borderTop: "1.5px dashed var(--border-light)", paddingTop: "16px" }}>
                            <span style={{ fontSize: "0.85rem", fontWeight: "800", color: "var(--text-main)", display: "block", marginBottom: "12px" }}>
                              🔒 신규 고객 필수 보안 및 개인정보 기재 (방문 용도)
                            </span>
                          </div>

                          <div className="form-group">
                            <label className="form-label">📞 연락처 (필수)</label>
                            <input
                              type="tel"
                              className="form-input"
                              value={clientPhone}
                              onChange={(e) => setClientPhone(e.target.value)}
                              placeholder="예: 010-1234-5678"
                              lang="ko"
                              autoCapitalize="none"
                              autoCorrect="off"
                              spellCheck={false}
                            />
                          </div>

                          <div className="form-group">
                            <label className="form-label">🏠 방문 상세 주소 (필수)</label>
                            <input
                              type="text"
                              className="form-input"
                              value={clientAddress}
                              onChange={(e) => setClientAddress(e.target.value)}
                              placeholder="예: 경상남도 거제시 고현로 123, 101동 102호"
                              lang="ko"
                              autoCapitalize="none"
                              autoCorrect="off"
                              spellCheck={false}
                            />
                          </div>

                          <div className="form-group" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                            <div>
                              <label className="form-label">🔑 공동현관 번호 (필수)</label>
                              <input
                                type="text"
                                className="form-input"
                                value={entranceCode}
                                onChange={(e) => setEntranceCode(e.target.value)}
                                placeholder="예: 종1234# 또는 없음"
                              />
                            </div>
                            <div>
                              <label className="form-label">🔑 도어락 비밀번호 (필수)</label>
                              <input
                                type="text"
                                className="form-input"
                                value={doorlockCode}
                                onChange={(e) => setDoorlockCode(e.target.value)}
                                placeholder="예: 1234* 또는 열쇠"
                              />
                            </div>
                          </div>

                          <div className="form-group">
                            <label className="form-label">🚪 상세 출입 방법 안내 (선택)</label>
                            <textarea
                              rows="2"
                              className="form-input"
                              value={entryMethodDetail}
                              onChange={(e) => setEntryMethodDetail(e.target.value)}
                              placeholder="예: 공동현관 호출 후 경비실 승인 필요 / 도어락 커버를 올리고 입력 등"
                              style={{ resize: "vertical", fontSize: "0.85rem" }}
                              lang="ko"
                              autoCapitalize="none"
                              autoCorrect="off"
                              spellCheck={false}
                            ></textarea>
                          </div>

                          <div className="form-group" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                            <div>
                              <label className="form-label">🅿️ 차량등록 및 주차 여부</label>
                              <select
                                className="form-input"
                                value={parkingOption}
                                onChange={(e) => setParkingOption(e.target.value)}
                                style={{ appearance: "auto" }}
                              >
                                <option value="free">무료 주차 가능</option>
                                <option value="paid">유료 주차 가능</option>
                                <option value="register">차량 사전 등록 필요</option>
                                <option value="impossible">주차 불가/대중교통</option>
                              </select>
                            </div>
                            <div>
                              <label className="form-label">📸 사진/영상 전송 희망</label>
                              <select
                                className="form-input"
                                value={photoVideoPreference}
                                onChange={(e) => setPhotoVideoPreference(e.target.value)}
                                style={{ appearance: "auto" }}
                              >
                                <option value="many">사진, 영상 많이 보내주세요</option>
                                <option value="confirmation">방문/퇴실 확인 문자만 한 통</option>
                              </select>
                            </div>
                          </div>

                          <div className="form-group" style={{
                            backgroundColor: "var(--bg-secondary)",
                            padding: "14px",
                            borderRadius: "8px",
                            border: "1px solid var(--border-light)",
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px",
                            marginTop: "4px"
                          }}>
                            <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer" }}>
                              <input
                                type="checkbox"
                                checked={snsAgreement}
                                onChange={(e) => setSnsAgreement(e.target.checked)}
                                style={{ marginTop: "2px" }}
                              />
                              <span style={{ fontSize: "0.82rem", color: "var(--text-main)" }}>
                                [선택] 동영상 및 사진 SNS/블로그 홍보 마케팅 사용 동의
                              </span>
                            </label>

                            <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer", borderTop: "1px solid var(--border-light)", paddingTop: "8px" }}>
                              <input
                                type="checkbox"
                                checked={privacyAgreement}
                                onChange={(e) => setPrivacyAgreement(e.target.checked)}
                                style={{ marginTop: "2px" }}
                              />
                              <span style={{ fontSize: "0.82rem", fontWeight: "700", color: "var(--text-main)" }}>
                                [필수] 개인정보 수집 및 이용 동의 (방문탁묘 목적 수집: 연락처, 주소, 공동현관 및 도어락 비밀번호, 출입방법, 차량등록 여부 등)
                              </span>
                            </label>
                          </div>

                          <div className="form-group">
                            <label className="form-label">📍 방문 예정 지역 (필수)</label>
                            <div style={{
                              fontSize: "0.78rem",
                              color: "hsl(12, 75%, 45%)", // 선명한 다크 코랄/오렌지 톤
                              backgroundColor: "rgba(255, 127, 63, 0.08)", // 연한 오렌지 틴트 배경
                              border: "1px solid rgba(255, 127, 63, 0.25)", // 오렌지 테두리
                              padding: "10px 14px",
                              borderRadius: "8px",
                              marginBottom: "10px",
                              lineHeight: "1.5",
                              fontWeight: "600"
                            }}>
                              📢 <strong>기본 8개 지역 안내</strong>: 
                              <span style={{ color: "var(--text-main)", marginLeft: "4px" }}>
                                고현동, 장평동, 상문동, 수월동, 중곡동, 옥포동, 아주동, 사곡리
                              </span>
                              <div style={{ marginTop: "4px", fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: "500" }}>
                                * 위 기본 지역 외에는 동선과 이동 시간을 고려하여 <strong>추가금 +5,000원</strong>이 발생합니다.
                              </div>
                            </div>
                            <select
                              className="form-input"
                              value={visitArea}
                              onChange={(e) => setVisitArea(e.target.value)}
                              style={{ appearance: "auto" }}
                              required
                            >
                              <option value="고현">고현동 (기본 지역)</option>
                              <option value="장평">장평동 (기본 지역)</option>
                              <option value="상문">상문동 (기본 지역)</option>
                              <option value="수월">수월동 (기본 지역)</option>
                              <option value="중곡">중곡동 (기본 지역)</option>
                              <option value="옥포">옥포동 (기본 지역)</option>
                              <option value="아주">아주동 (기본 지역)</option>
                              <option value="사곡">사곡리 (기본 지역)</option>
                              <option value="기타">기타 지역 (추가금 +5,000원)</option>
                            </select>
                          </div>

                          {visitArea === "기타" && (
                            <div className="form-group animate-fade-in">
                              <label className="form-label">기타 상세 지역 입력</label>
                              <input
                                type="text"
                                className="form-input"
                                value={customArea}
                                onChange={(e) => setCustomArea(e.target.value)}
                                placeholder="예: 하청면, 사등면, 장승포동 등 상세 지역명"
                                required
                              />
                            </div>
                          )}
                        </>
                      ) : (
                        <div style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "12px",
                          padding: "16px",
                          backgroundColor: "var(--bg-secondary)",
                          borderRadius: "var(--border-radius-sm)",
                          border: "1px solid var(--border-light)",
                          fontSize: "0.85rem",
                          marginBottom: "16px"
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <span>📍</span>
                            <span style={{ color: "var(--text-muted)" }}>방문 지역:</span>
                            <strong style={{ color: "var(--text-main)" }}>{MOCK_PREVIOUS_BOOKING.visitArea}</strong>
                            <span style={{
                              marginLeft: "auto",
                              fontSize: "0.72rem",
                              backgroundColor: "var(--success-mint-light)",
                              color: "var(--success-mint)",
                              padding: "2px 7px",
                              borderRadius: "8px",
                              fontWeight: "700"
                            }}>이전 정보 자동 적용</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px dashed var(--border-light)", paddingTop: "8px" }}>
                            <span style={{ color: "var(--text-muted)" }}>연락처:</span>
                            <span style={{ color: "var(--text-main)", fontWeight: "600" }}>{MOCK_PREVIOUS_BOOKING.clientPhone}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ color: "var(--text-muted)" }}>주소:</span>
                            <span style={{ color: "var(--text-main)", fontWeight: "600", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", maxWidth: "250px" }}>{MOCK_PREVIOUS_BOOKING.clientAddress}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ color: "var(--text-muted)" }}>출입코드:</span>
                            <span style={{ color: "var(--text-main)", fontWeight: "600" }}>공동현관(••••) / 도어락(••••)</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ color: "var(--text-muted)" }}>주차/사진:</span>
                            <span style={{ color: "var(--text-main)", fontWeight: "600" }}>
                              {MOCK_PREVIOUS_BOOKING.parkingOption === "free" ? "무료주차" : "주차등록"} / {MOCK_PREVIOUS_BOOKING.photoVideoPreference === "many" ? "많이 전송" : "확인문자"}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* ===== 반려동물 성격 섹션 ===== */}
                      <div className="form-group">
                        <label className="form-label">🐾 반려동물 성격 (복수 선택 가능)</label>
                        <div style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "8px",
                          backgroundColor: "var(--bg-secondary)",
                          padding: "16px",
                          borderRadius: "var(--border-radius-sm)",
                          border: "1px solid var(--border-light)"
                        }}>
                          {["사람 좋아함", "낯가림 있음", "겁이 많음", "공격성 있음", "만지는 거 싫어함"].map((trait) => {
                            const isSelected = petPersonality.includes(trait);
                            return (
                              <button
                                key={trait}
                                type="button"
                                onClick={() => {
                                  setPetPersonality(prev =>
                                    isSelected ? prev.filter(t => t !== trait) : [...prev, trait]
                                  );
                                }}
                                style={{
                                  padding: "8px 14px",
                                  borderRadius: "20px",
                                  border: isSelected ? "2px solid var(--primary-orange)" : "1.5px solid var(--border-light)",
                                  backgroundColor: isSelected ? "var(--primary-orange-light)" : "white",
                                  color: isSelected ? "var(--primary-orange)" : "var(--text-muted)",
                                  fontWeight: "700",
                                  fontSize: "0.8rem",
                                  cursor: "pointer",
                                  transition: "all 0.15s ease"
                                }}
                              >
                                {isSelected ? "✓ " : ""}{trait}
                              </button>
                            );
                          })}
                          <div style={{ width: "100%", marginTop: "4px" }}>
                            <input
                              type="text"
                              className="form-input"
                              value={petPersonalityOther}
                              onChange={(e) => setPetPersonalityOther(e.target.value)}
                              placeholder="기타 성격 특이사항을 직접 입력 (예: 밥 먹을 때 예민함, 특정 소리에 민감)"
                              style={{ fontSize: "0.83rem" }}
                              lang="ko"
                              autoCapitalize="none"
                              autoCorrect="off"
                              spellCheck={false}
                            />
                          </div>

                          <div style={{
                            width: "100%",
                            marginTop: "10px",
                            color: "var(--warning-coral)",
                            fontSize: "0.8rem",
                            fontWeight: "700",
                            backgroundColor: "var(--warning-coral-light)",
                            border: "1px dashed var(--warning-coral)",
                            padding: "10px 12px",
                            borderRadius: "8px"
                          }}>
                            *겁이 많거나 공격성이 있는경우 아이의 스트레스를 고려 하여 기본케어(급여,물,화장실관리)만 진행될 수 있습니다
                          </div>
                        </div>
                      </div>

                      {/* ===== 사료 급여 방법 섹션 ===== */}
                      <div className="form-group">
                        <label className="form-label">🍽️ 사료 급여 방법 안내</label>
                        <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "6px" }}>
                          그릇 위치, 급여 방법, 정수 또는 수돗물 여부, 간식 알러지 여부 등을 자세히 기재해 주세요.
                        </div>
                        <textarea
                          rows="3"
                          className="form-input"
                          value={feedingInfo}
                          onChange={(e) => setFeedingInfo(e.target.value)}
                          placeholder="예: 주방 싱크대 아래 파란 그릇, 건식 사료 1/3컵 1일 2회, 정수된 물 사용, 참치 알러지 있음"
                          style={{ resize: "vertical", fontSize: "0.85rem" }}
                          lang="ko"
                          autoCapitalize="none"
                          autoCorrect="off"
                          spellCheck={false}
                        ></textarea>
                      </div>

                      {/* ===== 화장실 관리 방법 섹션 ===== */}
                      <div className="form-group">
                        <label className="form-label">🚿 화장실 관리 방법 안내</label>
                        <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "6px" }}>
                          모래 종류, 처리 방법, 위치 등을 자세히 기재해 주세요.
                        </div>
                        <textarea
                          rows="3"
                          className="form-input"
                          value={litterInfo}
                          onChange={(e) => setLitterInfo(e.target.value)}
                          placeholder="예: 베란다에 두부 모래 화장실, 사용 후 응고된 부분 스쿱으로 제거 후 봉투에 담아 버림"
                          style={{ resize: "vertical", fontSize: "0.85rem" }}
                          lang="ko"
                          autoCapitalize="none"
                          autoCorrect="off"
                          spellCheck={false}
                        ></textarea>
                      </div>

                      <div className="form-group">
                        <label className="form-label">📝 펫시터 추가 요청 사항</label>
                        <textarea
                          rows="3"
                          className="form-input"
                          value={careMemo}
                          onChange={(e) => setCareMemo(e.target.value)}
                          placeholder="투약 지침, 산책 시 주의사항, 도어락 출입 수칙 등 기타 전달사항을 자세히 적어주세요."
                          style={{ resize: "vertical" }}
                          lang="ko"
                          autoCapitalize="none"
                          autoCorrect="off"
                          spellCheck={false}
                        ></textarea>
                      </div>

                      {/* Real-time price breakdown */}
                      <div style={{
                        backgroundColor: "var(--bg-primary)",
                        padding: "16px",
                        borderRadius: "var(--border-radius-sm)",
                        border: "1px solid var(--border-light)",
                        marginTop: "8px"
                      }}>
                        <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-main)", display: "block", marginBottom: "8px" }}>
                          💰 실시간 예상 이용 요금 상세
                        </span>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "4px" }}>
                          <span style={{ color: "var(--text-muted)" }}>
                            {bookingServiceChoice === "nursing" ? (
                              nursingPlan === "basic" ? `기본 방문 요양 (30,000원 × ${calculateBookingPrice().daysCount}일)` :
                              nursingPlan === "intensive" ? `집중 방문 요양 (55,000원 × ${calculateBookingPrice().daysCount}일)` :
                              nursingPlan === "medication" ? `투약 전용 서비스 (15,000원 × ${calculateBookingPrice().daysCount}일)` :
                              `주간/월간 패키지 (상담 필요)`
                            ) : (
                              `기본 요금 (17,000원 × ${calculateBookingPrice().daysCount}일)`
                            )}
                          </span>
                          <span style={{ fontWeight: "600" }}>
                            {bookingServiceChoice === "nursing" && nursingPlan === "package" ? "별도 안내" : `${calculateBookingPrice().basePrice.toLocaleString()}원`}
                          </span>
                        </div>

                        {isHoliday && (
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "4px", color: "var(--warning-coral)" }}>
                            <span>공휴일/명절 할증 (+5,000원)</span>
                            <span style={{ fontWeight: "600" }}>+5,000원</span>
                          </div>
                        )}

                        {bookingServiceChoice === "general" && optMedication && (
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "4px" }}>
                            <span style={{ color: "var(--text-muted)" }}>1회성 투약 서비스 추가요금</span>
                            <span style={{ fontWeight: "600" }}>+5,000원</span>
                          </div>
                        )}

                        {optPreMeet && (
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "4px" }}>
                            <span style={{ color: "var(--text-muted)" }}>사전 만남 추가요금</span>
                            <span style={{ fontWeight: "600" }}>+10,000원</span>
                          </div>
                        )}

                        {optForcedFeeding && (
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "4px" }}>
                            <span style={{ color: "var(--text-muted)" }}>급여도움 (강제급여) 추가요금</span>
                            <span style={{ fontWeight: "600" }}>+10,000원</span>
                          </div>
                        )}

                        {optHospital && (
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "4px" }}>
                            <span style={{ color: "var(--text-muted)" }}>병원 방문 1회 추가요금</span>
                            <span style={{ fontWeight: "600" }}>+20,000원</span>
                          </div>
                        )}

                        {optDogAdd && (
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "4px" }}>
                            <span style={{ color: "var(--text-muted)" }}>강아지 1마리 추가요금</span>
                            <span style={{ fontWeight: "600" }}>+8,000원</span>
                          </div>
                        )}



                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "8px" }}>
                          <span style={{ color: "var(--text-muted)" }}>방문 지역 추가금 ({visitArea === "기타" ? (customArea || "기타 지역") : (visitArea + (visitArea === "사곡" ? "리" : "동"))})</span>
                          <span style={{ fontWeight: "600", color: visitArea === "기타" ? "var(--warning-coral)" : "var(--success-mint)" }}>
                            {visitArea === "기타" ? "+5,000원" : "0원 (기본)"}
                          </span>
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", fontWeight: "800", borderTop: "1px solid var(--border-light)", paddingTop: "8px", color: "var(--primary-orange)" }}>
                          <span>최종 예상 요금</span>
                          <span>
                            {bookingServiceChoice === "nursing" && nursingPlan === "package" ? "별도 안내" : `${calculateBookingPrice().totalPrice.toLocaleString()}원`}
                          </span>
                        </div>
                      </div>


                      {/* 마감 안내 메세지 */}
                      {selectedDate && isDateFullyBooked(selectedDate) && (
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

                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isBookingLoading || (selectedDate ? isDateFullyBooked(selectedDate) : false)}
                        style={{
                          width: "100%",
                          padding: "16px",
                          fontSize: "1.1rem",
                          marginTop: "12px",
                          backgroundColor: (selectedDate && isDateFullyBooked(selectedDate)) ? "#9ca3af" : "var(--primary-orange)",
                          cursor: (isBookingLoading || (selectedDate ? isDateFullyBooked(selectedDate) : false)) ? "not-allowed" : "pointer",
                          opacity: (isBookingLoading || (selectedDate ? isDateFullyBooked(selectedDate) : false)) ? 0.6 : 1
                        }}
                      >
                        {isBookingLoading ? "예약 신청 전송 중... (안전 복구 보호 활성)" : "돌봄 예약 확정하기 📝"}
                      </button>
                    </>
                  )}
                </form>
              </div>

            </div>
          </>
        )}
      </div>
    </main>

      {/* ============================================================== */}
      {/* 9. PORTAL VIEW C: 🔒 펫시터 전용 관리 대시보드 (Admin Panel) */}
      {/* ============================================================== */}
      {activeUser && (activeUser.role === "admin" || activeUser.role === "sitter") && (
        <main className="animate-fade-in" style={{ flex: 1, padding: "40px 0", display: activePortal === "sitter" ? "block" : "none" }}>
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

            {/* 9.1 예약 일정 선택기 (Sitter Switch Reservation) */}
            <div style={{ 
              marginBottom: "28px", 
              padding: "20px", 
              backgroundColor: "var(--bg-secondary)", 
              borderRadius: "var(--border-radius-lg)", 
              border: "1px solid var(--border-light)",
              boxShadow: "0 4px 12px rgba(22, 31, 56, 0.03)",
              textAlign: "left"
            }}>
              <span style={{ fontSize: "0.9rem", fontWeight: "800", color: "var(--text-main)", display: "block", marginBottom: "12px" }}>
                📅 관리할 예약 일정 선택 ({sitterReservations.length}건)
              </span>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "20px" }}>
                {sitterReservations.map((res, index) => {
                  const isActive = activeReservationIndex === index;
                  return (
                    <button
                      key={res.id}
                      onClick={() => {
                        setActiveReservationIndex(index);
                        setChecklistReq1(res.status === "started" || res.status === "completed");
                        setChecklistReq2(res.status === "started" || res.status === "completed");
                        setChecklistReq3(res.status === "started" || res.status === "completed");
                      }}
                      style={{
                        padding: "10px 16px",
                        borderRadius: "8px",
                        border: isActive ? "2px solid var(--primary-orange)" : "1.5px solid var(--border-light)",
                        backgroundColor: isActive ? "var(--primary-orange-light)" : "white",
                        color: isActive ? "var(--primary-orange)" : "var(--text-main)",
                        fontWeight: "750",
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                      }}
                    >
                      {res.status === "completed" ? "✅" : res.status === "started" ? "⚡" : "📅"}{" "}
                      {res.pet_name} ({res.client_name}) - {res.visit_area || "고현동"}
                    </button>
                  );
                })}
              </div>

              {/* 펫시터 달력 뷰 (Sitter Calendar Grid) */}
              <div className="premium-card" style={{ padding: "clamp(12px, 3vw, 20px)", backgroundColor: "white", borderRadius: "12px", border: "1px solid var(--border-light)" }}>
                <span style={{ fontSize: "clamp(0.8rem, 2vw, 0.9rem)", fontWeight: "800", color: "var(--text-main)", display: "block", marginBottom: "16px" }}>
                  📅 펫시터 돌봄 통합 캘린더 (날짜/배지를 클릭하면 해당 예약으로 즉시 전환됩니다)
                </span>

                {/* 요일 헤더 */}
                <div style={{
                  display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                  textAlign: "center", fontWeight: "700", fontSize: "clamp(0.65rem, 1.5vw, 0.8rem)",
                  color: "var(--text-muted)", marginBottom: "10px"
                }}>
                  {["일", "월", "화", "수", "목", "금", "토"].map(d => <span key={d}>{d}</span>)}
                </div>

                {/* 날짜 그리드 */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: "clamp(2px, 0.8vw, 8px)" }}>
                  {calendarGridDays.map((dayObj, index) => {
                    if (!dayObj.day || !dayObj.date) {
                      return <div key={index} style={{ minHeight: "clamp(50px, 8vw, 80px)", backgroundColor: "var(--bg-primary)", opacity: 0.35, borderRadius: "4px" }} />;
                    }

                    // Find reservations on this date
                    const targetDateString = dayObj.date.toDateString();
                    const reservationsOnDay = sitterReservations.map((res, originalIndex) => ({
                      ...res,
                      originalIndex
                    })).filter(res => res.visit_date_string === targetDateString);

                    return (
                      <div
                        key={index}
                        style={{
                          borderRadius: "var(--border-radius-sm)",
                          minHeight: "clamp(50px, 8vw, 80px)",
                          padding: "clamp(3px, 1vw, 6px)",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                          justifyContent: "flex-start",
                          fontSize: "clamp(0.7rem, 1.6vw, 0.85rem)",
                          backgroundColor: "var(--bg-secondary)",
                          border: "1.5px solid var(--border-light)",
                          transition: "all 0.15s ease",
                          position: "relative",
                          minWidth: 0
                        }}
                      >
                        {/* 날짜 번호 */}
                        <span style={{ 
                          fontWeight: "800", 
                          color: "var(--text-main)", 
                          marginBottom: "4px",
                          fontSize: "clamp(0.75rem, 1.5vw, 0.9rem)"
                        }}>
                          {dayObj.day}
                        </span>

                        {/* 예약 리스트 */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px", width: "100%" }}>
                          {reservationsOnDay.map((res) => {
                            const isActive = activeReservationIndex === res.originalIndex;
                            let badgeBg = "var(--bg-primary)";
                            let badgeColor = "var(--text-muted)";
                            let borderStyle = "1px solid transparent";
                            let labelPrefix = "📅";
                            
                            const statusLower = (res.status || "").toLowerCase();
                            if (statusLower === "예약대기") {
                              badgeBg = "hsl(35, 100%, 94%)";
                              badgeColor = "hsl(35, 95%, 45%)";
                              borderStyle = "1px solid hsl(35, 90%, 80%)";
                              labelPrefix = "🕒 [대기]";
                            } else if (statusLower === "confirmed" || statusLower === "예약확정") {
                              badgeBg = "var(--success-mint-light)";
                              badgeColor = "var(--success-mint)";
                              borderStyle = "1px solid hsl(150, 40%, 85%)";
                              labelPrefix = "✅ [확정]";
                            } else if (statusLower === "started") {
                              badgeBg = "var(--warning-coral-light)";
                              badgeColor = "var(--warning-coral)";
                              borderStyle = "1px solid hsl(12, 85%, 90%)";
                              labelPrefix = "🟢 [돌봄중]";
                            } else if (statusLower === "completed") {
                              badgeBg = "#f1f5f9";
                              badgeColor = "var(--text-muted)";
                              borderStyle = "1px solid #e2e8f0";
                              labelPrefix = "🏁 [완료]";
                            } else {
                              badgeBg = "rgba(22, 31, 56, 0.05)";
                              badgeColor = "var(--text-main)";
                              labelPrefix = "📅";
                            }

                            return (
                              <div
                                key={res.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveReservationIndex(res.originalIndex);
                                  setChecklistReq1(res.status === "started" || res.status === "completed");
                                  setChecklistReq2(res.status === "started" || res.status === "completed");
                                  setChecklistReq3(res.status === "started" || res.status === "completed");
                                }}
                                style={{
                                  padding: "clamp(2px, 0.5vw, 4px) clamp(3px, 0.8vw, 6px)",
                                  borderRadius: "4px",
                                  backgroundColor: isActive ? "var(--primary-orange)" : badgeBg,
                                  color: isActive ? "white" : badgeColor,
                                  fontSize: "clamp(0.55rem, 1.2vw, 0.7rem)",
                                  fontWeight: "850",
                                  cursor: "pointer",
                                  border: isActive ? "1px solid var(--primary-orange)" : borderStyle,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "2px",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  width: "100%",
                                  boxShadow: isActive ? "0 2px 5px rgba(255, 112, 67, 0.2)" : "none",
                                  transition: "all 0.15s ease"
                                }}
                                title={`${res.client_name} (${res.pet_name}) - ${res.visit_time}`}
                              >
                                {labelPrefix} {res.pet_name}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
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
                                         sitterReservations[activeReservationIndex].status === "completed" ? "var(--success-mint-light)" : 
                                         sitterReservations[activeReservationIndex].status === "예약대기" ? "var(--warning-coral-light)" : "#e2e8f0",
                        color: sitterReservations[activeReservationIndex].status === "started" ? "var(--primary-orange)" : 
                               sitterReservations[activeReservationIndex].status === "completed" ? "var(--success-mint)" : 
                               sitterReservations[activeReservationIndex].status === "예약대기" ? "var(--warning-coral)" : "var(--text-muted)"
                      }}>
                        상태: {sitterReservations[activeReservationIndex].status === "started" ? "⚡ 돌봄 진행 중 (Started)" :
                               sitterReservations[activeReservationIndex].status === "completed" ? "🏁 돌봄 완료 (Completed)" : 
                               sitterReservations[activeReservationIndex].status === "예약대기" ? "⏳ 예약 대기 (Pending)" : "💤 대기 중 (Confirmed)"}
                      </span>
                    </div>

                    {/* Sitter and Admin time adjustment UI */}
                    {(activeUser && (activeUser.role === "admin" || activeUser.role === "sitter")) && (
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        backgroundColor: "var(--bg-secondary)",
                        padding: "12px 16px",
                        borderRadius: "8px",
                        border: "1px dashed var(--primary-orange)",
                        marginBottom: "20px",
                        width: "fit-content"
                      }}>
                        <span style={{ fontSize: "0.8rem", fontWeight: "800", color: "var(--text-main)" }}>
                          🕒 돌봄 시간 조절 및 수정:
                        </span>
                        <input
                          type="text"
                          value={sitterReservations[activeReservationIndex].visit_time || ""}
                          onChange={(e) => {
                            const newTime = e.target.value;
                            setSitterReservations(prev => {
                              const next = [...prev];
                              next[activeReservationIndex] = {
                                ...next[activeReservationIndex],
                                visit_time: newTime
                              };
                              return next;
                            });
                          }}
                          placeholder="예: 2 PM"
                          style={{
                            padding: "6px 10px",
                            fontSize: "0.8rem",
                            borderRadius: "6px",
                            border: "1px solid var(--border-light)",
                            width: "120px",
                            fontWeight: "700",
                            textAlign: "center"
                          }}
                          lang="ko"
                          autoCapitalize="none"
                          autoCorrect="off"
                          spellCheck={false}
                        />
                        <button
                          onClick={() => {
                            showToast("🕒 돌봄 방문 일정이 성공적으로 변경되었습니다.");
                          }}
                          className="btn btn-primary"
                          style={{
                            padding: "6px 12px",
                            fontSize: "0.8rem"
                          }}
                        >
                          수정 완료
                        </button>
                      </div>
                    )}

                    {/* Visit Area & Price details in dashboard */}
                    <div style={{
                      display: "flex",
                      gap: "12px",
                      flexWrap: "wrap",
                      marginBottom: "20px",
                      fontSize: "0.85rem"
                    }}>
                      <span style={{
                        backgroundColor: "white",
                        border: "1px solid var(--border-light)",
                        padding: "6px 12px",
                        borderRadius: "8px",
                        color: "var(--text-main)",
                        fontWeight: "500",
                        boxShadow: "0 2px 4px rgba(22, 31, 56, 0.02)"
                      }}>
                        📍 방문 지역: <strong>{sitterReservations[activeReservationIndex].visit_area || "고현동"}</strong>
                      </span>
                      <span style={{
                        backgroundColor: "white",
                        border: "1px solid var(--border-light)",
                        padding: "6px 12px",
                        borderRadius: "8px",
                        color: "var(--text-main)",
                        fontWeight: "500",
                        boxShadow: "0 2px 4px rgba(22, 31, 56, 0.02)"
                      }}>
                        💵 기본 요금: <strong>{(sitterReservations[activeReservationIndex].total_price ? (sitterReservations[activeReservationIndex].total_price - (sitterReservations[activeReservationIndex].additional_fee || 0)) : 30000).toLocaleString()}원</strong>
                      </span>
                      {sitterReservations[activeReservationIndex].additional_fee > 0 ? (
                        <span style={{
                          backgroundColor: "var(--warning-coral-light)",
                          border: "1px solid var(--warning-coral)",
                          padding: "6px 12px",
                          borderRadius: "8px",
                          color: "var(--warning-coral)",
                          fontWeight: "800",
                          boxShadow: "0 2px 4px rgba(22, 31, 56, 0.02)"
                        }}>
                          🚗 지역 추가금: +{(sitterReservations[activeReservationIndex].additional_fee || 0).toLocaleString()}원
                        </span>
                      ) : (
                        <span style={{
                          backgroundColor: "var(--success-mint-light)",
                          border: "1px solid var(--success-mint)",
                          padding: "6px 12px",
                          borderRadius: "8px",
                          color: "var(--success-mint)",
                          fontWeight: "800",
                          boxShadow: "0 2px 4px rgba(22, 31, 56, 0.02)"
                        }}>
                          🚗 지역 추가금 없음
                        </span>
                      )}
                      <span style={{
                        backgroundColor: "var(--primary-orange-light)",
                        border: "1px solid var(--primary-orange)",
                        padding: "6px 12px",
                        borderRadius: "8px",
                        color: "var(--primary-orange)",
                        fontWeight: "850",
                        boxShadow: "0 2px 4px rgba(22, 31, 56, 0.02)"
                      }}>
                        💰 총 결제 요금: {(sitterReservations[activeReservationIndex].total_price || 30000).toLocaleString()}원
                      </span>
                    </div>

                    {sitterReservations[activeReservationIndex].selected_options && sitterReservations[activeReservationIndex].selected_options.length > 0 && (
                      <div style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "6px",
                        marginBottom: "20px",
                        padding: "12px",
                        backgroundColor: "white",
                        borderRadius: "8px",
                        border: "1px solid var(--border-light)"
                      }}>
                        <span style={{ fontSize: "0.8rem", fontWeight: "800", color: "var(--text-muted)", display: "block", width: "100%", marginBottom: "4px" }}>
                          📋 선택된 돌봄 추가 요금/서비스 항목:
                        </span>
                        {sitterReservations[activeReservationIndex].selected_options.map((opt, idx) => (
                          <span key={idx} style={{
                            backgroundColor: "var(--primary-orange-light)",
                            color: "var(--primary-orange)",
                            fontSize: "0.75rem",
                            padding: "4px 10px",
                            borderRadius: "12px",
                            fontWeight: "750"
                          }}>
                            {opt}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* 건강 상태 + 성격 + 사료/화장실 정보 카드 */}
                    {(sitterReservations[activeReservationIndex].recent_hospital ||
                      sitterReservations[activeReservationIndex].pet_personality ||
                      sitterReservations[activeReservationIndex].feeding_info ||
                      sitterReservations[activeReservationIndex].litter_info) && (
                      <div style={{
                        backgroundColor: "white",
                        borderRadius: "var(--border-radius-md)",
                        border: "1px solid var(--border-light)",
                        padding: "16px",
                        marginBottom: "20px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px"
                      }}>
                        <span style={{ fontSize: "0.85rem", fontWeight: "800", color: "var(--text-main)", display: "block", borderBottom: "1px solid var(--border-light)", paddingBottom: "8px" }}>
                          🐾 반려동물 상세 정보
                        </span>

                        {sitterReservations[activeReservationIndex].recent_hospital && (
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                            <span style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--text-muted)" }}>🏥 최근 30일 병원 방문</span>
                            <span style={{ fontSize: "0.85rem", color: "var(--text-main)", fontWeight: "600" }}>
                              {sitterReservations[activeReservationIndex].recent_hospital}
                            </span>
                          </div>
                        )}

                        {sitterReservations[activeReservationIndex].infectious_disease && (
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                            <span style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--text-muted)" }}>🦠 전염성 질환</span>
                            <span style={{
                              fontSize: "0.85rem",
                              fontWeight: "700",
                              color: sitterReservations[activeReservationIndex].infectious_disease === "있음" ? "var(--warning-coral)" : "var(--success-mint)"
                            }}>
                              {sitterReservations[activeReservationIndex].infectious_disease}
                            </span>
                          </div>
                        )}

                        {sitterReservations[activeReservationIndex].pet_personality && sitterReservations[activeReservationIndex].pet_personality !== "미입력" && (
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <span style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--text-muted)" }}>😸 반려동물 성격</span>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                              {sitterReservations[activeReservationIndex].pet_personality.split(", ").map((trait, i) => (
                                <span key={i} style={{
                                  backgroundColor: "var(--bg-secondary)",
                                  color: "var(--text-main)",
                                  fontSize: "0.75rem",
                                  padding: "3px 9px",
                                  borderRadius: "10px",
                                  fontWeight: "600",
                                  border: "1px solid var(--border-light)"
                                }}>
                                  {trait}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {sitterReservations[activeReservationIndex].feeding_info && sitterReservations[activeReservationIndex].feeding_info !== "미입력" && (
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                            <span style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--text-muted)" }}>🍽️ 사료 급여 방법</span>
                            <p style={{
                              margin: 0,
                              fontSize: "0.83rem",
                              color: "var(--text-main)",
                              backgroundColor: "var(--bg-secondary)",
                              padding: "8px 10px",
                              borderRadius: "6px",
                              lineHeight: "1.6"
                            }}>
                              {sitterReservations[activeReservationIndex].feeding_info}
                            </p>
                          </div>
                        )}

                        {sitterReservations[activeReservationIndex].litter_info && sitterReservations[activeReservationIndex].litter_info !== "미입력" && (
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                            <span style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--text-muted)" }}>🚿 화장실 관리 방법</span>
                            <p style={{
                              margin: 0,
                              fontSize: "0.83rem",
                              color: "var(--text-main)",
                              backgroundColor: "var(--bg-secondary)",
                              padding: "8px 10px",
                              borderRadius: "6px",
                              lineHeight: "1.6"
                            }}>
                              {sitterReservations[activeReservationIndex].litter_info}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {sitterReservations[activeReservationIndex].status === "예약대기" ? (
                      <div style={{
                        backgroundColor: "var(--primary-orange-light)", padding: "18px", borderRadius: "var(--border-radius-md)",
                        border: "1.5px solid var(--primary-orange)", display: "flex", flexDirection: "column", gap: "10px"
                      }}>
                        <strong style={{ fontSize: "0.85rem", color: "var(--primary-orange)", display: "block" }}>
                          ⏳ 예약 대기 상태 (입금/상품권 결제 확인 필요)
                        </strong>
                        <p style={{ fontSize: "0.82rem", color: "var(--text-main)", margin: 0 }}>
                          결제 수단: <strong>{sitterReservations[activeReservationIndex].payment_method || "무통장/제로페이"}</strong><br />
                          고객이 예약 신청을 완료하고 결제/입금 확인을 기다리고 있습니다. 입금이 확인되었으면 아래 버튼을 눌러 승인해 주세요.
                        </p>
                        <button 
                          className="btn btn-primary" 
                          onClick={() => handleConfirmPaymentReceived(sitterReservations[activeReservationIndex].id)} 
                          style={{ backgroundColor: "var(--primary-orange)", color: "white", alignSelf: "flex-start", padding: "8px 16px", fontWeight: "750" }}
                        >
                          💰 결제 확인 및 예약 승인하기 ✅
                        </button>
                      </div>
                    ) : sitterReservations[activeReservationIndex].status === "confirmed" ? (
                      <div style={{
                        backgroundColor: "white", padding: "18px", borderRadius: "var(--border-radius-md)",
                        border: "1px solid var(--border-light)", display: "flex", flexDirection: "column", gap: "10px"
                      }}>
                        <strong style={{ fontSize: "0.85rem", color: "var(--text-main)", display: "block", marginBottom: "4px" }}>
                          ⚠️ 인적 실수 예방 필수 확인 프로세스 (3가지 수칙 체크 필수)
                        </strong>
                        
                        <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.85rem", cursor: "pointer" }}>
                          <input type="checkbox" checked={checklistReq1} onChange={(e) => setChecklistReq1(e.target.checked)} />
                          <span>{getDynamicChecklist1Text()}</span>
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
              <div style={{ flex: "1 1 300px", minWidth: "0", maxWidth: "100%", display: "flex", flexDirection: "column", gap: "20px" }}>
                
                <h3 style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--text-main)", borderBottom: "1px solid var(--border-light)", paddingBottom: "8px", margin: 0 }}>
                  📂 등록 고객 보안 관리대장 (출입코드 30초 한시 공개)
                </h3>

                {customers.map((customer) => {
                  const entranceTimer = revealedEntranceIds[customer.id] || 0;
                  const doorlockTimer = revealedDoorlockIds[customer.id] || 0;

                  return (
                    <div key={customer.id} className="premium-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "14px" }}>
                      
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h4 style={{ fontSize: "1.1rem", fontWeight: "800", color: "var(--text-main)" }}>
                          🐱 {customer.pet_name}네 ({customer.client_name}, {customer.pet_age}살)
                        </h4>
                        <span style={{ fontSize: "0.85rem", color: "var(--text-main)", fontWeight: "700" }}>
                          📞 {customer.phone}
                        </span>
                      </div>

                      <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        <span style={{ fontWeight: "700", color: "var(--text-main)", display: "block" }}>주소</span>
                        {customer.address}
                      </div>

                      <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                        <div>
                          <span style={{ fontWeight: "700", color: "var(--text-main)", display: "block" }}>🅿️ 차량등록/주차</span>
                          <span style={{ color: "var(--text-main)", fontWeight: "600" }}>
                            {customer.parking_option === "free" ? "무료 주차 가능" :
                             customer.parking_option === "paid" ? "유료 주차 가능" :
                             customer.parking_option === "register" ? "차량 사전 등록 필요" : "주차 불가/대중교통"}
                          </span>
                        </div>
                        <div>
                          <span style={{ fontWeight: "700", color: "var(--text-main)", display: "block" }}>📸 사진/영상 전송</span>
                          <span style={{ color: "var(--text-main)", fontWeight: "600" }}>
                            {customer.photo_video_preference === "many" ? "많이 전송 요청" : "확인 문자만 요청"}
                          </span>
                        </div>
                      </div>

                      <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                        <div>
                          <span style={{ fontWeight: "700", color: "var(--text-main)", display: "block" }}>📢 SNS 홍보 동의</span>
                          <span style={{ fontWeight: "750", color: customer.sns_agreement ? "var(--success-mint)" : "var(--text-muted)" }}>
                            {customer.sns_agreement ? "동의함 (Yes)" : "동의 안 함 (No)"}
                          </span>
                        </div>
                        <div>
                          <span style={{ fontWeight: "700", color: "var(--text-main)", display: "block" }}>👤 개인정보 동의</span>
                          <span style={{ fontWeight: "750", color: "var(--success-mint)" }}>동의 완료 (필수)</span>
                        </div>
                      </div>

                      <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        <span style={{ fontWeight: "700", color: "var(--text-main)", display: "block" }}>🚪 출입 방법 안내</span>
                        <p style={{ margin: 0, fontSize: "0.83rem", color: "var(--text-main)", backgroundColor: "var(--bg-secondary)", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--border-light)" }}>
                          {customer.entry_method_detail || "기재된 출입 방법 안내가 없습니다."}
                        </p>
                      </div>

                      <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        <span style={{ fontWeight: "700", color: "var(--text-main)", display: "block" }}>반려동물 특이사항</span>
                        <p style={{ margin: 0, fontStyle: "italic", color: "var(--warning-coral)" }}>
                          &ldquo;{customer.specialties}&rdquo;
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
              {(() => {
                const existingJournal = careJournals.find(j => Number(j.reservation_id) === Number(sitterReservations[activeReservationIndex]?.id));
                const hasJournal = !!existingJournal;
                return (
                  <div style={{ flex: "1 1 300px", minWidth: "0", maxWidth: "100%", display: "flex", flexDirection: "column", gap: "20px" }}>
                    
                    <h3 style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--text-main)", borderBottom: "1px solid var(--border-light)", paddingBottom: "8px", margin: 0 }}>
                      ✍️ AI 반자동 돌봄 일지 빌더
                    </h3>

                    <div className="premium-card" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                      
                      {isCareJournalTableMissing && isSupabaseConfigured && (
                        <div style={{
                          backgroundColor: "rgba(244, 67, 54, 0.08)",
                          border: "1.5px solid var(--warning-coral)",
                          padding: "14px 18px",
                          borderRadius: "var(--border-radius-md)",
                          color: "var(--warning-coral)",
                          fontSize: "0.85rem",
                          lineHeight: "1.5"
                        }}>
                          <strong style={{ display: "block", marginBottom: "4px" }}>⚠️ Supabase 데이터베이스 설정 필요</strong>
                          현재 연결된 Supabase 프로젝트에 <code style={{ backgroundColor: "rgba(0,0,0,0.06)", padding: "2px 4px", borderRadius: "4px" }}>care_journals</code> 테이블이 존재하지 않습니다.<br />
                          <span style={{ fontWeight: "600" }}>해결 방법:</span> 프로젝트 루트의 <code style={{ backgroundColor: "rgba(0,0,0,0.06)", padding: "2px 4px", borderRadius: "4px" }}>supabase_schema.sql</code> 파일 42~51행의 SQL 구문을 복사하여 Supabase Dashboard의 SQL Editor에서 실행해 주세요. (현재는 로컬 시뮬레이션 모드로 작동 중입니다)
                        </div>
                      )}

                      {hasJournal && (
                        <div style={{
                          backgroundColor: "rgba(76, 175, 80, 0.1)",
                          border: "1.5px solid var(--success-mint)",
                          padding: "14px 18px",
                          borderRadius: "var(--border-radius-md)",
                          color: "var(--success-mint)",
                          fontWeight: "700",
                          fontSize: "0.85rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px"
                        }}>
                          <span>✓ 이미 이 예약의 돌봄 일지가 제출되었습니다. 중복 작성이 방지됩니다.</span>
                        </div>
                      )}

                      {/* Category A: Meal options */}
                      <div>
                        <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-main)", display: "block", marginBottom: "8px" }}>
                          🍲 식사 급여 상태 (중복 선택 가능)
                        </span>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                          {["완식", "일부 남김", "사료 거부", "약 복용 완료"].map((chip) => {
                            const isSelected = journalMeals.includes(chip);
                            return (
                              <button
                                key={chip}
                                onClick={() => !hasJournal && toggleJournalMeal(chip)}
                                disabled={hasJournal}
                                style={{
                                  padding: "8px 14px", border: "1.5px solid var(--border-light)",
                                  borderRadius: "var(--border-radius-sm)", fontSize: "0.8rem", fontWeight: "700",
                                  backgroundColor: isSelected ? "var(--primary-orange)" : "white",
                                  color: isSelected ? "white" : "var(--text-muted)",
                                  cursor: hasJournal ? "not-allowed" : "pointer", transition: "var(--transition-fast)",
                                  opacity: hasJournal && !isSelected ? 0.5 : 1
                                }}
                              >
                                {chip}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Category B: Activity options */}
                      <div>
                        <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-main)", display: "block", marginBottom: "8px" }}>
                          🎾 활동 및 놀이 상태 (중복 선택 가능)
                        </span>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                          {["실내 놀이 완료", "산책 완료 (20분)", "컨디션 좋음", "무기력함"].map((chip) => {
                            const isSelected = journalActivities.includes(chip);
                            return (
                              <button
                                key={chip}
                                onClick={() => !hasJournal && toggleJournalActivity(chip)}
                                disabled={hasJournal}
                                style={{
                                  padding: "8px 14px", border: "1.5px solid var(--border-light)",
                                  borderRadius: "var(--border-radius-sm)", fontSize: "0.8rem", fontWeight: "700",
                                  backgroundColor: isSelected ? "var(--primary-orange)" : "white",
                                  color: isSelected ? "white" : "var(--text-muted)",
                                  cursor: hasJournal ? "not-allowed" : "pointer", transition: "var(--transition-fast)",
                                  opacity: hasJournal && !isSelected ? 0.5 : 1
                                }}
                              >
                                {chip}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Category C: Bowel options */}
                      <div>
                        <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-main)", display: "block", marginBottom: "8px" }}>
                          💩 배변 상태 점검 (중복 선택 가능)
                        </span>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                          {["소변 양호", "대변 양호", "설사/묽은변", "배변 없음"].map((chip) => {
                            const isSelected = journalBowels.includes(chip);
                            return (
                              <button
                                key={chip}
                                onClick={() => !hasJournal && toggleJournalBowel(chip)}
                                disabled={hasJournal}
                                style={{
                                  padding: "8px 14px", border: "1.5px solid var(--border-light)",
                                  borderRadius: "var(--border-radius-sm)", fontSize: "0.8rem", fontWeight: "700",
                                  backgroundColor: isSelected ? "var(--primary-orange)" : "white",
                                  color: isSelected ? "white" : "var(--text-muted)",
                                  cursor: hasJournal ? "not-allowed" : "pointer", transition: "var(--transition-fast)",
                                  opacity: hasJournal && !isSelected ? 0.5 : 1
                                }}
                              >
                                {chip}
                              </button>
                            );
                          })}
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
                          disabled={hasJournal}
                          placeholder={hasJournal ? "제출 완료되어 수정할 수 없습니다." : "특이사항이나 아이에게 해주고 싶은 말을 적으세요. 실시간으로 조합되어 완성됩니다."}
                          style={{ resize: "vertical", cursor: hasJournal ? "not-allowed" : "text" }}
                        ></textarea>
                      </div>

                      {/* Image/Video Uploader for Care Journal */}
                      {!hasJournal ? (
                        <JournalMediaUploader
                          reservationId={sitterReservations[activeReservationIndex]?.id}
                          value={currentJournalMedia}
                          onChange={setCurrentJournalMedia}
                        />
                      ) : (
                        existingJournal.photos && existingJournal.photos.length > 0 && (
                          <div style={{
                            backgroundColor: "var(--bg-secondary)",
                            padding: "20px",
                            borderRadius: "var(--border-radius-md)",
                            border: "1.5px solid var(--border-light)"
                          }}>
                            <span style={{ fontSize: "0.85rem", fontWeight: "800", color: "var(--text-main)", display: "block", marginBottom: "8px" }}>
                              📸 첨부된 현장 미디어 사진/동영상 ({existingJournal.photos.length}건)
                            </span>
                            <div style={{
                              display: "grid",
                              gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
                              gap: "10px"
                            }}>
                              {existingJournal.photos.map((url, idx) => {
                                const isVideo = url.endsWith(".mp4") || url.endsWith(".webm") || url.includes("mov_bbb") || url.includes("movie.mp4");
                                return (
                                  <div
                                    key={idx}
                                    style={{
                                      position: "relative",
                                      width: "100%",
                                      height: "80px",
                                      borderRadius: "6px",
                                      overflow: "hidden",
                                      border: "1px solid var(--border-light)",
                                      backgroundColor: "black",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center"
                                    }}
                                  >
                                    {isVideo ? (
                                      <video
                                        src={url}
                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                        controls
                                      />
                                    ) : (
                                      <img
                                        src={url}
                                        alt="첨부파일"
                                        style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "pointer" }}
                                        onClick={() => window.open(url, "_blank")}
                                      />
                                    )}
                                    {isVideo && (
                                      <div style={{
                                        position: "absolute",
                                        pointerEvents: "none",
                                        backgroundColor: "rgba(0,0,0,0.5)",
                                        borderRadius: "50%",
                                        width: "24px",
                                        height: "24px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "white",
                                        fontSize: "0.7rem"
                                      }}>
                                        ▶
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )
                      )}

                      {/* Dynamic Journal Template Output */}
                      <div style={{
                        backgroundColor: "var(--bg-primary)",
                        padding: "20px",
                        borderRadius: "var(--border-radius-md)",
                        border: "1.5px solid var(--border-light)"
                      }}>
                        <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--primary-orange)", display: "block", marginBottom: "10px" }}>
                          📱 보호자 전송용 보고서 {hasJournal ? "최종 제출본" : "실시간 미리보기"} (키워드 조합형)
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

                      {/* 돌봄 일지 작성 확인 및 홈화면 등록 버튼 */}
                      {!hasJournal && sitterReservations[activeReservationIndex]?.status === "started" && (
                        <button
                          className="btn"
                          onClick={handleFinishCare}
                          style={{
                            width: "100%",
                            padding: "16px 20px",
                            fontSize: "1.05rem",
                            fontWeight: "800",
                            backgroundColor: "var(--success-mint)",
                            color: "white",
                            border: "none",
                            borderRadius: "var(--border-radius-md)",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            boxShadow: "0 4px 12px rgba(76, 175, 80, 0.2)",
                            marginBottom: "10px"
                          }}
                        >
                          ✍️ 돌봄 일지 작성 확인 및 홈화면 등록 🏁
                        </button>
                      )}

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
                );
              })()}

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
            <strong style={{ color: "white", fontSize: "1.1rem", display: "block", marginBottom: "4px" }}>윤교품애 (Yoongyopoomae) Hub</strong>
            <span style={{ fontSize: "0.8rem" }}>사용자 지정 RLS & 30초 암호 마스킹 & 캘린더 예약 스위트</span>
            
            {/* 운영자 연락처 및 인스타 정보 */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "8px", fontSize: "0.8rem", color: "rgba(255, 255, 255, 0.55)", alignItems: "center" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <i className="fab fa-instagram" style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "0.9rem" }}></i>
                <a href="https://instagram.com/yoonkyopoomae" target="_blank" rel="noopener noreferrer" style={{ color: "rgba(255, 255, 255, 0.75)", transition: "color 0.2s" }} onMouseEnter={(e) => e.target.style.color = "white"} onMouseLeave={(e) => e.target.style.color = "rgba(255, 255, 255, 0.75)"}>yoonkyopoomae</a>
              </span>
              <span style={{ color: "rgba(255, 255, 255, 0.2)" }}>|</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <i className="fas fa-phone" style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "0.85rem" }}></i>
                <a href="tel:010-3202-2440" style={{ color: "rgba(255, 255, 255, 0.75)", transition: "color 0.2s" }} onMouseEnter={(e) => e.target.style.color = "white"} onMouseLeave={(e) => e.target.style.color = "rgba(255, 255, 255, 0.75)"}>010-3202-2440</a>
              </span>
            </div>
          </div>
          <div style={{ fontSize: "0.8rem", textAlign: "right" }}>
            <span>© 2026 윤교품애. All Rights Reserved.</span>
            <span style={{ display: "block", color: "var(--primary-orange)", marginTop: "2px", fontWeight: "600" }}>
              🔒 Supabase row-level-security & double-pass security timer standard
            </span>
          </div>
        </div>
      </footer>

      {/* Toss Payments SDK script loader */}
      {/* afterInteractive: 페이지 하이드레이션 직후 로드 → 결제 버튼 클릭 전 SDK 준비 완료 보장 */}
      <Script src="https://js.tosspayments.com/v1/payment" strategy="afterInteractive" />

      {/* AI Chatbot Float Button (고정 버튼 - 플로팅) */}
      <div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 1001 }}>
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, var(--gold) 0%, hsl(43,80%,60%) 100%)",
            color: "hsl(266,60%,30%)",
            border: "2.5px solid hsl(43,70%,75%)",
            boxShadow: "0 6px 22px rgba(180,140,0,0.4), 0 0 0 4px var(--gold-light)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: isChatOpen ? "1.1rem" : "0",
            overflow: "hidden",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            padding: "0",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = "0 10px 28px rgba(180,140,0,0.55), 0 0 0 5px var(--gold-light)";
            e.currentTarget.style.transform = "scale(1.08)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "0 6px 22px rgba(180,140,0,0.4), 0 0 0 4px var(--gold-light)";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          {isChatOpen
            ? <span style={{ fontSize: "1.1rem", fontWeight: "700", color: "hsl(266,60%,30%)" }}>✕</span>
            : <img src="/miki_icon.jpg" alt="미키" style={{ width: "52px", height: "52px", borderRadius: "50%", objectFit: "cover", objectPosition: "center" }} />
          }
        </button>
      </div>

      {/* AI Chatbot Window — position:fixed 독립 엘리먼트, ref로 드래그 직접 제어 */}
      {isChatOpen && (
        <div
          ref={chatWindowRef}
          style={{
            position: "fixed",
            bottom: "92px",
            right: "24px",
            top: "auto",
            left: "auto",
            width: "360px",
            height: "500px",
            minWidth: "300px",
            minHeight: "400px",
            maxWidth: "600px",
            maxHeight: "800px",
            resize: "both",
            overflow: "hidden",
            backgroundColor: "white",
            borderRadius: "20px",
            boxShadow: "var(--shadow-lg)",
            border: "1px solid var(--border-light)",
            display: "flex",
            flexDirection: "column",
            animation: "fadeIn 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards",
            zIndex: 1000
          }}
        >
          {/* Header — 드래그 핸들 */}
          <div
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
            style={{
              padding: "14px 18px",
              background: "linear-gradient(135deg, hsl(270,30%,97%) 0%, hsl(266,40%,94%) 60%, hsl(43,50%,96%) 100%)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "2px solid var(--gold-border)",
              boxShadow: "0 2px 8px rgba(100,40,180,0.07)",
              cursor: "move",
              userSelect: "none",
              WebkitUserSelect: "none",
              touchAction: "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "44px", height: "44px", borderRadius: "50%",
                overflow: "hidden", border: "2.5px solid var(--gold-border)",
                boxShadow: "0 0 0 3px var(--gold-light), 0 3px 10px rgba(180,140,0,0.2)",
                flexShrink: 0
              }}>
                <img src="/miki_icon.jpg" alt="미키" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
              </div>
              <div style={{ textAlign: "left" }}>
                <strong style={{ display: "block", fontSize: "0.9rem", color: "var(--text-main)", fontWeight: "800" }}>윤교품애 마스코트 미키 도우미</strong>
                <span style={{ fontSize: "0.7rem", color: "var(--gold)", fontWeight: "700" }}>🔔 온라인 · 가상 AI 지원 중</span>
              </div>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-muted)",
                fontSize: "1.1rem",
                cursor: "pointer",
                opacity: 0.7,
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
              onMouseLeave={(e) => e.currentTarget.style.opacity = 0.7}
            >
              ✕
            </button>
          </div>

          {/* Chat Messages Body */}
          <div
            ref={chatBodyRef}
            style={{
              position: "relative",
              flex: 1,
              padding: "20px",
              overflowY: "auto",
              backgroundColor: "var(--bg-primary)",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {chatMessages.map((msg) => {
              const isBot = msg.sender === "bot";
              return (
                <div
                  key={msg.id}
                  id={`chat-message-${msg.id}`}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: isBot ? "flex-start" : "flex-end",
                    animation: "fadeIn 0.3s ease forwards",
                  }}
                >
                  {isBot && (
                    <div style={{ display: "flex", alignItems: "flex-end", gap: "8px" }}>
                      <div style={{
                        width: "30px", height: "30px", borderRadius: "50%",
                        overflow: "hidden", border: "1.5px solid var(--gold-border)",
                        flexShrink: 0
                      }}>
                        <img src="/miki_icon.jpg" alt="미키" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                      <div style={{
                        maxWidth: "80%",
                        backgroundColor: "white",
                        border: "1px solid var(--border-light)",
                        borderRadius: "4px 16px 16px 16px",
                        padding: "10px 14px",
                        fontSize: "0.82rem",
                        lineHeight: "1.6",
                        color: "var(--text-main)",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                        whiteSpace: "pre-line",
                      }}>
                        {msg.text}
                      </div>
                    </div>
                  )}
                  {!isBot && (
                    <div style={{
                      maxWidth: "80%",
                      backgroundColor: "var(--primary-orange)",
                      color: "white",
                      borderRadius: "16px 16px 4px 16px",
                      padding: "10px 14px",
                      fontSize: "0.82rem",
                      lineHeight: "1.6",
                      boxShadow: "0 2px 8px rgba(180,100,0,0.18)",
                    }}>
                      {msg.text}
                    </div>
                  )}
                  <span style={{
                    fontSize: "0.65rem",
                    color: "var(--text-muted)",
                    marginTop: "4px",
                    marginLeft: isBot ? "38px" : "0",
                  }}>
                    {msg.time.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              );
            })}
            {isBotTyping && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{
                  width: "30px", height: "30px", borderRadius: "50%",
                  overflow: "hidden", border: "1.5px solid var(--gold-border)", flexShrink: 0
                }}>
                  <img src="/miki_icon.jpg" alt="미키" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{
                  backgroundColor: "white",
                  border: "1px solid var(--border-light)",
                  borderRadius: "4px 16px 16px 16px",
                  padding: "10px 16px",
                  display: "flex", gap: "4px", alignItems: "center",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: "7px", height: "7px", borderRadius: "50%",
                      backgroundColor: "var(--text-muted)",
                      animation: `bounce 1s ease ${i * 0.2}s infinite`,
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />

            {/* FAQ Buttons */}
            <div style={{ marginTop: "8px" }}>
              <div style={{
                fontSize: "0.72rem", fontWeight: "700", color: "var(--gold)",
                marginBottom: "8px", display: "flex", alignItems: "center", gap: "4px"
              }}>
                💡 자주 묻는 질문 (FAQ)
              </div>
              {FAQ_LIST.map((faq) => (
                <button
                  key={faq.id}
                  onClick={() => handleSendChatMessage(null, faq.question)}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "8px 12px",
                    marginBottom: "6px",
                    borderRadius: "10px",
                    border: "1.5px solid var(--border-light)",
                    backgroundColor: "white",
                    fontSize: "0.78rem",
                    fontWeight: "600",
                    color: "var(--text-main)",
                    cursor: "pointer",
                    lineHeight: "1.4",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--gold-border)";
                    e.currentTarget.style.backgroundColor = "var(--gold-light)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border-light)";
                    e.currentTarget.style.backgroundColor = "white";
                  }}
                >
                  {faq.question}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Input */}
          <form
            onSubmit={handleSendChatMessage}
            style={{
              display: "flex",
              gap: "8px",
              padding: "12px 16px",
              borderTop: "1.5px solid var(--border-light)",
              backgroundColor: "white",
            }}
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="질문을 입력하세요..."
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: "10px",
                border: "1.5px solid var(--border-light)",
                fontSize: "0.82rem",
                outline: "none",
                transition: "border-color 0.15s ease",
              }}
              onFocus={(e) => e.target.style.borderColor = "var(--primary-orange)"}
              onBlur={(e) => e.target.style.borderColor = "var(--border-light)"}
            />
            <button
              type="submit"
              disabled={!chatInput.trim()}
              style={{
                padding: "10px 16px",
                borderRadius: "10px",
                backgroundColor: !chatInput.trim() ? "var(--border-light)" : "var(--primary-orange)",
                color: "white",
                border: "none",
                fontSize: "0.85rem",
                fontWeight: "700",
                cursor: !chatInput.trim() ? "not-allowed" : "pointer",
                transition: "var(--transition-fast)",
              }}
            >
              전송
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
