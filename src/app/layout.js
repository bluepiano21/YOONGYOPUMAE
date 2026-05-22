import "./globals.css";

export const metadata = {
  title: "윤교품애 | 펫시터 예약 및 고객 관리 서비스",
  description: "보안이 강화된 고객 정보 관리와 실수를 예방하는 알림 시스템, AI 반자동 돌봄 일지 시스템을 갖춘 전문 펫시터용 통합 관리 솔루션",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
