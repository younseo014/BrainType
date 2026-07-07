"use client";

import { useMemo, useState } from "react";

type Role = "owner" | "evaluator";
type PrecisionStep = "closed" | "memory" | "digits" | "stroop" | "done";

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

const thresholdScore = 50;

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
  { id: "q1", text: "최근 같은 이야기를 반복해서 하신 적이 있나요?", hint: "반복 질문", strengthId: "memory", reverse: true },
  { id: "q2", text: "며칠 전 약속이나 전달받은 내용을 안정적으로 기억하시나요?", hint: "최근 기억", strengthId: "memory" },
  { id: "q3", text: "오래전 경험이나 단골 손님의 취향을 잘 기억하시나요?", hint: "장기 기억", strengthId: "memory" },
  { id: "q4", text: "물건을 놓고 어디 뒀는지 오래 찾는 경우가 있나요?", hint: "위치 기억", strengthId: "space", reverse: true },
  { id: "q5", text: "자주 가던 길이나 익숙한 장소에서 헤매는 모습이 있나요?", hint: "길 찾기", strengthId: "space", reverse: true },
  { id: "q6", text: "새로운 기기나 결제 방법을 배우는 데 전보다 어려워 보이나요?", hint: "새 정보 처리", strengthId: "speed", reverse: true },
  { id: "q7", text: "갑자기 상황이 바뀌어도 비교적 빠르게 대응하시나요?", hint: "대응 속도", strengthId: "speed" },
  { id: "q8", text: "익숙한 사람 이름이나 단어를 바로 떠올리기 어려워하시나요?", hint: "단어 찾기", strengthId: "language", reverse: true },
  { id: "q9", text: "대화 중 표현이 풍부하고 설명을 잘 이어가시나요?", hint: "표현력", strengthId: "language" },
  { id: "q10", text: "한 가지 일을 시작하면 끝까지 차분히 이어가시나요?", hint: "지속 주의", strengthId: "focus" },
  { id: "q11", text: "작업 중 작은 소리나 주변 일에 쉽게 흐트러져 보이나요?", hint: "주의 분산", strengthId: "focus", reverse: true },
  { id: "q12", text: "계산, 주문, 대화를 동시에 처리할 때 헷갈려 보이나요?", hint: "동시 처리", strengthId: "working", reverse: true },
  { id: "q13", text: "방금 들은 숫자나 요청 사항을 잠시 기억해 처리하시나요?", hint: "작업 기억", strengthId: "working" },
  { id: "q14", text: "거스름돈, 수량, 가격을 계산할 때 전보다 실수가 늘었나요?", hint: "생활 계산", strengthId: "working", reverse: true },
  { id: "q15", text: "상대의 기분 변화를 빠르게 알아차리시나요?", hint: "감정 읽기", strengthId: "empathy" },
  { id: "q16", text: "대화 상대의 표정이나 분위기를 놓치는 경우가 있나요?", hint: "사회적 단서", strengthId: "empathy", reverse: true },
  { id: "q17", text: "약속, 준비물, 순서를 꼼꼼히 챙기시는 편인가요?", hint: "계획성", strengthId: "plan" },
  { id: "q18", text: "일의 순서가 바뀌면 당황하거나 빠뜨리는 일이 있나요?", hint: "실행 순서", strengthId: "plan", reverse: true },
  { id: "q19", text: "하던 일을 잠시 멈춘 뒤에도 원래 하던 일을 잘 이어가시나요?", hint: "재개 능력", strengthId: "plan" },
  { id: "q20", text: "평소와 달라진 모습이 주변 사람에게도 반복 관찰되나요?", hint: "변화 지속성", strengthId: "memory", reverse: true },
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

const defaultAnswers = questions.reduce<Record<string, number>>((result, question) => {
  result[question.id] = question.reverse ? 0 : 2;
  return result;
}, {});

const answerLabels = ["없음", "가끔", "자주"];

function answerToScore(answer: number, reverse?: boolean) {
  if (reverse) {
    return [90, 62, 28][answer];
  }

  return [38, 66, 92][answer];
}

