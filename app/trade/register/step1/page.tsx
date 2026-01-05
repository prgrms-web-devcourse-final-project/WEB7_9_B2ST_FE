import { Suspense } from "react";
import TradeRegisterStep1Content from "./TradeRegisterStep1Content";

export default function TradeRegisterStep1Page() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <TradeRegisterStep1Content />
    </Suspense>
  );
}
