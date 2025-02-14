# Read ME

# 무브릿(MovLit) - 사용자 맞춤 영화, 책 추천과 채팅 제공 서비스

## 🕸️ 시스템 아키텍처

![https://github.com/user-attachments/assets/96b372dd-52ee-4481-96d1-fba414443c4a](https://github.com/user-attachments/assets/96b372dd-52ee-4481-96d1-fba414443c4a)

## 📄 프로젝트 개요

- 영화 도서의 통합 검색 및 사용자 맞춤 데이터 제공
- 실시간 데이터 처리를 활용한 유저 간 상호작용

## 🧑🏻‍💻 프로젝트 인원 및 기간

- **개발 인원**: 백엔드 개발자 4명 (FE, BE 동시 개발)
- **프로젝트 기간**: `2024.12.17 ~ 2025.02.13` (58일)

## 🎥 핵심 기능

<details>
<summary><h3>메인 화면</h3></summary>

![https://github.com/user-attachments/assets/c86c38e8-4812-427e-950f-42fdb85cdd11](https://github.com/user-attachments/assets/c86c38e8-4812-427e-950f-42fdb85cdd11)

![https://github.com/user-attachments/assets/99e01ff5-b105-4c0b-98cd-224ee0070b02](https://github.com/user-attachments/assets/99e01ff5-b105-4c0b-98cd-224ee0070b02)

- 카테고리별 콘텐츠(영화, 책) 리스트 제공
</details>

<details>
<summary><h3>상세 화면</h3></summary>

![https://github.com/user-attachments/assets/a9a6668b-0632-4445-b92f-703b880e30e1](https://github.com/user-attachments/assets/a9a6668b-0632-4445-b92f-703b880e30e1)

![https://github.com/user-attachments/assets/93140632-99de-4166-b4ef-384bfa25bb73](https://github.com/user-attachments/assets/93140632-99de-4166-b4ef-384bfa25bb73)

![https://github.com/user-attachments/assets/9ac75e7f-9782-46cd-a63b-8cf710e015a1](https://github.com/user-attachments/assets/9ac75e7f-9782-46cd-a63b-8cf710e015a1)

![https://github.com/user-attachments/assets/79539d4b-16ed-473a-aeae-4dc15e737690](https://github.com/user-attachments/assets/79539d4b-16ed-473a-aeae-4dc15e737690)

- 평점 및 코멘트, 찜, 유사 콘텐츠 제공 기능

</details>

<details>
<summary><h3>통합 검색</h3></summary>

[//]: # (![https://github.com/user-attachments/assets/2e66d8b0-9f04-4ecb-bdb7-ffe42a01bcfa]&#40;https://github.com/user-attachments/assets/2e66d8b0-9f04-4ecb-bdb7-ffe42a01bcfa&#41;)
<img src="https://github.com/user-attachments/assets/2e66d8b0-9f04-4ecb-bdb7-ffe42a01bcfa" style="width:400px">

- 콘텐츠의 제목/장르/카테고리/출연 배우/제작 등으로 검색 및 유사 콘텐츠 제공
</details>

<details>
<summary><h3>프로필 페이지</h3></summary>

![https://github.com/user-attachments/assets/8f440bfd-d64c-4e43-8329-5502c0b0b062](https://github.com/user-attachments/assets/8f440bfd-d64c-4e43-8329-5502c0b0b062)

- 팔로우/언팔로우, 개인정보 수정 및 사용자 정보 기반의 맞춤 콘텐츠 제공
</details>

<details>
<summary><h3>1:1 채팅 (DM)</h3></summary>

![https://github.com/user-attachments/assets/b3c1e0c9-b985-4b24-af52-5c1cde01ae55](https://github.com/user-attachments/assets/b3c1e0c9-b985-4b24-af52-5c1cde01ae55)

- 최초 DM 전송 시 프로필 페이지에서 채팅방 생성

![https://github.com/user-attachments/assets/7cd08d50-8ec1-4f38-88dc-35eb4c67bdf7](https://github.com/user-attachments/assets/7cd08d50-8ec1-4f38-88dc-35eb4c67bdf7)

- 일대일 채팅방 접속 중인 상태에서 상대방이 프로필 사진이 변경되면, 실시간 업데이트

![https://github.com/user-attachments/assets/505fea8c-7cbd-4eac-b7e1-a35a73763797](https://github.com/user-attachments/assets/505fea8c-7cbd-4eac-b7e1-a35a73763797)

- 일대일 채팅을 받으면, 그 받은 유저에게 알림이 오는 기능

</details>

<details>
<summary><h3>그룹 채팅</h3></summary>

- 콘텐츠 검색 및 그룹 채팅방 생성

![https://github.com/user-attachments/assets/f24799ba-e133-4824-9858-7fa50ed64abd](https://github.com/user-attachments/assets/f24799ba-e133-4824-9858-7fa50ed64abd)


- 실시간 그룹 채팅

![https://github.com/user-attachments/assets/48cbec83-32e2-480d-88d7-71ef0cf99c47](https://github.com/user-attachments/assets/48cbec83-32e2-480d-88d7-71ef0cf99c47)


- 실시간으로 프로필 정보 변경 반영

![https://github.com/user-attachments/assets/65d61216-23da-4f51-952e-437f7cbf5adb](https://github.com/user-attachments/assets/65d61216-23da-4f51-952e-437f7cbf5adb)


- 채팅방 나가기

![https://github.com/user-attachments/assets/62f28b53-feb7-4f45-81fa-6bbc37848107](https://github.com/user-attachments/assets/62f28b53-feb7-4f45-81fa-6bbc37848107)

</details>

<details>
<summary><h3>사용자 알림</h3></summary>

- 채팅, 팔로우, 콘텐츠 찜 이벤트를 실시간으로 알림 제공

![https://github.com/user-attachments/assets/cb18199a-8ed0-49eb-8515-8cda7d2e0503](https://github.com/user-attachments/assets/cb18199a-8ed0-49eb-8515-8cda7d2e0503)

</details>

## 💎 핵심 구현

## 🛠️ 기술 스택

| Frontend |  |  |
| --- | --- | --- |
|  | React (Vite) | 사용자 인터페이스 구축을 위한 프론트엔드 라이브러리 (Javascript) |
| Backend |  |  |
|  | Springboot 3.4 | 웹 애플리케이션 백엔드 프레임워크 (Java) |
|  | Spring Data JPA | JPA기반의 리포지토리를 통한 데이터 액세스 수행 |
|  | Spring Security | Spring Security, OAuth2.0, JWT를 활용한 인증, 권한 관리 |
| Test & Doc |  |  |
|  | Rest Assured 5.3 | REST API 테스트를 수행 |
|  | Spring REST Docs 3.0 | API 문서를 자동으로 생성 |
| DB & Caching |  |  |
|  | MySQL 8.0 | 유저정보, 콘텐츠 정보, 채팅방 정보 등의 정형 데이터 |
|  | MongoDB 5.0 | 채팅 메시지, 사용자 push알림과 같은 비정형 데이터 |
|  | Elasticsearch 8.16 | 검색 및 추천을 위한 콘텐츠 데이터 저장소 |
|  | Redis 7.0 | caching, pub/sub, queue, stream 사용 |
| Build & Deploy |  |  |
|  | Github Actions | CI/CD 자동화를 위해 GitHub에서 코드 변경 관리 및 빌드, AWS 환경에 배포 |
|  | AWS | AWS EC2 및 RDS, ELB, Route53, ACM을 활용해 배포 환경 구성 |
|  | Docker | Vite-React, Springboot, Redis의 Docker Container 환경 구축 |

## 🧑‍🤝‍🧑 멤버

| 팀장 | 팀원 | 팀원 | 팀원 |
| --- | --- | --- | --- |
| <a href="https://github.com/devbattery"><img src = "https://avatars.githubusercontent.com/u/60080167?v=4" width="120px;"> | <a href="https://github.com/minyoongi96"><img src = "https://avatars.githubusercontent.com/gunoc" width="120px;"> | <a href="https://github.com/G1Huh"><img src = "https://avatars.githubusercontent.com/chunghye98" width="120px;"> | <a href="https://github.com/minjikimkim2222"><img src = "https://avatars.githubusercontent.com/won4885" width="120px;"> |
| [정원준](https://github.com/devbattery) | [민윤기](https://github.com/minyoongi96) | [허지원](https://github.com/G1Huh) | [김민지](https://github.com/minjikimkim2222) |

## 📉 ERD 설계도

### 영화 (movie)

![https://github.com/user-attachments/assets/47596b32-ffbc-4eca-9602-f6a0e1da11ba](https://github.com/user-attachments/assets/47596b32-ffbc-4eca-9602-f6a0e1da11ba)

### 책 (book)

![https://github.com/user-attachments/assets/08851cee-5ca8-49f4-bdd6-68ff47ac417c](https://github.com/user-attachments/assets/08851cee-5ca8-49f4-bdd6-68ff47ac417c)

### 멤버 (member)

![https://github.com/user-attachments/assets/44b74d85-a6e2-45a8-999f-b331a4df03db](https://github.com/user-attachments/assets/44b74d85-a6e2-45a8-999f-b331a4df03db)