/**
 * 钤印二字印文 — 按景点专名取义,避免「博物馆→物馆」「清风楼→风楼」等误切。
 */
export function sealText(nameZh: string): string {
  const clean = nameZh.replace(/[()（）].*$/, "").trim();

  const exact: Record<string, string> = {
    邓小平故里: "故里",
    思源广场: "思源",
    非遗文化体验馆: "非遗",
    广安市博物馆: "博馆",
    百色起义纪念园: "碑园",
    百色起义纪念馆: "纪馆",
    百色全国廉政教育基地: "廉政",
    粤东会馆: "粤东",
    清风楼: "清风",
    右江民族博物馆: "右江",
    解放街: "解放",
    广西劳动第一中学旧址: "劳动",
    灵洲会馆: "灵洲",
    邓小平缅怀馆: "缅怀",
    华蓥山游击队遗址: "华蓥",
    百色起义纪念碑园: "碑园",
  };

  if (exact[clean]) return exact[clean];

  if (/故里$/.test(clean)) return "故里";
  if (/纪念园$|纪念碑园$/.test(clean)) return "碑园";
  if (/纪念馆$/.test(clean)) return "纪馆";
  if (/博物馆$/.test(clean)) return clean.slice(0, 2);
  if (/会馆$/.test(clean)) return clean.slice(0, 2);
  if (/广场$/.test(clean)) return clean.slice(0, 2);

  const chars = [...clean];
  if (chars.length === 2) return clean;
  if (chars.length >= 2) return chars.slice(0, 2).join("");
  return clean;
}
