# MovLit(Movie & Literature) - 사용자 맞춤 영화, 책 추천과 채팅 제공 서비스

## 🕸️ 시스템 아키텍처

<img src="https://github.com/user-attachments/assets/96b372dd-52ee-4481-96d1-fba414443c4a">

## 📄 프로젝트 개요

- 영화 도서의 통합 검색 및 사용자 맞춤 데이터 제공
- 실시간 데이터 처리를 활용한 유저 간 상호작용

## 🧑🏻‍💻 프로젝트 인원 및 기간

- **개발 인원**: 백엔드 개발자 4명 (FE, BE 동시 개발)
- **프로젝트 기간**: `2024.12.17 ~ 2025.02.13` (58일)

## 🎥 핵심 기능

<details>
<summary><h3>메인 화면 - 카테고리별 콘텐츠(영화, 도서) 리스트 제공</h3></summary>

- 메인 화면 (영화)

<img src="https://github.com/user-attachments/assets/c86c38e8-4812-427e-950f-42fdb85cdd11" style="width: 600px">

- 메인 화면 (도서)

<img src="https://github.com/user-attachments/assets/99e01ff5-b105-4c0b-98cd-224ee0070b02" style="width: 600px">

</details>

<details>
<summary><h3>상세 화면 - 평점 및 코멘트, 찜, 유사 콘텐츠 제공 기능</h3></summary>

- 도서 상세 정보 : 평점, 관련 도서 / 영화 리스트 제공

<img src="https://github.com/user-attachments/assets/a9a6668b-0632-4445-b92f-703b880e30e1" style="width: 600px">

<hr/>

- 평점 및 코멘트 입력 및 조회

<img src="https://github.com/user-attachments/assets/93140632-99de-4166-b4ef-384bfa25bb73" style="width: 600px">

<hr/>

- 영화 상세 정보 : 평점, 관련 도서 / 영화 리스트 제공

<img src="https://github.com/user-attachments/assets/9ac75e7f-9782-46cd-a63b-8cf710e015a1" style="width: 600px">

<hr/>

- 평점 및 코멘트 입력 및 조회

<img src="https://github.com/user-attachments/assets/79539d4b-16ed-473a-aeae-4dc15e737690" style="width: 600px">



</details>

<details>
<summary><h3>통합 검색 - 콘텐츠 검색 및 유사 콘텐츠 제공</h3></summary>

- 콘텐츠의 제목/장르/카테고리/출연 배우/제작 등으로 검색 및 유사 콘텐츠 제공

<img src="https://github.com/user-attachments/assets/2e66d8b0-9f04-4ecb-bdb7-ffe42a01bcfa" style="width:600px">


</details>

<details>
<summary><h3>프로필 페이지 - 팔로우, 개인정보 수정 및 맞춤 콘텐츠 제공</h3></summary>

- 팔로우/언팔로우, 개인정보 수정 및 사용자 정보 기반의 맞춤 콘텐츠 제공

<img src="https://github.com/user-attachments/assets/8f440bfd-d64c-4e43-8329-5502c0b0b062" style="width:600px">


</details>

<details>
<summary><h3>1:1 채팅 (DM) - 타 사용자와 1:1 채팅</h3></summary>

- 최초 DM 전송 시 프로필 페이지에서 채팅방 생성

<img src="https://github.com/user-attachments/assets/b3c1e0c9-b985-4b24-af52-5c1cde01ae55" style="width:600px">
<hr/>

- 일대일 채팅방 접속 중인 상태에서 상대방이 프로필 사진이 변경되면, 실시간 업데이트

<img src="https://github.com/user-attachments/assets/7cd08d50-8ec1-4f38-88dc-35eb4c67bdf7" style="width:600px">
<hr/>

- 일대일 채팅을 받으면, 그 받은 유저에게 알림이 오는 기능

<img src="https://github.com/user-attachments/assets/505fea8c-7cbd-4eac-b7e1-a35a73763797" style="width:600px">

</details>

<details>
<summary><h3>그룹 채팅 - 콘텐츠(영화/책)의 그룹 채팅방 가입 및 채팅을 통한 의견 교류</h3></summary>

- 콘텐츠 검색 및 그룹 채팅방 생성

<img src="https://github.com/user-attachments/assets/f24799ba-e133-4824-9858-7fa50ed64abd" style="width:600px">
<hr/>

