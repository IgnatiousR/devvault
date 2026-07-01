// eslint-disable-file @typescript-eslint/no-unused-vars
import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "better-auth/crypto";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg(connectionString);
const prisma = new PrismaClient({ adapter });

async function main() {
  // ─── Demo User ──────────────────────────────────────────────────────
  const hashedPassword = await hashPassword("12345678");
  const user = await prisma.user.upsert({
    where: { email: "demo@devvault.io" },
    update: {},
    create: {
      email: "demo@devvault.io",
      name: "Demo User",
      emailVerified: true,
      isPro: false,
      accounts: {
        create: {
          accountId: "demo@devvault.io",
          providerId: "credential",
          password: hashedPassword,
        },
      },
    },
  });
  console.log("Seeded demo user");

  // ─── System Item Types (Material Symbols icons) ─────────────────────
  const systemItemTypes = [
    { name: "Snippet", icon: "code", color: "#ef4444", isSystem: true },
    { name: "Prompt", icon: "auto_awesome", color: "#f97316", isSystem: true },
    { name: "Command", icon: "terminal", color: "#f59e0b", isSystem: true },
    { name: "Note", icon: "sticky_note_2", color: "#fde047", isSystem: true },
    { name: "File", icon: "description", color: "#6b7280", isSystem: true },
    { name: "Image", icon: "image", color: "#ec4899", isSystem: true },
    { name: "Link", icon: "link", color: "#10b981", isSystem: true },
  ];

  for (const itemType of systemItemTypes) {
    await prisma.itemType.upsert({
      where: { id: itemType.name.toLowerCase() },
      update: { icon: itemType.icon },
      create: {
        id: itemType.name.toLowerCase(),
        ...itemType,
      },
    });
  }
  console.log("Seeded system item types");

  // ─── Collections ────────────────────────────────────────────────────
  const collectionsData = [
    { name: "React Patterns", description: "Reusable React patterns and hooks", isFavorite: true },
    { name: "AI Workflows", description: "AI prompts and workflow automations", isFavorite: true },
    { name: "DevOps", description: "Infrastructure and deployment resources", isFavorite: false },
    { name: "Terminal Commands", description: "Useful shell commands for everyday development", isFavorite: false },
    { name: "Design Resources", description: "UI/UX resources and references", isFavorite: false },
  ];

  const collections = [];
  for (const col of collectionsData) {
    const created = await prisma.collection.upsert({
      where: { id: col.name.toLowerCase().replace(/\s+/g, "-") },
      update: {},
      create: {
        id: col.name.toLowerCase().replace(/\s+/g, "-"),
        userId: user.id,
        ...col,
      },
    });
    collections.push(created);
  }
  console.log("Seeded collections");

  // ─── Helper to get item type ID ─────────────────────────────────────
  const getType = (name: string) => name.toLowerCase();

  // ─── Items ──────────────────────────────────────────────────────────
  const itemsData = [
    // React Patterns - 3 snippets
    {
      title: "useDebounce Hook",
      description: "Custom hook to debounce input values. Useful for search inputs and API calls.",
      content: `export function useDebounce<T>(value: T, delay: number): T {\n  const [debouncedValue, setDebouncedValue] = useState(value);\n  useEffect(() => {\n    const timer = setTimeout(() => setDebouncedValue(value), delay);\n    return () => clearTimeout(timer);\n  }, [value, delay]);\n  return debouncedValue;\n}`,
      typeName: "snippet",
      collectionId: collections[0].id,
      tags: ["react", "hooks", "typescript"],
      isPinned: true,
    },
    {
      title: "useLocalStorage Hook",
      description: "Persistent state hook that syncs with localStorage.",
      content: `export function useLocalStorage<T>(key: string, initialValue: T) {\n  const [storedValue, setStoredValue] = useState<T>(() => {\n    try {\n      const item = window.localStorage.getItem(key);\n      return item ? JSON.parse(item) : initialValue;\n    } catch { return initialValue; }\n  });\n  const setValue = (value: T) => {\n    setStoredValue(value);\n    window.localStorage.setItem(key, JSON.stringify(value));\n  };\n  return [storedValue, setValue] as const;\n}`,
      typeName: "snippet",
      collectionId: collections[0].id,
      tags: ["react", "hooks", "localstorage"],
      isPinned: false,
    },
    {
      title: "Context Provider Pattern",
      description: "Compound component pattern for context providers with TypeScript.",
      content: `type ContextValue = { theme: string; toggle: () => void };\nconst Ctx = createContext<ContextValue | null>(null);\n\nexport function ThemeProvider({ children }: { children: ReactNode }) {\n  const [theme, setTheme] = useState("light");\n  const toggle = () => setTheme(t => t === "light" ? "dark" : "light");\n  return <Ctx.Provider value={{ theme, toggle }}>{children}</Ctx.Provider>;\n}\n\nexport function useTheme() {\n  const ctx = useContext(Ctx);\n  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");\n  return ctx;\n}`,
      typeName: "snippet",
      collectionId: collections[0].id,
      tags: ["react", "patterns", "context"],
      isPinned: false,
    },

    // AI Workflows - 3 prompts
    {
      title: "Code Review Prompt",
      description: "Comprehensive code review checklist for pull requests.",
      content: "Review this code for: 1) Correctness and edge cases, 2) Performance implications, 3) Security vulnerabilities, 4) TypeScript type safety, 5) Error handling, 6) Code readability and maintainability. Provide specific suggestions for improvement.",
      typeName: "prompt",
      collectionId: collections[1].id,
      tags: ["ai", "code-review", "quality"],
      isPinned: true,
    },
    {
      title: "Documentation Generator",
      description: "Generate comprehensive documentation for code files.",
      content: "Analyze this code file and generate: 1) Module summary, 2) API documentation with parameters and return types, 3) Usage examples, 4) Edge cases and error scenarios, 5) Dependencies and imports. Format as markdown.",
      typeName: "prompt",
      collectionId: collections[1].id,
      tags: ["ai", "documentation", "automation"],
      isPinned: false,
    },
    {
      title: "Refactoring Assistant",
      description: "Guide for refactoring code with best practices.",
      content: "Analyze this code and suggest refactoring improvements: 1) Identify code smells, 2) Suggest SOLID principle applications, 3) Recommend design patterns where appropriate, 4) Propose breaking down large functions, 5) Suggest better naming conventions. Provide before/after examples.",
      typeName: "prompt",
      collectionId: collections[1].id,
      tags: ["ai", "refactoring", "clean-code"],
      isPinned: false,
    },

    // DevOps - 1 snippet, 1 command, 2 links
    {
      title: "Docker Compose Dev Setup",
      description: "Docker Compose configuration for local development with PostgreSQL and Redis.",
      content: `version: "3.8"\nservices:\n  db:\n    image: postgres:16-alpine\n    environment:\n      POSTGRES_USER: dev\n      POSTGRES_PASSWORD: dev\n      POSTGRES_DB: devvault\n    ports: ["5432:5432"]\n    volumes: ["pgdata:/var/lib/postgresql/data"]\n  redis:\n    image: redis:7-alpine\n    ports: ["6379:6379"]\nvolumes:\n  pgdata:`,
      typeName: "snippet",
      collectionId: collections[2].id,
      tags: ["docker", "devops", "postgresql"],
      isPinned: false,
    },
    {
      title: "Deploy to Production",
      description: "Deployment script for production environment.",
      content: "#!/bin/bash\nset -euo pipefail\necho 'Building...'\nnpm run build\necho 'Running migrations...'\nnpx prisma migrate deploy\necho 'Starting server...'\nnpm run start",
      typeName: "command",
      collectionId: collections[2].id,
      tags: ["deploy", "bash", "production"],
      isPinned: false,
    },
    {
      title: "Prisma Docs",
      description: "Official Prisma ORM documentation.",
      url: "https://www.prisma.io/docs",
      typeName: "link",
      collectionId: collections[2].id,
      tags: ["prisma", "database", "docs"],
      isPinned: false,
    },
    {
      title: "Docker Docs",
      description: "Official Docker documentation and getting started guides.",
      url: "https://docs.docker.com",
      typeName: "link",
      collectionId: collections[2].id,
      tags: ["docker", "containers", "docs"],
      isPinned: false,
    },

    // Terminal Commands - 4 commands
    {
      title: "Git Interactive Rebase",
      description: "Rebase last N commits interactively.",
      content: "git rebase -i HEAD~5",
      typeName: "command",
      collectionId: collections[3].id,
      tags: ["git", "rebase", "interactive"],
      isPinned: false,
    },
    {
      title: "Docker Clean Up",
      description: "Remove all unused Docker resources (images, containers, networks).",
      content: "docker system prune -a --volumes",
      typeName: "command",
      collectionId: collections[3].id,
      tags: ["docker", "cleanup", "maintenance"],
      isPinned: false,
    },
    {
      title: "Kill Process on Port",
      description: "Find and kill a process running on a specific port.",
      content: "lsof -ti:3000 | xargs kill -9",
      typeName: "command",
      collectionId: collections[3].id,
      tags: ["process", "port", "kill"],
      isPinned: false,
    },
    {
      title: "NPM Update All",
      description: "Update all packages to latest versions.",
      content: "npx npm-check-updates -u && npm install",
      typeName: "command",
      collectionId: collections[3].id,
      tags: ["npm", "update", "packages"],
      isPinned: false,
    },

    // Design Resources - 4 links
    {
      title: "Tailwind CSS Docs",
      description: "Official Tailwind CSS documentation and utility classes reference.",
      url: "https://tailwindcss.com/docs",
      typeName: "link",
      collectionId: collections[4].id,
      tags: ["css", "tailwind", "design"],
      isPinned: false,
    },
    {
      title: "shadcn/ui",
      description: "Beautifully designed components built with Radix UI and Tailwind CSS.",
      url: "https://ui.shadcn.com",
      typeName: "link",
      collectionId: collections[4].id,
      tags: ["components", "ui", "react"],
      isPinned: false,
    },
    {
      title: "Material Design 3",
      description: "Google's Material Design 3 design system guidelines.",
      url: "https://m3.material.io",
      typeName: "link",
      collectionId: collections[4].id,
      tags: ["design-system", "material", "guidelines"],
      isPinned: false,
    },
    {
      title: "Lucide Icons",
      description: "Beautiful and consistent icon library with 1500+ icons.",
      url: "https://lucide.dev",
      typeName: "link",
      collectionId: collections[4].id,
      tags: ["icons", "svg", "design"],
      isPinned: false,
    },
  ];

  for (const item of itemsData) {
    const itemSlug = item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    await prisma.item.upsert({
      where: { id: itemSlug },
      update: {},
      create: {
        id: itemSlug,
        userId: user.id,
        itemTypeId: getType(item.typeName),
        title: item.title,
        description: item.description,
        content: item.content,
        url: item.url,
        isPinned: item.isPinned ?? false,
        tags: {
          connectOrCreate: item.tags.map((name) => ({
            where: { name },
            create: { name },
          })),
        },
        collections: {
          create: { collectionId: item.collectionId },
        },
      },
    });
  }
  console.log("Seeded items and collections");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
