import type { Locale } from "@/data/types";

// ============================================================
// UI 文案字典 — 与页面内容(cities/spots)分离
// 组件内用 useLocale() 取当前语言后调用 t(dict, locale)
// M8 起改为博物馆导览语气:陈述事实,点到为止,无排比、无口号。
// ============================================================

type Dict = Record<Locale, string>;

export const ui = {
  navHome: { zh: "首页", en: "Home" } as Dict,
  navMap: { zh: "寻访地图", en: "Map" } as Dict,
  navGallery: { zh: "影像", en: "Gallery" } as Dict,
  navMedia: { zh: "媒体关注", en: "Media" } as Dict,
  navTeam: { zh: "实践团队", en: "The Team" } as Dict,
  langSwitchLabel: { zh: "English", en: "中文" } as Dict,
  brandSubtitle: { zh: "川桂实践寻访", en: "Red Journey" } as Dict,

  heroKicker: { zh: "三下乡社会实践 · 2026 年夏", en: "STUDENT FIELDWORK · SUMMER 2026" } as Dict,
  heroTitleLine1: { zh: "自广安至百色", en: "From Guang'an to Baise" } as Dict,
  heroTitleLine2: { zh: "川桂实践寻访录", en: "A Field Record Across Sichuan and Guangxi" } as Dict,
  heroSubtitle: {
    zh: "2026 年 7 月至 8 月之间，实践团在四川广安、广西百色开展社会实践。本站为全程实地记录。",
    en: "Between July and August 2026, the team conducted fieldwork in Guang'an, Sichuan, and Baise, Guangxi. This site is the full on-site record.",
  } as Dict,
  heroCta: { zh: "开始参观", en: "Begin the visit" } as Dict,

  // 开场:目的地选择 + 地球 + 开始旅程
  introBrand: { zh: "红色足迹", en: "Red Journey" } as Dict,
  introQuestion: { zh: "先看哪一城？", en: "Where first?" } as Dict,
  introSub: {
    zh: "一在川东，邓小平出生地；一在桂西，1929 年起义发生地。",
    en: "Two cities, two chapters of one history: the birthplace of Deng Xiaoping in eastern Sichuan, and the site of the 1929 Bose Uprising in western Guangxi.",
  } as Dict,
  introPick: { zh: "选择城市", en: "Select a city" } as Dict,
  introStartPrefix: { zh: "展卷：", en: "Begin in" } as Dict,
  introStartSuffix: { zh: "", en: "" } as Dict,
  introEnter: { zh: "入卷", en: "Enter" } as Dict,
  introBack: { zh: "重新选择", en: "Choose again" } as Dict,
  // 章节 CTA
  ctaReady: { zh: "长卷已备好", en: "The scroll is ready" } as Dict,
  ctaStart: { zh: "展卷", en: "Open the scroll" } as Dict,
  ctaDepart: { zh: "即刻启程", en: "depart now" } as Dict,
  spotOverviewDetail: { zh: "查看详情", en: "View Details" } as Dict,
  spotTags: { zh: "特色", en: "Highlights" } as Dict,

  mapTitle: { zh: "寻访路线", en: "The Route" } as Dict,
  mapSubtitle: {
    zh: "点击高亮省份，查看该省的参访点。",
    en: "Select a highlighted province to see the sites we visited there.",
  } as Dict,
  mapBack: { zh: "返回全图", en: "Back to national map" } as Dict,
  // 长卷版式文案
  mapMotto: {
    zh: "四川广安 — 广西百色 · 2026 年 7–8 月",
    en: "Guang'an, Sichuan — Baise, Guangxi · Jul–Aug 2026",
  } as Dict,
  mapToBeContinued: { zh: "未完待续", en: "To be continued" } as Dict,
  mapLegend: { zh: "图例", en: "Legend" } as Dict,
  mapLegendRoute: { zh: "路线", en: "Route" } as Dict,
  mapLegendFlow: { zh: "行进方向", en: "Direction of travel" } as Dict,
  mapLegendStop: { zh: "参访点", en: "Site visited" } as Dict,

  // 影像区块
  filmCaption: {
    zh: "实践影像 · 2026 年 7–8 月摄于广安、百色",
    en: "Fieldwork film — shot in Guang'an and Baise, Jul–Aug 2026",
  } as Dict,
  filmScrollDown: { zh: "继续下滑", en: "Scroll down" } as Dict,

  // 详情抽屉
  drawerVisitInfo: { zh: "到访信息", en: "Visit details" } as Dict,
  drawerStory: { zh: "历史背景", en: "History" } as Dict,
  drawerGallery: { zh: "现场影像", en: "Field photographs" } as Dict,
  drawerFollow: { zh: "关注实践团公众号", en: "Follow us on WeChat" } as Dict,
  drawerFollowSub: {
    zh: "寻访手记、现场照片与幕后花絮，陆续更新。",
    en: "Field notes, photographs and outtakes from the trip.",
  } as Dict,
  drawerFollowAction: { zh: "前往关注", en: "Follow on WeChat" } as Dict,
  drawerPlaceholderNote: {
    zh: "更多现场素材整理中，将陆续更新。",
    en: "More field material is being prepared and will be added here.",
  } as Dict,

  gallerySectionTitle: { zh: "参访旧址", en: "The Sites" } as Dict,
  timelineSectionTitle: { zh: "行程时间线", en: "Itinerary" } as Dict,
  photoWallTitle: { zh: "影像记录", en: "Photographs" } as Dict,
  galleryKicker: { zh: "现场影像", en: "FIELD PHOTOGRAPHS" } as Dict,
  galleryTitle: { zh: "影像墙", en: "The Gallery" } as Dict,
  gallerySubtitle: {
    zh: "广安与百色沿途亲见亲摄，随卷展阅。",
    en: "Seen and photographed by the team across Guang'an and Baise.",
  } as Dict,
  galleryBack: { zh: "返回首页", en: "Back to home" } as Dict,
  galleryPhotoCountSuffix: { zh: "张现场影像", en: "field photographs" } as Dict,
  teamSectionTitle: { zh: "实践团队", en: "The Team" } as Dict,
  teamAdvisorsTitle: { zh: "指导老师", en: "Faculty Advisors" } as Dict,
  teamGuanganTitle: { zh: "广安团队", en: "Guang'an Team" } as Dict,
  teamBaiseTitle: { zh: "百色团队", en: "Baise Team" } as Dict,
  teamRoleLabel: { zh: "职务", en: "Role" } as Dict,
  teamMottoLabel: { zh: "座右铭", en: "Motto" } as Dict,
  teamBack: { zh: "返回", en: "Back" } as Dict,
  teamDualCity: { zh: "广安 · 百色", en: "Both Routes" } as Dict,
  teamGuanganCity: { zh: "广安", en: "Guang'an" } as Dict,
  teamBaiseCity: { zh: "百色", en: "Baise" } as Dict,
  teamScrollHint: { zh: "认识团队", en: "Meet the team" } as Dict,

  spotPrev: { zh: "上一站", en: "Previous site" } as Dict,
  spotNext: { zh: "下一站", en: "Next site" } as Dict,
  spotBack: { zh: "返回首页", en: "Back to home" } as Dict,
  spotFoldArchive: { zh: "收起卷宗", en: "Fold archive" } as Dict,
  spotBrandLine: { zh: "红色足迹", en: "Red Journey" } as Dict,
  spotBackScroll: { zh: "返回长卷", en: "Back to scroll" } as Dict,
  spotFieldTeam: { zh: "实践团现场", en: "Team in the field" } as Dict,
  spotPress: { zh: "相关推文与报道", en: "Press & social posts" } as Dict,
  spotReadArticle: { zh: "阅读原文", en: "Read article" } as Dict,
  spotGallery: { zh: "现场影像", en: "On-site photographs" } as Dict,
  spotTourism: { zh: "文旅提示", en: "For visitors" } as Dict,
  spotTourismBody: {
    zh: "本站参访点均面向公众开放。建议提前预约讲解、留意场馆开放时间,文明参观、尊重当地习俗与文物保护规定。欢迎结合川桂红色线路延伸周边研学与乡村体验。",
    en: "Sites are open to the public. Book guided tours where available, check opening hours, and observe local customs and heritage protection rules. The route connects to broader red-tourism and rural study itineraries in Sichuan and Guangxi.",
  } as Dict,

  // 长卷落款:全站唯一一处文学性文案,但仍只陈述事实(亲见亲摄、年月)
  scrollColophon: {
    zh: "是卷所记，皆亲见亲摄。二〇二六年七月至八月，实践团谨识。",
    en: "Everything in this scroll was seen and photographed by the team itself. July–August 2026.",
  } as Dict,

  footerRights: { zh: "保留所有权利", en: "All rights reserved" } as Dict,
  footerOrg: { zh: "三下乡社会实践团队", en: "Rural Fieldwork Team" } as Dict,
  footerPress: { zh: "国家级媒体报道", en: "National media coverage" } as Dict,

  mediaTitle: { zh: "媒体报道", en: "Media Coverage" } as Dict,
  mediaTitleEn: { zh: "权威报道收录", en: "MEDIA COVERAGE" } as Dict,
  mediaIntro: {
    zh: "国家级媒体关注实践团在川桂红色线路上的实地记录。以下收录人民网、中国日报等权威报道，以及实践团公众号推文。",
    en: "National outlets have covered the team's fieldwork across Sichuan and Guangxi. Featured reports from People's Daily and China Daily, plus WeChat field notes.",
  } as Dict,
  mediaMore: { zh: "更多推文", en: "More posts" } as Dict,
  mediaEndorsement: {
    zh: "项目获 China Daily 中国日报报道",
    en: "Featured by China Daily",
  } as Dict,
  mediaNationalCta: {
    zh: "查看国家级媒体报道",
    en: "National media coverage",
  } as Dict,
  mediaViewReport: { zh: "查看报道", en: "Read coverage" } as Dict,
  mediaBack: { zh: "返回首页", en: "Back to home" } as Dict,
  mediaSeal: { zh: "报道", en: "Press" } as Dict,
  mediaFeaturedRibbon: { zh: "精选报道", en: "Featured" } as Dict,
  mediaPhotoCaption: { zh: "现场摄影 · 实践团", en: "Field photo · Team" } as Dict,
  mediaArchiveFooter: {
    zh: "剪报存档 · 2026 川桂实践",
    en: "Press clippings · Sichuan–Guangxi 2026",
  } as Dict,
  mediaPressBadge: { zh: "媒体报道", en: "Press" } as Dict,
  spotStopLabel: { zh: "第 {n} 站", en: "Stop {n}" } as Dict,
  spotLocationLabel: { zh: "所在地", en: "Location" } as Dict,
} as const;

export function t(dict: Dict, locale: Locale): string {
  return dict[locale];
}

/** Replace `{n}` placeholders in UI strings */
export function tf(dict: Dict, locale: Locale, vars: Record<string, string | number>): string {
  let s = dict[locale];
  for (const [key, val] of Object.entries(vars)) {
    s = s.replace(`{${key}}`, String(val));
  }
  return s;
}
