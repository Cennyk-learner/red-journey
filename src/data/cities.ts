import { withBasePath } from "@/lib/base-path";
import type { City } from "./types";

// ============================================================
// 城市数据 — 实践团足迹城市
// sceneryImage 图源(CC BY-SA 4.0, 作者 N509FZ, Wikimedia Commons):
//   guangan/scenery.webp ← File:Former residence of Deng Xiaoping (20250115093513).jpg
//   baise/scenery.webp   ← File:Baise Uprising Memorial Hall (20230403093423).jpg
// 长卷/首页选城用大气实景图;详情页实拍见 public/spots/ (import-spot-images.py)
// ============================================================

export const CITIES: City[] = [
  {
    id: "guangan",
    adcode: "511600",
    nameZh: "四川 · 广安",
    nameEn: "Guang'an, Sichuan",
    coord: [106.633, 30.456],
    intro: {
      zh: "伟人故里,改革之源。广安是邓小平同志的家乡,红色基因深植于华蓥山麓、渠江之畔。",
      en: "Hometown of Deng Xiaoping and a cradle of China's reform. Red heritage runs deep beneath Mt. Huaying and along the Qujiang River.",
    },
    heroImage: "/cities/guangan/residence.webp",
    sceneryImage: "/cities/guangan/scenery.webp",
  },
  {
    id: "baise",
    adcode: "451000",
    nameZh: "广西 · 百色",
    nameEn: "Baise, Guangxi",
    coord: [106.618, 23.902],
    intro: {
      zh: "百色起义的热土,红七军的摇篮。右江两岸,壮乡儿女的革命记忆与民族风情交织。",
      en: "Land of the Baise Uprising and cradle of the Red Seventh Army, where revolutionary memory meets Zhuang ethnic culture along the Youjiang River.",
    },
    heroImage: "/cities/baise/memorial.webp",
    sceneryImage: "/cities/baise/scenery.webp",
  },
];

for (const city of CITIES) {
  city.heroImage = withBasePath(city.heroImage);
  if (city.sceneryImage) city.sceneryImage = withBasePath(city.sceneryImage);
}

export function getCity(id: string): City | undefined {
  return CITIES.find((c) => c.id === id);
}
