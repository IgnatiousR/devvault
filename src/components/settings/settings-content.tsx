"use client"

import { useState } from "react"
import Link from "next/link"
import { useProfile } from "@/hooks/use-profile"
import { ProfileContentSkeleton } from "@/components/ui/dashboard-skeletons"
import { Button } from "@/components/ui/button"
import { Key, Trash, Warning } from "@phosphor-icons/react"
import { ChangePasswordDialog } from "@/components/profile/change-password-dialog"
import { DeleteAccountDialog } from "@/components/profile/delete-account-dialog"
import { useEditorPreferences } from "@/contexts/editor-preferences-context"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  EDITOR_THEMES,
  FONT_SIZES,
  TAB_SIZES,
} from "@/types/editor-preferences"
import { BillingSection } from "./billing-section"

export function SettingsContent() {
  const { data: profile, isLoading, error, refetch } = useProfile()
  const { preferences, updatePreference } = useEditorPreferences()
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false)

  if (isLoading) {
    return <ProfileContentSkeleton />
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load settings: {error}</p>
        <Button onClick={refetch} className="mt-4">
          Retry
        </Button>
      </div>
    )
  }

  if (!profile) {
    return null
  }

  const { user } = profile

  return (
    <div className="space-y-6">
      <BillingSection />

      <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Editor Preferences
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Font Size
            </label>
            <Select
              value={String(preferences.fontSize)}
              onValueChange={(value) =>
                updatePreference("fontSize", Number(value))
              }
            >
              <SelectTrigger className="w-full">
                {preferences.fontSize}px
              </SelectTrigger>
              <SelectContent>
                {FONT_SIZES.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}px
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Tab Size
            </label>
            <Select
              value={String(preferences.tabSize)}
              onValueChange={(value) =>
                updatePreference("tabSize", Number(value))
              }
            >
              <SelectTrigger className="w-full">
                {preferences.tabSize} spaces
              </SelectTrigger>
              <SelectContent>
                {TAB_SIZES.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size} spaces
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Theme
            </label>
            <Select
              value={preferences.theme}
              onValueChange={(value) => {
                if (value) updatePreference("theme", value)
              }}
            >
              <SelectTrigger className="w-full">
                {EDITOR_THEMES.find((t) => t.value === preferences.theme)
                  ?.label || "VS Dark"}
              </SelectTrigger>
              <SelectContent>
                {EDITOR_THEMES.map((theme) => (
                  <SelectItem key={theme.value} value={theme.value}>
                    {theme.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">
                Word Wrap
              </label>
              <p className="text-xs text-muted-foreground">
                Wrap long lines in the editor
              </p>
            </div>
            <Checkbox
              checked={preferences.wordWrap}
              onCheckedChange={(checked) =>
                updatePreference("wordWrap", checked === true)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">
                Minimap
              </label>
              <p className="text-xs text-muted-foreground">
                Show code overview on the side
              </p>
            </div>
            <Checkbox
              checked={preferences.minimap}
              onCheckedChange={(checked) =>
                updatePreference("minimap", checked === true)
              }
            />
          </div>
        </div>
      </section>

      <section className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Account Actions
        </h2>
        <div className="flex flex-wrap gap-4">
          {user.hasPassword && (
            <Button
              variant="outline"
              onClick={() => setIsChangePasswordOpen(true)}
              className="flex items-center gap-2"
            >
              <Key className="w-4 h-4" />
              Change Password
            </Button>
          )}

          <Button
            variant="outline"
            onClick={() => setIsDeleteAccountOpen(true)}
            className="flex items-center gap-2 text-destructive hover:text-destructive"
          >
            <Trash className="w-4 h-4" />
            Delete Account
          </Button>
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <div className="flex items-center gap-2">
            <Warning className="w-4 h-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Need to reset your password?{" "}
              <Link
                href="/forgot-password"
                className="text-foreground underline underline-offset-4 hover:text-foreground/80 transition-colors"
              >
                Reset password
              </Link>
            </p>
          </div>
        </div>
      </section>

      <ChangePasswordDialog
        open={isChangePasswordOpen}
        onOpenChange={setIsChangePasswordOpen}
      />

      <DeleteAccountDialog
        open={isDeleteAccountOpen}
        onOpenChange={setIsDeleteAccountOpen}
        userEmail={user.email}
      />
    </div>
  )
}
