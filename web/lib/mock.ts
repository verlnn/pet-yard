export type FeedPost = {
  id: string;
  author: string;
  petName: string;
  petType: string;
  content: string;
  tags: string[];
  location: string;
  likes: number;
  comments: number;
  image?: string;
  time: string;
};

export type WalkEvent = {
  id: string;
  title: string;
  place: string;
  time: string;
  capacity: string;
  petSize: string;
  status: "모집중" | "마감";
};

export type BoardingRequest = {
  id: string;
  title: string;
  date: string;
  price: string;
  requirement: string;
};

export type KnowledgeCard = {
  id: string;
  title: string;
  subtitle: string;
  tags: string[];
};

export const feedPosts: FeedPost[] = [
  {
    id: "post-1",
    author: "하윤",
    petName: "콩이",
    petType: "푸들",
    content: "오늘은 처음으로 동네 공원에서 3km 산책 성공. 기분이 좋아서 사진도 찰칵!",
    tags: ["#첫산책", "#동네공원", "#건강"],
    location: "성수동",
    likes: 124,
    comments: 18,
    time: "2시간 전"
  },
  {
    id: "post-2",
    author: "정민",
    petName: "오리",
    petType: "코숏",
    content: "병원 검진 후 추천 받은 놀이 루틴 공유해요. 스트레스 지수 확 떨어짐!",
    tags: ["#검진", "#실내놀이", "#초보집사"],
    location: "망원동",
    likes: 89,
    comments: 9,
    time: "오늘"
  },
  {
    id: "post-3",
    author: "지수",
    petName: "달이",
    petType: "시바",
    content: "햇볕이 좋아서 루프탑 산책 코스를 만들었어요. 함께 가실 분?",
    tags: ["#산책메이트", "#시바", "#루프탑"],
    location: "연남동",
    likes: 211,
    comments: 34,
    time: "어제"
  }
];

export const walkEvents: WalkEvent[] = [
  {
    id: "walk-1",
    title: "저녁 한강 산책 2시간",
    place: "망원한강공원",
    time: "오늘 19:00 - 21:00",
    capacity: "2/5",
    petSize: "중형견",
    status: "모집중"
  },
  {
    id: "walk-2",
    title: "아침 카페 앞 가벼운 산책",
    place: "성수 카페거리",
    time: "내일 08:30 - 09:30",
    capacity: "4/4",
    petSize: "소형견",
    status: "마감"
  }
];

export const boardingRequests: BoardingRequest[] = [
  {
    id: "board-1",
    title: "주말 1박 위탁 가능하신 분",
    date: "3/8 - 3/9",
    price: "협의",
    requirement: "대형견 경험자"
  },
  {
    id: "board-2",
    title: "출근시간(09~18) 데이케어",
    date: "3/4 - 3/15",
    price: "일 2만원",
    requirement: "실내 케이지 가능"
  }
];

export const knowledgeCards: KnowledgeCard[] = [
  {
    id: "know-1",
    title: "1년차 강아지 필수 검진",
    subtitle: "예방접종, 치아, 관절 체크리스트",
    tags: ["강아지", "1년", "검진"]
  },
  {
    id: "know-2",
    title: "고양이 비만 예방 루틴",
    subtitle: "체중대별 급여량 가이드",
    tags: ["고양이", "체중", "주의"]
  },
  {
    id: "know-3",
    title: "위탁 전 체크해야 할 5가지",
    subtitle: "신뢰도, 환경, 응급 대응 확인",
    tags: ["위탁", "안전", "신뢰"]
  }
];
