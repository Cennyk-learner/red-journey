// ============================================================
// 图片兜底工具 — 景点实拍图未上传期间,任何 UI 都不出现空图
// CSS 多重背景:第一个能加载的 URL 盖在最上;404 的层是透明的,
// 后面的兜底图会透出来。因此把「首选图, 兜底图」按序传入即可。
// ============================================================

export function bgStack(...urls: Array<string | null | undefined>): string {
  const list = urls.filter((u): u is string => Boolean(u));
  return list.map((u) => `url(${u})`).join(", ");
}
