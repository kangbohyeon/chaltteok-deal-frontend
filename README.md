# chaltteok-deal-frontend

찰떡(Chaltteok) 타임딜 플랫폼의 프론트엔드 모노레포입니다. Turborepo 기반으로 유저/점주/관리자 웹 애플리케이션과 공통 패키지를 함께 관리합니다.

## 기술 스택

- **프레임워크:** Next.js 16, React 19, TypeScript 5
- **스타일링:** Tailwind CSS 4 (`prettier-plugin-tailwindcss`로 클래스 자동 정렬)
- **데이터 패칭:** TanStack React Query 5
- **모노레포:** Turborepo, npm Workspaces
- **코드 품질:** ESLint 9, Prettier 3, Husky + lint-staged (pre-commit 자동 검사)

## 프로젝트 구조

```
chaltteok-deal-frontend (Root)
├── apps/
│   ├── user      [Next.js] 유저 앱 → 3000 포트
│   ├── owner     [Next.js] 점주 앱 → 3001 포트
│   └── admin     [Next.js] 관리자 앱 → 3002 포트
└── packages/
    ├── shared-api    공통 API 클라이언트/타입
    ├── shared-store  공통 상태 관리
    └── shared-ui     공통 UI 컴포넌트
```

| 앱           | 역할                                                                                    |
| ------------ | --------------------------------------------------------------------------------------- |
| `apps/user`  | 회원가입/로그인(계정 잠금, 계정/비밀번호 찾기), 상품 조회/구매, 주문 내역, 댓글/문의 등 |
| `apps/owner` | 상품/재고/타임세일/배너 관리, 주문 관리, 매출 대시보드                                  |
| `apps/admin` | 운영자용 관리 화면                                                                      |

## 핵심 규칙

- TypeScript `any` 타입 사용 절대 금지
- Tailwind 클래스는 Prettier(`prettier-plugin-tailwindcss`)로 자동 정렬
- 커밋 시 Husky pre-commit 훅(lint-staged)이 자동 실행되며 `--no-verify` 우회 금지

## 로컬 실행

### 사전 요구사항

- Node.js 20+, npm 10.8.2

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev            # 전체 앱 동시 실행 (Turborepo)
npm run dev:user        # 유저 앱만 (3000)
npm run dev:owner       # 점주 앱만 (3001)
npm run dev:admin       # 관리자 앱만 (3002)
```

### 빌드 / 린트

```bash
npm run build
npm run lint
```

## 브랜치 전략

- `main`: 운영 배포 브랜치
- `develop`: 개발 통합 브랜치
- `feature/*`: 기능 개발 브랜치 → `develop`로 Squash Merge
- `develop` → `main` 배포는 Release PR을 통해 Merge Commit으로 병합
