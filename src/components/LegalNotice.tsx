import { Link } from "react-router-dom";

/** 모든 화면 하단에 노출되는 법적 고지 (투자자문 아님 · 상표 · 인용 안내) */
export function LegalNotice() {
  return (
    <footer className="pt-4 mt-2 border-t border-border text-xs leading-relaxed text-muted-foreground space-y-1">
      <p>
        본 서비스는 교육 목적이며 투자 자문이나 권유가 아닙니다. 모든 투자의 책임과 손익은 투자자 본인에게 귀속됩니다.
        과거 수익률은 미래 수익을 보장하지 않습니다.
      </p>
      <p>
        표시된 기업명·로고·상표는 각 기업의 자산이며 식별 목적으로만 사용됩니다. 투자자 인용은 공개 발언의 요지를 쉽게 풀어쓴 것으로, 해당 인물은 본 서비스와 관련이 없습니다.
      </p>
      <p>
        <Link to="/terms" className="underline underline-offset-2">이용약관</Link>
        {" · "}
        <Link to="/privacy" className="underline underline-offset-2">개인정보 처리방침</Link>
      </p>
    </footer>
  );
}
