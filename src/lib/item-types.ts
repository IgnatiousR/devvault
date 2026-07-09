export const EDITABLE_TYPES = ["Snippet", "Prompt", "Command", "Note"];
export const CODE_TYPES = ["Snippet", "Command"];
export const LANGUAGE_TYPES = ["Snippet", "Command"];
export const URL_TYPES = ["Link"];
export const FILE_TYPES = ["File"];
export const IMAGE_TYPES = ["Image"];

export const ITEM_TYPE_OPTIONS = [
  { id: "snippet", name: "Snippet", icon: "code", color: "text-[var(--color-brand-red)]" },
  { id: "prompt", name: "Prompt", icon: "auto_awesome", color: "text-orange-500" },
  { id: "command", name: "Command", icon: "terminal", color: "text-amber-500" },
  { id: "note", name: "Note", icon: "description", color: "text-yellow-500" },
  { id: "link", name: "Link", icon: "link", color: "text-emerald-500" },
  { id: "file", name: "File", icon: "description", color: "text-blue-500" },
  { id: "image", name: "Image", icon: "image", color: "text-purple-500" },
];