- 실시간 그룹 채팅

<img src="https://github.com/user-attachments/assets/48cbec83-32e2-480d-88d7-71ef0cf99c47" style="width:600px">
<hr/>

- 실시간으로 프로필 정보 변경 반영

<img src="https://github.com/user-attachments/assets/65d61216-23da-4f51-952e-437f7cbf5adb" style="width:600px">
<hr/>

- 채팅방 나가기

<img src="https://github.com/user-attachments/assets/62f28b53-feb7-4f45-81fa-6bbc37848107" style="width:600px">

</details>

<details>
<summary><h3>사용자 알림 - 특정 이벤트에 대한 실시간 알림</h3></summary>

- 채팅, 팔로우, 콘텐츠 찜 이벤트를 실시간으로 알림 제공

<img src="https://github.com/user-attachments/assets/cb18199a-8ed0-49eb-8515-8cda7d2e0503" style="width:600px">

</details>

## 💎 핵심 구현

<details>
<summary><h3> 1. 그룹 채팅방 생성 시 동시성 문제 해결</h3></summary>

Movlit 서비스에서는**한 컨텐츠당 하나의 그룹 채팅방**만 생성되도록 구현되어 있습니다.

인기 영화나 책이 공개되자마자 수많은 사용자가 동시에 “채팅방 만들기” 버튼을 누를 경우, 서버가 요청을 감당하지 못해 여러 채팅방이 생성될 수 있습니다.

이를 해결하기 위해**Worker 클래스**를 도입하였습니다.

Worker 클래스는**Redis Queue**와**Thread Pool**을 활용하여 채팅방 생성 요청을**비동기적으로 처리**합니다.

### 주요 처리 과정

- **Callable 인터페이스 활용**
    - 비동기 작업을 정의하여 Redis에서 데이터를 가져오는 작업을 처리합니다.
- **Redis Queue Key 생성**
    - Key Prefix와 contentId를 조합하여 Redis Queue의 Key를 생성합니다.
- **데이터 조회**
    - `rightPop()`메서드를 사용하여 가장 오래된 생성 요청을 최대 10초 동안 대기하며 가져옵니다.
    - 만약 데이터가 없거나 의도한 String 형태가 아니라면 empty를 반환합니다.
    - 정상적인 String 데이터라면 contentId와 memberId를 Map 형태로 반환합니다.
- **Future를 통한 결과 처리**
    - ThreadPoolExecutor의`submit()`메서드를 통해 Callable task를 비동기 실행하고, Future 객체로 결과를 관리합니다.
    - `future.get(30초)`를 호출하여 작업 완료를 기다리며, 30초 내에 완료되지 않으면 TimeoutException이 발생합니다.
    - **예외 처리:**
        - **InterruptedException:**스레드가 인터럽트될 경우 현재 스레드의 인터럽트 상태를 재설정합니다.
        - **ExecutionException:**Callable 실행 중 예외 발생 시 처리합니다.
        - **TimeoutException:**작업이 30초 안에 완료되지 않으면 발생합니다.
        - 위 세 가지 예외 발생 시,`GroupChatroomCreationWhenWorkingException`을 발생시켜 채팅방 생성 요청 처리 중 문제가 있음을 알립니다.

### 관련 이미지

<img width="1210" alt="image (4)" src="https://github.com/user-attachments/assets/d569a81d-b1e3-43f2-b296-551111229f1d" />
<img width="1416" alt="image (5)" src="https://github.com/user-attachments/assets/507953fb-8d63-4a84-a6ef-5efe3373c2ac" />

</details>

---

<details>
<summary><h3> 2. 메시징 (Redis Pub/Sub) 흐름</h3></summary>

실시간 채팅 메시지 전송을 위해**WebSocket**과**Redis Pub/Sub**를 활용하고 있습니다.

- **메시지 전송 과정:**
    1. 클라이언트가 채팅 메시지를 전송합니다.
    2. 서버는 메시지를 가공한 후, Redis Broker에 특정 토픽으로 발행합니다.
- **사용하는 토픽:**
    - 메시지 전송, 채팅방 업데이트, 채팅방 생성, 사용자 알림 등
- **후처리:**
    - Redis Subscriber가 각 토픽을 구독하여 후처리를 진행하고, 브로드캐스트 방식으로 실시간 반영됩니다.

### 관련 이미지

