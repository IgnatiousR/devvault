import { GitHubButton } from "./github-button";

interface AuthFormDividerProps {
  callbackURL: string;
}

export function AuthFormDivider({ callbackURL }: AuthFormDividerProps) {
  return (
    <>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <GitHubButton callbackURL={callbackURL} />
    </>
  );
}
