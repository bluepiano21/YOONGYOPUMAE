/* eslint-disable */
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
    address: "경상남도 거제시 고현동 123-45 102호 (기본 지역)",
    entrance_code: "종1234#",
    doorlock_code: "2026*",
    entry_method_detail: "공동현관 호출 버튼을 누르고 비밀번호 입력 후 종 버튼을 눌러주세요.",
    parking_option: "free",
    photo_video_preference: "many",
    sns_agreement: true,
    specialties: "신부전 초기 냥이, 매일 15:00 신부전 유도 약물 0.5cc 사료 믹스 필수, 낯가림이 매우 심해 큰 소리에 놀람."
  },
  {
    id: 2,
    client_name: "이은주 회원",
    phone: "010-8877-3344",
    pet_name: "먼지",
    pet_age: 15,
    address: "경상남도 거제시 아주동 98-7 2층 (기본 지역)",
    entrance_code: "경비실 호출 후 통과",
    doorlock_code: "9988#",
    entry_method_detail: "경비실 호출 벨을 누르고 방문 돌봄 펫시터라고 말씀하신 뒤 통과해 주세요.",
    parking_option: "register",
    photo_video_preference: "many",
    sns_agreement: false,
    specialties: "15세 노령묘, 관절염으로 높은 곳 점프 금지, 안약 하루 2회 점적 수칙, 식욕 모니터링 필요."
  },
  {
    id: 3,
    client_name: "박태영 회원",
    phone: "010-1234-5678",
    pet_name: "레오",
    pet_age: 2,
    address: "경상남도 거제시 하청면 하청로 45-12 401호 (기타 지역 - 추가금 +5,000원 적용)",
    entrance_code: "열쇠 아이콘 터치 후 0401#",
    doorlock_code: "0401*",
    entry_method_detail: "공동현관 키패드에서 열쇠 버튼을 누르고 호실 번호 입력 후 #을 누르세요.",
    parking_option: "impossible",
    photo_video_preference: "confirmation",
    sns_agreement: true,
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
    visit_date_string: new Date().toDateString(),
    mandatory_requirements: "💊 보리 15시 투약 지침: 신부전 약물 0.5cc 필수 급여 및 2차 주거 보안 코드 확인 준수",
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
    client_name: "이은주 회원",
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

  // Global Auth / RLS States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeUser, setActiveUser] = useState(null);
  const [toast, setToast] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState("vip"); // 'vip' or 'admin' for demo simulation
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
  const [forceNetworkError, setForceNetworkError] = useState(false);
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [showBookingSuccessModal, setShowBookingSuccessModal] = useState(false);
  const [bookingSummary, setBookingSummary] = useState(null);
  const [tempBookingData, setTempBookingData] = useState(null);

  // New multi-day and questionnaire fields
  const [bookingType, setBookingType] = useState("single"); // "single" | "multi"
  const [bookingStartDate, setBookingStartDate] = useState("");
  const [bookingEndDate, setBookingEndDate] = useState("");
  const [bookingFrequency, setBookingFrequency] = useState("daily"); // "daily" | "every_other" | "custom"
  const [bookingDateText, setBookingDateText] = useState("");
  const [bookingTimeText, setBookingTimeText] = useState("");
  const [petCount, setPetCount] = useState("1");
  const [petDetailsText, setPetDetailsText] = useState("");

  // New Pricing Option States
  const [isHoliday, setIsHoliday] = useState(false);
  const [optPreMeet, setOptPreMeet] = useState(false);
  const [optMedication, setOptMedication] = useState(false);
  const [optForcedFeeding, setOptForcedFeeding] = useState(false);
  const [optHospital, setOptHospital] = useState(false);
  const [optDogAdd, setOptDogAdd] = useState(false);
  const [optTwoVisits, setOptTwoVisits] = useState(false);

  // Health Check States (건강 상태 체크)
  const [recentHospitalVisit, setRecentHospitalVisit] = useState(""); // "yes" | "no" | ""
  const [recentHospitalDetail, setRecentHospitalDetail] = useState("");
  const [infectiousDisease, setInfectiousDisease] = useState(""); // "yes" | "no" | ""
  const [healthAgreement, setHealthAgreement] = useState(false);

  // Pet Personality States (반려동물 성격)
  const [petPersonality, setPetPersonality] = useState([]);
  const [petPersonalityOther, setPetPersonalityOther] = useState("");

  // Care Info States (사료급여 + 화장실 관리)
  const [feedingInfo, setFeedingInfo] = useState("");
  const [litterInfo, setLitterInfo] = useState("");

  // 신규 / 재신청 고객 구분
  const [isReturningCustomer, setIsReturningCustomer] = useState(false);

  // 등록 고객 목록 상태 (보안 관리대장 연동용)
  const [customers, setCustomers] = useState(CUSTOMERS_DB);

  // 신규 수집 개인정보 및 출입/동의 관련 상태들
  const [clientPhone, setClientPhone] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [entranceCode, setEntranceCode] = useState("");
  const [doorlockCode, setDoorlockCode] = useState("");
  const [entryMethodDetail, setEntryMethodDetail] = useState("");
  const [parkingOption, setParkingOption] = useState("free"); // "free" | "paid" | "register" | "impossible"
  const [photoVideoPreference, setPhotoVideoPreference] = useState("many"); // "many" | "confirmation"
  const [snsAgreement, setSnsAgreement] = useState(false);
  const [privacyAgreement, setPrivacyAgreement] = useState(false);

  // 재신청 고객이 이전에 저장한 정보 (실제 서비스에서는 DB에서 불러옴 - 여기서는 모의 데이터)
  const MOCK_PREVIOUS_BOOKING = {
    visitArea: "고현동",
    feedingInfo: "싱크대 아래 주황 그릇, 건식 사료 1/4컵 1일 2회, 정수된 물 사용, 참치 알러지 있음",
    litterInfo: "거실 베란다 두부 모래 화장실, 사용 후 응고 부분 스쿱으로 제거 후 봉투에 담아 처리",
    petPersonality: "낯가림 있음, 겁이 많음",
    clientPhone: "010-4422-9011",
    clientAddress: "경상남도 거제시 고현동 123-45 102호 (기본 지역)",
    entranceCode: "종1234#",
    doorlockCode: "2026*",
    entryMethodDetail: "공동현관 호출 버튼을 누르고 비밀번호 입력 후 종 버튼을 눌러주세요.",
    parkingOption: "free",
    photoVideoPreference: "many",
    snsAgreement: true,
    privacyAgreement: true,
    petName: "로니",
    petAge: "3",
    petCount: "1",
    bookingDateText: "5월 27일 ~ 5월 30일 매일",
    bookingTimeText: "오후 2시 선호",
    petDetailsText: "1. 로니 (3살, 남아, 중성화 완료) - 소심하지만 다정한 아이. 사료 급여와 감자 수확 필요."
  };

  // 재신청 / 신규 선택 시 폼 필드 자동 로드/초기화 함수
  const handleCustomerTypeChange = (isReturning) => {
    setIsReturningCustomer(isReturning);
    if (isReturning) {
      setFeedingInfo(MOCK_PREVIOUS_BOOKING.feedingInfo);
      setLitterInfo(MOCK_PREVIOUS_BOOKING.litterInfo);
      
      const savedTraits = MOCK_PREVIOUS_BOOKING.petPersonality.split(", ").map(t => t.trim());
      const standardTraits = ["사람 좋아함", "낯가림 있음", "겁이 많음", "공격성 있음", "만지는 거 싫어함"];
      
      const standardSelected = savedTraits.filter(t => standardTraits.includes(t));
      const otherSelected = savedTraits.filter(t => !standardTraits.includes(t)).join(", ");
      
      setPetPersonality(standardSelected);
      setPetPersonalityOther(otherSelected);

      // Auto-fill new fields for returning customer
      setPetName(MOCK_PREVIOUS_BOOKING.petName || "");
      setPetAge(MOCK_PREVIOUS_BOOKING.petAge || "");
      setPetCount(MOCK_PREVIOUS_BOOKING.petCount || "1");
      setBookingDateText(MOCK_PREVIOUS_BOOKING.bookingDateText || "");
      setBookingTimeText(MOCK_PREVIOUS_BOOKING.bookingTimeText || "");
      setPetDetailsText(MOCK_PREVIOUS_BOOKING.petDetailsText || "");
    } else {
      setFeedingInfo("");
      setLitterInfo("");
      setPetPersonality([]);
      setPetPersonalityOther("");

      // Clear fields for new customer
      setPetName("");
      setPetAge("");
      setPetCount("1");
      setBookingDateText("");
      setBookingTimeText("");
      setPetDetailsText("");
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
    const base = 17000;
    let extra = 0;
    
    if (isHoliday) extra += 5000;
    if (optPreMeet) extra += 10000;
    if (optMedication) extra += 5000;
    if (optForcedFeeding) extra += 10000;
    if (optHospital) extra += 20000;
    if (optDogAdd) extra += 8000;
    if (optTwoVisits) extra += 13000;
    if (visitArea === "기타") extra += 5000;
    
    const daysMultiplier = bookingType === "multi" ? getMultiDaysCount() : 1;
    
    return {
      basePrice: base * daysMultiplier,
      additionalFee: extra * daysMultiplier,
      totalPrice: (base + extra) * daysMultiplier,
      daysCount: daysMultiplier
    };
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

  // Handle fallback hero image loading check (prevents React 19 image preload issues)
  useEffect(() => {
    const img = new Image();
    img.src = "/hero.png";
    img.onerror = () => {
      setHeroImageSrc("https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800");
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
    
    setJournalPreviewText(`🐾 윤교품애 돌봄 보고서 (${timeNow} 기준)\n-----------------------------\n${mealText} ${activityText} ${bowelText}${custom}\n\n전윤교 펫시터가 정성을 다해 아이를 보살폈습니다. 항상 믿고 맡겨주셔서 감사드립니다! ♥`);
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

  const selectBookingDate = (dayObj) => {
    if (dayObj.isPast || !dayObj.day) return;
    setSelectedDate(dayObj.date);
    setSelectedTimeSlot(null);
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();

    // Validation based on reservation type
    if (bookingType === "single") {
      if (!selectedDate || !selectedTimeSlot || !petName || !petAge) {
        showToast("필수 예약 양식을 모두 완성해 주세요. (날짜 선택, 시간대 선택, 대표 동물 이름, 나이 기입 필수)");
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
      if (!entryMethodDetail.trim()) {
        showToast("상세 출입 방법 안내를 입력해 주세요.");
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
      if (forceNetworkError) {
        setIsBookingLoading(false);
        showToast("⚠️ 네트워크 오류가 발생하여 예약에 실패했습니다. 잠시 후 다시 시도해 주세요.");
        return;
      }

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
      if (optMedication) selectedOptions.push("투약 1회 (+5,000원)");
      if (optForcedFeeding) selectedOptions.push("급여도움(강제급여) (+10,000원)");
      if (optHospital) selectedOptions.push("병원 방문 1회 (+20,000원)");
      if (optDogAdd) selectedOptions.push("강아지 1마리 추가 (+8,000원)");
      if (optTwoVisits) selectedOptions.push("1일 2회 방문 (+13,000원)");
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
          ? selectedTimeSlot.time
          : `${bookingTimeText} (방문 조율 가능)`,
        petName: petName,
        petAge: bookingType === "single" ? `${petAge}살` : `${petCount}마리`,
        serviceType: "기본 돌봄 (1일 1회 약 30분)",
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
          ? `${dateObj.toLocaleDateString("ko-KR", { month: "long", day: "numeric" })} ${selectedTimeSlot.time}`
          : `${dateObj.toLocaleDateString("ko-KR", { month: "long", day: "numeric" })} ${bookingTimeText} (조정 가능)`;

        return {
          id: Date.now() + idx,
          customer_id: newCustId,
          client_name: activeUser ? activeUser.full_name : "보호자 회원",
          pet_name: petName,
          is_returning_customer: isReturningCustomer,
          visit_time: visitTimeDisplay,
          visit_date_string: dateStr,
          mandatory_requirements: bookingType === "single"
            ? `🐾 ${petName} (${petAge}살) ${isReturningCustomer ? "[재신청]" : "[신규]"} | 옵션: ${selectedOptions.join(", ") || '없음'} | 요청: ${careMemo || '없음'}`
            : `🐾 ${petName} (${petCount}마리) | 상세: ${petDetailsText.substring(0, 100)}... | 기간: ${bookingStartDate} ~ ${bookingEndDate} | [옵션]: ${selectedOptions.join(", ")}`,
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
      showToast("📅 예약 신청 정보가 돌봄달력에 즉시 적용되었습니다.");
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

  const handleFinishCare = () => {
    setSitterReservations((prev) => {
      const next = [...prev];
      next[activeReservationIndex].status = "completed";
      return next;
    });
    showToast("🏁 돌봄이 종료되었습니다. 작성된 돌봄 일지를 보호자님께 공유할 수 있습니다.");
  };

  const handleCopyJournalLink = () => {
    const mockUrl = `https://yoongyopoomae.yenu.com/journal/share_id=${Date.now()}`;
    navigator.clipboard.writeText(mockUrl);
    showToast("📋 돌봄 보고서 공유 단축링크가 클립보드에 복사되었습니다!");
  };

  // --- A. BLOG PORTAL HANDLERS ---
  const handlePostCardClick = (post) => {
    // If restricted and not logged in (or logged in but not VIP/Admin/Member)
    const hasAccess = activeUser && (activeUser.role === "member" || activeUser.role === "vip" || activeUser.role === "admin");
    if (post.is_restricted && !hasAccess) {
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
          🛡️ Supabase 실시간 클라우드 DB 연동 중 | 윤교품애 RLS 정책 및 스토리지 연계 완수
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
          <div className="premium-card animate-fade-in" style={{ 
            maxWidth: "440px", 
            width: "90%", 
            padding: "40px 32px",
            backgroundColor: "white",
            borderRadius: "var(--border-radius-lg)",
            boxShadow: "var(--shadow-lg)",
            border: "1px solid var(--border-light)",
            textAlign: "center"
          }}>
            <div style={{ position: "relative", marginBottom: "28px" }}>
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
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                backgroundColor: "var(--primary-orange-light)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px"
              }}>
                <span style={{ fontSize: "1.8rem" }}>🔐</span>
              </div>
              <h3 style={{ fontSize: "1.4rem", color: "var(--text-main)", fontWeight: "800", margin: "0 0 6px" }}>
                윤교품애 인증 센터
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0 }}>
                {isSupabaseConfigured 
                  ? "안전한 Google 원클릭 로그인을 지원합니다." 
                  : "현재 데모 시뮬레이션 모드로 가동 중입니다."}
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
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
                      onClick={() => setSelectedRole("vip")}
                      style={{
                        flex: 1, padding: "10px", border: "1.5px solid var(--border-light)",
                        borderRadius: "var(--border-radius-sm)",
                        backgroundColor: selectedRole === "vip" ? "var(--primary-orange-light)" : "white",
                        borderColor: selectedRole === "vip" ? "var(--primary-orange)" : "var(--border-light)",
                        color: selectedRole === "vip" ? "var(--primary-orange)" : "var(--text-muted)",
                        fontWeight: "700", cursor: "pointer", fontSize: "0.8rem"
                      }}
                    >
                      👤 일반 회원 (VIP)
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
                      👑 펫시터 (Admin)
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

            <div style={{ marginTop: "24px", display: "flex", justifyContent: "center" }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setShowLoginModal(false)} 
                style={{ width: "100%", padding: "10px" }}
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
      {/* 4. BOOKING SUCCESS MODAL */}
      {/* ============================================================== */}
      {showBookingSuccessModal && bookingSummary && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "rgba(22, 31, 56, 0.7)", display: "flex", alignItems: "center",
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
                <strong style={{ color: "var(--text-main)" }}>{bookingSummary.petName} ({bookingSummary.petAge})</strong>
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
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
                <span style={{ color: "var(--text-muted)" }}>방문 지역</span>
                <strong style={{ color: "var(--text-main)" }}>📍 {bookingSummary.visitArea}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", borderTop: "1px solid var(--border-light)", paddingTop: "8px" }}>
                <span style={{ color: "var(--text-muted)" }}>기본 돌봄 요금 (30분)</span>
                <strong style={{ color: "var(--text-main)" }}>{bookingSummary.basePrice ? bookingSummary.basePrice.toLocaleString() : "17,000"}원</strong>
              </div>

              {bookingSummary.selectedOptions && bookingSummary.selectedOptions.length > 0 && (
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

              {bookingSummary.additionalFee > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", color: "var(--warning-coral)" }}>
                  <span>추가 요금 합계</span>
                  <strong>+{bookingSummary.additionalFee.toLocaleString()}원</strong>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.95rem", fontWeight: "800", color: "var(--primary-orange)", borderTop: "1.5px dashed var(--border-light)", paddingTop: "8px" }}>
                <span>총 예상 결제 요금</span>
                <span>{bookingSummary.totalPrice ? bookingSummary.totalPrice.toLocaleString() : "17,000"}원</span>
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
                <strong style={{ color: "var(--text-main)" }}>{bookingSummary.sitterName}</strong>
              </div>

              {/* 건강 상태 요약 */}
              {bookingSummary.recentHospitalVisit && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", borderTop: "1px solid var(--border-light)", paddingTop: "8px" }}>
                  <span style={{ color: "var(--text-muted)" }}>🏥 최근 병원 방문</span>
                  <strong style={{ color: "var(--text-main)", textAlign: "right", maxWidth: "60%" }}>{bookingSummary.recentHospitalVisit}</strong>
                </div>
              )}
              {bookingSummary.petPersonality && bookingSummary.petPersonality !== "미입력" && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                  <span style={{ color: "var(--text-muted)" }}>🐾 성격</span>
                  <strong style={{ color: "var(--text-main)", textAlign: "right", maxWidth: "60%" }}>{bookingSummary.petPersonality}</strong>
                </div>
              )}

              <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
                <span style={{ display: "block", fontWeight: "700", color: "var(--text-main)", marginBottom: "2px" }}>💡 보호자 요청사항:</span>
                <p style={{ margin: 0, fontStyle: "italic", backgroundColor: "white", padding: "8px 12px", borderRadius: "4px", border: "1px solid var(--border-light)" }}>
                  &ldquo;{bookingSummary.careMemo}&rdquo;
                </p>
              </div>
            </div>

            <button className="btn btn-primary" onClick={handleConfirmReservation} style={{ width: "100%", padding: "14px", fontWeight: "800", fontSize: "0.95rem" }}>
              예약 확정 및 신청 완료 (돌봄달력 즉시 적용) 🐾
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
        backgroundColor: "var(--bg-secondary)", borderBottom: "1px solid var(--border-light)",
        position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(10px)",
        background: "rgba(255,255,255,0.85)"
      }}>
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "80px" }}>
          
          {/* Logo brand linked from index.html */}
          <div onClick={() => setActivePortal("home")} style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "8px",
                backgroundImage: "url('/logo.png?v=3')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat"
              }}
              aria-label="윤교품애 로고"
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
              🏠 윤교품애 홈
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
      {/* 7. PORTAL VIEW A: 🏠 YOONGYOPOOMAE HOME & BLOG */}
      {/* ============================================================== */}
      <main className="animate-fade-in" style={{ flex: 1, display: activePortal === "home" ? "block" : "none" }}>
          
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
          <section style={{
            backgroundColor: "var(--bg-secondary)",
            padding: "80px 0",
            borderTop: "1.5px solid var(--border-light)",
            borderBottom: "1.5px solid var(--border-light)"
          }}>
            <div className="container" style={{ maxWidth: "1000px" }}>
              <div style={{ textAlign: "center", marginBottom: "48px" }}>
                <span style={{
                  backgroundColor: "var(--primary-orange-light)",
                  color: "var(--primary-orange)",
                  fontSize: "0.85rem",
                  fontWeight: "800",
                  padding: "8px 16px",
                  borderRadius: "20px",
                  display: "inline-block",
                  letterSpacing: "0.5px"
                }}>
                  반려동물 방문 탁묘 및 요양보호 & 회복 케어 전문
                </span>
                <h2 style={{
                  fontSize: "2.4rem",
                  fontWeight: "800",
                  color: "var(--text-main)",
                  marginTop: "16px",
                  marginBottom: "12px"
                }}>
                  윤교품애
                </h2>
                <p style={{
                  fontSize: "1.25rem",
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
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "32px",
                marginBottom: "48px"
              }}>
                {/* 브랜드 스토리 카드 */}
                <div className="premium-card" style={{
                  backgroundColor: "white",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  padding: "40px 32px"
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
                <div className="premium-card" style={{
                  backgroundColor: "white",
                  padding: "40px 32px"
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
                        textAlign: "center"
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
                    lineHeight: "1.4"
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
                <div className="premium-card" style={{
                  backgroundColor: "white",
                  padding: "36px 30px"
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
                <div className="premium-card" style={{
                  backgroundColor: "white",
                  padding: "36px 30px",
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
                  const hasAccess = activeUser && (activeUser.role === "member" || activeUser.role === "vip" || activeUser.role === "admin");
                  const isLocked = post.is_restricted && !hasAccess;
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
                        aria-label={post.title}
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

      {/* ============================================================== */}
      {/* 8. PORTAL VIEW B: 📅 실시간 캘린더 예약 (보호자 채널) */}
      {/* ============================================================== */}
      <main className="animate-fade-in" style={{ flex: 1, padding: "40px 0", display: activePortal === "booking" ? "block" : "none" }}>
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
                            minHeight: "56px",
                            height: "auto",
                            padding: "6px 2px",
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
                            <span style={{ fontSize: "0.6rem", color: isSelected ? "white" : "var(--primary-orange)", marginBottom: "2px" }}>오늘</span>
                          )}
                          {/* Display reservation badge(s) */}
                          {dayObj.date && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px", width: "100%", alignItems: "center", marginTop: "2px" }}>
                              {sitterReservations
                                .filter(res => res.visit_date_string === dayObj.date.toDateString())
                                .map((res, i) => (
                                  <span key={i} style={{
                                    fontSize: "0.6rem",
                                    backgroundColor: isSelected ? "rgba(255, 255, 255, 0.25)" : "var(--primary-orange-light)",
                                    color: isSelected ? "white" : "var(--primary-orange)",
                                    padding: "1px 4px",
                                    borderRadius: "4px",
                                    fontWeight: "800",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    maxWidth: "90%",
                                    display: "block"
                                  }}>
                                    🐾 {res.pet_name}
                                  </span>
                                ))}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 시간 선택 */}
                {bookingType === "single" && selectedDate && (
                  <div className="premium-card animate-fade-in">
                    <h4 style={{ fontSize: "1rem", fontWeight: "800", marginBottom: "12px", color: "var(--text-main)" }}>
                      ⏰ 돌봄을 진행할 시간대를 골라주세요
                    </h4>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "16px" }}>
                      선택하신 날짜: <strong>{selectedDate.toLocaleDateString("ko-KR", { month: "long", day: "numeric" })}</strong>
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {TIME_SLOTS_POOL.map(slot => {
                        const isBooked = isSlotBooked(slot);
                        return (
                          <button
                            key={slot.id}
                            disabled={isBooked}
                            type="button"
                            onClick={() => setSelectedTimeSlot(slot)}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "16px 20px",
                              border: "1.5px solid var(--border-light)",
                              borderRadius: "var(--border-radius-sm)",
                              cursor: isBooked ? "not-allowed" : "pointer",
                              backgroundColor: selectedTimeSlot?.id === slot.id 
                                ? "var(--primary-orange-light)" 
                                : isBooked ? "var(--bg-primary)" : "var(--bg-secondary)",
                              borderColor: selectedTimeSlot?.id === slot.id 
                                ? "var(--primary-orange)" 
                                : "var(--border-light)",
                              color: isBooked ? "var(--text-muted)" : "var(--text-main)",
                              transition: "var(--transition-fast)"
                            }}
                          >
                            <span style={{ fontWeight: "700" }}>⏰ {slot.time}</span>
                            <span style={{
                              fontSize: "0.75rem", fontWeight: "800",
                              backgroundColor: isBooked ? "#e0e0e0" : "var(--success-mint-light)",
                              color: isBooked ? "var(--text-muted)" : "var(--success-mint)",
                              padding: "4px 10px", borderRadius: "10px"
                            }}>
                              {isBooked ? "예약 불가 ❌" : "예약 가능 🟢"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {bookingType === "single" && !selectedDate && (
                  <div className="premium-card animate-fade-in" style={{ textAlign: "center", padding: "30px 20px" }}>
                    <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", margin: 0, fontWeight: "600" }}>
                      📅 달력에서 원하시는 예약 날짜를 먼저 선택해 주세요.
                    </p>
                  </div>
                )}

                {bookingType === "multi" && (
                  <div className="premium-card animate-fade-in" style={{ backgroundColor: "var(--primary-orange-light)", border: "1.5px solid var(--primary-orange)" }}>
                    <h4 style={{ fontSize: "1rem", fontWeight: "800", marginBottom: "8px", color: "var(--primary-orange)" }}>
                      📅 여러 날 정기 신청 진행 중
                    </h4>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-main)", lineHeight: "1.5", margin: 0, fontWeight: "500" }}>
                      여러 날 예약을 신청하실 때는 개별 타임슬롯을 선택하지 않습니다. <br />
                      우측 입력 폼에서 <strong>원하시는 시작일/종료일 및 구체적인 시간대</strong>를 기재해 주시면 펫시터가 조율을 진행합니다.
                    </p>
                  </div>
                )}

              </div>

              {/* Right Column: Detail Forms */}
              <div className="premium-card" style={{ flex: "1 1 400px", display: "flex", flexDirection: "column", gap: "20px" }}>
                <h3 style={{ fontSize: "1.2rem", fontWeight: "800", borderBottom: "1.5px solid var(--border-light)", paddingBottom: "10px", margin: 0 }}>
                  📋 돌봄 예약 세부 사항 입력
                </h3>

                <form onSubmit={handleBookingSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

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
                        📅 여러 날 정기 신청
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
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "4px" }}>
                      ※ 다른 돌봄 일정이 있을 시 방문 시간이 다소 조정될 수 있습니다.
                    </div>
                    <input
                      type="text"
                      className="form-input"
                      value={bookingTimeText}
                      onChange={(e) => setBookingTimeText(e.target.value)}
                      placeholder={bookingType === "single" && selectedTimeSlot ? `선택된 시간: ${selectedTimeSlot.time} (직접 수정/추가 기입 가능)` : "예: 오후 2시 선호합니다, 또는 오전 11시 ~ 오후 1시 사이 (최대 100자)"}
                      maxLength={100}
                      required
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

                      <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.85rem", cursor: "pointer", fontWeight: "600" }}>
                        <input type="checkbox" checked={optPreMeet} onChange={(e) => setOptPreMeet(e.target.checked)} />
                        <span>사전 만남 (+10,000원)</span>
                      </label>

                      <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.85rem", cursor: "pointer", fontWeight: "600" }}>
                        <input type="checkbox" checked={optMedication} onChange={(e) => setOptMedication(e.target.checked)} />
                        <span>투약 1회 (+5,000원)</span>
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

                      <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.85rem", cursor: "pointer", fontWeight: "600" }}>
                        <input type="checkbox" checked={optTwoVisits} onChange={(e) => setOptTwoVisits(e.target.checked)} />
                        <span>1일 2회 방문 (+13,000원)</span>
                      </label>

                      <div style={{ fontSize: "0.72rem", color: "var(--warning-coral)", borderTop: "1px dashed var(--border-light)", paddingTop: "8px", marginTop: "4px" }}>
                        ※ 다묘가정 및 강아지가 함께 있는 가정의 경우 돌봄 난이도에 따라 추가요금이 발생할 수 있습니다.
                      </div>
                    </div>
                  </div>

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
                        <label className="form-label">🚪 상세 출입 방법 안내 (필수)</label>
                        <textarea
                          rows="2"
                          className="form-input"
                          value={entryMethodDetail}
                          onChange={(e) => setEntryMethodDetail(e.target.value)}
                          placeholder="예: 공동현관 호출 후 경비실 승인 필요 / 도어락 커버를 올리고 입력 등"
                          style={{ resize: "vertical", fontSize: "0.85rem" }}
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
                        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "6px" }}>
                          * 거제 기본 지역(고현, 장평, 상문, 수월, 중곡, 옥포, 아주, 사곡)은 추가금이 없으며, 그 외 지역은 <strong>추가금 +5,000원</strong>이 발생합니다.
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
                      fontSize: "0.85rem"
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
                      <span style={{ color: "var(--text-muted)" }}>기본 요금 (1일 1회 약 30분)</span>
                      <span style={{ fontWeight: "600" }}>{calculateBookingPrice().basePrice.toLocaleString()}원</span>
                    </div>

                    {isHoliday && (
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "4px", color: "var(--warning-coral)" }}>
                        <span>공휴일/명절 할증 (+5,000원)</span>
                        <span style={{ fontWeight: "600" }}>+5,000원</span>
                      </div>
                    )}

                    {optPreMeet && (
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "4px" }}>
                        <span style={{ color: "var(--text-muted)" }}>사전 만남 추가요금</span>
                        <span style={{ fontWeight: "600" }}>+10,000원</span>
                      </div>
                    )}

                    {optMedication && (
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "4px" }}>
                        <span style={{ color: "var(--text-muted)" }}>투약 1회 추가요금</span>
                        <span style={{ fontWeight: "600" }}>+5,000원</span>
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

                    {optTwoVisits && (
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "4px" }}>
                        <span style={{ color: "var(--text-muted)" }}>1일 2회 방문 추가요금</span>
                        <span style={{ fontWeight: "600" }}>+13,000원</span>
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
                        {calculateBookingPrice().totalPrice.toLocaleString()}원
                      </span>
                    </div>
                  </div>

                  {/* ===== 건강 상태 체크 섹션 ===== */}
                  <div className="form-group">
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
                        />
                      </div>

                      {(petPersonality.includes("겁이 많음") || petPersonality.includes("공격성 있음")) && (
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
                        }} className="animate-fade-in">
                          *겁이 많거나 공격성이 있는경우 아이의 스트레스를 고려 하여 기본케어(급여,물,화장실관리)만 진행될 수 있습니다
                        </div>
                      )}
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

      {/* ============================================================== */}
      {/* 9. PORTAL VIEW C: 🔒 펫시터 전용 관리 대시보드 (Admin Panel) */}
      {/* ============================================================== */}
      {activeUser && activeUser.role === "admin" && (
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
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
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
            <strong style={{ color: "white", fontSize: "1.1rem", display: "block", marginBottom: "4px" }}>윤교품애 (Yoongyopoomae) Hub</strong>
            <span style={{ fontSize: "0.8rem" }}>사용자 지정 RLS & 30초 암호 마스킹 & 캘린더 예약 스위트</span>
          </div>
          <div style={{ fontSize: "0.8rem", textAlign: "right" }}>
            <span>© 2026 윤교품애. All Rights Reserved.</span>
            <span style={{ display: "block", color: "var(--primary-orange)", marginTop: "2px", fontWeight: "600" }}>
              🔒 Supabase row-level-security & double-pass security timer standard
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
