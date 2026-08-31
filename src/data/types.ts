// ============================================================
// 双语类型基座 — 所有内容双语字段统一用 Bilingual
// ============================================================

export type Locale = "zh" | "en";

export interface Bilingual {
  zh: string;
  en: string;
}

/** 详情页正文分节:标题 + 段落 + 可选配图 */
export interface SpotSection {
  heading: Bilingual;
  text: Bilingual;
  image?: string;
}

export interface City {
  id: string;
  /** 行政区划代码,对应 DataV GeoJSON */
  adcode: string;
  nameZh: string;
  nameEn: string;
  /** [经度, 纬度] */
  coord: [number, number];
  intro: Bilingual;
  heroImage: string;
  /** 全屏风景大图(intro 选中后的水墨过渡背景);缺省回退 heroImage */
  sceneryImage?: string;
}

export interface Spot {
  id: string;
  cityId: string;
  /** [经度, 纬度] — 足迹地图定位 */
  coord: [number, number];
  /** 行程顺序,时间线/路径/上下一站按此排序 */
  order: number;
  /** 待定地点设 false 即全站隐藏,不必删数据 */
  visible: boolean;
  name: Bilingual;
  tagline: Bilingual;
  summary: Bilingual;
  /** 特色标签(概览气泡展示),如「爱国教育」「川东民居」;可选 */
  tags?: Bilingual[];
  body: SpotSection[];
  images: string[];
  /**
   * 主图 object-position / background-position（如 "50% 12%"）。
   * 用于竖构图在横卡里时把焦点上移，避免裁掉头脸。
   */
  imageFocus?: string;
  /** 计划到访日期(可选),时间线展示用 */
  date?: string;
  /** 外部报道链接(如公众号推文、媒体报道) */
  pressLinks?: SpotPressLink[];
}

export interface SpotPressLink {
  label: Bilingual;
  url: string;
  /** 来源平台简称,如 WeChat、People's Daily */
  source?: Bilingual;
  /** 国家级 / 重点报道 */
  featured?: boolean;
  summary?: Bilingual;
  date?: string;
}

export type TeamGroup = "advisor" | "guangan" | "baise";

export interface TeamMember {
  id: string;
  name: Bilingual;
  role: Bilingual;
  motto: Bilingual;
  avatar: string;
  group: TeamGroup;
  cities?: ("guangan" | "baise")[];
  isCaptain?: boolean;
}
