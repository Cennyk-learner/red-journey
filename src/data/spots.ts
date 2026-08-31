import { withBasePath } from "@/lib/base-path";
import type { Spot } from "./types";
import { getSpotImages } from "./spot-images";
// 四川安排(广安): 故里研学 → 思源广场 → 非遗体验馆 → 市博物馆
// 广西安排(百色): 8.19–8.22 纪念园/纪念馆/廉政基地/粤东会馆/清风楼/
//                 右江博物馆/解放街/劳动一中旧址/灵洲会馆
// order: 同城市内行程顺序(长卷、时间线、上一站/下一站)
// ============================================================

export const SPOTS: Spot[] = [
  // ---------------- 广安 · 7 月 ----------------
  {
    id: "deng-xiaoping-former-residence",
    cityId: "guangan",
    coord: [106.681, 30.551],
    order: 1,
    visible: true,
    name: { zh: "邓小平故里", en: "Deng Xiaoping's Former Residence" },
    tagline: {
      zh: "故里研学,访谈场馆师长",
      en: "Field study at the hometown, conversations with site educators",
    },
    summary: {
      zh: "实践团首站走进邓小平故里,开展红色研学,并邀请场馆老师参与访谈交流,从亲历者视角理解伟人成长与革命历程。",
      en: "The team's first stop: field study at Deng's hometown, with interviews of on-site educators on his early life and revolutionary path.",
    },
    tags: [
      { zh: "研学首站", en: "First Site" },
      { zh: "场馆访谈", en: "Site Interview" },
      { zh: "爱国教育", en: "Patriotic Education" },
    ],
    body: [
      {
        heading: { zh: "故里研学", en: "Hometown Study" },
        text: {
          zh: "沿故居、陈列馆一线参观学习,结合实地观察与讲解,梳理邓小平同志从川东农家走出的成长脉络。",
          en: "A guided route through the residence and exhibition halls traces Deng's path from an eastern-Sichuan farmhouse to national leadership.",
        },
      },
      {
        heading: { zh: "场馆访谈", en: "Educator Interview" },
        text: {
          zh: "团队邀请场馆老师座谈,围绕红色资源讲解、青少年思政教育等议题交流,为后续宣传与报告积累口述素材。",
          en: "Conversations with site educators on interpreting red heritage and youth civic education, gathering material for reports and outreach.",
        },
      },
    ],
    images: ["/spots/deng-xiaoping-former-residence/01.jpg"],
    // 竖构图铜像：横卡裁切时贴顶，避免挡住脸
    imageFocus: "50% 0%",
    date: "2026-07-15",
  },
  {
    id: "siyuan-square",
    cityId: "guangan",
    coord: [106.678, 30.548],
    order: 2,
    visible: true,
    name: { zh: "思源广场", en: "Siyuan Square" },
    tagline: {
      zh: "广场诵读,以声传情",
      en: "Recitation on the square, voices carrying conviction",
    },
    summary: {
      zh: "团队在思源广场开展集体诵读活动,以经典篇章与原创文稿表达对伟人故里的敬意与青年使命。",
      en: "The team held a collective recitation at Siyuan Square, reading classics and original pieces to honor the hometown and youth responsibility.",
    },
    tags: [
      { zh: "集体诵读", en: "Group Recitation" },
      { zh: "广场活动", en: "Public Square" },
    ],
    body: [
      {
        heading: { zh: "诵读现场", en: "On the Square" },
        text: {
          zh: "队员在广场整齐列队诵读,声音与广场景观相映,形成可记录、可传播的现场思政场景。",
          en: "Members recited in formation; the scene became a documentable moment of civic education against the open square backdrop.",
        },
      },
    ],
    images: ["/spots/siyuan-square/01.jpg"],
    date: "2026-07-15",
    pressLinks: [
      {
        label: {
          zh: "“星星之火”社会实践团队暑期三下乡 | 聚焦传承红色基因 筑牢复兴之路",
          en: "\"Spark of Stars\" summer field team | Inheriting red genes, strengthening rejuvenation",
        },
        url: "https://mp.weixin.qq.com/s/npA4L2dF4KBLfu-GTy8RCQ",
        source: { zh: "微信公众号", en: "WeChat" },
      },
    ],
  },
  {
    id: "intangible-heritage-experience",
    cityId: "guangan",
    coord: [106.685, 30.544],
    order: 3,
    visible: true,
    name: { zh: "非遗文化体验馆", en: "Intangible Heritage Experience Center" },
    tagline: {
      zh: "指尖非遗,可感可传",
      en: "Heritage at hand — felt and passed on",
    },
    summary: {
      zh: "实践团走进非遗文化体验馆,体验剪纸、手工艺等本土非遗项目,在动手实践中理解红色文化与民间技艺的共生。",
      en: "Hands-on sessions with paper-cutting and local crafts linked revolutionary memory to living folk artistry.",
    },
    tags: [
      { zh: "非遗体验", en: "Heritage Workshop" },
      { zh: "手工实践", en: "Hands-on Craft" },
    ],
    body: [
      {
        heading: { zh: "体验学习", en: "Experiential Learning" },
        text: {
          zh: "在老师指导下完成非遗作品,队员拍摄记录制作过程,作为文创与跨文化融合的素材来源。",
          en: "Guided craft sessions were filmed and photographed as source material for cultural exchange and creative outputs.",
        },
      },
    ],
    images: ["/spots/intangible-heritage-experience/01.jpg"],
    date: "2026-07-16",
    pressLinks: [
      {
        label: {
          zh: "“星星之火”社会实践团队暑期三下乡 | 踏寻伟人足迹 赓续精神薪火",
          en: "\"Spark of Stars\" summer field team | Retracing great leaders, carrying forward spirit",
        },
        url: "https://mp.weixin.qq.com/s/2Ft2AvIi8wY0F9vIZNtjLQ",
        source: { zh: "微信公众号", en: "WeChat" },
      },
    ],
  },
  {
    id: "guangan-museum",
    cityId: "guangan",
    coord: [106.633, 30.458],
    order: 4,
    visible: true,
    name: { zh: "广安市博物馆", en: "Guang'an Museum" },
    tagline: {
      zh: "馆藏广安,读懂家乡",
      en: "City collections that tell a hometown story",
    },
    summary: {
      zh: "参观广安市博物馆,系统了解广安历史沿革、红色记忆与城市发展,为川桂双线实践建立地方文化坐标。",
      en: "A visit to Guang'an Museum anchored the trip in local history, red memory, and the city's development across eras.",
    },
    tags: [
      { zh: "地方史志", en: "Local History" },
      { zh: "馆藏陈列", en: "Museum Collection" },
    ],
    body: [
      {
        heading: { zh: "参观要点", en: "Highlights" },
        text: {
          zh: "结合馆藏文物与专题展,梳理广安从巴蜀腹地到伟人故里的历史节点,补充红色研学的地域语境。",
          en: "Exhibits and thematic displays framed Guang'an's place in Bashu history and its role as Deng's hometown.",
        },
      },
    ],
    images: ["/spots/guangan-museum/01.jpg"],
    date: "2026-07-17",
    pressLinks: [
      {
        label: {
          zh: "三下乡青春派×牛津布鲁克斯学院｜踏寻伟人足迹，赓续精神薪火",
          en: "Sanxiaxiang Youth × Oxford Brookes | Retracing great leaders, carrying forward spirit",
        },
        url: "https://mp.weixin.qq.com/s/woL4mxzVPONa27gglMRG0Q",
        source: { zh: "成理青年", en: "Chengli Youth" },
      },
      {
        label: { zh: "人民网四川频道专题报道", en: "People's Daily Sichuan feature" },
        url: "http://sc.people.com.cn/n2/2026/0724/c345167-41649287.html",
        source: { zh: "人民网", en: "People's Daily" },
        featured: true,
        summary: {
          zh: "人民网四川频道报道实践团在广安开展故里研学、广场诵读与非遗体验。",
          en: "People's Daily Sichuan on hometown study, recitation, and heritage workshops in Guang'an.",
        },
        date: "2026-07-24",
      },
      {
        label: { zh: "中国日报英文报道", en: "China Daily English coverage" },
        url: "https://cn.chinadaily.com.cn/a/202607/23/WS6a61d086a310d709c2fbf52b.html",
        source: { zh: "中国日报", en: "China Daily" },
        featured: true,
        summary: {
          zh: "中国日报英文网刊发专题，报道中外青年在伟人故里的红色研学实践。",
          en: "China Daily feature on cross-cultural red field study at Deng's hometown.",
        },
        date: "2026-07-23",
      },
    ],
  },

  // ---------------- 百色 · 8 月 19–22 日 ----------------
  {
    id: "baise-uprising-monument-park",
    cityId: "baise",
    coord: [106.622, 23.905],
    order: 1,
    visible: true,
    name: {
      zh: "百色起义纪念园",
      en: "Baise Uprising Monument Park",
    },
    tagline: {
      zh: "碑林雕像,实践启程",
      en: "Monuments and statues — where the journey begins",
    },
    summary: {
      zh: "8 月 19 日上午,团队在百色起义纪念园、邓小平手迹碑林与邓小平雕像前举行中外联合启动仪式,献花默哀并重温誓词。",
      en: "On Aug 19 morning: a joint launch at the monument park, Deng's handwriting grove and statue — flowers, silence, and renewed pledges.",
    },
    tags: [
      { zh: "启动仪式", en: "Opening Ceremony" },
      { zh: "手迹碑林", en: "Handwriting Grove" },
      { zh: "城市地标", en: "City Landmark" },
    ],
    body: [
      {
        heading: { zh: "纪念空间", en: "Memorial Grounds" },
        text: {
          zh: "纪念园依山就势,主碑、碑林与雕像构成完整纪念序列,是百色红色教育的标志性入口。",
          en: "The park's main monument, handwriting tablets and statue form Baise's iconic gateway to red education.",
        },
      },
      {
        heading: { zh: "首日任务", en: "Day-One Tasks" },
        text: {
          zh: "中外队员共同献花,国内队员重温入党入团誓词;联合拍摄双语开篇宣传片,启动跨国历史对比研学笔记。",
          en: "Chinese and international members laid flowers; pledges were renewed; bilingual opening footage and cross-national study notes began.",
        },
      },
    ],
    images: ["/spots/baise-uprising-monument-park/01.jpg"],
    date: "2026-08-19",
  },
  {
    id: "baise-uprising-memorial",
    cityId: "baise",
    coord: [106.616, 23.899],
    order: 2,
    visible: true,
    name: { zh: "百色起义纪念馆", en: "Baise Uprising Memorial Hall" },
    tagline: {
      zh: "史料展厅,三语同学",
      en: "Archives in the hall, study in three languages",
    },
    summary: {
      zh: "8 月 19 日下午参观纪念馆,梳理百色起义史料;中外队员联合研学,采访讲解员与游客,录制中、英、孟三语口述素材。",
      en: "Afternoon of Aug 19: exhibition study, interviews with guides and visitors, and trilingual oral-history recordings.",
    },
    tags: [
      { zh: "百色起义", en: "Baise Uprising" },
      { zh: "三语研学", en: "Trilingual Study" },
      { zh: "口述素材", en: "Oral History" },
    ],
    body: [
      {
        heading: { zh: "展厅研学", en: "Exhibition Study" },
        text: {
          zh: "国内学生梳理起义脉络,留学生结合本国独立史开展对比分享,形成纪念馆史料库与多语种音视频素材。",
          en: "Chinese students mapped the uprising timeline; international peers compared with their national liberation histories.",
        },
      },
    ],
    images: ["/spots/baise-uprising-memorial/01.jpg"],
    date: "2026-08-19",
  },
  {
    id: "baise-integrity-education-base",
    cityId: "baise",
    coord: [106.618, 23.897],
    order: 3,
    visible: true,
    name: {
      zh: "百色全国廉政教育基地",
      en: "Baise National Integrity Education Base",
    },
    tagline: {
      zh: "廉政教育,与史同行",
      en: "Integrity education alongside revolutionary history",
    },
    summary: {
      zh: "与纪念馆同日下午走访全国廉政教育基地,延伸红色研学至党风廉政建设与青年廉洁教育维度。",
      en: "The same afternoon extended red study into party integrity building and youth ethics education.",
    },
    tags: [
      { zh: "廉政教育", en: "Integrity Education" },
      { zh: "联合研学", en: "Joint Study" },
    ],
    body: [
      {
        heading: { zh: "教育内涵", en: "Educational Focus" },
        text: {
          zh: "通过案例展陈与现场讲解,引导队员思考红色精神在新时代廉政建设中的延续与实践。",
          en: "Case exhibits and guided interpretation linked revolutionary spirit to integrity in contemporary public life.",
        },
      },
    ],
    images: ["/spots/baise-integrity-education-base/01.jpg"],
    date: "2026-08-19",
  },
  {
    id: "guangdong-guild-hall",
    cityId: "baise",
    coord: [106.619, 23.902],
    order: 4,
    visible: true,
    name: {
      zh: "粤东会馆",
      en: "Guangdong Guild Hall",
    },
    tagline: {
      zh: "红军军部,岭南砖木",
      en: "Red Army headquarters in Lingnan timber and brick",
    },
    summary: {
      zh: "8 月 20 日上午实地研学粤东会馆(红七军军部旧址),拍摄建筑与文物,录制中、英、孟三语讲解音视频。",
      en: "Aug 20 morning: field study at the guild hall — former Red Seventh Army HQ — with trilingual guided recordings.",
    },
    tags: [
      { zh: "军部旧址", en: "Former HQ" },
      { zh: "三语讲解", en: "Trilingual Guide" },
      { zh: "岭南建筑", en: "Lingnan Architecture" },
    ],
    body: [
      {
        heading: { zh: "旧址研学", en: "Site Study" },
        text: {
          zh: "梳理起义前后中共前敌委员会与军部办公脉络,分工采集建筑细部与文物影像,形成三语红色讲解库。",
          en: "The team documented offices of the front committee and army HQ, building a trilingual explanation archive.",
        },
      },
    ],
    images: ["/spots/guangdong-guild-hall/01.jpg"],
    date: "2026-08-20",
  },
  {
    id: "qingfeng-lou",
    cityId: "baise",
    coord: [106.617, 23.898],
    order: 5,
    visible: true,
    name: {
      zh: "清风楼",
      en: "Qingfeng Lou (Red Seventh Army Political Dept. Site)",
    },
    tagline: {
      zh: "政治部旧址,深度访谈",
      en: "Political department site — interviews in depth",
    },
    summary: {
      zh: "8 月 20 日下午走访中国工农红军第七军政治部旧址(清风楼),专访党史专家与革命后代,录制跨国解放道路对比口述史。",
      en: "Aug 20 afternoon: interviews with historians and revolutionary descendants at the Red Seventh Army political department site.",
    },
    tags: [
      { zh: "政治部旧址", en: "Political Dept. Site" },
      { zh: "专家访谈", en: "Expert Interview" },
      { zh: "跨国对比", en: "Cross-national Compare" },
    ],
    body: [
      {
        heading: { zh: "专题访谈", en: "Thematic Interviews" },
        text: {
          zh: "围绕民族独立与后发国家复兴议题深度对话,留学生结合本国独立战争经历,口述中孟解放道路异同。",
          en: "Discussions on national independence and post-colonial renewal, with international peers comparing liberation paths.",
        },
      },
    ],
    images: ["/spots/qingfeng-lou/01.jpg"],
    date: "2026-08-20",
  },
  {
    id: "youjiang-ethnic-museum",
    cityId: "baise",
    coord: [106.614, 23.896],
    order: 6,
    visible: true,
    name: { zh: "右江民族博物馆", en: "Youjiang Ethnic Museum" },
    tagline: {
      zh: "民族文献,红色影像",
      en: "Ethnic archives and red documentary footage",
    },
    summary: {
      zh: "8 月 21 日上午与解放街一并走访,在博物馆采集红色与民族文化影像,对照边疆脱贫与跨国发展议题开展研学。",
      en: "Aug 21 morning with Jiefang Street: ethnographic and red footage, studying border development in cross-national context.",
    },
    tags: [
      { zh: "民族文博", en: "Ethnic Museum" },
      { zh: "边疆发展", en: "Border Development" },
      { zh: "影像采集", en: "Footage" },
    ],
    body: [
      {
        heading: { zh: "研学重点", en: "Study Focus" },
        text: {
          zh: "记录邓小平同志在百色领导边疆建设的实践叙事,与留学生本国发展困境对照,整理宣讲素材笔记。",
          en: "Documentation of border governance narratives compared with international peers' home-country development contexts.",
        },
      },
    ],
    images: ["/spots/youjiang-ethnic-museum/01.jpg"],
    date: "2026-08-21",
  },
  {
    id: "jiefang-street",
    cityId: "baise",
    coord: [106.615, 23.901],
    order: 7,
    visible: true,
    name: { zh: "解放街", en: "Jiefang Street" },
    tagline: {
      zh: "老街红脉,街巷寻史",
      en: "Old streets where red history still lives",
    },
    summary: {
      zh: "8 月 21 日上午沿解放街补充拍摄红色街巷资源,录制中、英、孟三语红色故事口播,为中孟文创提供街景素材。",
      en: "Aug 21 morning street documentation and trilingual storytelling recordings for cultural creative work.",
    },
    tags: [
      { zh: "历史街区", en: "Historic Quarter" },
      { zh: "三语口播", en: "Trilingual Voice-over" },
    ],
    body: [
      {
        heading: { zh: "街巷拍摄", en: "Street Documentation" },
        text: {
          zh: "多机位记录老街建筑立面、红色标识与市井日常,沉淀可用于海外传播的城市场景素材。",
          en: "Multi-camera coverage of facades, red markers and everyday street life for outreach-ready urban footage.",
        },
      },
    ],
    images: ["/spots/jiefang-street/01.jpg"],
    date: "2026-08-21",
  },
  {
    id: "guangxi-labor-first-middle-school",
    cityId: "baise",
    coord: [106.620, 23.904],
    order: 8,
    visible: true,
    name: {
      zh: "广西劳动第一中学旧址",
      en: "Former Site of Guangxi Labor First Middle School",
    },
    tagline: {
      zh: "校园旧址,文创初稿",
      en: "School site — first drafts of fusion artwork",
    },
    summary: {
      zh: "8 月 21 日下午走访广西劳动第一中学旧址,推进中孟融合文创初稿,融合百色红色元素与孟加拉 Alpana、Baul 等非遗纹样。",
      en: "Aug 21 afternoon: site visit and first drafts of China–Bangladesh fusion art blending red motifs with Alpana and Baul patterns.",
    },
    tags: [
      { zh: "劳动教育", en: "Labor Education" },
      { zh: "融合文创", en: "Fusion Art" },
      { zh: "非遗元素", en: "Folk Patterns" },
    ],
    body: [
      {
        heading: { zh: "文创设计", en: "Creative Drafts" },
        text: {
          zh: "结合北部湾港口素材绘制西部陆海新通道合作插画底稿,为次日灵洲会馆终稿创作做准备。",
          en: "Illustration drafts on the New Western Land–Sea Corridor set the stage for final works at Lingzhou Guild Hall.",
        },
      },
    ],
    images: ["/spots/guangxi-labor-first-middle-school/01.jpg"],
    date: "2026-08-21",
  },
  {
    id: "lingzhou-guild-hall",
    cityId: "baise",
    coord: [106.621, 23.9],
    order: 9,
    visible: true,
    name: { zh: "灵洲会馆", en: "Lingzhou Guild Hall" },
    tagline: {
      zh: "会馆深处,成果收官",
      en: "Inside the guild hall — where outcomes converge",
    },
    summary: {
      zh: "8 月 22 日全天深度研学灵洲会馆:三语宣讲成片、西部陆海新通道主题口播、中孟融合文创终稿与中外总结交流。",
      en: "Aug 22 full day at Lingzhou Guild Hall: trilingual lectures, corridor-themed broadcasts, final fusion art and closing exchange.",
    },
    tags: [
      { zh: "起义联络点", en: "Uprising Liaison Site" },
      { zh: "三语成片", en: "Trilingual Film" },
      { zh: "总结交流", en: "Closing Exchange" },
    ],
    body: [
      {
        heading: { zh: "深度研学", en: "Deep Study" },
        text: {
          zh: "梳理会馆作为百色起义联络点、右江工农运动策源地的沿革,采访老街居民与党史专家,采集三语口述史。",
          en: "Research on the hall as uprising liaison point and workers' movement hub, with trilingual oral histories.",
        },
      },
      {
        heading: { zh: "成果产出", en: "Final Outputs" },
        text: {
          zh: "实景录制完整版三语宣讲视频,完成文创终稿与中孟青年红色文化交流手绘长卷,召开总结会归档全部素材。",
          en: "Final trilingual lecture films, fusion artworks, handscroll and a closing session archiving all field materials.",
        },
      },
    ],
    images: ["/spots/lingzhou-guild-hall/01.jpg"],
    date: "2026-08-22",
  },
];

