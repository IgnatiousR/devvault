"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createItemAction } from "@/actions/items";
import { ITEM_TYPE_OPTIONS, FILE_TYPES } from "@/lib/item-types";

interface Collection {
  id: string;
  name: string;
}

interface UseCreateItemOptions {
  pathname: string;
  onOpenChange: (open: boolean) => void;
}

function buildItemCreatePayload(
  selectedType: string,
  title: string,
  description: string,
  content: string,
  language: string,
  url: string,
  tags: string,
  uploadedFile: { fileUrl: string; fileName: string; fileSize: number } | null,
  selectedCollectionIds: string[]
) {
  const tagsArray = tags
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  const itemType = ITEM_TYPE_OPTIONS.find((t) => t.id === selectedType);
  const showContent = ["snippet", "prompt", "command", "note"].includes(selectedType);
  const showLanguage = ["snippet", "command"].includes(selectedType);
  const showUrl = selectedType === "link";

  return {
    title,
    description: description || null,
    content: showContent ? content || null : null,
    language: showLanguage ? language || null : null,
    url: showUrl ? url || null : null,
    fileUrl: uploadedFile?.fileUrl || null,
    fileName: uploadedFile?.fileName || null,
    fileSize: uploadedFile?.fileSize || null,
    tags: tagsArray,
    itemTypeId: itemType?.id || "snippet",
    collectionIds: selectedCollectionIds,
  };
}

function getDefaultType(pathname: string): string {
  const match = pathname.match(/^\/items\/([^/]+)/);
  if (match) {
    const routeType = match[1];
    if (ITEM_TYPE_OPTIONS.some((t) => t.id === routeType)) {
      return routeType;
    }
  }
  return "snippet";
}

export function useCreateItem({ pathname, onOpenChange }: UseCreateItemOptions) {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState(() => getDefaultType(pathname));
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [language, setLanguage] = useState("");
  const [url, setUrl] = useState("");
  const [tags, setTags] = useState("");
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{
    fileUrl: string;
    fileName: string;
    fileSize: number;
  } | null>(null);

  useEffect(() => {
    fetch("/api/collections")
      .then((res) => res.json())
      .then((data) => setCollections(data))
      .catch(() => setCollections([]));
  }, []);

  const showContent = ["snippet", "prompt", "command", "note"].includes(selectedType);
  const showLanguage = ["snippet", "command"].includes(selectedType);
  const showUrl = selectedType === "link";
  const showFileUpload = FILE_TYPES.includes(selectedType);

  const resetForm = () => {
    setSelectedType(getDefaultType(pathname));
    setTitle("");
    setDescription("");
    setContent("");
    setLanguage("");
    setUrl("");
    setTags("");
    setSelectedCollectionIds([]);
    setUploadedFile(null);
  };

  const handleCreate = async () => {
    setIsCreating(true);

    const result = await createItemAction(
      buildItemCreatePayload(
        selectedType,
        title,
        description,
        content,
        language,
        url,
        tags,
        uploadedFile,
        selectedCollectionIds
      )
    );

    setIsCreating(false);

    if (result.success) {
      toast.success("Item created successfully");
      resetForm();
      onOpenChange(false);
      router.refresh();
    } else {
      toast.error(result.error || "Failed to create item");
    }
  };

  return {
    selectedType,
    setSelectedType,
    title,
    setTitle,
    description,
    setDescription,
    content,
    setContent,
    language,
    setLanguage,
    url,
    setUrl,
    tags,
    setTags,
    selectedCollectionIds,
    setSelectedCollectionIds,
    collections,
    isCreating,
    uploadedFile,
    setUploadedFile,
    showContent,
    showLanguage,
    showUrl,
    showFileUpload,
    resetForm,
    handleCreate,
  };
}
