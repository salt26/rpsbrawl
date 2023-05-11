export const Language = [
  {
    title: "RPS Brawl",
    intro_text: "Enjoy Rock Scissor Paper with several friends! 😁",
    rule: "Rule",
    explanation: `The lastest hand is shown in the center of the screen. If you win the hand, you will get +1 points. But if not, you will get -1 points.`,
    start: "Start",
    entrance: "Start",
    name: "Name",
    join: "Join",
    quit: "Quit",
    places: "Places",
    play: "Play",
    network_logs: "Network logs",
    rooms: "Rooms",
    create_room: "Create Room",
    quick_start: "Quick Start",
    mode: "Mode",
    normal: "Normal",
    limited: "Limited",
    privateRoom: "Private room",
    create: "Create",
    cancel: "Cancel",
    update: "Update",
    settings: "Settings",
    reconnection_request: "Please reconnect with the same username.",
    ingame_title_text: "Thinking about which hand to play...",
    ingame_describe_text: (num) => {
      return `The game starts soon ( connected : ${num} ) `;
    },
    team: "Team",
    add_bot: "Add bots",
    skilled: "Skilled",
    dumb: "Dumb",
    teams: ["red", "orange", "yellow", "green", "blue", "navy", "purple"],
    time_over: "Time over!",
    save_result: "Save result",
    result_page_text: (count) => {
      return `You'll be moved to the room in ${count} seconds...`;
    },
    no_room_text: "Create new room to play! 😁",
    limited_text: "You cannot throw the same hand in a row.",
    quick_start_limit_text: "There's no room available.",
    quit_warning_text: "You cannot quit from playing room.",
    tutorial: [
      "How to play",
      "1. Sign in",
      "2. Create or Join a room",
      "3. Settings",
      "4. Teams & Bots",
      "5. Start",
      "6. Play",
    ],
    tutorial_details: [
      [
        "Press F11 for best experience.",
        "Enjoy Rock-Paper-Scissors with your friends!",
        "6-15 people are the best! 👍",
        "Up to 30 people can play!",
        "Solo play is also available with bots 🤖",
      ],
      "Please enter your nickname.",
      `You can create room 
or 
join the existing room.`,
      `⦁ Normal : normal mode.
⦁ Limited : cannot throw the same hand in a row.
⦁ Only the room host can set the mode.`,
      `⦁ Anyone can change teams.
⦁ Dumb : A bot that only throws the losing hand.
⦁ Skilled : A bot that only throws the winning hand.
⦁ Only the room host can set the bot.`,
      `The game starts when the room host presses "Start"!`,
      `Whenever someone throws a hand, 
it will be displayed in the center of the screen.
If you win the hand, you will get +1 points.
But if you lose the hand, you will get -1 points.
You can throw your hand repeatedly every second.
Get the most points in 60 seconds! 🤩`,
    ],
    name_blank: "Name is required.",
    name_long: "Name must be no more than 32 characters long.",
    already_end: "The game has already finished.",
    disconnected: "Someone has disconnected.",
    page_not_found: "Page not found.",
    bot_exceed: "Cannot add more bots.",
    bot_negative: "Cannot be reduced to less than zero.",
    password_long: "Please set a password of no more than 20 characters long.",
    title_long: "Please set a title of no more than 32 characters long.",
  },

  {
    title: "RPS Brawl",
    intro_text: "여러 명의 친구들과 가위바위보 난투를 즐기세요! 😁",
    rule: "규칙",
    explanation: `가장 마지막에 낸 사람의 손이 화면에 크게 보입니다. 이 손을 이기면 +1점! 지면 -1점! 60초 안에 가장 많은 점수를 획득하세요!`,
    start: "시작",
    entrance: "입장",
    name: "이름",
    join: "참여",
    quit: "나가기",
    play: "게임 중",
    places: "순위",
    network_logs: "네트워크 로그",
    rooms: "방 목록",
    create_room: "방 만들기",
    quick_start: "빠른 시작",
    mode: "모드",
    normal: "일반",
    limited: "한 손 제한",
    privateRoom: "비밀방",
    create: "생성",
    cancel: "취소",
    update: "변경",
    settings: "설정",
    limited_explain_text: " ",
    reconnection_request: "같은 이름으로 재접속해주시기 바랍니다.",
    ingame_title_text: "무엇을 낼지 고민하는 중..",
    ingame_describe_text: (num) => {
      return `난투가 곧 시작됩니다. ( 현재 : ${num}명 ) `;
    },
    team: "팀",
    add_bot: "봇 추가",
    skilled: "실력봇",
    dumb: "트롤봇",
    teams: ["빨강", "오렌지", "노랑", "초록", "파랑", "네이비", "보라"],
    time_over: "시간 종료!",
    save_result: "결과 저장",
    result_page_text: (count) => {
      return `${count} 초 후에 대기실로 이동됩니다...`;
    },
    no_room_text: "방을 생성하고 게임을 즐기세요!😁",
    limited_text: "같은 손을 연속해서 낼 수 없습니다. (한 손 제한)",
    quick_start_limit_text: "들어갈 수 있는 방이 없습니다.",
    quit_warning_text: "게임 중에는 나갈 수 없습니다.",
    tutorial: [
      "게임 방법",
      "1. 입장",
      "2. 방 생성 혹은 기존 방 입장",
      "3. 게임 설정",
      "4. 팀 선택 및 봇 설정",
      "5. 시작",
      "6. 플레이",
    ],
    tutorial_details: [
      [
        "F11 버튼을 눌러 전체화면으로 플레이하세요!",
        "여럿이서 가위바위보를 즐겨보세요!",
        "추천 인원 6~15명! 👍",
        "최대 30명까지 플레이 가능!",
        "혼자서도 봇과 함께 재미있게! 🤖",
      ],
      "게임에서 사용할 닉네임을 입력해주세요.",
      "새롭게 방을 생성하거나 기존에 있던 방에 입장하세요.",
      `⦁ 일반(normal): 일반 모드
⦁ 한 손 제한(limited): 연속으로 같은 손을 낼 수 없는 모드
⦁ 방 설정은 방장만 가능합니다.`,
      `⦁ 팀은 누구나 자유롭게 바꿀 수 있습니다.
⦁ 트롤봇(dumb): 지는 손만 내는 봇 
⦁ 실력봇(skilled): 이기는 손만 내는 봇 
⦁ 봇 설정은 방장만 가능합니다.`,
      `방장이 "시작"을 누르면 게임이 시작됩니다!`,
      `누군가가 손을 낼 때마다 해당 손이 화면 중앙에 표시됩니다.
이 손을 이기면 +1점! 지면 -1점!
손은 1초마다 반복하여 낼 수 있습니다.
60초 안에 가장 많은 점수를 획득하세요!`,
    ],
    name_blank: "이름을 입력하세요.",
    name_long: "이름은 32글자 이하여야 합니다.",
    already_end: "게임이 이미 종료된 방입니다.",
    disconnected: "누군가 접속이 끊겼습니다.",
    page_not_found: "페이지를 찾을 수 없습니다.",
    bot_exceed: "봇을 더 추가할 수 없습니다.",
    bot_negative: "0 미만으로 줄일 수 없습니다.",
    password_long: "비밀번호를 20글자 이하로 설정해 주세요.",
    title_long: "방 제목을 32글자 이하로 설정해 주세요.",
  },
];
