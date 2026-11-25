import { jamoById, type Jamo } from "./jamo"

export type Vocab = {
  hangul: string
  romanization: string
  meaning: string
}

export type BuildTarget = {
  hangul: string
  /** English gloss. Syllables that aren't full words still get an honest reading gloss. */
  meaning: string
  lexical: boolean
}

export type ConceptCard = {
  title: string
  body: string
  examples?: { hangul: string; caption: string }[]
  table?: { label: string; value: string }[]
}

export type Lesson = {
  id: string
  section: string
  title: string
  blurb: string
  hero: string
  minutes: number
  newJamo: string[]
  concept?: ConceptCard
  words: Vocab[]
  builds: BuildTarget[]
}

export const LESSONS: Lesson[] = [
  {
    id: "four-vowels",
    section: "Vowels",
    title: "Four vowels",
    blurb: "The shapes you’ll see in almost every Korean word.",
    hero: "ㅏ",
    minutes: 4,
    newJamo: ["a", "eo", "o", "u"],
    words: [],
    builds: [],
  },
  {
    id: "line-vowels",
    section: "Vowels",
    title: "ㅣ and ㅡ",
    blurb: "One tall line, one flat line.",
    hero: "ㅣ",
    minutes: 3,
    newJamo: ["i", "eu"],
    words: [],
    builds: [],
  },
  {
    id: "silent-ieung",
    section: "Vowels",
    title: "The silent ㅇ",
    blurb: "How a vowel gets a block of its own.",
    hero: "ㅇ",
    minutes: 5,
    newJamo: ["ieung"],
    concept: {
      title: "Blocks, not a line of letters",
      body: "Korean letters stack into square blocks, one block per syllable. A vowel can’t start a block alone, so ㅇ holds the place. It is silent there. ㅏ is just the vowel. 아 is the syllable “a”.",
      examples: [
        { hangul: "아", caption: "a · ah!" },
        { hangul: "어", caption: "eo · uh…" },
        { hangul: "오", caption: "o · five" },
        { hangul: "이", caption: "i · tooth; this" },
      ],
    },
    words: [
      { hangul: "오", romanization: "o", meaning: "five" },
      { hangul: "아이", romanization: "ai", meaning: "child" },
      { hangul: "오이", romanization: "oi", meaning: "cucumber" },
    ],
    builds: [
      { hangul: "아", meaning: "ah!", lexical: false },
      { hangul: "어", meaning: "uh…", lexical: false },
      { hangul: "오", meaning: "five", lexical: true },
      { hangul: "우", meaning: "ooh!", lexical: false },
      { hangul: "으", meaning: "hmm…", lexical: false },
      { hangul: "이", meaning: "tooth; this", lexical: true },
    ],
  },
  {
    id: "g-n-m",
    section: "Consonants",
    title: "ㄱ ㄴ ㅁ",
    blurb: "g, n, and m — three consonants you can already read words with.",
    hero: "ㄱ",
    minutes: 5,
    newJamo: ["g", "n", "m"],
    words: [
      { hangul: "나무", romanization: "namu", meaning: "tree" },
      { hangul: "어머니", romanization: "eomeoni", meaning: "mother" },
      { hangul: "누구", romanization: "nugu", meaning: "who" },
      { hangul: "아기", romanization: "agi", meaning: "baby" },
      { hangul: "고구마", romanization: "goguma", meaning: "sweet potato" },
      { hangul: "누나", romanization: "nuna", meaning: "older sister (of a boy)" },
      { hangul: "이모", romanization: "imo", meaning: "aunt (mother’s sister)" },
    ],
    builds: [
      { hangul: "가", meaning: "go (가다, to go)", lexical: true },
      { hangul: "나", meaning: "I; me", lexical: true },
      { hangul: "무", meaning: "radish", lexical: true },
    ],
  },
  {
    id: "d-r-b-s",
    section: "Consonants",
    title: "ㄷ ㄹ ㅂ ㅅ",
    blurb: "d, the r/l flap, b, and s.",
    hero: "ㄹ",
    minutes: 6,
    newJamo: ["d", "r", "b", "s"],
    words: [
      { hangul: "바다", romanization: "bada", meaning: "sea" },
      { hangul: "나라", romanization: "nara", meaning: "country" },
      { hangul: "나비", romanization: "nabi", meaning: "butterfly" },
      { hangul: "다리", romanization: "dari", meaning: "leg; bridge" },
      { hangul: "머리", romanization: "meori", meaning: "head; hair" },
      { hangul: "우리", romanization: "uri", meaning: "we; our" },
      { hangul: "비", romanization: "bi", meaning: "rain" },
      { hangul: "소", romanization: "so", meaning: "cow" },
      { hangul: "버스", romanization: "beoseu", meaning: "bus" },
      { hangul: "바나나", romanization: "banana", meaning: "banana" },
      { hangul: "소리", romanization: "sori", meaning: "sound" },
      { hangul: "비누", romanization: "binu", meaning: "soap" },
      { hangul: "도시", romanization: "dosi", meaning: "city" },
      { hangul: "미소", romanization: "miso", meaning: "smile" },
    ],
    builds: [
      { hangul: "비", meaning: "rain", lexical: true },
      { hangul: "소", meaning: "cow", lexical: true },
      { hangul: "다", meaning: "all", lexical: true },
    ],
  },
  {
    id: "j-h",
    section: "Consonants",
    title: "ㅈ and ㅎ",
    blurb: "j and h. Then you can read mother and father.",
    hero: "ㅈ",
    minutes: 5,
    newJamo: ["j", "h"],
    words: [
      { hangul: "모자", romanization: "moja", meaning: "hat; cap" },
      { hangul: "아버지", romanization: "abeoji", meaning: "father" },
      { hangul: "하나", romanization: "hana", meaning: "one" },
      { hangul: "주스", romanization: "juseu", meaning: "juice" },
      { hangul: "사자", romanization: "saja", meaning: "lion" },
      { hangul: "호수", romanization: "hosu", meaning: "lake" },
      { hangul: "오후", romanization: "ohu", meaning: "afternoon" },
      { hangul: "하마", romanization: "hama", meaning: "hippo" },
    ],
    builds: [
      { hangul: "하", meaning: "do (하다, to do)", lexical: true },
      { hangul: "주", meaning: "week", lexical: true },
    ],
  },
  {
    id: "aspirated",
    section: "Consonants",
    title: "Airy consonants",
    blurb: "ㅊ ㅋ ㅌ ㅍ — the same family, with a puff of air.",
    hero: "ㅋ",
    minutes: 5,
    newJamo: ["ch", "k", "t", "p"],
    words: [
      { hangul: "코", romanization: "ko", meaning: "nose" },
      { hangul: "차", romanization: "cha", meaning: "tea; car" },
      { hangul: "커피", romanization: "keopi", meaning: "coffee" },
      { hangul: "포도", romanization: "podo", meaning: "grape" },
      { hangul: "피자", romanization: "pija", meaning: "pizza" },
      { hangul: "기차", romanization: "gicha", meaning: "train" },
      { hangul: "키", romanization: "ki", meaning: "height; key" },
      { hangul: "파", romanization: "pa", meaning: "green onion" },
      { hangul: "아파트", romanization: "apateu", meaning: "apartment" },
      { hangul: "카드", romanization: "kadeu", meaning: "card" },
      { hangul: "고추", romanization: "gochu", meaning: "chili pepper" },
    ],
    builds: [
      { hangul: "코", meaning: "nose", lexical: true },
      { hangul: "차", meaning: "tea; car", lexical: true },
      { hangul: "키", meaning: "height; key", lexical: true },
      { hangul: "파", meaning: "green onion", lexical: true },
    ],
  },
  {
    id: "ae-e",
    section: "Combinations",
    title: "ㅐ and ㅔ",
    blurb: "Two e-sounds. Modern Korean barely splits them.",
    hero: "ㅐ",
    minutes: 5,
    newJamo: ["ae", "e"],
    words: [
      { hangul: "개", romanization: "gae", meaning: "dog" },
      { hangul: "새", romanization: "sae", meaning: "bird; new" },
      { hangul: "네", romanization: "ne", meaning: "yes" },
      { hangul: "해", romanization: "hae", meaning: "sun; year" },
      { hangul: "노래", romanization: "norae", meaning: "song" },
      { hangul: "가게", romanization: "gage", meaning: "shop" },
      { hangul: "케이크", romanization: "keikeu", meaning: "cake" },
      { hangul: "배", romanization: "bae", meaning: "pear; boat; belly" },
      { hangul: "고래", romanization: "gorae", meaning: "whale" },
      { hangul: "개미", romanization: "gaemi", meaning: "ant" },
      { hangul: "카메라", romanization: "kamera", meaning: "camera" },
    ],
    builds: [
      { hangul: "개", meaning: "dog", lexical: true },
      { hangul: "새", meaning: "bird; new", lexical: true },
      { hangul: "네", meaning: "yes", lexical: true },
      { hangul: "해", meaning: "sun; year", lexical: true },
    ],
  },
  {
    id: "y-vowels",
    section: "Combinations",
    title: "Y vowels",
    blurb: "Add a tick, add a y.",
    hero: "ㅛ",
    minutes: 6,
    newJamo: ["ya", "yeo", "yo", "yu", "yae", "ye"],
    words: [
      { hangul: "여우", romanization: "yeou", meaning: "fox" },
      { hangul: "여자", romanization: "yeoja", meaning: "woman" },
      { hangul: "이야기", romanization: "iyagi", meaning: "story" },
      { hangul: "야구", romanization: "yagu", meaning: "baseball" },
      { hangul: "자유", romanization: "jayu", meaning: "freedom" },
      { hangul: "교사", romanization: "gyosa", meaning: "teacher" },
      { hangul: "표", romanization: "pyo", meaning: "ticket" },
      { hangul: "세계", romanization: "segye", meaning: "world" },
      { hangul: "혀", romanization: "hyeo", meaning: "tongue" },
      { hangul: "이유", romanization: "iyu", meaning: "reason" },
      { hangul: "유리", romanization: "yuri", meaning: "glass" },
    ],
    builds: [
      { hangul: "표", meaning: "ticket", lexical: true },
      { hangul: "혀", meaning: "tongue", lexical: true },
      { hangul: "야", meaning: "hey", lexical: true },
    ],
  },
  {
    id: "w-vowels",
    section: "Combinations",
    title: "W vowels",
    blurb: "ㅗ or ㅜ fused with another vowel, plus ㅢ.",
    hero: "ㅘ",
    minutes: 6,
    newJamo: ["wa", "wae", "oe", "wo", "we", "wi", "ui"],
    words: [
      { hangul: "사과", romanization: "sagwa", meaning: "apple; apology" },
      { hangul: "과자", romanization: "gwaja", meaning: "snack" },
      { hangul: "뭐", romanization: "mwo", meaning: "what" },
      { hangul: "왜", romanization: "wae", meaning: "why" },
      { hangul: "귀", romanization: "gwi", meaning: "ear" },
      { hangul: "의자", romanization: "uija", meaning: "chair" },
      { hangul: "돼지", romanization: "dwaeji", meaning: "pig" },
      { hangul: "회사", romanization: "hoesa", meaning: "company" },
      { hangul: "뒤", romanization: "dwi", meaning: "behind" },
      { hangul: "의사", romanization: "uisa", meaning: "doctor" },
      { hangul: "위", romanization: "wi", meaning: "above; stomach" },
    ],
    builds: [
      { hangul: "왜", meaning: "why", lexical: true },
      { hangul: "뭐", meaning: "what", lexical: true },
      { hangul: "귀", meaning: "ear", lexical: true },
      { hangul: "와", meaning: "wow", lexical: true },
    ],
  },
  {
    id: "batchim",
    section: "Finals",
    title: "Batchim",
    blurb: "The consonant at the bottom. It stops short.",
    hero: "한",
    minutes: 7,
    newJamo: [],
    concept: {
      title: "A consonant underneath",
      body: "Batchim is the consonant at the bottom of a block. Don’t release it — start the sound and stop. At the end of a syllable, every final collapses into one of seven sounds.",
      examples: [
        { hangul: "국", caption: "guk · soup" },
        { hangul: "눈", caption: "nun · eye; snow" },
        { hangul: "물", caption: "mul · water" },
        { hangul: "집", caption: "jip · house" },
      ],
      table: [
        { label: "ㄱ ㅋ ㄲ", value: "k" },
        { label: "ㄴ", value: "n" },
        { label: "ㄷ ㅅ ㅆ ㅈ ㅊ ㅌ ㅎ", value: "t" },
        { label: "ㄹ", value: "l" },
        { label: "ㅁ", value: "m" },
        { label: "ㅂ ㅍ", value: "p" },
        { label: "ㅇ", value: "ng" },
      ],
    },
    words: [
      { hangul: "물", romanization: "mul", meaning: "water" },
      { hangul: "불", romanization: "bul", meaning: "fire" },
      { hangul: "눈", romanization: "nun", meaning: "eye; snow" },
      { hangul: "손", romanization: "son", meaning: "hand" },
      { hangul: "발", romanization: "bal", meaning: "foot" },
      { hangul: "산", romanization: "san", meaning: "mountain" },
      { hangul: "달", romanization: "dal", meaning: "moon; month" },
      { hangul: "집", romanization: "jip", meaning: "house; home" },
      { hangul: "밥", romanization: "bap", meaning: "cooked rice; meal" },
      { hangul: "입", romanization: "ip", meaning: "mouth" },
      { hangul: "강", romanization: "gang", meaning: "river" },
      { hangul: "방", romanization: "bang", meaning: "room" },
      { hangul: "책", romanization: "chaek", meaning: "book" },
      { hangul: "국", romanization: "guk", meaning: "soup" },
      { hangul: "한국", romanization: "hanguk", meaning: "Korea" },
      { hangul: "사람", romanization: "saram", meaning: "person" },
      { hangul: "사랑", romanization: "sarang", meaning: "love" },
      { hangul: "오늘", romanization: "oneul", meaning: "today" },
      { hangul: "친구", romanization: "chingu", meaning: "friend" },
      { hangul: "아침", romanization: "achim", meaning: "morning" },
      { hangul: "이름", romanization: "ireum", meaning: "name" },
      { hangul: "마음", romanization: "maeum", meaning: "heart; feelings" },
      { hangul: "학생", romanization: "haksaeng", meaning: "student" },
      { hangul: "옷", romanization: "ot", meaning: "clothes" },
      { hangul: "낮", romanization: "nat", meaning: "daytime" },
    ],
    builds: [
      { hangul: "국", meaning: "soup", lexical: true },
      { hangul: "눈", meaning: "eye; snow", lexical: true },
      { hangul: "물", meaning: "water", lexical: true },
      { hangul: "집", meaning: "house; home", lexical: true },
      { hangul: "강", meaning: "river", lexical: true },
      { hangul: "산", meaning: "mountain", lexical: true },
    ],
  },
  {
    id: "doubles",
    section: "Finals",
    title: "Tense doubles",
    blurb: "ㄲ ㄸ ㅃ ㅆ ㅉ. Tight throat, no puff of air.",
    hero: "ㄲ",
    minutes: 5,
    newJamo: ["kk", "tt", "pp", "ss", "jj"],
    concept: {
      title: "Tense twins",
      body: "A double consonant is tense. Squeeze the sound and keep the air in, like the consonant after s in “ski”, “stop”, and “spy”. 빵 (ppang) is bread. 꿈 (kkum) is a dream.",
    },
    words: [
      { hangul: "빵", romanization: "ppang", meaning: "bread" },
      { hangul: "꿈", romanization: "kkum", meaning: "dream" },
      { hangul: "꽃", romanization: "kkot", meaning: "flower" },
      { hangul: "딸", romanization: "ttal", meaning: "daughter" },
      { hangul: "쌀", romanization: "ssal", meaning: "uncooked rice" },
      { hangul: "떡", romanization: "tteok", meaning: "rice cake" },
      { hangul: "꼬리", romanization: "kkori", meaning: "tail" },
      { hangul: "있어요", romanization: "isseoyo", meaning: "there is; I have" },
      { hangul: "아저씨", romanization: "ajeossi", meaning: "mister; older man" },
    ],
    builds: [
      { hangul: "빵", meaning: "bread", lexical: true },
      { hangul: "꿈", meaning: "dream", lexical: true },
      { hangul: "꽃", meaning: "flower", lexical: true },
      { hangul: "떡", meaning: "rice cake", lexical: true },
    ],
  },
  {
    id: "real-words",
    section: "Reading",
    title: "Real words",
    blurb: "Greetings, places, food, and the name of the alphabet.",
    hero: "한",
    minutes: 6,
    newJamo: [],
    concept: {
      title: "You can read this",
      body: "Nothing new to memorize. These are words people actually say. The romanization follows Revised Romanization, the system on Korean street signs. 김치 is written gimchi and means kimchi.",
      examples: [
        { hangul: "한글", caption: "hangeul · Hangul" },
        { hangul: "안녕하세요", caption: "annyeonghaseyo · hello" },
      ],
    },
    words: [
      { hangul: "안녕하세요", romanization: "annyeonghaseyo", meaning: "hello" },
      { hangul: "감사합니다", romanization: "gamsahamnida", meaning: "thank you" },
      { hangul: "서울", romanization: "seoul", meaning: "Seoul" },
      { hangul: "내일", romanization: "naeil", meaning: "tomorrow" },
      { hangul: "어제", romanization: "eoje", meaning: "yesterday" },
      { hangul: "고양이", romanization: "goyangi", meaning: "cat" },
      { hangul: "강아지", romanization: "gangaji", meaning: "puppy" },
      { hangul: "비빔밥", romanization: "bibimbap", meaning: "bibimbap (mixed rice)" },
      { hangul: "김치", romanization: "gimchi", meaning: "kimchi" },
      { hangul: "선생님", romanization: "seonsaengnim", meaning: "teacher (respectful)" },
      { hangul: "학교", romanization: "hakgyo", meaning: "school" },
      { hangul: "한글", romanization: "hangeul", meaning: "Hangul, the Korean alphabet" },
      { hangul: "둘", romanization: "dul", meaning: "two" },
      { hangul: "셋", romanization: "set", meaning: "three" },
    ],
    builds: [
      { hangul: "한", meaning: "one; Korea", lexical: true },
      { hangul: "글", meaning: "writing", lexical: true },
    ],
  },
]

export function lessonById(id: string): Lesson | undefined {
  return LESSONS.find((lesson) => lesson.id === id)
}

export function lessonIndex(id: string): number {
  return LESSONS.findIndex((lesson) => lesson.id === id)
}

export function learnedJamo(throughIndex: number): Jamo[] {
  const ids: string[] = []
  for (let i = 0; i <= throughIndex && i < LESSONS.length; i++) {
    ids.push(...LESSONS[i].newJamo)
  }
  return ids.map((id) => jamoById(id))
}

export function taughtChars(throughIndex: number): Set<string> {
  return new Set(learnedJamo(throughIndex).map((jamo) => jamo.char))
}

export function isLessonUnlocked(completedIds: readonly string[], lessonId: string): boolean {
  const index = lessonIndex(lessonId)
  if (index < 0) return false
  if (index === 0) return true
  return completedIds.includes(LESSONS[index - 1].id)
}

export function nextLesson(completedIds: readonly string[]): Lesson | null {
  return LESSONS.find((lesson) => !completedIds.includes(lesson.id)) ?? null
}
