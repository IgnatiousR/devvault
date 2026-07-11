import type { ItemDetail } from "@/types/dashboard";
import type { EditData } from "./types";
import { DescriptionSection } from "./sections/description-section";
import { ContentSection } from "./sections/content-section";
import { MetadataSection } from "./sections/metadata-section";

interface Collection {
  id: string;
  name: string;
}

interface DrawerContentSectionsProps {
  item: ItemDetail;
  isEditing: boolean;
  editData: EditData;
  setEditData: (data: EditData) => void;
  collections: Collection[];
}

export function DrawerContentSections({
  item,
  isEditing,
  editData,
  setEditData,
  collections,
}: DrawerContentSectionsProps) {
  return (
    <div className="p-6 space-y-6">
      <DescriptionSection
        description={item.description || ""}
        isEditing={isEditing}
        editData={editData}
        setEditData={setEditData}
      />
      <ContentSection
        item={item}
        isEditing={isEditing}
        editData={editData}
        setEditData={setEditData}
      />
      <MetadataSection
        item={item}
        isEditing={isEditing}
        editData={editData}
        setEditData={setEditData}
        collections={collections}
      />
    </div>
  );
}
