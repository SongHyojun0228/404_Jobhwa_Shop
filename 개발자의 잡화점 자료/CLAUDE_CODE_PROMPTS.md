# Claude Code 프롬프트 — 개발자의 잡화점

각 프롬프트를 **순서대로 하나씩** Claude Code에 붙여넣으세요. 같은 폴더의 `SPEC.md`, `DESIGN_TOKENS.md`, `prototype/개발자의 잡화점.dc.html`을 레포에 함께 두고 시작하면, 프롬프트에서 그 파일들을 참조할 수 있습니다.

> 사용법 팁: Claude Code를 이 핸드오프 폴더가 포함된 레포 루트에서 실행하고, 첫 프롬프트에 "먼저 `design_handoff_jabhwajeom/` 안의 SPEC.md·DESIGN_TOKENS.md·prototype HTML을 읽고 시작해" 한 줄을 넣으면 가장 정확합니다.

---

## 프롬프트 0 — 프로젝트 셋업 & 디자인 시스템

```
개발자 커뮤니티 서비스 "개발자의 잡화점"을 만든다. 익명 고민 접수 → 운영자 선정/게시 → 해결편지 수집 → 정리의 흐름.

먼저 design_handoff_jabhwajeom/ 안의 SPEC.md, DESIGN_TOKENS.md, prototype/개발자의 잡화점.dc.html 을 모두 읽어. 그 HTML은 "디자인 레퍼런스"다 — 그대로 복붙하는 게 아니라 아래 스택에서 동일한 룩&동작으로 재현한다.

[스택]
- Next.js(App Router, TypeScript) + Tailwind CSS
- Supabase(Postgres) — @supabase/supabase-js, 서버 컴포넌트/route handler에서 사용
- 환경변수: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY(서버 전용), ADMIN_PASSWORD

[해야 할 일]
1. Next.js 프로젝트 스캐폴딩 + Tailwind + Supabase 클라이언트(서버용/클라이언트용 분리) 셋업.
2. Supabase 마이그레이션 SQL 작성: SPEC.md의 worries, solutions 테이블 그대로. status는 text + CHECK 제약(pending|selected|published|closed|completed), 기본 'pending'. updated 타임스탬프 컬럼들 nullable. solutions.worry_id FK + index. RLS는 1차에서 단순화(서버 라우트에서 service role로 접근, 공개 insert는 anon 허용 정책).
3. 디자인 토큰을 코드로 박제: tailwind.config + globals.css에 DESIGN_TOKENS.md의 색/폰트/그림자/베벨을 등록.
   - 폰트: Jua, Gaegu, IBM Plex Sans KR, IBM Plex Mono (next/font 또는 link).
   - 색 토큰(teal #1f5048, face #ddd6c4, page #37615a, yellow #ffd95c, terracotta #b5562f, green #2c8c3c, ink #2a2722, paper #fffdf6 …).
   - 재사용 유틸 컴포넌트 4개를 먼저 만든다(아래 화면들이 전부 이걸 쓴다):
     · <Bevel raised|sunken> : 95창 입체 보더(raised: 좌상 #f1ede2 / 우하 #8f897a, sunken: 반대).
     · <RetroWindow title icon awningColor> : 차양 띠(스캘럽 mask) + 타이틀바(딥틸, _/× 버튼) + 본체 + 하단 상태바("© 2025 개발자의 잡화점" / 우측 슬롯). DESIGN_TOKENS.md의 awning mask 그대로.
     · <RetroButton variant=yellow|terracotta|green|plain> : raised 베벨 + 3px 오프셋 그림자, Jua 라벨.
     · <LinedPaperTextarea> : DESIGN_TOKENS.md "편지지" 레시피(line-height 28 = 줄간격 28, 위패딩 0, 분홍 여백선 + 가로줄, Gaegu 17px) + 실시간 글자수 카운터 prop(maxLength).
4. 라우트 골격: /submit, /solve, /admin (빈 페이지 + RetroWindow 껍데기). 모바일 우선.

지금은 화면 내용 채우지 말고, 셋업 + 마이그레이션 + 위 4개 공용 컴포넌트 + 라우트 골격까지만. 완료되면 npm run dev 로 3개 라우트가 빈 레트로 창으로 뜨는지 확인.
```

---

## 프롬프트 1 — `/submit` 고민 넣기