function clampScore(score: number) {
  return Math.max(16, Math.min(98, Math.round(score)));
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

  return (
    <div className="radar-wrap" aria-label="8개 두뇌 강점 레이더 차트">
      <svg viewBox={`0 0 ${size} ${size}`} role="img">
        {[0.35, 0.65, 1].map((ring) => {
          const ringPoints = scores
            .map((_, index) => {
              const angle = (Math.PI * 2 * index) / scores.length - Math.PI / 2;
              const radius = maxRadius * ring;
              return `${center + Math.cos(angle) * radius},${center + Math.sin(angle) * radius}`;
            })
            .join(" ");

          return <polygon key={ring} points={ringPoints} fill="none" stroke="#d7dde5" strokeWidth="1" />;
        })}
        {scores.map((item, index) => {
          const angle = (Math.PI * 2 * index) / scores.length - Math.PI / 2;
          const endX = center + Math.cos(angle) * maxRadius;
          const endY = center + Math.sin(angle) * maxRadius;
          const labelX = center + Math.cos(angle) * 119;
          const labelY = center + Math.sin(angle) * 119;

          return (
            <g key={item.id}>
              <line x1={center} y1={center} x2={endX} y2={endY} stroke="#e1e6ed" strokeWidth="1" />
              <text x={labelX} y={labelY} textAnchor="middle" dominantBaseline="middle" fill="#344054" fontSize="11" fontWeight="700">
                {item.short}
              </text>
            </g>
          );
        })}
        <polygon points={points} fill="rgba(12, 133, 153, 0.24)" stroke="#0c8599" strokeWidth="3" />
        {scores.map((item, index) => {
          const angle = (Math.PI * 2 * index) / scores.length - Math.PI / 2;
          const radius = (item.score / 100) * maxRadius;

          return <circle key={item.id} cx={center + Math.cos(angle) * radius} cy={center + Math.sin(angle) * radius} r="4" fill={item.color} />;
        })}
      </svg>
    </div>
  );
}

