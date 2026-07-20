import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { EditData } from "../types";

interface DescriptionSectionProps {
  description: string;
  isEditing: boolean;
  editData: EditData;
  setEditData: (data: EditData) => void;
  aiAccess?: boolean;
  isGeneratingDescription?: boolean;
  onGenerateDescription?: () => void;
}

export function DescriptionSection({
  description,
  isEditing,
  editData,
  setEditData,
  aiAccess,
  isGeneratingDescription,
  onGenerateDescription,
}: DescriptionSectionProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Description</h3>
        {isEditing && aiAccess && onGenerateDescription && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onGenerateDescription}
            disabled={isGeneratingDescription || !editData.title.trim()}
            className="h-7 px-2 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
          >
            {isGeneratingDescription ? (
              <Spinner size="sm" />
            ) : (
              <span className="material-symbols-outlined text-sm">auto_awesome</span>
            )}
            {isGeneratingDescription ? "Generating..." : "Generate"}
          </Button>
        )}
      </div>
      {isEditing ? (
        <Textarea
          value={editData.description}
          onChange={(e) =>
            setEditData({ ...editData, description: e.target.value })
          }
          className="min-h-[80px] resize-none"
          placeholder="Add a description..."
        />
      ) : description ? (
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground/50 italic">
          No description
        </p>
      )}
    </div>
  );
}
