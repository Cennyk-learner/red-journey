import { withBasePath } from "@/lib/base-path";
import type { TeamMember } from "./types";

// ============================================================
// 实践团队 — 2026 川桂红脉 · 星星之火社会实践团队
// ============================================================

export const TEAM_ADVISORS: TeamMember[] = [
  {
    id: "chen-yuxiao",
    name: { zh: "陈昱晓", en: "Chen Yuxiao" },
    role: { zh: "广安带队老师", en: "Lead Advisor · Guang'an" },
    motto: {
      zh: "岁月不言，山河为证",
      en: "Years pass in silence; mountains and rivers bear witness.",
    },
    avatar: "/team/avatars/chen-yuxiao.jpg",
    group: "advisor",
    cities: ["guangan"],
  },
  {
    id: "liao-qi",
    name: { zh: "廖琪", en: "Liao Qi" },
    role: { zh: "百色带队老师", en: "Lead Advisor · Baise" },
    motto: {
      zh: "愿以寸心，寄华夏",
      en: "With a humble heart, I pledge myself to this land.",
    },
    avatar: "/team/avatars/liao-qi.jpg",
    group: "advisor",
    cities: ["baise"],
  },
];

export const TEAM_GUANGAN: TeamMember[] = [
  {
    id: "guo-yunbei",
    name: { zh: "郭耘贝", en: "Guo Yunbei" },
    role: { zh: "队员", en: "Team Member" },
    motto: {
      zh: "心有猛虎，细嗅蔷薇",
      en: "In me the tiger sniffs the rose.",
    },
    avatar: "/team/avatars/guo-yunbei.jpg",
    group: "guangan",
    cities: ["guangan"],
  },
  {
    id: "zhang-ruiyang",
    name: { zh: "张锐洋", en: "Zhang Ruiyang" },
    role: { zh: "队员", en: "Team Member" },
    motto: {
      zh: "凡是过往，皆为序章",
      en: "What's past is prologue.",
    },
    avatar: "/team/avatars/zhang-ruiyang.jpg",
    group: "guangan",
    cities: ["guangan"],
  },
  {
    id: "cao-yuanke",
    name: { zh: "曹渊柯", en: "Cao Yuanke" },
    role: { zh: "队员", en: "Team Member" },
    motto: {
      zh: "知命者不怨天，知己者不怨人",
      en: "Those who know fate do not blame heaven; those who know themselves do not blame others.",
    },
    avatar: "/team/avatars/cao-yuanke.jpg",
    group: "guangan",
    cities: ["guangan"],
  },
  {
    id: "chen-jiarui",
    name: { zh: "陈嘉睿", en: "Chen Jiarui" },
    role: { zh: "队长", en: "Team Captain" },
    motto: {
      zh: "志当存高远",
      en: "Set your aim far and high.",
    },
    avatar: "/team/avatars/chen-jiarui.jpg",
    group: "guangan",
    cities: ["guangan"],
    isCaptain: true,
  },
  {
    id: "du-bingfeng",
    name: { zh: "杜秉峰", en: "Du Bingfeng" },
    role: { zh: "权威媒体联络", en: "Press Liaison" },
    motto: {
      zh: "言出有信，行必有果",
      en: "Speak with trust; act to deliver.",
    },
    avatar: "/team/avatars/du-bingfeng.jpg",
    group: "guangan",
  },
  {
    id: "lin-yi",
    name: { zh: "林一", en: "Lin Yi" },
    role: { zh: "留学生", en: "International Student" },
    motto: {
      zh: "世界是一本书，不旅行的人只读过一页",
      en: "The world is a book, and those who do not travel read only one page.",
    },
    avatar: "/team/avatars/lin-yi.jpg",
    group: "guangan",
    cities: ["guangan", "baise"],
  },
  {
    id: "tang-yang",
    name: { zh: "唐洋", en: "Tang Yang" },
    role: { zh: "摄影", en: "Photography" },
    motto: {
      zh: "光在心里，影在脚下",
      en: "Light lives within; shadow follows the step.",
    },
    avatar: "/team/avatars/tang-yang.jpg",
    group: "guangan",
    cities: ["guangan"],
  },
  {
    id: "xu-fulin",
    name: { zh: "许富麟", en: "Xu Fulin" },
    role: { zh: "摄影 · 推文编写", en: "Photography & Writing" },
    motto: {
      zh: "纸上得来终觉浅，绝知此事要躬行",
      en: "Knowledge from books alone is shallow; true understanding demands practice.",
    },
    avatar: "/team/avatars/xu-fulin.jpg",
    group: "guangan",
    cities: ["guangan", "baise"],
  },
  {
    id: "an-taiyu",
    name: { zh: "安泰雨", en: "An Taiyu" },
    role: { zh: "队员", en: "Team Member" },
    motto: {
      zh: "静水流深，沧笙踏歌",
      en: "Still waters run deep; walk on, and let life sing.",
    },
    avatar: "/team/avatars/an-taiyu.jpg",
    group: "guangan",
    cities: ["guangan"],
  },
];

