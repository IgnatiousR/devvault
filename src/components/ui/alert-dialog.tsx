"use client"

import * as React from "react"
import { Dialog as AlertDialogPrimitive } from "@base-ui/react/dialog"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DialogContext = React.createContext<{ onOpenChange?: (...args: any[]) => void } | null>(null)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function AlertDialog({ onOpenChange, ...props }: any) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleOpenChange = React.useCallback((open: boolean, _eventDetails: unknown) => {
    onOpenChange?.(open)
  }, [onOpenChange])

  return (
    <DialogContext.Provider value={{ onOpenChange: handleOpenChange }}>
      <AlertDialogPrimitive.Root data-slot="alert-dialog" onOpenChange={handleOpenChange} {...props} />
    </DialogContext.Provider>
  )
}

function AlertDialogPortal({ ...props }: AlertDialogPrimitive.Portal.Props) {
  return <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
}

function AlertDialogOverlay({ className, ...props }: AlertDialogPrimitive.Backdrop.Props) {
  return (
    <AlertDialogPrimitive.Backdrop
      data-slot="alert-dialog-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/80 text-xs/relaxed transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogContent({
  className,
  ...props
}: AlertDialogPrimitive.Popup.Props) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Popup
        data-slot="alert-dialog-content"
        className={cn(
          "fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border bg-popover p-6 text-popover-foreground shadow-lg duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0 data-ending-style:scale-95 data-starting-style:scale-95 sm:rounded-xl",
          className
        )}
        {...props}
      />
    </AlertDialogPortal>
  )
}

function AlertDialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn("flex flex-col gap-1.5 text-center sm:text-left", className)}
      {...props}
    />
  )
}

function AlertDialogTitle({ className, ...props }: AlertDialogPrimitive.Title.Props) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn("text-base font-semibold text-foreground", className)}
      {...props}
    />
  )
}

function AlertDialogDescription({
  className,
  ...props
}: AlertDialogPrimitive.Description.Props) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function AlertDialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogAction({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      data-slot="alert-dialog-action"
      className={cn(className)}
      {...props}
    />
  )
}

function AlertDialogCancel({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button> & { onClick?: () => void }) {
  const context = React.useContext(DialogContext)

  return (
    <Button
      data-slot="alert-dialog-cancel"
      variant="outline"
      className={cn(className)}
      onClick={(e) => {
        onClick?.(e)
        context?.onOpenChange?.(false)
      }}
      {...props}
    />
  )
}

export {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
}