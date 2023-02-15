export const Language = [
  {
    title: "RPS Brawl",
    intro_text: "Enjoy Rock Scissor Paper with several friends! 😁",
    rule: "Rule",
    explanation: `The lastest hand is shown in the center of the screen.
          If you win the hand, you will get +1 points. But if not, you will get -1 points. `,
    start: "Start",
    entrance: "Start",
    name: "name",
    join: "Join",
    quit: "quit",
    place: "Places",
    play: "play",
    network_logs: "Network logs",
    rooms: "Rooms",
    create_room: "Create Room",
    quick_start: "Quick Start",

    ingame_title_text: "Thinking about what to choose",
    ingame_describe_text: (num) => {
      return `The game starts soon ( connected : ${num} ) `;
    },
    team: "Team",
    add_bot: "Add_bot",
    skilled: "Skilled",
    dumb: "Dumb",
    teams: ["red", "orange", "yellow", "green", "blue", "navy", "purple"],
  },
  {
    title: "RPS Brawl",
    intro_text: "여러명의 친구들과 가위바위보 난투를 즐기세요! 😁",
    rule: "규칙",
    explanation: `가장 마지막에 낸 사람의 손이 화면에 크게 보입니다. 이 손을 이기면
          +1점! 지면 -1점! 60초 안에 가장 많은 점수를 획득하세요!`,
    start: "시작",
    entrance: "입장",
    name: "이름",
    join: "참여",
    quit: "나가기",
    play: "시작",
    place: "순위",
    network_logs: "네트워크 로그",
    rooms: "방목록",
    create_room: "방만들기",
    quick_start: "빠른 시작",
    ingame_title_text: "무엇을 낼지 고민하는중..",
    ingame_describe_text: (num) => {
      return `난투가 곧 시작됩니다. ( 현재 : ${num}명 ) `;
    },
    team: "팀",
    add_bot: "봇추가",
    skilled: "숙련된",
    dumb: "트롤",
    teams: ["빨강", "오렌지", "노랑", "초록", "파랑", "네이비", "보라"],
  },
];