<img width="1152" alt="image (6)" src="https://github.com/user-attachments/assets/74068e47-3d14-404f-bee0-3e8b18454f67" />

</details>

---

<details>
<summary><h3> 3. 메시지 처리 (Redis Stream) 흐름</h3></summary>

채팅 메시지의**실시간 전송**과**영구 저장**을 위해 Redis Stream과 Pub/Sub를 사용합니다.

- **메시지 전송 및 처리 과정:**
    1. 사용자가 채팅 메시지를 전송하면, 서버에서 메시지를 가공합니다.
    2. Redis Publish를 통해 다른 소비자에게 메시지를 전달하여 WebSocket과 SSE를 통한 UI 업데이트가 이루어집니다.
    3. 동시에 Redis Stream에 메시지를 추가하여, 하나 이상의 Consumer가 그룹으로 묶여 비동기적으로 처리합니다.
    4. MongoDB에 저장 후, ACK를 전송하여 메시지 처리가 완료되었음을 확인합니다.
- **Redis Stream 사용 이유:**
    - **Consumer Group 지원:**Producer가 발행한 메시지를 여러 Consumer가 중복 없이 순차적으로 병렬 처리할 수 있습니다.
    - **비동기 처리:**메시지 저장을 별도의 리스너가 비동기적으로 처리하여 수평 확장이 용이합니다.
    - **실시간성과 안정성 분리:**메시지 전송/알림은 실시간, 저장은 비동기 처리함으로써 효율적인 파이프라인을 구축합니다.

### 관련 이미지

<img width="1278" alt="image (7)" src="https://github.com/user-attachments/assets/2ce8800a-0103-4925-b980-9cef729352e2" />
<img width="1416" alt="image (8)" src="https://github.com/user-attachments/assets/844591d9-6366-466c-9e32-4ae4db3a5166" />
<img width="1369" alt="image (9)" src="https://github.com/user-attachments/assets/75b70d01-740e-44d2-92ad-a8086af1454f" />

- **Consumer 클래스:**
    - 별도의 Consumer 클래스를 정의하여 Consumer Group의 등록, 구독 설정, 종료 처리를 관리합니다.
    - `@PostConstruct`로 애플리케이션 시작 시 ConsumerGroup이 없으면 생성하고, 지정한 그룹과 이름으로 StreamOffset 이후의 메시지를 구독합니다.
- **StreamListener 구현체 (ChatMessageStreamListener):**
    - Redis 스트림에서 전달된 채팅 메시지를 처리하며, MongoDB에 저장 후 ACK를 전송합니다.

</details>

---

<details>
<summary><h3> 4. 그룹채팅방 멤버정보 캐싱 (Redis Cache)</h3></summary>

그룹 채팅방에 참여한 멤버 정보를 실시간으로 조회할 경우 DB 부하가 크므로**Redis 캐싱**을 도입하였습니다.

- **처리 과정:**
    - **Cache Hit:**Redis에 캐싱된 데이터를 빠르게 조회합니다.
    - **Cache Miss:**DB에서 조회 후 Redis에 캐싱하여 이후 요청에 빠르게 응답할 수 있도록 합니다.

### 관련 이미지

<img width="1245" alt="image (14)" src="https://github.com/user-attachments/assets/9224e9c3-6ddc-4601-ba88-5ba781928a63" />

</details>

---
<details>
<summary><h3> 5. 캐싱 성능 개선</h3></summary>

DB에서 멤버 정보를 조회할 경우 평균 두 자리 수의 시간이 소요되지만, Redis 캐시를 사용하면 평균 한 자리 수의 시간으로 조회가 가능해졌습니다.

### 관련 이미지

<img width="517" alt="image (15)" src="https://github.com/user-attachments/assets/92afb98c-d425-4f75-a63a-bd2c924df450" />
</details>

---

<details>
<summary><h3> 6. 일대일 채팅방 목록 캐싱 (Redis Cache)</h3></summary>

**일대일 채팅방**은 삭제 없이 새로운 채팅이 추가되는 형태이므로 변경 빈도가 낮습니다.

따라서, 채팅방 목록 역시 Redis 캐싱을 통해 빠르게 조회할 수 있도록 처리하였습니다.

- **처리 과정:**
    - **Cache Hit:**Redis에 저장된 캐시 데이터를 조회합니다.
    - **Cache Miss:**DB에서 데이터를 가져온 후 Redis에 캐싱합니다.

