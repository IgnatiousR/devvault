import type { ItemDetail } from "@/types/dashboard";
import type { EditData } from "../types";
import { EditorContent } from "./editor-content";
import { LanguageField } from "./language-field";
import { UrlField } from "./url-field";
import { FilePreview } from "./file-preview";

interface ContentSectionProps {
  item: ItemDetail;
  isEditing: boolean;
  editData: EditData;
  setEditData: (data: EditData) => void;
}

export function ContentSection({
  item,
  isEditing,
  editData,
  setEditData,
}: ContentSectionProps) {
  return (
    <>
      <EditorContent
        item={item}
        isEditing={isEditing}
        editData={editData}
        setEditData={setEditData}
      />
      <LanguageField
        item={item}
        isEditing={isEditing}
        editData={editData}
        setEditData={setEditData}
      />
      <UrlField
        item={item}
        isEditing={isEditing}
        editData={editData}
        setEditData={setEditData}
      />
      <FilePreview item={item} />
    </>
  );
}