export const TEAM_BAISE: TeamMember[] = [
  {
    id: "jian-shangyun",
    name: { zh: "简上云", en: "Jian Shangyun" },
    role: { zh: "队员", en: "Team Member" },
    motto: {
      zh: "纵有疾风起，人生不言弃",
      en: "Though the wind rises fierce, never yield the road ahead.",
    },
    avatar: "/team/avatars/jian-shangyun.jpg",
    group: "baise",
    cities: ["baise"],
  },
  {
    id: "wang-dandan",
    name: { zh: "王丹丹", en: "Wang Dandan" },
    role: { zh: "队员", en: "Team Member" },
    motto: {
      zh: "行到水穷处，坐看云起时",
      en: "Walk until the stream ends, then sit and watch the clouds rise.",
    },
    avatar: "/team/avatars/wang-dandan.jpg",
    group: "baise",
    cities: ["baise"],
  },
  {
    id: "gao-qianya",
    name: { zh: "高千雅", en: "Gao Qianya" },
    role: { zh: "队员", en: "Team Member" },
    motto: {
      zh: "愿你走出半生，归来仍是少年",
      en: "May you walk half a lifetime and return still young at heart.",
    },
    avatar: "/team/avatars/gao-qianya.jpg",
    group: "baise",
    cities: ["baise"],
  },
  {
    id: "sun-aiming",
    name: { zh: "孙爱茗", en: "Sun Aiming" },
    role: { zh: "队员", en: "Team Member" },
    motto: {
      zh: "星光不问赶路人",
      en: "The stars do not ask how late the traveler walks.",
    },
    avatar: "/team/avatars/sun-aiming.jpg",
    group: "baise",
    cities: ["baise"],
  },
  {
    id: "wang-jindong",
    name: { zh: "王金栋", en: "Wang Jindong" },
    role: { zh: "队员", en: "Team Member" },
    motto: {
      zh: "披星戴月，只为心中所念",
      en: "Under stars and moon, for what the heart holds dear.",
    },
    avatar: "/team/avatars/wang-jindong.jpg",
    group: "baise",
    cities: ["baise"],
  },
];

/** 按英文名母表排序 */
function sortByName(members: TeamMember[]): TeamMember[] {
  return [...members].sort((a, b) => a.name.en.localeCompare(b.name.en));
}

/** 指导老师 → 队长 → 权威媒体联络 → 广安队员（字母序）→ 百色队员（字母序） */
for (const member of [...TEAM_ADVISORS, ...TEAM_GUANGAN, ...TEAM_BAISE]) {
  member.avatar = withBasePath(member.avatar);
}

const AFTER_CAPTAIN_IDS = new Set(["du-bingfeng"]);

export const TEAM_ALL: TeamMember[] = [
  ...TEAM_ADVISORS,
  ...TEAM_GUANGAN.filter((m) => m.isCaptain),
  ...TEAM_GUANGAN.filter((m) => AFTER_CAPTAIN_IDS.has(m.id)),
  ...sortByName(
    TEAM_GUANGAN.filter((m) => !m.isCaptain && !AFTER_CAPTAIN_IDS.has(m.id)),
  ),
  ...sortByName(TEAM_BAISE),
];

/** 详情页展示:与该城实践相关的成员头像 */
export function getTeamForCity(cityId: "guangan" | "baise"): TeamMember[] {
  return TEAM_ALL.filter((m) => m.cities?.includes(cityId));
}

export const PROJECT_INFO = {
  title: {
    zh: "红色足迹 · 三下乡社会实践",
    en: "Red Journey · Rural Practice Program",
  },
  mission: {
    zh: "追寻红色记忆，促进中外文化交流。",
    en: "Tracing red memories, fostering cross-cultural exchange.",
  },
};
