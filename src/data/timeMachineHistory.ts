// PPURI 앵커 4개 기업 — 연도별 실제 기록 (타임머신용)
// 주가: 각 연도 마지막 거래일 종가, 이후 모든 주식분할 반영(배당 재투자 제외).
//   분할: AAPL 7:1(2014)·4:1(2020) / AMZN 20:1(2022) / GOOGL 2:1(2014)·20:1(2022) / MSFT 2006년 이후 분할 없음
// 매출·순이익: 각 사 연차보고서(10-K) 회계연도 기준. MSFT는 6월 결산, AAPL은 9월 결산.
// 리더: 해당 연도 말 기준 CEO/이사회 의장.
// 출처: 각 사 10-K, Macrotrends·Yahoo Finance 분할조정 종가. 마지막 정리: 2026-10.
// ⚠ 수치는 공개 자료 기반 정리치이며 소수점 반올림 차이가 있을 수 있음. 분기마다 재검증.

import aaplIcon from "@/assets/tm-aapl.png";
import amznIcon from "@/assets/tm-amzn.png";
import msftIcon from "@/assets/tm-msft.png";
import googlIcon from "@/assets/tm-googl.png";

export interface YearStop {
  year: number;
  close: number;      // 연말 종가 (분할조정 USD)
}
export interface Milestone {
  year: number;
  revenue: string;    // 해당 회계연도 매출
  netIncome: string;  // 해당 회계연도 순이익
  leader: string;     // CEO · 의장
  story: string;      // 그 해 사람들이 보던 풍경
}
export interface TimeMachineCompany {
  ticker: string;
  company: string;
  icon: string;
  closes: YearStop[];
  milestones: Milestone[];
}

const s = (pairs: [number, number][]): YearStop[] => pairs.map(([year, close]) => ({ year, close }));