### 관련 이미지

<img width="1283" alt="image (16)" src="https://github.com/user-attachments/assets/57862678-d57d-410b-ba94-8de8d910d513" />

</details>

---
<details>
<summary><h3> 7. 일대일 채팅방 캐시 업데이트 (Redis Cache)</h3></summary>

일대일 채팅의 경우,

1. 상대방에게 최초 메시지 전송 시 일대일 채팅방이 생성되고 메시지가 전송됩니다.
2. RDB에 채팅방 정보 저장 후 Redis 캐시를 업데이트합니다.
3. 이후 토픽을 발행하여 Redis Subscriber 클라이언트를 통해 채팅방 및 메시지 정보를 전달합니다.

### 관련 이미지

<img width="1106" alt="image (17)" src="https://github.com/user-attachments/assets/0ba0f62c-e8ec-4d0c-bf4b-613c4ba35df0" />

</details>

---

<details>
<summary><h3> 8. 실시간 멤버정보 변경과 캐시 동기화</h3></summary>

채팅 중에 사용자의 프로필 사진 등 멤버 정보가 변경되면, 이를 실시간으로 반영할 필요가 있습니다.

- **처리 과정:**
    1. 프로필 업데이트 후 이벤트를 발행합니다.
    2. 업데이트된 멤버 정보를 기반으로 Redis 캐시를 갱신합니다.
    3. Redis로 Publish하여, Subscriber가 WebSocket에 연결된 클라이언트에게 변경된 정보를 전송합니다.

### 관련 이미지

<img width="1154" alt="image (18)" src="https://github.com/user-attachments/assets/b15a3b4a-3ef3-41d6-855b-4dd7e36b2c86" />

</details>

---

<details>
<summary><h3> 9. Redis 캐시 업데이트 코드</h3></summary>

업데이트된 멤버 정보를 캐시에 반영하는 과정은 다음과 같이 진행됩니다.

- **처리 과정:**
    1. Redis에 저장된 기존 멤버 목록을 불러옵니다. (캐시가 없다면 DB에서 조회)
    2. 이벤트에서 전달받은 업데이트된 멤버 객체를 생성합니다.
    3. `modifyCachedMember`함수를 통해 캐시된 멤버 목록에서 업데이트된 멤버와 ID가 같은 항목을 찾아 갱신합니다.
    4. `updateCachedMembers`함수를 통해 변경된 전체 멤버 목록을 Redis에 다시 저장하고, 변경사항을 Publish합니다.

### 관련 이미지

<img width="1416" alt="image (19)" src="https://github.com/user-attachments/assets/1c9f88ae-4be0-4898-99cb-d12959f51093" />
<img width="1420" alt="image (20)" src="https://github.com/user-attachments/assets/9f63be9f-2f14-47c8-97ff-460507c42320" />
<img width="1289" alt="image (21)" src="https://github.com/user-attachments/assets/488efecd-da65-4d64-8ffd-43d9bd2167bd" />
</details>

---

<details>
<summary><h3> 10. SSE 알림</h3></summary>

사용자가 특정 이벤트 발생 시**즉각적인**알림을 받을 수 있도록 SSE(Server-Sent Events)를 사용하여 브라우저 알림과 페이지 내 알림(알림 리스트)을 제공합니다.

- **알림 적용 대상:**
    - 새로운 팔로워 추가
    - 사용자가 찜한 콘텐츠의 그룹 채팅방 생성
    - 1:1 채팅 메시지 수신
    - 그룹 채팅 메시지 수신
- **처리 과정:**
    1. 클라이언트가 SSE 연결 요청 시`addEmitter`메서드가 호출되어 새로운 SSE 연결이 생성됩니다.
    2. 30초 간격으로 하트비트(keep-alive)를 전송하여 연결을 유지합니다.

### 관련 이미지

- **브라우저 알림:**

<img width="562" alt="image (23)" src="https://github.com/user-attachments/assets/8b3dd225-1ffb-44f8-a83a-c0717f56697c" />

- **알림 리스트:**

<img width="460" alt="image (24)" src="https://github.com/user-attachments/assets/f6fda653-4981-4b9e-a4ae-df8331111b3b" />

</details>

---

<details>
<summary><h3> 11. SSE 알림에 Redis Pub/Sub을 사용한 이유</h3></summary>