```
/submit 페이지를 완성한다. prototype HTML의 "01 — 고민 넣기" 프레임을 재현. 모바일 우선, 공통 컴포넌트(RetroWindow/RetroButton/Bevel/LinedPaperTextarea) 사용.

[창]
- RetroWindow title="고민접수 — 개발자의 잡화점", awning=teal(#1f5048), 타이틀바 좌측 노란 큐브 아이콘, 하단 상태바 우측 "🏪 영업중 · 24h".
- 메뉴바(파일/편집/보기/도움말) mono 텍스트 한 줄(장식, 비기능).

[본문]
- 키커(mono, terracotta): "No.118 접수중" (현재 회차 번호는 일단 정적/혹은 다음 published 회차+1 로직은 추후).
- 제목(Jua 26px): "오늘의 고민을 / 맡기고 가세요".
- 서브카피: "우유통에 살며시 넣어두고 가세요. 선정되면 익명으로 게시되고, 누군가의 처방이 도착합니다."
- 주의 박스(sunken, 배경 #fff3c4, ⚠): "본인·타인을 특정할 수 있는 실명, 연락처, 회사명, SNS 아이디는 적지 말아주세요. 익명이라 더 솔직해질 수 있어요." (굵게 강조 부분 유지)

[폼 필드]
1. 표시 방법: [익명][닉네임][초성] 베벨 칩 3개(선택 시 #ffd95c, 미선택 #e4dfd2). 닉네임/초성 선택 시 아래에 텍스트 input(20자) 노출. 초성이면 placeholder "초성 (예: ㄱㄴㄷ)".
2. 나이대(선택): text input, placeholder "예: 20대 후반".
3. 직업/신분(선택, 50자): placeholder "예: 3년차 백엔드".
4. 고민 내용(필수, 2000자): LinedPaperTextarea + "N / 2000" 카운터.
5. 이메일(선택): email input + 형식검증 + "선정 알림에만 쓰고 게시물엔 절대 노출되지 않아요."
모든 input은 sunken 베벨 + 배경 #fffdf6.

[우유통 투입 모티프]
- 제출 버튼 위에 sunken 패널: 좌측 우유통 아이콘(DESIGN_TOKENS.md milk box CSS 도형, 약 30×36, "우유" 라벨), 우측 텍스트 "다 쓴 편지는 가게 옆 우유통에 살짝 넣어두면 돼요. 운영자만 조용히 꺼내 읽습니다."
- CTA: RetroButton variant=yellow, Jua "우유통에 넣기 ▸". 아래 캡션 "넣은 뒤에는 익명성을 위해 다시 꺼내볼 수 없어요."

[동작/검증]
- 필수: 표시방법, (닉/초성이면)표시이름, 고민 내용. 이메일 입력 시 형식검증.
- 제출 → server action/route로 worries insert: status 'pending', display_type(anonymous|nickname|initials 매핑), display_name(익명이면 null), age_group, job, content, email.
- 성공 시 같은 레트로 창 톤의 안내 화면으로 전환: "고민이 잘 도착했어요. 선정되면 이메일로 알려드릴게요(이메일 입력 시)." — 재조회 수단 제공하지 않음.
- 제출 중 로딩/중복제출 방지, 실패 시 인라인 에러 토스트.

접근성: 모든 input에 label, 카운터 aria-live, 히트영역 44px+.
```

---

## 프롬프트 2 — `/solve` 고민 해결하기

```
/solve 페이지를 완성한다. prototype HTML의 "02 — 고민 해결하기" 프레임 재현. 모바일 우선.

[진입 데이터]
- 서버에서 worries where status='published' 조회. published_at 오름차순 1건만 사용.
- 0건이면: 빈 상태 화면 — RetroWindow 안에 "지금은 받고 있는 고민이 없어요. 다음 회차를 기다려주세요." (편지 폼 숨김).
- 1건이면 아래 렌더.

[창]
- RetroWindow title="처방전 쓰기 — No.117"(번호는 회차/혹은 worry의 표시번호), awning=terracotta(#b5562f), 타이틀바 좌측 봉투 아이콘(CSS 도형: 흰 봉투 + 노란 삼각 플랩), 상태바 우측 "📮 편지 수신중".

[본문]
- From/To 헤더(mono, sunken 아래 점선): 
    From : 나의 처방
    To   : @{표시이름 or 익명} · {직업}
    RE   : No.117 — {고민 한 줄 요약 or 제목}
- 고민 원문 패널: sunken + 편지지(LinedPaper) 배경, Gaegu 17px로 worry.content 전문 표시(읽기 전용). 상단에 표시명/나이/직업 칩(mono pill).
- 구분선 "℞ 나의 처방"(Jua, terracotta, 양옆 라인).

[폼]
1. 표시 방법 칩(익명/닉네임/초성) — /submit과 동일 동작(20자).
2. 해결편지(필수, 1000자): LinedPaperTextarea + "N / 1000" 카운터, placeholder "보낼 수는 없겠지만, 당신께 편지를 씁니다…".
- 우측 정렬 CTA: RetroButton variant=terracotta "✉ 보내기"(white-space:nowrap). 아래 캡션 "보낸 편지는 운영자가 정리해 SNS에 올려요."

[동작]
- 제출 → solutions insert: worry_id = 현재 published worry.id, display_type/display_name, content, is_picked=false.
- 성공 → "편지가 잘 전달됐어요." 안내 화면. 제출자 재열람 불가.
- 만약 제출 직전 해당 고민이 closed로 바뀌었으면(레이스) 서버에서 거부 + "방금 이 회차가 마감됐어요" 안내.
```

