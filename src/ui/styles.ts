import { CSS_VARS } from "./theme";

const defaultVars = Object.entries(CSS_VARS)
  .map(([k, v]) => `${k}: ${v};`)
  .join("\n  ");

export const WIDGET_CSS = `
:host {
  ${defaultVars}
  display: block;
  font-family: var(--argyros-font);
  color: var(--argyros-text);
  box-sizing: border-box;
}

:host([theme="light"]) {
  --argyros-bg: #ffffff;
  --argyros-surface: #f5f5f7;
  --argyros-surface-hover: #ebebef;
  --argyros-border: #d4d4dc;
  --argyros-text: #1a1a2e;
  --argyros-text-secondary: #6b6b7a;
  --argyros-accent: #1a1a2e;
  --argyros-accent-hover: #2d2d45;
}

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.swap-container {
  background: var(--argyros-bg);
  border-radius: var(--argyros-radius);
  padding: 16px;
  max-width: 420px;
  width: 100%;
  border: 1px solid var(--argyros-border);
}

.token-panel {
  background: var(--argyros-surface);
  border-radius: var(--argyros-radius-sm);
  padding: 16px;
  margin-bottom: 4px;
  position: relative;
}

.token-panel-label {
  font-size: 13px;
  color: var(--argyros-text-secondary);
  margin-bottom: 8px;
}

.token-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.amount-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 28px;
  font-weight: 600;
  color: var(--argyros-text);
  font-family: var(--argyros-font);
  min-width: 0;
}

.amount-input::placeholder {
  color: var(--argyros-text-secondary);
  opacity: 0.5;
}

.amount-input:disabled {
  opacity: 0.7;
}

.token-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--argyros-surface-hover);
  border: 1px solid var(--argyros-border);
  border-radius: 20px;
  padding: 6px 12px 6px 8px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  color: var(--argyros-text);
  white-space: nowrap;
  transition: background 0.15s;
}

.token-badge:hover {
  background: var(--argyros-border);
}

.token-badge svg {
  width: 8px;
  height: 8px;
  opacity: 0.5;
}

.sub-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  font-size: 12px;
  color: var(--argyros-text-secondary);
}

.swap-direction {
  display: flex;
  justify-content: center;
  margin: -8px 0;
  position: relative;
  z-index: 1;
}

.swap-direction-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 3px solid var(--argyros-bg);
  background: var(--argyros-surface);
  color: var(--argyros-text);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, transform 0.2s;
}

.swap-direction-btn:hover {
  background: var(--argyros-surface-hover);
  transform: rotate(180deg);
}

.swap-btn {
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: var(--argyros-radius-sm);
  background: var(--argyros-accent);
  color: var(--argyros-bg);
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 12px;
  font-family: var(--argyros-font);
  transition: background 0.15s, opacity 0.15s;
}

.swap-btn:hover:not(:disabled) {
  background: var(--argyros-accent-hover);
}

.swap-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.route-info {
  margin-top: 12px;
  padding: 12px;
  background: var(--argyros-surface);
  border-radius: var(--argyros-radius-sm);
  font-size: 12px;
  color: var(--argyros-text-secondary);
}

.route-info-row {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
}

.route-info-label {
  opacity: 0.7;
}

.impact-warning {
  color: var(--argyros-warning);
}

.impact-high {
  color: var(--argyros-error);
}

.error-msg {
  margin-top: 8px;
  padding: 10px 12px;
  background: rgba(255, 77, 106, 0.1);
  border: 1px solid rgba(255, 77, 106, 0.2);
  border-radius: var(--argyros-radius-sm);
  color: var(--argyros-error);
  font-size: 13px;
}

.success-msg {
  margin-top: 8px;
  padding: 10px 12px;
  background: rgba(0, 214, 143, 0.1);
  border: 1px solid rgba(0, 214, 143, 0.2);
  border-radius: var(--argyros-radius-sm);
  color: var(--argyros-success);
  font-size: 13px;
}

.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid var(--argyros-text-secondary);
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  vertical-align: middle;
  margin-right: 6px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.half-max-row {
  display: flex;
  gap: 6px;
  align-items: center;
}

.half-max-btn {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 6px;
  border: 1px solid var(--argyros-border);
  background: transparent;
  color: var(--argyros-text-secondary);
  cursor: pointer;
  font-family: var(--argyros-font);
  transition: background 0.15s;
}

.half-max-btn:hover {
  background: var(--argyros-surface-hover);
}
`;
