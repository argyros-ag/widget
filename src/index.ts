import { ArgyrosSwapElement } from "./argyros-swap";

if (typeof customElements !== "undefined" && !customElements.get("argyros-swap")) {
  customElements.define("argyros-swap", ArgyrosSwapElement);
}

export { ArgyrosSwapElement };
export type { WidgetState, WidgetStatus } from "./state/store";
