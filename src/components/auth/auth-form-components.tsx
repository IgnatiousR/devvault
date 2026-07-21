import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function FormErrorAlert({ error }: { error: string }) {
  if (!error) return null;
  return (
    <div
      role="alert"
      className="rounded-md bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-500"
    >
      {error}
    </div>
  );
}

export function FormSubmitButton({
  loading,
  label,
  loadingLabel,
}: {
  loading: boolean;
  label: string;
  loadingLabel: string;
}) {
  return (
    <Button
      type="submit"
      disabled={loading}
      className="flex w-full items-center justify-center gap-2 rounded-md bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-50"
    >
      {loading && <Spinner size="sm" />}
      {loading ? loadingLabel : label}
    </Button>
  );
}
