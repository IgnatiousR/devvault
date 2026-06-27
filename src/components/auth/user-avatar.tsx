import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

function getInitials(name: string | null | undefined): string {
  if (!name) return "U";
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

interface UserAvatarProps {
  user: {
    name?: string | null;
    image?: string | null;
  };
  className?: string;
}

export function UserAvatar({ user, className }: UserAvatarProps) {
  return (
    <Avatar className={className}>
      <AvatarImage src={user.image || undefined} alt={user.name || "User"} />
      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
    </Avatar>
  );
}
