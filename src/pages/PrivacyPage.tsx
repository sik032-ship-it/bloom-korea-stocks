import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

export default function PrivacyPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 bg-background border-b border-border z-10">
        <div className="max-w-lg mx-auto px-5 h-14 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 rounded-lg hover:bg-muted transition-colors">
            <ChevronLeft size={24} className="text-foreground" />
          </button>
          <h1 className="text-body font-bold text-foreground">개인정보 처리방침</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-5 py-6 space-y-6 text-foreground">
        <section>
          <h2 className="text-lg font-bold mb-2">1. 수집하는 개인정보</h2>
          <ul className="text-small text-muted-foreground leading-relaxed list-disc pl-5 space-y-1">
            <li><strong className="text-foreground">필수:</strong> 이메일, 비밀번호(암호화 저장), 닉네임</li>
            <li><strong className="text-foreground">자동 수집:</strong> 접속 일시, 학습 기록, 작성한 문장</li>
            <li><strong className="text-foreground">선택:</strong> 보유 종목 정보 (사용자가 직접 입력)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">2. 수집·이용 목적</h2>
          <ul className="text-small text-muted-foreground leading-relaxed list-disc pl-5 space-y-1">
            <li>회원 식별 및 로그인</li>
            <li>학습 기록 저장 및 진도 관리</li>
            <li>맞춤형 콘텐츠 제공</li>
            <li>서비스 개선 및 통계 분석</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">3. 보관 기간</h2>
          <p className="text-small text-muted-foreground leading-relaxed">
            회원 탈퇴 시 모든 개인정보는 <strong className="text-foreground">즉시 삭제</strong>됩니다. 단, 관련 법령에 의해 보관이 필요한 경우 해당 기간 동안 보관 후 삭제합니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">4. 제3자 제공</h2>
          <p className="text-small text-muted-foreground leading-relaxed">
            서비스는 이용자의 개인정보를 <strong className="text-foreground">외부에 제공하지 않습니다</strong>. 단, 법령에 의한 요청이 있는 경우는 예외로 합니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">5. 처리 위탁</h2>
          <p className="text-small text-muted-foreground leading-relaxed">
            안정적인 서비스 제공을 위해 다음 업체에 데이터 처리를 위탁합니다:
          </p>
          <ul className="text-small text-muted-foreground leading-relaxed list-disc pl-5 space-y-1 mt-2">
            <li>Supabase (데이터베이스 및 인증) — 미국</li>
            <li>Lovable Cloud (호스팅) — 미국</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">6. 이용자의 권리</h2>
          <p className="text-small text-muted-foreground leading-relaxed">
            이용자는 언제든지 본인의 개인정보를 열람, 수정, 삭제할 수 있습니다. 설정 페이지에서 계정 삭제 시 모든 데이터가 즉시 파기됩니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">7. 안전성 확보 조치</h2>
          <ul className="text-small text-muted-foreground leading-relaxed list-disc pl-5 space-y-1">
            <li>비밀번호는 단방향 암호화되어 저장돼요.</li>
            <li>모든 통신은 HTTPS로 암호화돼요.</li>
            <li>본인의 데이터에만 접근할 수 있도록 권한이 분리돼 있어요 (RLS).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">8. 만 14세 미만 아동</h2>
          <p className="text-small text-muted-foreground leading-relaxed">
            서비스는 만 14세 이상부터 가입할 수 있으며, 만 14세 미만 아동의 개인정보는 수집하지 않습니다.
          </p>
        </section>

        <p className="text-xs text-muted-foreground pt-4 border-t border-border">
          시행일: 2026년 4월 20일 · 문의: privacy@ppuri.app
        </p>
      </main>
    </div>
  );
}