export const TIME_MACHINE: TimeMachineCompany[] = [
  {
    ticker: "MSFT", company: "마이크로소프트", icon: msftIcon,
    closes: s([[2006, 29.86], [2007, 35.6], [2008, 19.44], [2009, 30.48], [2010, 27.91], [2011, 25.96], [2012, 26.71], [2013, 37.41], [2014, 46.45], [2015, 55.48], [2016, 62.14], [2017, 85.54], [2018, 101.57], [2019, 157.7], [2020, 222.42], [2021, 336.32], [2022, 239.82], [2023, 376.04], [2024, 421.5]]),
    milestones: [
      { year: 2006, revenue: "443억 달러", netIncome: "126억 달러", leader: "CEO 스티브 발머 · 의장 빌 게이츠", story: "윈도우·오피스로 돈은 잘 벌지만 '성장이 멈춘 회사'라는 평가가 많았어요." },
      { year: 2008, revenue: "604억 달러", netIncome: "177억 달러", leader: "CEO 스티브 발머 · 의장 빌 게이츠", story: "금융위기로 주가가 1년 새 절반 가까이 떨어졌어요. 그래도 회사는 흑자였어요." },
      { year: 2014, revenue: "868억 달러", netIncome: "221억 달러", leader: "CEO 사티아 나델라 · 의장 존 톰슨", story: "새 CEO 나델라가 '모바일 퍼스트, 클라우드 퍼스트'를 선언했어요." },
      { year: 2016, revenue: "853억 달러", netIncome: "168억 달러", leader: "CEO 사티아 나델라 · 의장 존 톰슨", story: "애저 클라우드가 빠르게 크고, 링크드인 인수를 발표했어요." },
      { year: 2020, revenue: "1,430억 달러", netIncome: "443억 달러", leader: "CEO 사티아 나델라 · 의장 존 톰슨", story: "재택근무로 팀즈·클라우드 수요가 크게 늘었어요." },
      { year: 2022, revenue: "1,983억 달러", netIncome: "727억 달러", leader: "CEO·의장 사티아 나델라", story: "금리 급등으로 주가가 약 28% 하락했지만 이익은 사상 최대였어요." },
    ],
  },
  {
    ticker: "GOOGL", company: "알파벳(구글)", icon: googlIcon,
    closes: s([[2006, 11.51], [2007, 17.29], [2008, 7.69], [2009, 15.5], [2010, 14.85], [2011, 16.15], [2012, 17.68], [2013, 28.02], [2014, 26.53], [2015, 38.9], [2016, 39.62], [2017, 52.67], [2018, 52.25], [2019, 66.97], [2020, 87.63], [2021, 144.85], [2022, 88.23], [2023, 139.69], [2024, 189.3]]),
    milestones: [
      { year: 2006, revenue: "106억 달러", netIncome: "31억 달러", leader: "CEO 에릭 슈미트 · 창업자 래리 페이지·세르게이 브린", story: "상장 2년 차. 유튜브를 16.5억 달러에 인수해 '너무 비싸다'는 말을 들었어요." },
      { year: 2008, revenue: "218억 달러", netIncome: "42억 달러", leader: "CEO 에릭 슈미트", story: "금융위기로 주가가 한 해에 절반 넘게 떨어졌어요. 안드로이드 첫 폰이 나왔어요." },
      { year: 2011, revenue: "379억 달러", netIncome: "97억 달러", leader: "CEO 래리 페이지 · 의장 에릭 슈미트", story: "창업자 래리 페이지가 CEO로 돌아왔어요." },
      { year: 2016, revenue: "903억 달러", netIncome: "195억 달러", leader: "알파벳 CEO 래리 페이지 · 구글 CEO 순다르 피차이", story: "알파벳 지주회사 체제 첫해. 검색·유튜브 광고가 계속 커졌어요." },
      { year: 2019, revenue: "1,619억 달러", netIncome: "343억 달러", leader: "CEO 순다르 피차이", story: "순다르 피차이가 알파벳 전체 CEO가 됐어요." },
      { year: 2022, revenue: "2,828억 달러", netIncome: "600억 달러", leader: "CEO 순다르 피차이 · 의장 존 헤네시", story: "광고 경기 둔화와 'AI에 뒤처졌다'는 걱정에 주가가 약 39% 하락했어요." },
    ],
  },
  {
    ticker: "AMZN", company: "아마존", icon: amznIcon,
    closes: s([[2006, 1.97], [2007, 4.63], [2008, 2.56], [2009, 6.73], [2010, 9.0], [2011, 8.66], [2012, 12.54], [2013, 19.94], [2014, 15.52], [2015, 33.79], [2016, 37.49], [2017, 58.47], [2018, 75.1], [2019, 92.39], [2020, 162.85], [2021, 166.72], [2022, 84.0], [2023, 151.94], [2024, 219.39]]),
    milestones: [
      { year: 2006, revenue: "107억 달러", netIncome: "1.9억 달러", leader: "CEO·의장 제프 베이조스", story: "'이익이 거의 없는 온라인 서점'이라는 시선. 이 해 AWS(S3·EC2)가 조용히 문을 열었어요." },
      { year: 2008, revenue: "192억 달러", netIncome: "6.5억 달러", leader: "CEO·의장 제프 베이조스", story: "금융위기로 주가가 반토막 났지만 매출은 29% 늘었어요." },
      { year: 2014, revenue: "890억 달러", netIncome: "-2.4억 달러(적자)", leader: "CEO·의장 제프 베이조스", story: "파이어폰 실패와 적자로 주가가 약 22% 떨어졌어요." },
      { year: 2016, revenue: "1,360억 달러", netIncome: "24억 달러", leader: "CEO·의장 제프 베이조스", story: "AWS가 회사 이익의 대부분을 벌기 시작했어요." },
      { year: 2021, revenue: "4,698억 달러", netIncome: "334억 달러", leader: "CEO 앤디 재시 · 의장 제프 베이조스", story: "AWS를 키운 앤디 재시가 CEO가 됐어요." },
      { year: 2022, revenue: "5,140억 달러", netIncome: "-27억 달러(적자)", leader: "CEO 앤디 재시", story: "과잉 투자와 투자 손실로 주가가 약 50% 하락했어요." },
    ],
  },
  {
    ticker: "AAPL", company: "애플", icon: aaplIcon,
    closes: s([[2006, 3.03], [2007, 7.07], [2008, 3.05], [2009, 7.53], [2010, 11.52], [2011, 14.46], [2012, 19.01], [2013, 20.04], [2014, 27.59], [2015, 26.32], [2016, 28.95], [2017, 42.31], [2018, 39.44], [2019, 73.41], [2020, 132.69], [2021, 177.57], [2022, 129.93], [2023, 192.53], [2024, 250.42]]),
    milestones: [
      { year: 2006, revenue: "193억 달러", netIncome: "20억 달러", leader: "CEO 스티브 잡스", story: "아이팟과 맥을 파는 회사. 아이폰은 아직 세상에 없었어요(2007년 1월 발표)." },
      { year: 2008, revenue: "325억 달러", netIncome: "48억 달러", leader: "CEO 스티브 잡스", story: "금융위기와 잡스 건강 걱정으로 주가가 반 넘게 떨어졌어요. 앱스토어가 열렸어요." },
      { year: 2011, revenue: "1,082억 달러", netIncome: "259억 달러", leader: "CEO 팀 쿡", story: "스티브 잡스가 세상을 떠나고 팀 쿡이 CEO가 됐어요." },
      { year: 2016, revenue: "2,156억 달러", netIncome: "457억 달러", leader: "CEO 팀 쿡 · 의장 아서 레빈슨", story: "15년 만에 처음 매출이 줄었어요. 이 해 버크셔 해서웨이가 처음 애플을 샀어요." },
      { year: 2020, revenue: "2,745억 달러", netIncome: "574억 달러", leader: "CEO 팀 쿡", story: "코로나 폭락 후 서비스·아이폰 수요가 다시 커졌어요." },
      { year: 2022, revenue: "3,943억 달러", netIncome: "998억 달러", leader: "CEO 팀 쿡", story: "금리 급등으로 주가가 약 27% 하락했지만 이익은 사상 최대였어요." },
    ],
  },
];

export const TM_FIRST_YEAR = 2006;

export function closeAt(c: TimeMachineCompany, year: number): number {
  const exact = c.closes.find((x) => x.year === year);
  return (exact ?? c.closes[c.closes.length - 1]).close;
}
export function milestoneAt(c: TimeMachineCompany, year: number): Milestone {
  const ms = c.milestones.filter((m) => m.year <= year);
  return ms[ms.length - 1] ?? c.milestones[0];
}
/** 1,000만원을 from년 말에 넣고 to년 말(또는 오늘 가격)까지 보유한 가치 */
export function growth(c: TimeMachineCompany, from: number, toPrice: number) {
  return 10_000_000 * (toPrice / closeAt(c, from));
}
