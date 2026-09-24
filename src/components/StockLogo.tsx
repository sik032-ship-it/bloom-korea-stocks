import { useState } from "react";

// 실제 기업 로고 — "종목 코드"가 아니라 "기업의 한 조각"을 산다는 것을 보여주기 위해
const logoUrl = (ticker: string) =>
  `https://financialmodelingprep.com/image-stock/${encodeURIComponent(ticker.replace(".", "-").toUpperCase())}.png`;

const SIZES = { xs: "w-5 h-5 rounded-md text-[8px]", sm: "w-8 h-8 rounded-lg text-[10px]", md: "w-11 h-11 rounded-xl text-xs", lg: "w-14 h-14 rounded-2xl text-sm" };

export function StockLogo({ ticker, name, size = "md", className = "" }: { ticker: string; name?: string; size?: keyof typeof SIZES; className?: string }) {
  const [failed, setFailed] = useState(false);
  const box = `${SIZES[size]} shrink-0 overflow-hidden border border-border bg-card flex items-center justify-center ${className}`;
  if (failed) {
    return <span className={`${box} bg-primary/10 text-primary font-extrabold`} aria-hidden>{(name || ticker).slice(0, 2)}</span>;
  }
  return (
    <span className={box}>
      <img src={logoUrl(ticker)} alt={`${name || ticker} 로고`} loading="lazy" className="w-full h-full object-contain p-1" onError={() => setFailed(true)} />
    </span>
  );
}
