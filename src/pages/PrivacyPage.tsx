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
          <h2 className="text-lg font-bold mb-2">0. 운영자 정보</h2>
          <ul className="text-small text-muted-foreground leading-relaxed list-disc pl-5 space-y-1">
            <li><strong className="text-foreground">서비스명:</strong> PPURI (뿌리)</li>
            <li><strong className="text-foreground">운영 형태:</strong> 개인 개발자 운영</li>
            <li><strong className="text-foreground">개인정보 보호책임자 / 문의:</strong> support@ppuri.app</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">1. 수집하는 개인정보 항목</h2>
          <p className="text-small text-muted-foreground leading-relaxed mb-2">
            서비스 제공을 위해 아래 항목을 수집·저장합니다.
          </p>
          <ul className="text-small text-muted-foreground leading-relaxed list-disc pl-5 space-y-1">
            <li><strong className="text-foreground">회원가입(필수):</strong> 이메일 주소, 비밀번호(단방향 암호화 저장)</li>
            <li><strong className="text-foreground">프로필(선택):</strong> 닉네임(display_name), 동의 일시 및 약관·개인정보 버전</li>
            <li><strong className="text-foreground">학습 기록:</strong> 작성한 문장(question_text, answer_text, question_type), 작성 일시, 마지막 학습일, 누적 문장 수, 현재 레벨, 연속 학습일(스트릭)</li>
            <li><strong className="text-foreground">보유 종목(선택):</strong> 티커, 한글 종목명, 추가 일시, 활성 여부</li>
            <li><strong className="text-foreground">위기 시뮬레이션 결과:</strong> 시나리오 ID/제목, 단계별 점수, 총점, 완료 일시</li>
            <li><strong className="text-foreground">결제·구독 정보:</strong> 구독 플랜, 시작·갱신일, Stripe 고객 ID(유료 결제 시에만)</li>
            <li><strong className="text-foreground">자동 수집:</strong> 접속 IP, 접속 일시, 브라우저·기기 정보(User-Agent), 쿠키·세션 토큰, 인증 로그(로그인 성공/실패), 서비스 이용 로그</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">2. 수집·이용 목적</h2>
          <ul className="text-small text-muted-foreground leading-relaxed list-disc pl-5 space-y-1">
            <li>회원 식별, 로그인 및 본인 확인</li>
            <li>학습 기록 저장 및 진도·스트릭 관리</li>
            <li>보유 종목 기반 맞춤 학습 콘텐츠 제공</li>
            <li>위기 시뮬레이션 결과 저장 및 복기</li>
            <li>유료 구독 결제 처리 및 청구</li>
            <li>서비스 안정성 확보, 부정 이용 방지, 보안 사고 대응</li>
            <li>서비스 개선을 위한 통계 분석(개인 식별 불가 형태)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">3. 보유 및 이용 기간</h2>
          <p className="text-small text-muted-foreground leading-relaxed mb-2">
            회원 탈퇴 또는 수집·이용 목적 달성 시 개인정보를 지체 없이 파기합니다. 다만, 아래 관련 법령에 따라 일정 기간 보관해야 하는 정보는 해당 기간 동안 분리 보관 후 파기합니다.
          </p>
          <ul className="text-small text-muted-foreground leading-relaxed list-disc pl-5 space-y-1">
            <li><strong className="text-foreground">계약 또는 청약철회 등에 관한 기록:</strong> 5년 (전자상거래법)</li>
            <li><strong className="text-foreground">대금결제 및 재화 등의 공급에 관한 기록:</strong> 5년 (전자상거래법)</li>
            <li><strong className="text-foreground">소비자의 불만 또는 분쟁처리에 관한 기록:</strong> 3년 (전자상거래법)</li>
            <li><strong className="text-foreground">표시·광고에 관한 기록:</strong> 6개월 (전자상거래법)</li>
            <li><strong className="text-foreground">웹사이트 방문 기록(로그·접속 IP):</strong> 3개월 (통신비밀보호법)</li>
          </ul>
          <p className="text-small text-muted-foreground leading-relaxed mt-2">
            서비스 내부적으로 삭제 요청된 학습·종목 데이터는 복구 오남용 방지를 위해 최대 30일간 소프트 삭제 상태로 보관 후 영구 파기됩니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">4. 제3자 제공</h2>
          <p className="text-small text-muted-foreground leading-relaxed">
            서비스는 이용자의 개인정보를 <strong className="text-foreground">외부에 제공하지 않습니다</strong>. 단, 법령에 의한 수사기관·감독기관의 적법한 요청이 있는 경우에 한해 제공할 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">5. 처리 위탁 (국외 이전 포함)</h2>
          <p className="text-small text-muted-foreground leading-relaxed">
            안정적인 서비스 제공을 위해 아래 업체에 데이터 처리를 위탁하며, 데이터는 미국에 위치한 서버에 저장될 수 있습니다.
          </p>
          <ul className="text-small text-muted-foreground leading-relaxed list-disc pl-5 space-y-1 mt-2">
            <li><strong className="text-foreground">Supabase Inc. (미국):</strong> 데이터베이스, 인증, 파일 저장 — 회원·학습·종목 데이터</li>
            <li><strong className="text-foreground">Lovable Cloud (미국):</strong> 애플리케이션 호스팅 및 백엔드 함수 실행</li>
            <li><strong className="text-foreground">Stripe Inc. (미국):</strong> 결제 처리 — 결제 수단·청구 정보 (유료 구독 시에만)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">6. 이용자의 권리와 행사 방법</h2>
          <p className="text-small text-muted-foreground leading-relaxed">
            이용자는 언제든지 본인의 개인정보 열람·수정·삭제·처리정지를 요구할 수 있습니다. 앱 내 설정 페이지에서 직접 수정하거나 계정을 삭제할 수 있으며, 추가 문의는 <strong className="text-foreground">support@ppuri.app</strong>으로 연락 주세요.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">7. 안전성 확보 조치</h2>
          <ul className="text-small text-muted-foreground leading-relaxed list-disc pl-5 space-y-1">
            <li>비밀번호는 단방향 암호화(해시)되어 저장됩니다.</li>
            <li>모든 통신은 HTTPS(TLS)로 암호화됩니다.</li>
            <li>유출된 비밀번호 차단(HIBP) 기능이 적용되어 있습니다.</li>
            <li>본인의 데이터에만 접근할 수 있도록 행 단위 권한 분리(RLS)가 적용되어 있습니다.</li>
            <li>관리자 권한 접근 및 주요 변경 사항은 로그로 기록됩니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">8. 쿠키 및 자동 수집 정보</h2>
          <p className="text-small text-muted-foreground leading-relaxed">
            로그인 상태 유지와 보안을 위해 인증 토큰을 쿠키·로컬 스토리지에 저장합니다. 브라우저 설정에서 쿠키 저장을 거부할 수 있으나, 이 경우 일부 기능 이용이 제한될 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">9. 만 14세 미만 아동</h2>
          <p className="text-small text-muted-foreground leading-relaxed">
            서비스는 만 14세 이상부터 가입할 수 있으며, 만 14세 미만 아동의 개인정보는 수집하지 않습니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">10. 처리방침의 변경</h2>
          <p className="text-small text-muted-foreground leading-relaxed">
            본 처리방침이 변경되는 경우 시행일 최소 7일 전 앱 내 공지를 통해 알려드립니다. 중요한 변경 사항이 있는 경우 30일 전 고지합니다.
          </p>
        </section>

        <p className="text-xs text-muted-foreground pt-4 border-t border-border">
          시행일: 2026년 4월 28일 · 문의: support@ppuri.app
        </p>
      </main>
    </div>
  );
}
