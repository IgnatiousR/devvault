"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { Spinner } from "@/components/ui/spinner";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const iconStyle = {
  fontSize: "14px",
  fontVariationSettings: '"FILL" 0, "wght" 400, "GRAD" 0, "opsz" 16',
  transform: "scale(0.75)",
  display: "inline-block" as const,
};

const buttonClass =
  "flex items-center gap-1 px-2 py-1 rounded text-xs text-[#858585] hover:text-[#cccccc] hover:bg-[#3c3c3c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

function AiIcon({ name, animated }: { name: string; animated?: boolean }) {
  return (
    <span className="material-symbols-outlined" style={iconStyle}>
      {animated ? "progress_activity" : name}
    </span>
  );
}

export function AiGhostButton({
  show,
  onClick,
  isLoading,
  disabled,
  label,
  loadingLabel,
}: {
  show?: boolean;
  onClick: () => void;
  isLoading: boolean;
  disabled: boolean;
  label: string;
  loadingLabel: string;
}) {
  if (!show) return null;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
      className="h-7 px-2 text-xs gap-1.5 text-muted-foreground hover:text-foreground inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
    >
      {isLoading ? (
        <Spinner size="sm" />
      ) : (
        <span className="material-symbols-outlined text-sm">auto_awesome</span>
      )}
      {isLoading ? loadingLabel : label}
    </button>
  );
}

export function AiButton({
  icon,
  label,
  loadingLabel,
  isLoading,
  disabled,
  onClick,
}: {
  icon: string;
  label: string;
  loadingLabel?: string;
  isLoading?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} disabled={disabled || isLoading} className={buttonClass}>
      <AiIcon name={isLoading ? "progress_activity" : icon} animated={isLoading} />
      {isLoading ? loadingLabel || `${label}...` : label}
    </button>
  );
}

export function AiPremiumTooltip() {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button type="button" disabled className="flex items-center gap-1 px-2 py-1 rounded text-xs text-[#858585] opacity-50 cursor-not-allowed">
            <AiIcon name="workspace_premium" />
          </button>
        }
      />
      <TooltipContent side="bottom">AI features require Pro subscription</TooltipContent>
    </Tooltip>
  );
}

export function AiResponseMarkdown({ content }: { content: string | null }) {
  return (
    <div className="p-4 bg-[#1e1e1e] text-sm text-[#d4d4d4] leading-relaxed markdown-preview min-h-[200px]">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

export function AiUseOptimizedButton({
  isSaving,
  onClick,
}: {
  isSaving: boolean;
  onClick: () => void;
}) {
  return (
    <div className="ml-auto flex items-center pr-3">
      <button
        type="button"
        onClick={onClick}
        disabled={isSaving}
        className="flex items-center gap-1 px-3 py-1 rounded text-xs bg-[#3c3c3c] text-[#cccccc] hover:bg-[#4c4c4c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <AiIcon name={isSaving ? "progress_activity" : "check"} animated={isSaving} />
        {isSaving ? "Saving..." : "Use this"}
      </button>
    </div>
  );
}

export function AiOptimizedTabButton({
  isActive,
  label,
  onClick,
}: {
  isActive: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-1.5 text-xs font-medium transition-colors ${
        isActive
          ? "text-[#cccccc] border-b-2 border-[#cccccc]"
          : "text-[#858585] hover:text-[#cccccc]"
      }`}
    >
      {label}
    </button>
  );
}
