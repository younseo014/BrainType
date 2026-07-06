"use client";

import { useMemo, useState } from "react";

type Strength = {
  id: string;
  name: string;
  short: string;
  color: string;
  bg: string;
  description: string;
  activity: string;
};

type Question = {
  id: string;
  text: string;
  hint: string;
  strengthId: string;
  reverse?: boolean;
};

const strengths: Strength[] = [
  {
    id: "memory",
    name: "기억 장인형",
    short: "기억",
    color: "#d9480f",
    bg: "#fff4e6",
    description: "오래된 경험과 맥락을 생생하게 붙잡는 힘이 돋보여요.",
    activity: "가족 기록 정리, 단골 응대, 경험 기반 멘토링",
  },
  {
    id: "speed",
    name: "순발력형",
    short: "순발",
    color: "#0c8599",
    bg: "#e3fafc",
    description: "새로운 상황을 빠르게 읽고 반응하는 감각이 좋아요.",
    activity: "짧은 퍼즐, 가벼운 기기 학습, 빠른 주문 처리",
  },
  {
    id: "language",
    name: "언어 감각형",
    short: "언어",
    color: "#5f3dc4",
    bg: "#f3f0ff",
    description: "표현과 단어를 고르는 능력이 풍부하게 관찰돼요.",
    activity: "손님 안내, 이야기 모임, 짧은 글쓰기",
  },
  {
    id: "space",
    name: "공간 탐험형",
    short: "공간",
    color: "#2b8a3e",
    bg: "#ebfbee",
    description: "길과 위치, 물건 배치를 직관적으로 기억하는 편이에요.",
    activity: "동네 산책 코스 만들기, 매장 진열, 지도 보기",
  },
  {
    id: "focus",
    name: "집중 몰입형",
    short: "집중",
    color: "#c2255c",
    bg: "#fff0f6",
    description: "한 가지 일을 차분하게 이어가는 집중력이 안정적이에요.",
    activity: "정리 작업, 취미 루틴, 짧은 명상",
  },
  {
    id: "working",
    name: "멀티태스킹형",
    short: "동시",
    color: "#1971c2",
    bg: "#e7f5ff",
    description: "여러 정보를 동시에 붙잡고 처리하는 힘이 보여요.",
    activity: "장보기 목록 관리, 계산 연습, 요리 순서 맞추기",
  },
  {
    id: "empathy",
    name: "감정 공감형",
    short: "공감",
    color: "#e67700",
    bg: "#fff9db",
    description: "상대의 표정과 분위기를 섬세하게 읽어내요.",
    activity: "가족 대화, 손님 맞이, 모임 진행",
  },
  {
    id: "plan",
    name: "신중 계획형",
    short: "계획",
    color: "#087f5b",
    bg: "#e6fcf5",
    description: "실수를 줄이기 위해 순서를 세우고 확인하는 힘이 있어요.",
    activity: "하루 일정표, 복약 체크, 매장 마감 루틴",
  },
];

const questions: Question[] = [
  {
    id: "q1",
    text: "최근 같은 이야기를 반복해서 하신 적이 있나요?",
    hint: "기억 흐름 관찰",
    strengthId: "memory",
    reverse: true,
  },
  {
    id: "q2",
    text: "오래전 경험이나 단골 손님의 취향을 잘 기억하시나요?",
    hint: "장기 기억 강점",
    strengthId: "memory",
  },
  {
    id: "q3",
    text: "새로운 기기나 방법을 배우는 데 전보다 오래 걸려 보이나요?",
    hint: "처리 속도 관찰",
    strengthId: "speed",
    reverse: true,
  },
  {
    id: "q4",
    text: "익숙한 사람 이름이나 단어를 바로 떠올리기 어려워하시나요?",
    hint: "언어 유창성 관찰",
    strengthId: "language",
    reverse: true,
  },
  {
    id: "q5",
    text: "물건을 놓은 위치나 자주 가는 길은 안정적으로 찾으시나요?",
    hint: "공간 감각 강점",
    strengthId: "space",
  },
  {
    id: "q6",
    text: "한 가지 일을 시작하면 끝까지 차분히 이어가시나요?",
    hint: "지속 주의력",
    strengthId: "focus",
  },
  {
    id: "q7",
    text: "계산, 주문, 대화를 동시에 처리할 때 헷갈려 보이나요?",
    hint: "작업 기억 관찰",
    strengthId: "working",
    reverse: true,
  },
  {
    id: "q8",
    text: "약속, 준비물, 순서를 꼼꼼히 챙기시는 편인가요?",
    hint: "실행 기능 강점",
    strengthId: "plan",
  },
  {
    id: "q9",
    text: "상대의 기분 변화를 빠르게 알아차리시나요?",
    hint: "사회적 인지",
    strengthId: "empathy",
  },
];

