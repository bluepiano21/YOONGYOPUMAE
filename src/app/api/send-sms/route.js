import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { to, petName, visitTime, totalPrice } = await request.json();

    if (!to || !petName || !visitTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const apiKey = process.env.COOLSMS_API_KEY;
    const apiSecret = process.env.COOLSMS_API_SECRET;
    const senderNumber = process.env.COOLSMS_SENDER_NUMBER;

    if (!apiKey || !apiSecret || !senderNumber) {
      console.log("CoolSMS 환경변수가 설정되지 않아 시뮬레이션 모드로 처리합니다.");
      return NextResponse.json({ 
        success: true, 
        simulated: true,
        message: "CoolSMS 환경변수 미설정으로 인한 시뮬레이션 발송 성공" 
      });
    }

    // Dynamic import to prevent compilation crash if library is not installed yet
    let coolsms;
    try {
      coolsms = (await import("coolsms-node-sdk")).default;
    } catch (e) {
      console.warn("coolsms-node-sdk is not installed. Run 'npm install coolsms-node-sdk' to activate.", e);
      return NextResponse.json({
        success: true,
        simulated: true,
        message: "coolsms-node-sdk 패키지가 설치되지 않아 시뮬레이션 발송 처리되었습니다."
      });
    }

    const messageService = new coolsms({
      apiKey,
      apiSecret
    });

    const smsText = `[윤교품애 예약 접수 안내]
안녕하세요, 보호자님! 반려동물 돌봄 예약이 정상 접수되었습니다.
🐾 돌봄 아이: ${petName}
📅 예약 일정: ${visitTime}
💰 송금 금액: ${(totalPrice || 17000).toLocaleString()}원
🏦 입금 계좌: 카카오뱅크 3333-05-0634796 전윤교
* 입금 확인 후 1시간 이내에 예약이 최종 확정됩니다. 감사합니다. ✨`;

    const cleanTo = to.replace(/[^0-9]/g, "");

    const response = await messageService.sendOne({
      to: cleanTo,
      from: senderNumber.replace(/[^0-9]/g, ""),
      text: smsText
    });

    return NextResponse.json({ success: true, response });
  } catch (error) {
    console.error("SMS sending error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
