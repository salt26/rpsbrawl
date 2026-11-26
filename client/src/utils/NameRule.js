// 사용자 이름 규칙. 서버(sql_app/main.py의 check_name)와 같게 유지한다.

// 주소·쿼리·HTML 등에서 다르게 해석될 수 있는 글자
const FORBIDDEN_CHARS = /[&#%+?=/\\'"`<>;]/;
// 제어 문자, 보이지 않는 서식 문자, 사용자 정의 문자, 줄·문단 구분자
const FORBIDDEN_CATEGORIES = /[\p{Cc}\p{Cf}\p{Co}\p{Cs}\p{Zl}\p{Zp}]/u;
// 이름 맨 앞에 올 수 없는 글자(결과 .csv를 엑셀에서 열 때 수식으로 해석되는 것을 막는다). 중간에는 써도 된다.
const FORBIDDEN_FIRST_CHARS = /^[-@]/;
// 봇 이름 형식(새 형식 "S-0001-bot", 옛 형식 "S-1676609745-962277"). 대소문자, 숫자 길이와 관계없이 막는다.
const BOT_NAME = /^[SD]-[0-9]+-(bot|[0-9]+)$/i;
export const NAME_MAX_LENGTH = 32;

// 사용할 수 없는 이름이면 Language의 안내 문구 키를, 사용할 수 있으면 null을 반환
export const getNameError = (name) => {
  if (name.trim() === "") return "name_blank";
  if ([...name].length > NAME_MAX_LENGTH) return "name_long"; // 서버처럼 글자(코드 포인트) 수로 센다
  if (name !== name.trim()) return "name_space";
  if (FORBIDDEN_CHARS.test(name) || FORBIDDEN_CATEGORIES.test(name))
    return "name_char";
  if (FORBIDDEN_FIRST_CHARS.test(name)) return "name_first";
  if (BOT_NAME.test(name)) return "name_reserved";
  return null;
};
