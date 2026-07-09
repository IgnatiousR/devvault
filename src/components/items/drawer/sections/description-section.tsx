import { Textarea } from "@/components/ui/textarea";
import type { EditData } from "../types";

interface DescriptionSectionProps {
  description: string;
  isEditing: boolean;
  editData: EditData;
  setEditData: (data: EditData) => void;
}

export function DescriptionSection({
  description,
  isEditing,
  editData,
  setEditData,
}: DescriptionSectionProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-foreground">Description</h3>
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
