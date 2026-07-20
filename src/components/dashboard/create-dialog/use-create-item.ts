"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createItemAction } from "@/actions/items";
import { ITEM_TYPE_OPTIONS, FILE_TYPES } from "@/lib/item-types";
import { parseTags, shouldIncludeContent, hasLanguage, isUrlType } from "@/lib/item-helpers";
import { useAutoTags } from "@/components/ui/use-auto-tags";
import { useAutoDescription } from "@/components/ui/use-auto-description";

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
  const itemType = ITEM_TYPE_OPTIONS.find((t) => t.id === selectedType);

  return {
    title,
    description: description || null,
    content: shouldIncludeContent(selectedType) ? content || null : null,
    language: hasLanguage(selectedType) ? language || null : null,
    url: isUrlType(selectedType) ? url || null : null,
    fileUrl: uploadedFile?.fileUrl || null,
    fileName: uploadedFile?.fileName || null,
    fileSize: uploadedFile?.fileSize || null,
    tags: parseTags(tags),
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

  const {
    isSuggesting,
    suggestions,
    suggestTags,
    acceptTag,
    rejectTag,
    clearSuggestions,
  } = useAutoTags();

  const {
    isGenerating: isGeneratingDescription,
    generate,
  } = useAutoDescription();

  useEffect(() => {
    fetch("/api/collections")
      .then((res) => res.json())
      .then((data) => setCollections(data))
      .catch(() => setCollections([]));
  }, []);

  const showContent = shouldIncludeContent(selectedType);
  const showLanguage = hasLanguage(selectedType);
  const showUrl = isUrlType(selectedType);
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
    clearSuggestions();
  };

  const handleSuggestTags = useCallback(() => {
    suggestTags({
      title,
      content: showContent ? content : undefined,
      itemType: selectedType,
      existingTags: parseTags(tags),
    });
  }, [suggestTags, title, content, selectedType, tags, showContent]);

  const handleAcceptTag = useCallback(
    (tag: string) => {
      acceptTag(tag);
      const currentTags = parseTags(tags);
      if (!currentTags.includes(tag)) {
        setTags((prev) => (prev ? `${prev}, ${tag}` : tag));
      }
    },
    [acceptTag, tags]
  );

  const handleGenerateDescription = useCallback(async () => {
    const description = await generate({
      title,
      content: showContent ? content : undefined,
      itemType: selectedType,
      language: showLanguage ? language : undefined,
      url: showUrl ? url : undefined,
      tags: parseTags(tags),
    });
    if (description) {
      setDescription(description);
    }
  }, [generate, title, content, selectedType, language, url, tags, showContent, showLanguage, showUrl]);

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
    isSuggesting,
    suggestions,
    handleSuggestTags,
    handleAcceptTag,
    handleRejectTag: rejectTag,
    isGeneratingDescription,
    handleGenerateDescription,
  };
}
