export interface LanguageOption {
  id: string;
  label: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { id: "plaintext", label: "Plain Text" },
  { id: "javascript", label: "JavaScript" },
  { id: "typescript", label: "TypeScript" },
  { id: "jsx", label: "JSX" },
  { id: "tsx", label: "TSX" },
  { id: "python", label: "Python" },
  { id: "go", label: "Go" },
  { id: "rust", label: "Rust" },
  { id: "java", label: "Java" },
  { id: "kotlin", label: "Kotlin" },
  { id: "swift", label: "Swift" },
  { id: "c", label: "C" },
  { id: "cpp", label: "C++" },
  { id: "csharp", label: "C#" },
  { id: "ruby", label: "Ruby" },
  { id: "php", label: "PHP" },
  { id: "shell", label: "Shell" },
  { id: "sql", label: "SQL" },
  { id: "html", label: "HTML" },
  { id: "css", label: "CSS" },
  { id: "scss", label: "SCSS" },
  { id: "json", label: "JSON" },
  { id: "yaml", label: "YAML" },
  { id: "xml", label: "XML" },
  { id: "markdown", label: "Markdown" },
  { id: "dockerfile", label: "Dockerfile" },
  { id: "graphql", label: "GraphQL" },
  { id: "bash", label: "Bash" },
  { id: "powershell", label: "PowerShell" },
  { id: "lua", label: "Lua" },
  { id: "r", label: "R" },
  { id: "perl", label: "Perl" },
  { id: "haskell", label: "Haskell" },
  { id: "scala", label: "Scala" },
  { id: "dart", label: "Dart" },
  { id: "elixir", label: "Elixir" },
  { id: "erlang", label: "Erlang" },
  { id: "clojure", label: "Clojure" },
  { id: "solidity", label: "Solidity" },
  { id: "svelte", label: "Svelte" },
  { id: "vue", label: "Vue" },
  { id: "angular", label: "Angular" },
  { id: "less", label: "Less" },
  { id: "handlebars", label: "Handlebars" },
  { id: "ini", label: "INI" },
  { id: "toml", label: "TOML" },
  { id: "makefile", label: "Makefile" },
  { id: "objective-c", label: "Objective-C" },
];

export const MONACO_LANGUAGE_IDS = LANGUAGE_OPTIONS.map((l) => l.id);

export function getLanguageLabel(id: string): string {
  return LANGUAGE_OPTIONS.find((l) => l.id === id)?.label ?? id;
}
