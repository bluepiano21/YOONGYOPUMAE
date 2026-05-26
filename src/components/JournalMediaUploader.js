/* eslint-disable */
"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

/**
 * 윤교품애 - 명품 돌봄일지 미디어(사진/동영상) 업로더 컴포넌트
 * 
 * @param {Object} props
 * @param {string|number} props.reservationId - 연동할 예약 ID
 * @param {Array<string>} props.value - 업로드된 미디어 URL 리스트 (외부 state 바인딩)
 * @param {Function} props.onChange - 미디어 리스트 변경 콜백 함수 (urls => {})
 */
export default function JournalMediaUploader({ reservationId, value = [], onChange }) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState(null);
  
  const fileInputRef = useRef(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // 파일 선택 처리
  const handleFileChange = async (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await uploadMediaFile(files[0]);
    }
  };

  // Drag & Drop
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
      await uploadMediaFile(files[0]);
    }
  };

  // 미디어 업로드 핵심 로직
  const uploadMediaFile = async (file) => {
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      showToast("❌ 사진 또는 동영상 파일만 업로드할 수 있습니다.");
      return;
    }

    // 용량 제한 (사진: 5MB, 동영상: 15MB)
    const limit = isVideo ? 15 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > limit) {
      showToast(`❌ 용량 초과: ${isVideo ? "동영상은 15MB" : "사진은 5MB"} 이하만 가능합니다.`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    if (isSupabaseConfigured) {
      try {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const storagePath = `journal_${reservationId}/${fileName}`;

        setUploadProgress(30);

        // Supabase Storage 업로드 (post-images 버킷 재사용)
        const { data, error } = await supabase.storage
          .from("post-images")
          .upload(storagePath, file, {
            cacheControl: "3600",
            upsert: false
          });

        if (error) throw error;
        setUploadProgress(70);

        // Public URL 획득
        const { data: { publicUrl } } = supabase.storage
          .from("post-images")
          .getPublicUrl(storagePath);

        setUploadProgress(100);
        showToast("🎉 미디어가 성공적으로 첨부되었습니다!");
        
        // 상위 state 업데이트
        onChange([...value, publicUrl]);
      } catch (err) {
        console.error("미디어 업로드 실패:", err);
        showToast(`❌ 업로드 실패: ${err.message}`);
      } finally {
        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
        }, 500);
      }
    } else {
      // 데모 모드 시뮬레이션
      let progress = 10;
      const interval = setInterval(() => {
        progress += 30;
        if (progress >= 100) {
          clearInterval(interval);
          setUploadProgress(100);
          
          setTimeout(() => {
            // 데모용 샘플 이미지 / 비디오 URL 매칭
            const demoUrls = isImage ? [
              "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=300",
              "https://images.unsplash.com/photo-1513245543132-31f507417b26?auto=format&fit=crop&q=80&w=300",
              "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?auto=format&fit=crop&q=80&w=300"
            ] : [
              "https://www.w3schools.com/html/mov_bbb.mp4",
              "https://www.w3schools.com/html/movie.mp4"
            ];
            
            const randomUrl = demoUrls[Math.floor(Math.random() * demoUrls.length)];
            
            setIsUploading(false);
            setUploadProgress(0);
            showToast("🎉 [데모 시뮬레이션] 미디어 첨부 완료!");
            onChange([...value, randomUrl]);
          }, 300);
        } else {
          setUploadProgress(progress);
        }
      }, 300);
    }
  };

  // 첨부 미디어 삭제
  const handleDeleteMedia = async (urlToDelete) => {
    if (isSupabaseConfigured) {
      try {
        const urlParts = urlToDelete.split("/public/post-images/");
        if (urlParts.length > 1) {
          const storagePath = urlParts[1];
          await supabase.storage.from("post-images").remove([storagePath]);
        }
      } catch (err) {
        console.error("Storage 삭제 에러:", err);
      }
    }
    onChange(value.filter(url => url !== urlToDelete));
    showToast("🗑️ 첨부 파일이 제거되었습니다.");
  };

  return (
    <div style={{
      backgroundColor: "var(--bg-secondary)",
      padding: "20px",
      borderRadius: "var(--border-radius-md)",
      border: "1.5px solid var(--border-light)",
      marginTop: "12px",
      marginBottom: "12px"
    }}>
      {toast && (
        <div className="toast-container" style={{ zIndex: 3000 }}>
          <div className="toast" style={{ backgroundColor: "var(--text-main)", color: "white" }}>
            <span style={{ marginRight: "8px" }}>📁</span>
            <span>{toast}</span>
          </div>
        </div>
      )}

      <label className="form-label" style={{ fontSize: "0.85rem", fontWeight: "800", color: "var(--text-main)", display: "block", marginBottom: "8px" }}>
        📸 돌봄 현장 사진 및 동영상 첨부 (필수/선택)
      </label>

      {/* Drop/Click Zone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: isDragActive ? "2px dashed var(--primary-orange)" : "1.5px dashed var(--border-light)",
          backgroundColor: isDragActive ? "var(--primary-orange-light)" : "white",
          borderRadius: "8px",
          padding: "20px",
          textAlign: "center",
          cursor: "pointer",
          transition: "var(--transition-smooth)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100px"
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*,video/*"
          style={{ display: "none" }}
        />

        {isUploading ? (
          <div style={{ width: "100%", maxWidth: "200px" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--text-main)", display: "block", marginBottom: "4px" }}>
              업로드 중... ({uploadProgress}%)
            </span>
            <div style={{ width: "100%", height: "4px", backgroundColor: "var(--border-light)", borderRadius: "2px", overflow: "hidden" }}>
              <div style={{ width: `${uploadProgress}%`, height: "100%", backgroundColor: "var(--primary-orange)", transition: "width 0.2s ease" }}></div>
            </div>
          </div>
        ) : (
          <div>
            <span style={{ fontSize: "1.5rem", display: "block", marginBottom: "4px" }}>📤</span>
            <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--text-main)", display: "block" }}>
              사진 / 동영상 추가하기 (클릭 또는 끌어놓기)
            </span>
            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "2px", display: "block" }}>
              이미지(최대 5MB), 동영상(최대 15MB)
            </span>
          </div>
        )}
      </div>

      {/* Thumbnails grid */}
      {value.length > 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
          gap: "10px",
          marginTop: "16px"
        }}>
          {value.map((url, idx) => {
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
                    muted
                    preload="metadata"
                  />
                ) : (
                  <img
                    src={url}
                    alt="첨부파일"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                )}

                {/* Video Play Icon Indicator */}
                {isVideo && (
                  <div style={{
                    position: "absolute",
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

                {/* Remove button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteMedia(url);
                  }}
                  style={{
                    position: "absolute",
                    top: "3px",
                    right: "3px",
                    backgroundColor: "rgba(244, 67, 54, 0.9)",
                    border: "none",
                    color: "white",
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    fontSize: "0.6rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                  title="제거"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
