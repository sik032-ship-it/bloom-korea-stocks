import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

export default function TermsPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 bg-background border-b border-border z-10">
        <div className="max-w-lg mx-auto px-5 h-14 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 rounded-lg hover:bg-muted transition-colors">
            <ChevronLeft size={24} className="text-foreground" />
          </button>
          <h1 className="text-body font-bold text-foreground">이용약관</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-5 py-6 space-y-6 text-foreground">
        <section>
          <h2 className="text-lg font-bold mb-2">제1조 (목적)</h2>
          <p className="text-small text-muted-foreground leading-relaxed">
            본 약관은 PPURI(이하 "서비스")가 제공하는 모든 서비스의 이용 조건 및 절차, 이용자와 서비스 간의 권리, 의무 및 책임 사항을 규정합니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">제2조 (서비스 내용)</h2>
          <p className="text-small text-muted-foreground leading-relaxed">
            서비스는 행동경제학 기반의 투자 학습 콘텐츠, 일일 문장 작성, 위기 시뮬레이션, 학습 기록 보관 등의 기능을 제공합니다. 본 서비스는 투자 자문이나 금융 상품 추천이 아니며, 교육 목적으로만 제공됩니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">제3조 (회원가입)</h2>
          <ul className="text-small text-muted-foreground leading-relaxed list-disc pl-5 space-y-1">
            <li>만 14세 이상부터 가입할 수 있어요.</li>
            <li>가입 시 정확한 정보를 제공해야 해요.</li>
            <li>타인의 정보를 도용하면 서비스 이용이 제한될 수 있어요.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">제4조 (이용자의 의무)</h2>
          <ul className="text-small text-muted-foreground leading-relaxed list-disc pl-5 space-y-1">
            <li>타인을 비방하거나 명예를 훼손하는 내용을 작성하지 않아요.</li>
            <li>서비스 운영을 방해하는 행위를 하지 않아요.</li>
            <li>저작권 등 타인의 권리를 침해하지 않아요.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">제5조 (투자 책임의 한계)</h2>
          <p className="text-small text-muted-foreground leading-relaxed">
            본 서비스에서 제공하는 모든 콘텐츠는 교육 및 정보 제공 목적이며, 특정 종목의 매수·매도 추천이 아닙니다. 모든 투자 결정과 그에 따른 손익은 이용자 본인에게 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">제6조 (계정 해지)</h2>
          <p className="text-small text-muted-foreground leading-relaxed">
            이용자는 언제든지 설정 페이지에서 계정을 삭제할 수 있어요. 해지 시 작성한 모든 데이터는 즉시 삭제됩니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">제7조 (약관의 변경)</h2>
          <p className="text-small text-muted-foreground leading-relaxed">
            서비스는 필요 시 약관을 변경할 수 있으며, 변경 시 앱 내 공지를 통해 7일 전 알려드립니다.
          </p>
        </section>

        <p className="text-xs text-muted-foreground pt-4 border-t border-border">
          시행일: 2026년 4월 20일
        </p>
      </main>
    </div>
  );
}
