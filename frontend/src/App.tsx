import { useState } from "react";
import { AlertCircle, FileText, ReceiptText, Search, Upload } from "lucide-react";

const meetings = [
  {
    id: "weekly-ops",
    title: "주간 운영 회의",
    date: "2026-05-18",
    status: "요약 대기",
    problems: [
      {
        title: "봉사자 일정 변경 공지가 늦어짐",
        owner: "운영팀",
        due: "2026-05-20",
        priority: "높음"
      },
      {
        title: "행사 당일 물품 담당자 미확정",
        owner: "총무",
        due: "2026-05-21",
        priority: "보통"
      }
    ]
  },
  {
    id: "expense-approval",
    title: "비용 승인 회의",
    date: "2026-05-16",
    status: "보고서 준비",
    problems: [
      {
        title: "영수증 원본 3건 누락",
        owner: "회계",
        due: "2026-05-18",
        priority: "높음"
      },
      {
        title: "승인 기준 금액 초과 건 검토 필요",
        owner: "대표",
        due: "2026-05-19",
        priority: "보통"
      },
      {
        title: "정산 메일 수신자 목록 업데이트 필요",
        owner: "사무국",
        due: "2026-05-19",
        priority: "낮음"
      }
    ]
  }
];

export function App() {
  const [selectedMeetingId, setSelectedMeetingId] = useState(meetings[0].id);
  const selectedMeeting =
    meetings.find((meeting) => meeting.id === selectedMeetingId) ?? meetings[0];

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <h1 className="text-lg font-semibold">Activities</h1>
          <nav className="flex gap-2 text-sm text-zinc-600">
            <a className="rounded-md px-3 py-2 hover:bg-zinc-100" href="#accounting">
              회계
            </a>
            <a className="rounded-md px-3 py-2 hover:bg-zinc-100" href="#meetings">
              회의
            </a>
          </nav>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-6 py-8 lg:grid-cols-[360px_1fr]">
        <section id="accounting" className="rounded-lg border bg-white p-5">
          <div className="mb-5 flex items-center gap-3">
            <ReceiptText className="h-5 w-5 text-emerald-700" />
            <h2 className="text-base font-semibold">회계</h2>
          </div>
          <label className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-4 text-center hover:bg-zinc-100">
            <Upload className="mb-3 h-7 w-7 text-zinc-500" />
            <span className="text-sm font-medium">영수증 이미지 업로드</span>
            <span className="mt-1 text-xs text-zinc-500">OCR 처리 후 비용 데이터로 저장</span>
            <input className="sr-only" type="file" accept="image/*" />
          </label>
          <div className="mt-5 rounded-md bg-amber-50 p-3 text-sm text-amber-900">
            매일 17시 미지급 건 정산 및 이메일 알림 배치를 위한 자리입니다.
          </div>
        </section>

        <section id="meetings" className="rounded-lg border bg-white p-5">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-sky-700" />
              <h2 className="text-base font-semibold">회의</h2>
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-zinc-950 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800">
              <Upload className="h-4 w-4" />
              TXT 업로드
              <input className="sr-only" type="file" accept=".txt,text/plain" />
            </label>
          </div>

          <div className="mb-4 flex items-center gap-2 rounded-md border px-3 py-2">
            <Search className="h-4 w-4 text-zinc-500" />
            <input
              className="w-full bg-transparent text-sm outline-none"
              placeholder="회의록, 결정사항, 후속업무 검색"
              type="search"
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-1">
            {meetings.map((meeting) => (
              <button
                key={meeting.id}
                className={`rounded-lg border p-4 text-left transition hover:border-sky-300 hover:bg-sky-50 ${
                  selectedMeetingId === meeting.id ? "border-sky-500 bg-sky-50" : "bg-white"
                }`}
                type="button"
                onClick={() => setSelectedMeetingId(meeting.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-medium">{meeting.title}</h3>
                    <p className="mt-1 text-sm text-zinc-500">{meeting.date}</p>
                  </div>
                  <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-700">
                    {meeting.status}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs text-zinc-600">
                  <div className="rounded-md bg-zinc-50 p-2">요약</div>
                  <div className="rounded-md bg-zinc-50 p-2">결정</div>
                  <div className="rounded-md bg-zinc-50 p-2">문제 {meeting.problems.length}</div>
                </div>
              </button>
            ))}
            </div>

            <aside className="rounded-lg border bg-zinc-50 p-4">
              <div className="mb-4 flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 text-rose-600" />
                <div>
                  <h3 className="font-medium">{selectedMeeting.title} 문제</h3>
                  <p className="mt-1 text-sm text-zinc-500">
                    {selectedMeeting.problems.length}개 항목
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {selectedMeeting.problems.map((problem) => (
                  <div key={problem.title} className="rounded-md border bg-white p-3">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-medium leading-5">{problem.title}</p>
                      <span className="shrink-0 rounded-full bg-white px-2 py-1 text-xs text-rose-700 ring-1 ring-rose-200">
                        {problem.priority}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-500">
                      <span>담당 {problem.owner}</span>
                      <span>기한 {problem.due}</span>
                    </div>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
