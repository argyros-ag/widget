# @argyros/widget

Embeddable swap widget for the Argyros DEX aggregator. Framework-agnostic Web Component that works in React, Vue, Svelte, Angular, or plain HTML.

## Install

```bash
npm install @argyros/widget
```

Or via CDN (no build step needed):

```html
<script src="https://cdn.argyros.trade/argyros-widget.umd.js"></script>
```

## Usage

### HTML / CDN

```html
<script src="https://cdn.argyros.trade/argyros-widget.umd.js"></script>

<argyros-swap
  api-key="argy_your_api_key"
  chain="solana"
  default-input-mint="So11111111111111111111111111111111111111112"
  default-output-mint="EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
  theme="dark"
></argyros-swap>
```

### React

```tsx
import "@argyros/widget";

function App() {
  return (
    <argyros-swap
      api-key="argy_your_api_key"
      chain="solana"
      default-input-mint="So11111111111111111111111111111111111111112"
      default-output-mint="EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
      theme="dark"
    />
  );
}
```

For TypeScript, add to your `global.d.ts`:

```typescript
declare namespace JSX {
  interface IntrinsicElements {
    "argyros-swap": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        "api-key"?: string;
        chain?: string;
        "default-input-mint"?: string;
        "default-output-mint"?: string;
        theme?: "dark" | "light";
      },
      HTMLElement
    >;
  }
}
```

### Vue

```vue
<template>
  <argyros-swap
    api-key="argy_your_api_key"
    chain="solana"
    default-input-mint="So11111111111111111111111111111111111111112"
    default-output-mint="EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
    theme="dark"
    @quote-update="onQuote"
    @swap-complete="onSwap"
  />
</template>

<script setup>
import "@argyros/widget";

function onQuote(e) {
  console.log("Quote:", e.detail);
}
function onSwap(e) {
  console.log("Swap:", e.detail);
}
</script>
```

### Next.js

```tsx
"use client";
import { useEffect, useRef } from "react";

export default function SwapWidget() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    import("@argyros/widget");
  }, []);

  return (
    <argyros-swap
      ref={ref}
      api-key="argy_your_api_key"
      chain="solana"
      theme="dark"
    />
  );
}
```

## Attributes

| Attribute             | Type               | Default    | Description                    |
| --------------------- | ------------------ | ---------- | ------------------------------ |
| `api-key`             | `string`           | —          | **Required.** Your API key     |
| `chain`               | `"solana"\|"fogo"` | `"solana"` | Target chain                   |
| `base-url`            | `string`           | Production | API base URL override          |
| `default-input-mint`  | `string`           | —          | Pre-selected input token mint  |
| `default-output-mint` | `string`           | —          | Pre-selected output token mint |
| `theme`               | `"dark"\|"light"`  | `"dark"`   | Color theme                    |

## Events

| Event             | Detail                                    | Description                   |
| ----------------- | ----------------------------------------- | ----------------------------- |
| `quote-update`    | `QuoteResponse`                           | Fired when a new quote loads  |
| `swap-initiated`  | `{ inputMint, outputMint, amount }`       | Fired when swap starts        |
| `swap-complete`   | `SwapResponse`                            | Fired on successful swap      |
| `swap-error`      | `{ error: string }`                       | Fired on swap failure         |
| `connect-wallet`  | `{}`                                      | Fired when user clicks swap without wallet |

## Wallet Integration

Set the wallet address programmatically:

```javascript
const widget = document.querySelector("argyros-swap");
widget.setWallet("9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM");
```

Listen for the `connect-wallet` event to trigger your wallet adapter:

```javascript
widget.addEventListener("connect-wallet", async () => {
  const wallet = await connectWallet(); // your wallet adapter
  widget.setWallet(wallet.publicKey.toString());
});
```

## Customization

Override CSS custom properties on the host element:

```css
argyros-swap {
  --argyros-bg: #0d0d12;
  --argyros-accent: #00ff88;
  --argyros-radius: 20px;
}
```

Available CSS variables:

| Variable                    | Default (dark) | Description        |
| --------------------------- | -------------- | ------------------ |
| `--argyros-bg`              | `#0a0a0f`      | Background         |
| `--argyros-surface`         | `#141419`      | Card/panel bg      |
| `--argyros-surface-hover`   | `#1c1c24`      | Hover state        |
| `--argyros-border`          | `#2a2a35`      | Borders            |
| `--argyros-text`            | `#e8e8ed`      | Primary text       |
| `--argyros-text-secondary`  | `#8b8b9a`      | Secondary text     |
| `--argyros-accent`          | `#c8ff00`      | Accent / CTA       |
| `--argyros-error`           | `#ff4d6a`      | Error color        |
| `--argyros-radius`          | `16px`         | Border radius      |