for (const spot of SPOTS) {
  spot.images = spot.images.map(withBasePath);
  for (const section of spot.body) {
    if (section.image) section.image = withBasePath(section.image);
  }
}

export function getVisibleSpots(): Spot[] {
  return SPOTS.filter((s) => s.visible).sort((a, b) => {
    if (a.cityId !== b.cityId) return a.cityId.localeCompare(b.cityId);
    return a.order - b.order;
  });
}

export function getSpot(id: string): Spot | undefined {
  return SPOTS.find((s) => s.id === id);
}

export function getSpotsByCity(cityId: string): Spot[] {
  return SPOTS.filter((s) => s.cityId === cityId && s.visible).sort(
    (a, b) => a.order - b.order,
  );
}

/** 上一站/下一站(同城市内按 order 串联) */
export function getAdjacentSpots(id: string): {
  prev: Spot | null;
  next: Spot | null;
} {
  const spot = getSpot(id);
  if (!spot) return { prev: null, next: null };
  const siblings = getSpotsByCity(spot.cityId);
  const idx = siblings.findIndex((s) => s.id === id);
  return {
    prev: idx > 0 ? siblings[idx - 1] : null,
    next: idx < siblings.length - 1 ? siblings[idx + 1] : null,
  };
}

export function resolveSpotImages(spot: Spot): string[] {
  const imported = getSpotImages(spot.id);
  return imported.length > 0 ? imported : spot.images;
}
