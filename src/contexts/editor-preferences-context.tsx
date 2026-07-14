"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import {
  getEditorPreferencesAction,
  updateEditorPreferencesAction,
} from "@/actions/editor-preferences";
import {
  DEFAULT_EDITOR_PREFERENCES,
  type EditorPreferences,
} from "@/types/editor-preferences";

interface EditorPreferencesContextValue {
  preferences: EditorPreferences;
  isLoading: boolean;
  updatePreference: <K extends keyof EditorPreferences>(
    key: K,
    value: EditorPreferences[K]
  ) => void;
}

const EditorPreferencesContext =
  createContext<EditorPreferencesContextValue | null>(null);

export function useEditorPreferences() {
  const context = useContext(EditorPreferencesContext);
  if (!context) {
    return {
      preferences: DEFAULT_EDITOR_PREFERENCES,
      isLoading: false,
      updatePreference: () => {},
    };
  }
  return context;
}

export function EditorPreferencesProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [preferences, setPreferences] = useState<EditorPreferences>(
    DEFAULT_EDITOR_PREFERENCES
  );
  const [isLoading, setIsLoading] = useState(true);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingPrefsRef = useRef<EditorPreferences | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPreferences() {
      try {
        const prefs = await getEditorPreferencesAction();
        if (!cancelled) {
          setPreferences(prefs);
        }
      } catch {
        // Use defaults on error
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadPreferences();

    return () => {
      cancelled = true;
    };
  }, []);

  const savePreferences = useCallback(async (prefs: EditorPreferences) => {
    try {
      const result = await updateEditorPreferencesAction({
        ...prefs,
        theme: prefs.theme as "vs-dark" | "monokai" | "github-dark",
      });
      if (result.success) {
        toast.success("Editor preferences saved");
      } else {
        toast.error(result.error || "Failed to save preferences");
      }
    } catch {
      toast.error("Failed to save preferences");
    }
  }, []);

  const updatePreference = useCallback(
    <K extends keyof EditorPreferences>(key: K, value: EditorPreferences[K]) => {
      setPreferences((prev) => {
        const next = { ...prev, [key]: value };
        pendingPrefsRef.current = next;

        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(() => {
          if (pendingPrefsRef.current) {
            savePreferences(pendingPrefsRef.current);
            pendingPrefsRef.current = null;
          }
        }, 300);

        return next;
      });
    },
    [savePreferences]
  );

  return (
    <EditorPreferencesContext.Provider
      value={{ preferences, isLoading, updatePreference }}
    >
      {children}
    </EditorPreferencesContext.Provider>
  );
}