SSE는 단일 서버 인스턴스에 연결된 클라이언트에게만 알림을 전송할 수 있는 한계가 있습니다.

다중 서버(로드밸런싱) 환경에서는 각 서버가 자신이 관리하는 SSE 연결에만 알림을 보낼 수 있습니다.

따라서**Redis Pub/Sub**을 사용하여,

- 모든 서버 인스턴스가 특정 채널을 구독하고,
- 발행된 메시지를 각 서버가 받아 자신이 관리하는 SSE 연결을 통해 클라이언트에게 알림을 전달할 수 있도록 하였습니다.

### 관련 이미지

<img width="1055" alt="image (27)" src="https://github.com/user-attachments/assets/e4e1fecc-992e-4842-801d-c502e7572ef2" />

</details>

## 🛠️ 기술 스택

|                |                      |                                                       |
|----------------|----------------------|-------------------------------------------------------|
| Frontend       |                      |                                                       |
|                | React (Vite)         | 사용자 인터페이스 구축을 위한 프론트엔드 라이브러리 (Javascript)             |
| Backend        |                      |                                                       |
|                | Springboot 3.4       | 웹 애플리케이션 백엔드 프레임워크 (Java)                             |
|                | Spring Data JPA      | JPA기반의 리포지토리를 통한 데이터 액세스 수행                           |
|                | Spring Security      | Spring Security, OAuth2.0, JWT를 활용한 인증, 권한 관리         |
| Test & Doc     |                      |                                                       |
|                | Rest Assured 5.3     | REST API 테스트를 수행                                      |
|                | Spring REST Docs 3.0 | API 문서를 자동으로 생성                                       |
| DB & Caching   |                      |                                                       |
|                | MySQL 8.0            | 유저정보, 콘텐츠 정보, 채팅방 정보 등의 정형 데이터                        |
|                | MongoDB 5.0          | 채팅 메시지, 사용자 push알림과 같은 비정형 데이터                        |
|                | Elasticsearch 8.16   | 검색 및 추천을 위한 콘텐츠 데이터 저장소                               |
|                | Redis 7.0            | caching, pub/sub, queue, stream 사용                    |
| Build & Deploy |                      |                                                       |
|                | Github Actions       | CI/CD 자동화를 위해 GitHub에서 코드 변경 관리 및 빌드, AWS 환경에 배포      |
|                | AWS                  | AWS EC2 및 RDS, ELB, Route53, ACM을 활용해 배포 환경 구성        |
|                | Docker               | Vite-React, Springboot, Redis의 Docker Container 환경 구축 |

## 🧑‍🤝‍🧑 멤버

| 팀장                                                                                                                    | 팀원                                                                                                                      | 팀원                                                                                                          | 팀원                                                                                                                              |
|-----------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------|
| <a href="https://github.com/devbattery"><img src = "https://avatars.githubusercontent.com/devbattery" width="120px;"> | <a href="https://github.com/minyoongi96"><img src = "https://avatars.githubusercontent.com/minyoongi96" width="120px;"> | <a href="https://github.com/G1Huh"><img src = "https://avatars.githubusercontent.com/G1Huh" width="120px;"> | <a href="https://github.com/minjikimkim2222"><img src = "https://avatars.githubusercontent.com/minjikimkim2222" width="120px;"> |
| [정원준](https://github.com/devbattery)                                                                                  | [민윤기](https://github.com/minyoongi96)                                                                                   | [허지원](https://github.com/G1Huh)                                                                             | [김민지](https://github.com/minjikimkim2222)                                                                                       |

## 📉 ERD 설계도

### 영화 (movie)

![https://github.com/user-attachments/assets/47596b32-ffbc-4eca-9602-f6a0e1da11ba](https://github.com/user-attachments/assets/47596b32-ffbc-4eca-9602-f6a0e1da11ba)

### 책 (book)

![https://github.com/user-attachments/assets/08851cee-5ca8-49f4-bdd6-68ff47ac417c](https://github.com/user-attachments/assets/08851cee-5ca8-49f4-bdd6-68ff47ac417c)

### 멤버 (member)

![https://github.com/user-attachments/assets/44b74d85-a6e2-45a8-999f-b331a4df03db](https://github.com/user-attachments/assets/44b74d85-a6e2-45a8-999f-b331a4df03db)