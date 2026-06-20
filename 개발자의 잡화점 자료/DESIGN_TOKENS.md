# 디자인 토큰 — 개발자의 잡화점

프로토타입: `prototype/개발자의 잡화점.dc.html`. 모든 스타일은 인라인. 아래 값을 그대로 쓰세요.

## 폰트 (Google Fonts)
```
Jua                 → 큰 제목 / 주요 CTA 버튼 라벨 (둥글고 친근한 한글)
Gaegu               → 손글씨: 고민 내용·해결편지 입력칸, 표시된 편지 본문
IBM Plex Sans KR    → 일반 UI/라벨/본문
IBM Plex Mono       → 코드 느낌: No.117, 글자수 카운터, From/To, 상태바, 메뉴바
```
import:
```
https://fonts.googleapis.com/css2?family=Jua&family=Gaegu:wght@400;700&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans+KR:wght@400;500;600;700&display=swap
```

## 색상
```
페이지 배경(틸)        #37615a
창 본체(따뜻한 회베이지) #ddd6c4
타이틀바(딥 틸)        #1f5048   글자 #ffffff
상태바                #cfc9ba   글자 #6f6a5e (mono)
메뉴/구분선           #b3ad9d

본문 잉크             #2a2722
약한 텍스트           #6f6a5e / #8a8474
placeholder          #a39c8b

입력칸 배경           #fffdf6
선택칩/제출 CTA(노랑)  #ffd95c   (raised 보더 #ffe9a6 / #c79a14)
미선택 칩             #e4dfd2
보내기/RX(테라코타)    #b5562f   (raised 보더 #d98a64 / #7d3618), 키커 텍스트도 #b5562f
완료 처리(그린)        #2c8c3c   (raised 보더 #6cc279 / #1b5c27)
주의 박스(노랑틸트)     배경 #fff3c4  글자 #6b5800
요약 박스(프레임3)      배경 #fff3c4
```

## 베벨(입체) — 95창 핵심
```
RAISED(튀어나옴: 버튼/칩/창):
  border-top:2px solid #f1ede2; border-left:2px solid #f1ede2;
  border-right:2px solid #8f897a; border-bottom:2px solid #8f897a;

SUNKEN(들어감: input/textarea/요약패널):
  border-top:2px solid #8f897a; border-left:2px solid #8f897a;
  border-right:2px solid #f1ede2; border-bottom:2px solid #f1ede2;
```

## 그림자(블러 0, 오프셋만 — 톡 튀는 메모장 느낌)
```
창       7px 7px 0 rgba(15,28,25,.22)
주요버튼  3px 3px 0 rgba(15,28,25,.22)
칩       2px 2px 0 rgba(15,28,25,.16)
채택된 편지카드  3px 3px 0 rgba(31,80,72,.30)
```
모서리는 거의 각짐(라운드 0~3px). 베벨 버튼은 border-radius 0.

## 차양(awning) — 창 상단 스캘럽 띠
```
height:15px;
background: repeating-linear-gradient(90deg, #1f5048 0 14px, #e8dfca 14px 28px);  /* 프레임2는 #b5562f */
-webkit-mask: linear-gradient(#000,#000) 0 0/100% 7px no-repeat,
             radial-gradient(circle 7px at 8px 7px, #000 7px, transparent 7.5px) 0 7px/16px 8px repeat-x;
mask: (위와 동일)
```

## 편지지(lined paper) — 고민/편지 입력칸 & 본문
```
font-family:'Gaegu',cursive; font-size:17px; line-height:28px;
padding:0 14px 12px 42px;          /* 위 패딩 0 이 핵심: 글자가 줄에 정확히 앉음 */
background:
  linear-gradient(90deg, transparent 0 34px, rgba(193,90,82,.28) 34px 35px, transparent 35px),   /* 분홍 여백선 */
  repeating-linear-gradient(#fffdf6 0 27px, #d8ccb2 27px 28px);                                   /* 28px 가로줄 */
/* + SUNKEN 베벨 보더 */
```
⚠️ line-height와 줄 간격(28px)을 반드시 일치, 위 패딩은 0으로. 어긋나면 첫 줄이 2줄 높이로 벌어짐.

## 우유통(milk box) 아이콘 — /submit 투입 모티프 (CSS 도형)
```
뚜껑 배경 #7f9a93 (raised #aabfb8/#566962), 몸통 #8fa8a1 (raised #b4c8c2/#54665f),
투입 슬롯 #2f3b37, 라벨 "우유" mono 7px #2f3b37. 약 30×36px.
```

## 글자수 제한 (프론트 검증)
```
닉네임/초성 20자 · 직업/신분 50자 · 고민 내용 2000자 · 해결편지 1000자
고민/편지 칸엔 실시간 "N / 2000" 카운터(mono).
```

## 프레임 너비
모바일 우선. 프로토타입 카드 폭 392px 기준. `/submit`·`/solve`는 모바일 최적화, `/admin`은 데스크톱 기준.
