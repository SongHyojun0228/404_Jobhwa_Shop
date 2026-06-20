# SPEC — 개발자의 잡화점 (기능/로직/데이터)

> 운영자는 SNS(인스타/스레드)에 직접 게시한다. **이 앱은 SNS에 자동 게시하지 않는다.** 앱의 역할 = "수집 + 선별 + 정리". 게시는 운영자가 손으로.

## 데이터 모델

### `worries` (고민)
| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid PK | |
| display_type | text | `anonymous`\|`nickname`\|`initials` |
| display_name | text null | 닉네임/초성. anonymous면 null |
| age_group | text null | 자유 입력 또는 10대/20대/… |
| job | text null | 자유 입력 (50자) |
| content | text not null | 고민 (2000자) |
| email | text null | 선정 알림용. **게시물 노출 금지** |
| status | text not null default `'pending'` | 상태값(아래) |
| created_at | timestamptz default now() | |
| selected_at | timestamptz null | |
| published_at | timestamptz null | `/solve` 노출 시작 |
| closed_at | timestamptz null | `/solve` 노출 종료 |
| completed_at | timestamptz null | 완료 처리 |

### `solutions` (해결편지)
| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid PK | |
| worry_id | uuid FK→worries.id not null | |
| display_type | text | anonymous\|nickname\|initials |
| display_name | text null | |
| content | text not null | 해결편지 (1000자) |
| is_picked | boolean default false | 모아보기 채택 여부 |
| created_at | timestamptz default now() | |

### 상태값 (5단계, 한 방향)
```
pending(대기) → selected(선정) → published(게시) → closed(마감) → completed(완료)
```
- pending: 막 제출 / selected: 골랐으나 아직 SNS 미게시(문구 다듬는 중)
- **published: SNS에 올린 시점. 이 상태에서만 `/solve` 노출 + 편지 수신**
- closed: 편지 수집 마감, `/solve`에서 사라짐, 운영자 정리 중
- completed: 해결법 모음 게시 후 최종. 역행 없음(되돌리기 버튼은 선택).

## 페이지 동작

### `/submit` 고민 넣기 (공개, 상시 오픈)
폼: 표시방법(익명/닉네임/초성, 조건부 입력) · 나이대(선택) · 직업(선택,50) · 고민내용(필수,2000,카운터) · 이메일(선택, 형식검증).
제출 → `worries` insert `status:'pending'` → 안내 화면. **본인 재조회 수단 없음(익명성).**
폼 상단 고정 안내: 실명/연락처/회사명/SNS ID 작성 금지.

### `/solve` 고민 해결하기 (공개)
진입 시 `status='published'` 1건 조회.
- 0건: "지금은 받고 있는 고민이 없어요. 다음 회차를 기다려주세요."
- 1건: 고민 전문 표시 + 편지 폼.
- 2건 이상(정합성 깨짐): `published_at` 오름차순 1건만 노출 + 운영자 확인 필요.
폼: 표시방법 · 해결편지(필수,1000,카운터) → `solutions` insert(`worry_id`=현재 published, `is_picked:false`) → "편지가 잘 전달됐어요."

### `/admin` 운영자 (비번 게이트)
- 진입 시 비번 입력 → `ADMIN_PASSWORD`(env) 대조 → 세션/쿠키 플래그(브라우저 닫기 전 유지). 틀리면 에러만(잠금 불필요).
- 레이아웃: 상태별 탭 `[대기중(N)][선정됨(N)][게시됨(N)][마감(N)][완료(N)]`, 각 탭 최신순 목록.
- **① 대기중**: 목록(제출일시/표시명/나이/직업/고민전문) + `[선정하기]`→selected.
- **② 선정됨**: 보통 0~1건. `[게시 완료]`→published(+이미 published 있으면 경고). `[대기중으로 되돌리기]`(선택).
- **③ 게시됨**: 현재 `/solve` 노출 중. 실시간 편지 개수("해결편지 7건 도착"). `[마감]`→closed.
- **④ 마감 — 정리(가장 중요)**: 고민 클릭→상세. 상단 고민 원문, 하단 편지 전체 목록 **각 편지 앞 체크박스**(클릭 시 `is_picked` 즉시 토글, 자동저장). `[선택한 편지만 모아보기]` 토글(is_picked=true만). 모아보기에 **[전체 복사]**(채택 편지 원문 클립보드). `[완료 처리]`→completed.
- **⑤ 완료**: 아카이브(고민+편지 전체 열람). 액션 없음, 검색/필터는 선택.

## 비기능
- 인증: `/admin`만 비번. `/submit`,`/solve` 완전 공개.
- 동시성: 동시 published 1건 원칙(앱이 강제할 필요는 없으나 게시완료 시 경고).
- 삭제: 운영자 부적절 항목 제거 **필수**. 모든 탭에 `[삭제]`(hard delete로 단순하게 가능).
- 알림(이메일): 1차 생략 가능(추후 Resend 등).
- 반응형: `/submit`,`/solve` 모바일 우선. `/admin` 데스크톱 기준.

## MVP 범위
submit 폼+insert / solve published 1건 조회+폼+insert / admin 비번 / admin 5탭+상태전환 4버튼 / 마감탭 체크박스+모아보기. (이메일·전체복사·soft delete·검색은 추후.)
