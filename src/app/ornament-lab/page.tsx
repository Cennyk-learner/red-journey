import type { ReactNode } from "react";
import {
  CloudCorner,
  Logotype,
  MeanderRule,
  PlaqueFrame,
  RuyiHead,
  Seal,
} from "@/components/ornament";

// 纹样校对页 —— 只在开发期用来逐个核对手绘 SVG 的形状与色阶,
// 定稿后可删。两种底色各排一遍,因为纹样要在玄墨和宣纸上都成立。

function Row({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}): ReactNode {
  return (
    <section className="mb-14">
      <p className="datum mb-5 text-[11px] uppercase text-current opacity-45">
        {title}
      </p>
      <div className="flex flex-wrap items-end gap-10">{children}</div>
    </section>
  );
}

export default function OrnamentLab(): ReactNode {
  return (
    <main>
      {/* ── 宣纸调 ── */}
      <div className="bg-rice px-12 py-16 text-ink">
        <h1 className="brush mb-12 text-4xl">宣纸调</h1>

        <Row title="Logotype / 双钩填墨">
          <Logotype size={56} tone="ink" />
          <Logotype size={30} tone="ink" delay={0.6} />
          <Logotype size={20} tone="ink" still />
        </Row>

        <Row title="Seal / 钤印">
          <Seal text="红色足迹" size={72} />
          <Seal text="广安" size={56} />
          <Seal text="百色" size={56} carve="yang" />
          <Seal text="印" size={40} />
          <Seal text="寻访" size={48} carve="yang" />
        </Row>

        <Row title="MeanderRule / 回纹带">
          <div className="w-[420px]">
            <MeanderRule tone="cinnabar" />
            <div className="h-8" />
            <MeanderRule tone="cinnabar" diamond />
          </div>
        </Row>

        <Row title="PlaqueFrame / 匾额框">
          <PlaqueFrame className="w-[300px] px-8 py-10" tone="paper">
            <p className="plaque-text text-center text-lg">邓小平故里</p>
            <p className="en-caption mt-2 text-center text-xs opacity-55">
              Deng Xiaoping&apos;s Former Residence
            </p>
          </PlaqueFrame>

          <PlaqueFrame
            className="w-[300px] px-8 py-10"
            tone="paper"
            label={<span className="plaque-text text-xs">卷一</span>}
          >
            <p className="kai text-center text-sm">
              一九二九年十二月十一日，百色起义。
            </p>
          </PlaqueFrame>
        </Row>

        <Row title="CloudCorner / 云纹角隅">
          <div className="relative h-40 w-64 border border-rule">
            <CloudCorner place="tl" size={80} color="var(--cinnabar)" style={{ position: "absolute", left: 4, top: 4 }} />
            <CloudCorner place="br" size={80} color="var(--cinnabar)" style={{ position: "absolute", right: 4, bottom: 4 }} />
          </div>
        </Row>

        <Row title="RuyiHead / 如意云头">
          <RuyiHead width={96} color="var(--cinnabar)" />
          <RuyiHead width={64} color="var(--cinnabar)" point="up" />
          <RuyiHead width={48} color="var(--cinnabar)" point="left" />
        </Row>
      </div>

      {/* ── 玄墨调 ── */}
      <div className="bg-ink-ground px-12 py-16 text-rice-text">
        <h1 className="brush mb-12 text-4xl">玄墨调</h1>

        <Row title="Logotype / 双钩填墨">
          <Logotype size={56} tone="rice" />
          <Logotype size={30} tone="rice" delay={0.6} />
        </Row>

        <Row title="Seal / 钤印">
          <Seal text="红色足迹" size={72} ground="var(--ink-ground)" />
          <Seal text="广安" size={56} ground="var(--ink-ground)" />
          <Seal text="百色" size={56} carve="yang" />
        </Row>

        <Row title="MeanderRule / 回纹带">
          <div className="w-[420px]">
            <MeanderRule tone="glaze" />
            <div className="h-8" />
            <MeanderRule tone="glaze" diamond diamondRing="var(--ink-ground)" />
          </div>
        </Row>

        <Row title="PlaqueFrame / 匾额框">
          <PlaqueFrame className="w-[300px] px-8 py-10" tone="ink"
            label={<span className="plaque-text text-xs">图例</span>}
          >
            <p className="plaque-text text-center text-lg">百色起义纪念馆</p>
            <p className="en-caption mt-2 text-center text-xs opacity-55">
              Bose Uprising Memorial Hall
            </p>
          </PlaqueFrame>
        </Row>

        <Row title="CloudCorner / 云纹角隅">
          <div className="relative h-40 w-64 border border-rule-invert">
            <CloudCorner place="tl" size={80} style={{ position: "absolute", left: 4, top: 4 }} />
            <CloudCorner place="br" size={80} style={{ position: "absolute", right: 4, bottom: 4 }} />
          </div>
        </Row>

        <Row title="字体样张">
          <div className="max-w-xl space-y-4">
            <p className="brush text-5xl">跨越山河 贯通中外</p>
            <p className="kai text-base">
              霞鹜文楷：一九二九年十二月十一日，红七军在百色成立，军部设于粤东会馆。
            </p>
            <p className="font-serif text-base tracking-[0.2em]">
              思源宋体：邓小平故里 · 缅怀馆 · 华蓥山
            </p>
            <p className="en-title text-xl">
              Bose Uprising Memorial Hall, Guangxi
            </p>
            <p className="en-caption text-sm">Exhibition Notes 2026</p>
            <p className="datum text-xs">106.63°E 30.46°N · 17.4 KM · NO.03</p>
          </div>
        </Row>
      </div>
    </main>
  );
}
