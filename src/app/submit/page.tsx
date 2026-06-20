import RetroWindow from "@/components/RetroWindow";
import SubmitForm from "./SubmitForm";

export default function SubmitPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <RetroWindow
        title="고민접수 — 개발자의 잡화점"
        statusRight={<span>🏪 영업중 · 24h</span>}
        toolbar={
          <div
            style={{
              display: "flex",
              gap: 16,
              padding: "4px 11px",
              borderBottom: "1px solid #b3ad9d",
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
              color: "#4a463c",
            }}
            aria-hidden="true"
          >
            <span>
              <u>파</u>일
            </span>
            <span>
              <u>편</u>집
            </span>
            <span>
              <u>보</u>기
            </span>
            <span>도움말</span>
          </div>
        }
      >
        <SubmitForm />
      </RetroWindow>
    </main>
  );
}
