/* eslint-disable */
"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

/**
 * 윤교품애 - 명품 이미지 업로더 컴포넌트 (Next.js & Supabase SDK 기반)
 * 
 * [동작 상세]
 * 1. 기기 갤러리/파일 탐색기 또는 Drag-and-Drop을 통해 이미지 파일을 선택합니다.
 * 2. Supabase Storage의 'post-images' 버킷에 파일을 업로드합니다.
 * 3. 업로드된 파일의 Public CDN URL을 취득합니다.
 * 4. 취득한 URL을 PostgreSQL 'post_images' 테이블에 post_id와 연동하여 INSERT 합니다.
 * 5. 업로드된 이미지를 썸네일 그리드로 렌더링하고, RLS 권한에 기반하여 삭제(Storage 파일 + DB 행 일괄 삭제)할 수 있습니다.
 * 
 * @param {Object} props
 * @param {string|number} props.postId - 연동할 블로그 포스트의 고유 ID (posts.id)
 * @param {string} props.userId - 로그인한 사용자 고유 ID (auth.uid)
 * @param {boolean} props.isOwnerOrAdmin - 현재 사용자가 포스트 작성자 본인이거나 관리자인지 여부 (삭제 버튼 제어용)
 */
export default function ImageUploader({ postId, userId, isOwnerOrAdmin }) {
  const [images, setImages] = useState([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState(null);
  
  const fileInputRef = useRef(null);

  // Toast 메시지 팝업
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // 1. 해당 포스트의 업로드된 이미지 리스트 가져오기 (Allow public read)
  const fetchImages = async () => {
    if (!postId) return;

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("post_images")
          .select("*")
          .eq("post_id", postId)
          .order("created_at", { ascending: true });

        if (error) throw error;
        setImages(data || []);
      } catch (err) {
        console.error("이미지 불러오기 실패:", err.message);
        showToast(`❌ 목록 패치 오류: ${err.message}`);
      }
    } else {
      // 데모용 가상 초기 이미지 바인딩
      const demoImages = [
        {
          id: 1001,
          post_id: postId,
          image_url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=300",
          storage_path: "demo/cat1.jpg"
        }
      ];
      setImages(demoImages);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [postId]);


  // 2. 이미지 파일 선택 및 검증
  const handleFileChange = async (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await uploadImage(files[0]);
    }
  };

  // Drag & Drop 이벤트 핸들러
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await uploadImage(files[0]);
    }
  };

  // 3. Supabase Storage & DB 일괄 업로드 핵심 로직
  const uploadImage = async (file) => {
    // 3.1 파일 유효성 검증
    if (!file.type.startsWith("image/")) {
      showToast("❌ 이미지 포맷의 파일만 업로드할 수 있습니다.");
      return;
    }

    // 파일 크기 5MB 제한
    if (file.size > 5 * 1024 * 1024) {
      showToast("❌ 5MB 이하의 이미지만 업로드 가능합니다.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    if (isSupabaseConfigured) {
      try {
        // A. 파일명 고유화 (타임스탬프와 난수 조합으로 겹침 방지)
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const storagePath = `post_${postId}/${fileName}`;

        setUploadProgress(30);

        // B. Supabase Storage 업로드 실행 (post-images 버킷 대상)
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("post-images")
          .upload(storagePath, file, {
            cacheControl: "3600",
            upsert: false
          });

        if (uploadError) throw uploadError;
        setUploadProgress(60);

        // C. Public URL 취득
        const { data: { publicUrl } } = supabase.storage
          .from("post-images")
          .getPublicUrl(storagePath);

        setUploadProgress(85);

        // D. post_images 테이블 연동 저장 (RLS: posts.user_id = auth.uid() 검증)
        const { data: dbData, error: dbError } = await supabase
          .from("post_images")
          .insert([
            {
              post_id: postId,
              image_url: publicUrl,
              // 스토리지 파일 삭제를 대비해 스토리지 상대 경로 정보를 임의의 컬럼 혹은 보관 정보로 관리 가능
            }
          ])
          .select();

        if (dbError) {
          // DB 입력 실패 시 스토리지 파일 고아 방지를 위해 롤백 제거 실행
          await supabase.storage.from("post-images").remove([storagePath]);
          throw dbError;
        }

        setUploadProgress(100);
        showToast("🎉 이미지가 성공적으로 업로드 및 등록되었습니다!");
        fetchImages();
      } catch (err) {
        console.error("업로드 중 치명적인 실패:", err);
        showToast(`❌ 업로드 실패: ${err.message}`);
      } finally {
        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
        }, 500);
      }
    } else {
      // [데모 시뮬레이션 모드]
      // 1초간 프로그레스 바 충전 시각 효과
      let progress = 10;
      const interval = setInterval(() => {
        progress += 30;
        if (progress >= 100) {
          clearInterval(interval);
          setUploadProgress(100);
          
          setTimeout(() => {
            const simulatedUrls = [
              "https://images.unsplash.com/photo-1513245543132-31f507417b26?auto=format&fit=crop&q=80&w=300",
              "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?auto=format&fit=crop&q=80&w=300",
              "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=300"
            ];
            const randomUrl = simulatedUrls[Math.floor(Math.random() * simulatedUrls.length)];

            const newImg = {
              id: Date.now(),
              post_id: postId,
              image_url: randomUrl,
              storage_path: `simulated/post_${postId}/${file.name}`
            };

            setImages(prev => [...prev, newImg]);
            setIsUploading(false);
            setUploadProgress(0);
            showToast("🎉 [데모 시뮬레이션 승인] 사진 업로드 성공!");
          }, 300);
        } else {
          setUploadProgress(progress);
        }
      }, 300);
    }
  };

  // 4. 이미지 삭제 (Storage 파일 + DB 행 일괄 삭제 - RLS 검증)
  const handleDeleteImage = async (image) => {
    if (!isOwnerOrAdmin) {
      showToast("🔒 RLS 권한 오류: 본인이 작성한 글의 사진만 삭제 가능합니다.");
      return;
    }

    if (isSupabaseConfigured) {
      try {
        // A. DB 행 삭제 수행 (post_images 테이블)
        const { error: dbError } = await supabase
          .from("post_images")
          .delete()
          .eq("id", image.id);

        if (dbError) throw dbError;

        // B. Storage 내의 실 파일 삭제 수행
        // image_url에서 파일 상대 경로 추출 (예: post_1/1234-filename.jpg)
        const urlParts = image.image_url.split("/public/post-images/");
        if (urlParts.length > 1) {
          const storagePath = urlParts[1];
          await supabase.storage.from("post-images").remove([storagePath]);
        }

        showToast("🗑️ 이미지 및 Storage 파일이 삭제 완료되었습니다.");
        fetchImages();
      } catch (err) {
        showToast(`❌ 삭제 실패: ${err.message}`);
      }
    } else {
      // 데모 모드 (가상 제거)
      setImages(prev => prev.filter(img => img.id !== image.id));
      showToast("🗑️ [데모 RLS 시뮬레이션 승인] 사진이 정상 삭제되었습니다.");
    }
  };

  return (
    <div style={{
      backgroundColor: "var(--bg-secondary)",
      padding: "24px",
      borderRadius: "var(--border-radius-md)",
      border: "1px solid var(--border-light)",
      marginTop: "20px"
    }}>
      {/* Toast Alert */}
      {toast && (
        <div className="toast-container" style={{ zIndex: 3000 }}>
          <div className="toast" style={{ backgroundColor: "var(--text-main)", color: "white" }}>
            <span style={{ marginRight: "8px" }}>📸</span>
            <span>{toast}</span>
          </div>
        </div>
      )}

      <h4 style={{ fontSize: "1rem", fontWeight: "800", color: "var(--text-main)", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
        <span>📷</span> 포스트 현장 사진 갤러리 관리
      </h4>
      <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "16px" }}>
        사진첩 갤러리에 추가할 이미지를 업로드하거나 관리하세요. (RLS: 글 작성자 또는 관리자만 사진 추가/삭제 가능)
      </p>

      {/* Drag and Drop / Pick zone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: isDragActive ? "2.5px dashed var(--primary-orange)" : "2px dashed var(--border-light)",
          backgroundColor: isDragActive ? "var(--primary-orange-light)" : "var(--bg-primary)",
          borderRadius: "var(--border-radius-sm)",
          padding: "30px 20px",
          textAlign: "center",
          cursor: "pointer",
          transition: "var(--transition-smooth)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "130px",
          position: "relative"
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          style={{ display: "none" }}
        />

        {isUploading ? (
          <div style={{ width: "100%", maxWidth: "240px", textAlign: "center" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-main)", display: "block", marginBottom: "8px" }}>
              Supabase Storage 업로드 중... ({uploadProgress}%)
            </span>
            <div style={{ width: "100%", height: "6px", backgroundColor: "var(--border-light)", borderRadius: "3px", overflow: "hidden" }}>
              <div style={{ width: `${uploadProgress}%`, height: "100%", backgroundColor: "var(--primary-orange)", transition: "width 0.2s ease" }}></div>
            </div>
          </div>
        ) : (
          <div>
            <span style={{ fontSize: "1.8rem", display: "block", marginBottom: "6px" }}>📤</span>
            <span style={{ fontSize: "0.9rem", fontWeight: "700", color: "var(--text-main)", display: "block" }}>
              기기 사진 업로드 (Click 또는 Drag & Drop)
            </span>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>
              JPG, PNG, WEBP 등 이미지 파일 (최대 5MB)
            </span>
          </div>
        )}
      </div>

      {/* Uploaded Thumbnail Grid */}
      <div style={{ marginTop: "24px" }}>
        <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--text-muted)", display: "block", marginBottom: "10px" }}>
          현재 등록된 갤러리 사진 ({images.length}장)
        </span>

        {images.length > 0 ? (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
            gap: "12px"
          }}>
            {images.map((img) => (
              <div
                key={img.id}
                style={{
                  position: "relative",
                  width: "100%",
                  height: "80px",
                  borderRadius: "var(--border-radius-sm)",
                  overflow: "hidden",
                  border: "1px solid var(--border-light)",
                  group: "true"
                }}
              >
                <img
                  src={img.image_url}
                  alt="Care Gallery"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                
                {/* Delete Hover Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteImage(img);
                  }}
                  style={{
                    position: "absolute",
                    top: "4px",
                    right: "4px",
                    backgroundColor: "rgba(244, 67, 54, 0.9)",
                    border: "none",
                    color: "white",
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    fontSize: "0.65rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "var(--transition-fast)"
                  }}
                  title="사진 삭제"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            padding: "16px",
            textAlign: "center",
            backgroundColor: "var(--bg-primary)",
            borderRadius: "var(--border-radius-sm)",
            border: "1px solid var(--border-light)",
            fontSize: "0.8rem",
            color: "var(--text-muted)",
            fontStyle: "italic"
          }}>
            현재 이 포스트에 등록된 사진이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