const baseScores: Record<string, number> = {
  memory: 72,
  speed: 64,
  language: 70,
  space: 78,
  focus: 74,
  working: 58,
  empathy: 82,
  plan: 69,
};

const defaultAnswers: Record<string, number> = {
  q1: 1,
  q2: 2,
  q3: 1,
  q4: 1,
  q5: 2,
  q6: 2,
  q7: 1,
  q8: 2,
  q9: 2,
};

const answerLabels = ["없음", "가끔", "자주"];

function answerToScore(answer: number, reverse?: boolean) {
  if (reverse) {
    return [88, 62, 36][answer];
  }

  return [42, 66, 90][answer];
}

function clampScore(score: number) {
  return Math.max(20, Math.min(96, Math.round(score)));
}

function RadarChart({ scores }: { scores: Array<Strength & { score: number }> }) {
  const size = 260;
  const center = size / 2;
  const maxRadius = 100;
  const points = scores
    .map((item, index) => {
      const angle = (Math.PI * 2 * index) / scores.length - Math.PI / 2;
      const radius = (item.score / 100) * maxRadius;
      return `${center + Math.cos(angle) * radius},${center + Math.sin(angle) * radius}`;
    })
    .join(" ");

  const rings = [0.35, 0.65, 1];

  return (
    <div className="radar-wrap" aria-label="8개 두뇌 강점 레이더 차트">
      <svg viewBox={`0 0 ${size} ${size}`} role="img">
        {rings.map((ring) => {
          const ringPoints = scores
            .map((_, index) => {
              const angle = (Math.PI * 2 * index) / scores.length - Math.PI / 2;
              const radius = maxRadius * ring;
              return `${center + Math.cos(angle) * radius},${
                center + Math.sin(angle) * radius
              }`;
            })
            .join(" ");

          return (
            <polygon
              key={ring}
              points={ringPoints}
              fill="none"
              stroke="#d7dde5"
              strokeWidth="1"
            />
          );
        })}
        {scores.map((item, index) => {
          const angle = (Math.PI * 2 * index) / scores.length - Math.PI / 2;
          const endX = center + Math.cos(angle) * maxRadius;
          const endY = center + Math.sin(angle) * maxRadius;
          const labelX = center + Math.cos(angle) * 119;
          const labelY = center + Math.sin(angle) * 119;

          return (
            <g key={item.id}>
              <line
                x1={center}
                y1={center}
                x2={endX}
                y2={endY}
                stroke="#e1e6ed"
                strokeWidth="1"
              />
              <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#344054"
                fontSize="11"
                fontWeight="700"
              >
                {item.short}
              </text>
            </g>
          );
        })}
        <polygon points={points} fill="rgba(12, 133, 153, 0.24)" stroke="#0c8599" strokeWidth="3" />
        {scores.map((item, index) => {
          const angle = (Math.PI * 2 * index) / scores.length - Math.PI / 2;
          const radius = (item.score / 100) * maxRadius;

          return (
            <circle
              key={item.id}
              cx={center + Math.cos(angle) * radius}
              cy={center + Math.sin(angle) * radius}
              r="4"
              fill={item.color}
            />
          );
        })}
      </svg>
    </div>
  );
}

