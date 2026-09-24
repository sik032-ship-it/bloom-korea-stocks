// 종목 검색 목록 — 나스닥 100 전 종목 + 한국 투자자가 많이 보는 대표 종목
export interface StockItem { ticker: string; name: string; nasdaq100?: boolean }

const NDX: [string, string][] = [
  ["AAPL","애플"],["MSFT","마이크로소프트"],["GOOGL","구글(알파벳 A)"],["GOOG","구글(알파벳 C)"],["AMZN","아마존"],
  ["NVDA","엔비디아"],["META","메타"],["TSLA","테슬라"],["AVGO","브로드컴"],["COST","코스트코"],
  ["NFLX","넷플릭스"],["PEP","펩시코"],["ADBE","어도비"],["CSCO","시스코"],["TMUS","T-모바일"],
  ["AMD","AMD"],["INTC","인텔"],["QCOM","퀄컴"],["TXN","텍사스인스트루먼트"],["AMGN","암젠"],
  ["INTU","인튜이트"],["ISRG","인튜이티브서지컬"],["HON","허니웰"],["CMCSA","컴캐스트"],["BKNG","부킹홀딩스"],
  ["AMAT","어플라이드머티리얼즈"],["ADP","ADP"],["SBUX","스타벅스"],["GILD","길리어드"],["VRTX","버텍스"],
  ["MDLZ","몬델리즈"],["ADI","아날로그디바이스"],["REGN","리제네론"],["LRCX","램리서치"],["PANW","팔로알토네트웍스"],
  ["MU","마이크론"],["KLAC","KLA"],["SNPS","시놉시스"],["CDNS","케이던스"],["PYPL","페이팔"],
  ["MELI","메르카도리브레"],["ASML","ASML"],["MAR","메리어트"],["ORLY","오라일리오토모티브"],["CTAS","신타스"],
  ["CSX","CSX"],["MRVL","마벨테크놀로지"],["ABNB","에어비앤비"],["CRWD","크라우드스트라이크"],["FTNT","포티넷"],
  ["NXPI","NXP반도체"],["WDAY","워크데이"],["PCAR","팩카"],["MNST","몬스터베버리지"],["ROP","로퍼테크놀로지스"],
  ["CPRT","코파트"],["PAYX","페이첵스"],["AEP","아메리칸일렉트릭파워"],["ODFL","올드도미니언"],["ROST","로스스토어"],
  ["KDP","큐리그닥터페퍼"],["FAST","패스널"],["DASH","도어대시"],["EA","일렉트로닉아츠"],["CHTR","차터커뮤니케이션"],
  ["KHC","크래프트하인즈"],["EXC","엑셀론"],["VRSK","베리스크"],["CTSH","코그니전트"],["GEHC","GE헬스케어"],
  ["LULU","룰루레몬"],["XEL","엑셀에너지"],["IDXX","아이덱스"],["BKR","베이커휴즈"],["CCEP","코카콜라유로퍼시픽"],
  ["TTWO","테이크투"],["DDOG","데이터독"],["FANG","다이아몬드백에너지"],["ANSS","앤시스"],["CSGP","코스타그룹"],
  ["ON","온세미"],["ZS","지스케일러"],["TEAM","아틀라시안"],["DXCM","덱스콤"],["BIIB","바이오젠"],
  ["CDW","CDW"],["MCHP","마이크로칩"],["GFS","글로벌파운드리"],["ILMN","일루미나"],["WBD","워너브라더스디스커버리"],
  ["MDB","몽고DB"],["ARM","ARM홀딩스"],["MRNA","모더나"],["SMCI","슈퍼마이크로"],["PDD","PDD(테무)"],
  ["LIN","린데"],["AZN","아스트라제네카"],["PLTR","팔란티어"],["APP","앱러빈"],["MSTR","마이크로스트래티지"],
  ["AXON","액손"],["SHOP","쇼피파이"],["TRI","톰슨로이터"],["ADSK","오토데스크"],["CEG","컨스텔레이션에너지"],
  ["DLTR","달러트리"],["EBAY","이베이"],["KVUE","켄뷰"],["HOOD","로빈후드"],
];

const OTHERS: [string, string][] = [
  ["DIS","디즈니"],["JPM","JP모건"],["V","비자"],["MA","마스터카드"],["COIN","코인베이스"],["SOFI","소파이"],
  ["SNOW","스노우플레이크"],["CRM","세일즈포스"],["UBER","우버"],["XYZ","블록(스퀘어)"],["TSM","TSMC"],["BABA","알리바바"],
  ["JNJ","존슨앤존슨"],["PG","P&G"],["KO","코카콜라"],["WMT","월마트"],["HD","홈디포"],["MCD","맥도날드"],
  ["NKE","나이키"],["BA","보잉"],["GS","골드만삭스"],["MS","모건스탠리"],["BRK.B","버크셔해서웨이"],["XOM","엑슨모빌"],
  ["CVX","셰브론"],["LLY","일라이릴리"],["UNH","유나이티드헬스"],["PFE","화이자"],["ABBV","애브비"],["MRK","머크"],
  ["TMO","써모피셔"],["ABT","애보트"],["ORCL","오라클"],["IBM","IBM"],["NOW","서비스나우"],["SPGI","S&P글로벌"],
];

export const STOCK_LIST: StockItem[] = [
  ...NDX.map(([ticker, name]) => ({ ticker, name, nasdaq100: true })),
  ...OTHERS.map(([ticker, name]) => ({ ticker, name })),
];

export function searchStocks(q: string, exclude: Set<string>, limit = 20): StockItem[] {
  const s = q.trim().toLowerCase().replace(/\s/g, "");
  const list = STOCK_LIST.filter((x) => !exclude.has(x.ticker));
  if (!s) return list.slice(0, limit);
  const score = (x: StockItem) => {
    const t = x.ticker.toLowerCase(), n = x.name.toLowerCase().replace(/\s/g, "");
    if (t === s) return 0; if (t.startsWith(s)) return 1; if (n.startsWith(s)) return 2;
    if (n.includes(s)) return 3; if (t.includes(s)) return 4; return 9;
  };
  return list.map((x) => [x, score(x)] as const).filter(([, v]) => v < 9).sort((a, b) => a[1] - b[1]).slice(0, limit).map(([x]) => x);
}

export const TICKER_RE = /^[A-Z0-9.\-]{1,10}$/;