---

## 프롬프트 3 — `/admin` 운영자(비번 게이트 + 5탭 + 정리)

```
/admin 페이지를 완성한다. prototype HTML의 "03 — 고민 모아보기" 프레임을 정리(마감) 탭 기준으로 확장. 이 화면은 데스크톱 기준이어도 무방.

[접근 제어]
- /admin 진입 시 비밀번호 입력 화면(레트로 창). 제출 → 서버에서 ADMIN_PASSWORD(env) 대조. 통과 시 httpOnly 쿠키/세션 플래그(브라우저 닫기 전 유지). 틀리면 에러 메시지만(잠금/횟수제한 불필요). 미인증 상태로 데이터 라우트 접근 차단(서버에서 검사).

[레이아웃]
- 5개 상태 탭: [대기중(N)][선정됨(N)][게시됨(N)][마감(N)][완료(N)] — mono 베벨 토글(활성 #ffd95c). 각 탭 = 해당 status worries 목록(최신순).
- 모든 항목 카드에 [삭제] 버튼 공통(hard delete, 확인 모달). worry 삭제 시 관련 solutions도 삭제.

[탭별 동작]
① 대기중: 카드(제출일시, 표시명/나이/직업, 고민 전문) + RetroButton "선정하기" → status=selected, selected_at=now().
② 선정됨: 보통 0~1건. "게시 완료" → published, published_at=now(). 단, 이미 published인 worry가 있으면 경고 모달("동시에 게시중인 고민이 이미 있어요"). "대기중으로 되돌리기"(선택) → pending.
③ 게시됨: 현재 /solve 노출 중 카드. 실시간(또는 새로고침) solutions count 표시: "해결편지 N건 도착". "마감" → closed, closed_at=now().
④ 마감 — 정리(가장 중요): 고민 클릭 → 상세 뷰.
   - 상단: 고민 원문 전체(편지지 패널).
   - 하단: 해당 worry의 solutions 전체 목록. 각 편지 카드 앞에 베벨 체크박스 → 클릭 시 is_picked 즉시 토글(낙관적 업데이트 + 서버 PATCH, 자동저장, 별도 저장버튼 없음). 채택 카드는 #ffd95c 체크 + 그림자 강조. 편지 본문은 Gaegu.
   - 상단 우측: [전체 N] / [채택 M] 세그먼트 토글(채택만 필터) + [전체 복사] 버튼(채택 편지 원문들을 "[i] 이름\n본문" 형식으로 클립보드 복사).
   - "완료 처리" → completed, completed_at=now().
⑤ 완료: 아카이브 뷰(고민 + 달린 편지 전체 열람, 읽기전용). 액션 없음. 검색/필터는 선택(있으면 좋음, 필수 아님).

[데이터 규칙]
- 상태 전환은 서버 action으로만(직접 클라이언트에서 update 금지). 전환 시 해당 타임스탬프 기록.
- 상태는 한 방향 진행(역행 버튼은 선정됨→대기중만 선택적으로).
- 카운트(N)는 status별 집계 쿼리.

[톤]
- 전부 RetroWindow/Bevel/RetroButton 재사용. 타이틀바 좌측 초록 큐브, awning=teal, 상태바 우측 "🗂 {채택수}건 채택됨".
```

---

## 마무리 체크리스트(구현 후)
- [ ] 상태 흐름 pending→selected→published→closed→completed 한 방향 동작
- [ ] /solve가 published 1건만(2건 이상이면 가장 먼저 게시된 것) 노출
- [ ] 글자수 제한(20/50/2000/1000) 프론트+서버 양쪽 검증
- [ ] 이메일/표시이름 등 민감정보가 공개 화면(/solve)에 절대 안 나옴
- [ ] /admin 비번 미통과 시 데이터 접근 차단(서버 검사)
- [ ] 마감 탭 체크박스 자동저장 + 전체 복사
- [ ] 모바일에서 /submit·/solve 레이아웃 정상
- [ ] 편지지 줄과 글자 정렬(line-height=줄간격 28, 위패딩 0)