export default function Home() {
  const [activeRole, setActiveRole] = useState<"owner" | "evaluator">("owner");
  const [answers, setAnswers] = useState(defaultAnswers);
  const [completed, setCompleted] = useState(false);
  const [precisionDone, setPrecisionDone] = useState(false);
  const [copied, setCopied] = useState(false);

  const scoredStrengths = useMemo(() => {
    const grouped = strengths.map((strength) => {
      const related = questions.filter((question) => question.strengthId === strength.id);
      const surveyAverage =
        related.reduce((sum, question) => {
          const answer = answers[question.id] ?? 1;
          return sum + answerToScore(answer, question.reverse);
        }, 0) / Math.max(related.length, 1);

      const score = clampScore(baseScores[strength.id] * 0.58 + surveyAverage * 0.42);

      return {
        ...strength,
        score,
      };
    });

    return grouped.sort((a, b) => b.score - a.score);
  }, [answers]);

  const chartScores = useMemo(
    () =>
      strengths.map((strength) => {
        const scored = scoredStrengths.find((item) => item.id === strength.id);
        return {
          ...strength,
          score: scored?.score ?? 60,
        };
      }),
    [scoredStrengths],
  );

  const topTwo = scoredStrengths.slice(0, 2);
  const growthTarget = scoredStrengths[scoredStrengths.length - 1];
  const evaluatorCount = completed ? 3 : 2;
  const reliability = Math.min(96, 52 + evaluatorCount * 13 + (completed ? 5 : 0));
  const points = 230 + (completed ? 100 : 0) + (precisionDone ? 200 : 0);
  const inviteCode = "BT-5628";
  const inviteLink = `https://braintype.demo/join/${inviteCode}`;

  const completeSurvey = () => {
    setCompleted(true);
    setActiveRole("owner");
  };

  const copyInvite = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    }
  };

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <div className="hero-copy">
          <div className="brand-row">
            <span className="brand-mark" aria-hidden="true">
              BT
            </span>
            <span>BrainType</span>
          </div>
          <h1>주변 사람들이 발견해주는 나의 두뇌 강점 유형</h1>
          <p>
            평가자 초대부터 관찰 설문, 강점 리포트, 정밀 측정 권유까지 PRD의
            핵심 흐름을 한 번에 테스트하는 모바일 웹 데모입니다.
          </p>
          <div className="hero-actions">
            <button className="primary-button" onClick={() => setActiveRole("owner")}>
              <span aria-hidden="true">+</span>
              초대 만들기
            </button>
            <button className="secondary-button" onClick={() => setActiveRole("evaluator")}>
              <span aria-hidden="true">✓</span>
              설문 참여
            </button>
          </div>
        </div>

        <div className="brain-card" aria-label="두뇌 강점 요약">
          <div className="brain-visual">
            {chartScores.slice(0, 6).map((item, index) => (
              <span
                key={item.id}
                className={`brain-dot dot-${index + 1}`}
                style={{ background: item.bg, borderColor: item.color, color: item.color }}
              >
                {item.short}
              </span>
            ))}
          </div>
          <div className="brain-summary">
            <span>현재 대표 유형</span>
            <strong>{topTwo.map((item) => item.name).join(" · ")}</strong>
          </div>
        </div>
      </section>

      <section className="workspace-grid">
        <div className="control-panel">
          <div className="segmented-control" aria-label="역할 선택">
            <button
              className={activeRole === "owner" ? "active" : ""}
              onClick={() => setActiveRole("owner")}
            >
              피평가자
            </button>
            <button
              className={activeRole === "evaluator" ? "active" : ""}
              onClick={() => setActiveRole("evaluator")}
            >
              평가자
            </button>
          </div>

          {activeRole === "owner" ? (
            <div className="owner-flow">
              <div className="section-heading">
                <span>초대 코드</span>
                <strong>{inviteCode}</strong>
              </div>
              <div className="invite-box">
                <div>
                  <span>공유 링크</span>
                  <p>{inviteLink}</p>
                </div>
                <button onClick={copyInvite} title="초대 링크 복사">
                  <span aria-hidden="true">{copied ? "✓" : "↗"}</span>
                  {copied ? "복사됨" : "복사"}
                </button>
              </div>

              <div className="progress-row">
                <div>
                  <span>응답자</span>
                  <strong>{evaluatorCount}/10명</strong>
                </div>
                <div>
                  <span>리포트 조건</span>
                  <strong>{evaluatorCount >= 2 ? "생성 가능" : "2명 필요"}</strong>
                </div>
                <div>
                  <span>포인트</span>
                  <strong>{points}P</strong>
                </div>
              </div>

              <div className="notice-line">
                브레인타입은 두뇌 강점 탐색과 함께 인지 건강 모니터링을 지원해요.
                지속적인 관리를 원하면 알림을 켤 수 있어요.
              </div>
            </div>
          ) : (
            <div className="survey-flow">
              <div className="section-heading">
                <span>관찰 설문</span>
                <strong>{completed ? "완료" : "약 3분"}</strong>
              </div>

              <div className="question-list">
                {questions.map((question) => (
                  <fieldset key={question.id} className="question-item">
                    <legend>
                      <span>{question.hint}</span>
                      {question.text}
                    </legend>
                    <div className="choice-row">
                      {answerLabels.map((label, index) => (
                        <label key={label} className={answers[question.id] === index ? "checked" : ""}>
                          <input
                            type="radio"
                            name={question.id}
                            checked={answers[question.id] === index}
                            onChange={() =>
                              setAnswers((current) => ({
                                ...current,
                                [question.id]: index,
                              }))
                            }
                          />
                          <span>{label}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                ))}
              </div>

              <button className="primary-button full" onClick={completeSurvey}>
                <span aria-hidden="true">✓</span>
                제출하고 100P 받기
              </button>
            </div>
          )}
        </div>

        <aside className="report-panel">
          <div className="report-card">
            <div className="report-topline">
              <span>BrainType Report</span>
              <strong>신뢰도 {reliability}%</strong>
            </div>
            <h2>
              {topTwo[0].name} + {topTwo[1].name}
            </h2>
            <p>{topTwo[0].description} 함께 {topTwo[1].description}</p>

            <div className="type-pair">
              {topTwo.map((item) => (
                <div key={item.id} style={{ background: item.bg, borderColor: item.color }}>
                  <span style={{ color: item.color }}>{item.short}</span>
                  <strong>{item.score}점</strong>
                </div>
              ))}
            </div>

            <RadarChart scores={chartScores} />

            <div className="growth-box">
              <span>더 키워볼 수 있는 강점</span>
              <strong>{growthTarget.name}</strong>
              <p>
                {growthTarget.short} 강점을 조금 더 키우면 일상 속 판단과 준비가
                함께 편안해질 수 있어요.
              </p>
            </div>
          </div>

          <div className="side-panel">
            <div className="recommend-block">
              <span>잘 맞는 활동</span>
              <p>{topTwo.map((item) => item.activity).join(" · ")}</p>
            </div>
            <div className="precision-block">
              <div>
                <span>정밀 측정 모드</span>
                <strong>{precisionDone ? "배지 추가됨" : "5분 권장"}</strong>
              </div>
              <p>
                더 정확한 두뇌 유형 측정을 위한 짧은 테스트입니다. 인지 기능
                전반을 점검하는 방식으로 구성돼 있어요.
              </p>
              <button
                className="secondary-button full"
                onClick={() => setPrecisionDone((current) => !current)}
              >
                <span aria-hidden="true">{precisionDone ? "✓" : "→"}</span>
                {precisionDone ? "정밀 측정 완료" : "정밀 측정 시작"}
              </button>
            </div>
            <button className="share-button">
              <span aria-hidden="true">↗</span>
              결과 카드 공유 +30P
            </button>
          </div>
        </aside>
      </section>
    </main>
  );
}