export default function Home() {
  const [activeRole, setActiveRole] = useState<Role>("owner");
  const [answers, setAnswers] = useState(defaultAnswers);
  const [completed, setCompleted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [episode, setEpisode] = useState("");
  const [accountCreated, setAccountCreated] = useState(false);
  const [precisionStep, setPrecisionStep] = useState<PrecisionStep>("closed");
  const [memoryChoice, setMemoryChoice] = useState("");
  const [digitsAnswer, setDigitsAnswer] = useState("");
  const [stroopAnswer, setStroopAnswer] = useState("");

  const scoredStrengths = useMemo(() => {
    const grouped = strengths.map((strength) => {
      const related = questions.filter((question) => question.strengthId === strength.id);
      const surveyAverage =
        related.reduce((sum, question) => {
          const answer = answers[question.id] ?? 1;
          return sum + answerToScore(answer, question.reverse);
        }, 0) / Math.max(related.length, 1);

      const score = clampScore(baseScores[strength.id] * 0.45 + surveyAverage * 0.55);

      return { ...strength, score };
    });

    return grouped.sort((a, b) => b.score - a.score);
  }, [answers]);

  const chartScores = useMemo(
    () =>
      strengths.map((strength) => ({
        ...strength,
        score: scoredStrengths.find((item) => item.id === strength.id)?.score ?? 60,
      })),
    [scoredStrengths],
  );

  const topTwo = scoredStrengths.slice(0, 2);
  const growthTarget = scoredStrengths[scoredStrengths.length - 1];
  const needsPrecision = completed && growthTarget.score <= thresholdScore;
  const precisionDone = precisionStep === "done";
  const evaluatorCount = completed ? 3 : 2;
  const reliability = Math.min(96, 52 + evaluatorCount * 13 + (completed ? 5 : 0));
  const points = 230 + (completed ? 100 : 0) + (accountCreated ? 50 : 0) + (precisionDone ? 200 : 0);
  const inviteCode = "BT-5628";
  const inviteLink = `https://braintype.demo/join/${inviteCode}`;
  const precisionScore =
    (memoryChoice === "사과-책" ? 1 : 0) +
    (digitsAnswer.replace(/\s/g, "") === "2417" ? 1 : 0) +
    (stroopAnswer === "파랑" ? 1 : 0);

  const completeSurvey = () => {
    setCompleted(true);
  };

  const copyInvite = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
    } finally {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    }
  };

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <div className="hero-copy">
          <div className="brand-row">
            <span className="brand-mark" aria-hidden="true">BT</span>
            <span>BrainType</span>
          </div>
          <h1>주변 사람들이 발견해주는 나의 두뇌 강점 유형</h1>
          <p>
            초대 링크를 받은 주변인이 관찰 설문을 작성하면, 나의 강점 유형과 잘 맞는 활동을 확인할 수 있어요.
          </p>
          <div className="hero-actions">
            <button className="primary-button" onClick={() => setActiveRole("owner")}>
              <span aria-hidden="true">+</span>
              초대 만들기
            </button>
            <button className="secondary-button" onClick={() => setActiveRole("evaluator")}>
              <span aria-hidden="true">✓</span>
              초대 링크로 참여
            </button>
          </div>
        </div>

        <div className="brain-card" aria-label="두뇌 강점 요약">
          <div className="brain-visual">
            {chartScores.slice(0, 6).map((item, index) => (
              <span key={item.id} className={`brain-dot dot-${index + 1}`} style={{ background: item.bg, borderColor: item.color, color: item.color }}>
                {item.short}
              </span>
            ))}
          </div>
          <div className="brain-summary">
            <span>공유 카드 미리보기</span>
            <strong>{topTwo.map((item) => item.name).join(" · ")}</strong>
          </div>
        </div>
      </section>

      <section className="workspace-grid">
        <div className="control-panel">
          <div className="role-note">
            <strong>{activeRole === "owner" ? "피평가자 초대 화면" : "평가자 전용 링크 화면"}</strong>
            <span>데모에서는 한 화면에서 전환하지만, 실제 서비스는 초대 링크와 계정 세션을 분리합니다.</span>
          </div>

          <div className="segmented-control" aria-label="데모 역할 선택">
            <button className={activeRole === "owner" ? "active" : ""} onClick={() => setActiveRole("owner")}>피평가자</button>
            <button className={activeRole === "evaluator" ? "active" : ""} onClick={() => setActiveRole("evaluator")}>평가자</button>
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

              <div className="respondent-list">
                <span>응답 상태</span>
                <div><strong>딸</strong><em>완료 · 응답 내용 비식별</em></div>
                <div><strong>동료</strong><em>완료 · 응답 내용 비식별</em></div>
                {completed && <div><strong>단골 손님</strong><em>방금 완료 · 응답 내용 비식별</em></div>}
              </div>

              {completed ? (
                <div className="notice-line">
                  브레인타입은 두뇌 강점 탐색과 함께 인지 건강 모니터링을 지원해요.
                  지속적인 건강 관리를 원하시면 알림을 켜 둘 수 있어요.
                </div>
              ) : (
                <div className="soft-line">
                  초대 단계에서는 강점 유형 탐색만 안내합니다. 자세한 건강 관련 고지는 설문 완료 이후에 표시됩니다.
                </div>
              )}
            </div>
          ) : completed ? (
            <div className="evaluator-done">
              <div className="success-mark" aria-hidden="true">✓</div>
              <h2>제출 완료</h2>
              <p>
                관찰 설문이 반영됐어요. 피평가자가 리포트를 열람하면 평가자에게도 공유 가능한 요약 화면이 열립니다.
              </p>
              <div className="next-status">
                <div><span>내 적립</span><strong>100P</strong></div>
                <div><span>계정 생성 보너스</span><strong>{accountCreated ? "50P 지급" : "대기"}</strong></div>
                <div><span>리포트 공개</span><strong>알림 예정</strong></div>
              </div>
              <button className="secondary-button full" onClick={() => setAccountCreated(true)}>
                <span aria-hidden="true">+</span>
                평가자 계정 만들고 50P 받기
              </button>
              <button className="primary-button full" onClick={() => setActiveRole("owner")}>
                <span aria-hidden="true">→</span>
                공개된 리포트 미리보기
              </button>
            </div>
          ) : (
            <div className="survey-flow">
              <div className="section-heading">
                <span>관찰 설문</span>
                <strong>20문항 · 약 5분</strong>
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
                            onChange={() => setAnswers((current) => ({ ...current, [question.id]: index }))}
                          />
                          <span>{label}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                ))}
              </div>

              <label className="episode-box">
                <span>자유 관찰 메모</span>
                <textarea
                  value={episode}
                  onChange={(event) => setEpisode(event.target.value)}
                  placeholder="예: 최근 거스름돈 계산을 두 번 확인하셨고, 같은 질문을 식사 중 3번 반복하셨어요."
                />
              </label>

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
            <h2>{topTwo[0].name} + {topTwo[1].name}</h2>
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

            {needsPrecision ? (
              <div className="growth-box alert">
                <span>정밀 측정 권유 조건 충족</span>
                <strong>{growthTarget.name} {growthTarget.score}점</strong>
                <p>
                  이 영역은 데모 기준 {thresholdScore}점 이하라 정밀 측정 모드를 부드럽게 제안합니다.
                </p>
              </div>
            ) : (
              <div className="strength-line">
                모든 영역이 기준 이상이에요. 오늘은 강점 카드와 추천 활동만 보여드립니다.
              </div>
            )}
          </div>

          <div className="side-panel">
            <div className="recommend-block">
              <span>잘 맞는 활동</span>
              <p>{topTwo.map((item) => item.activity).join(" · ")}</p>
            </div>

            {needsPrecision && (
              <div className="precision-block">
                <div>
                  <span>정밀 측정 모드</span>
                  <strong>{precisionDone ? "배지 추가됨" : "선택 권장"}</strong>
                </div>
                <p>
                  더 정확한 두뇌 유형 측정을 위한 3단계 샘플입니다. 이 단계에서 인지 기능 전반을 점검한다고 명시합니다.
                </p>
                {precisionStep === "closed" && (
                  <button className="secondary-button full" onClick={() => setPrecisionStep("memory")}>
                    <span aria-hidden="true">→</span>
                    정밀 측정 시작
                  </button>
                )}
                {precisionStep === "memory" && (
                  <div className="mini-test">
                    <span>1. 단어-그림 연결</span>
                    <p>방금 본 그림 조합을 골라주세요.</p>
                    {["사과-책", "시계-의자", "꽃-컵"].map((choice) => (
                      <button key={choice} className={memoryChoice === choice ? "selected" : ""} onClick={() => setMemoryChoice(choice)}>
                        {choice}
                      </button>
                    ))}
                    <button className="primary-button full" onClick={() => setPrecisionStep("digits")}>다음</button>
                  </div>
                )}
                {precisionStep === "digits" && (
                  <div className="mini-test">
                    <span>2. 숫자 역순 입력</span>
                    <p>7-1-4-2를 거꾸로 입력해 주세요.</p>
                    <input value={digitsAnswer} onChange={(event) => setDigitsAnswer(event.target.value)} placeholder="예: 2417" />
                    <button className="primary-button full" onClick={() => setPrecisionStep("stroop")}>다음</button>
                  </div>
                )}
                {precisionStep === "stroop" && (
                  <div className="mini-test">
                    <span>3. 색깔-단어 테스트</span>
                    <p><b className="stroop-word">빨강</b> 글자의 실제 색을 고르세요.</p>
                    {["빨강", "파랑", "초록"].map((choice) => (
                      <button key={choice} className={stroopAnswer === choice ? "selected" : ""} onClick={() => setStroopAnswer(choice)}>
                        {choice}
                      </button>
                    ))}
                    <button className="primary-button full" onClick={() => setPrecisionStep("done")}>결과 반영</button>
                  </div>
                )}
                {precisionDone && (
                  <div className="precision-result">
                    <strong>샘플 점수 {precisionScore}/3</strong>
                    <p>
                      기준 미달 시 가까운 치매안심센터 무료 프로그램 안내와 지도 연결을 보여주는 단계입니다.
                    </p>
                    <button className="secondary-button full">치매안심센터 지도 연결 스텁</button>
                  </div>
                )}
              </div>
            )}

            <div className="points-ledger">
              <span>포인트 내역</span>
              <div><em>평가자 설문 완료</em><strong>{completed ? "+100P" : "대기"}</strong></div>
              <div><em>평가자 계정 생성</em><strong>{accountCreated ? "+50P" : "선택"}</strong></div>
              <div><em>리포트 확인</em><strong>+50P</strong></div>
              <div><em>정밀 측정 완료</em><strong>{precisionDone ? "+200P" : "조건부"}</strong></div>
              <p>1,000P부터 네이버페이/카카오페이 전환 예정입니다.</p>
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
