import { withBasePath } from "@/lib/base-path";
import type { Bilingual } from "./types";

// ============================================================
// 国家级媒体报道 — 全站背书与媒体关注区块
// ============================================================

export interface MediaCoverageItem {
  id: string;
  source: Bilingual;
  headline: Bilingual;
  summary: Bilingual;
  url: string;
  date: string;
  featured?: boolean;
  /** 配图：实践团现场照 */
  image?: string;
}

export const NATIONAL_MEDIA: MediaCoverageItem[] = [
  {
    id: "china-daily-2026",
    featured: true,
    source: { zh: "中国日报", en: "China Daily" },
    headline: {
      zh: "红色足迹实践项目获中国日报报道",
      en: "Youth team explores revolutionary legacy in Guang'an",
    },
    summary: {
      zh: "中国日报英文网刊发专题，报道成都理工大学实践团在邓小平故里等地开展红色研学、场馆访谈与中外青年交流，呈现川桂红色线路的当代实践叙事。",
      en: "China Daily published a feature on the team's field study at Deng's hometown and partner sites — red education, site interviews, and cross-cultural youth exchange along the Sichuan–Guangxi route.",
    },
    url: "https://cn.chinadaily.com.cn/a/202607/23/WS6a61d086a310d709c2fbf52b.html",
    date: "2026-07-23",
    image: "/spots/deng-xiaoping-former-residence/03.jpg",
  },
  {
    id: "people-daily-2026",
    featured: true,
    source: { zh: "人民网", en: "People's Daily Online" },
    headline: {
      zh: "人民网四川频道关注红色足迹社会实践",
      en: "People's Daily Sichuan reports on Red Journey fieldwork",
    },
    summary: {
      zh: "人民网四川频道报道实践团在广安开展故里研学、广场诵读与非遗体验，记录青年学子在伟人故里书写思政大课的现场。",
      en: "People's Daily Sichuan covered the team's hometown study, square recitation, and heritage workshops in Guang'an — civic education on site.",
    },
    url: "http://sc.people.com.cn/n2/2026/0724/c345167-41649287.html",
    date: "2026-07-24",
    image: "/spots/siyuan-square/02.jpg",
  },
];

export const WECHAT_COVERAGE: MediaCoverageItem[] = [
  {
    id: "wechat-siyuan",
    source: { zh: "微信公众号", en: "WeChat" },
    headline: {
      zh: "“星星之火”社会实践团队暑期三下乡 | 聚焦传承红色基因 筑牢复兴之路",
      en: "\"Spark of Stars\" summer field team | Inheriting red genes, strengthening the path to rejuvenation",
    },
    summary: {
      zh: "记录团队在思源广场的集体诵读现场与青年使命表达。",
      en: "On-site recitation at Siyuan Square and voices of youth responsibility.",
    },
    url: "https://mp.weixin.qq.com/s/npA4L2dF4KBLfu-GTy8RCQ",
    date: "2026-07-09",
    image: "/spots/siyuan-square/05.jpg",
  },
  {
    id: "wechat-heritage",
    source: { zh: "微信公众号", en: "WeChat" },
    headline: {
      zh: "“星星之火”社会实践团队暑期三下乡 | 踏寻伟人足迹 赓续精神薪火",
      en: "\"Spark of Stars\" summer field team | Retracing great leaders, carrying forward their spirit",
    },
    summary: {
      zh: "剪纸与手工艺体验，红色文化与民间技艺的共生记录。",
      en: "Paper-cutting and craft sessions linking red memory to living folk art.",
    },
    url: "https://mp.weixin.qq.com/s/2Ft2AvIi8wY0F9vIZNtjLQ",
    date: "2026-07-14",
    image: "/spots/intangible-heritage-experience/04.jpg",
  },
  {
    id: "wechat-museum",
    source: { zh: "成理青年", en: "Chengli Youth" },
    headline: {
      zh: "三下乡青春派×牛津布鲁克斯学院｜踏寻伟人足迹，赓续精神薪火",
      en: "Sanxiaxiang Youth × Oxford Brookes | Retracing great leaders, carrying forward their spirit",
    },
    summary: {
      zh: "馆藏广安，从地方史志理解红色研学的地域语境。",
      en: "City collections anchoring field study in local historical context.",
    },
    url: "https://mp.weixin.qq.com/s/woL4mxzVPONa27gglMRG0Q",
    date: "2026-08-24",
    image: "/spots/guangan-museum/06.jpg",
  },
];

for (const item of [...NATIONAL_MEDIA, ...WECHAT_COVERAGE]) {
  if (item.image) item.image = withBasePath(item.image);
}

export function getFeaturedMedia(): MediaCoverageItem[] {
  return NATIONAL_MEDIA;
}
