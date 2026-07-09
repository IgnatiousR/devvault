import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { ITEM_TYPE_OPTIONS } from "@/lib/item-types";

interface TypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function TypeSelector({ value, onChange }: TypeSelectorProps) {
  const selected = ITEM_TYPE_OPTIONS.find((t) => t.id === value);

  return (
    <div>
      <label className="text-sm font-medium text-foreground mb-2 block">
        Type
      </label>
      <Select value={value} onValueChange={(v) => v && onChange(v)}>
        <SelectTrigger className="w-full">
          {selected ? (
            <span className="flex items-center gap-2">
              <span className={`material-symbols-outlined text-xs ${selected.color}`}>
                {selected.icon}
              </span>
              {selected.name}
            </span>
          ) : (
            "Select a type"
          )}
        </SelectTrigger>
        <SelectContent>
          {ITEM_TYPE_OPTIONS.map((type) => (
            <SelectItem key={type.id} value={type.id}>
              <span className="flex items-center gap-2">
                <span className={`material-symbols-outlined text-xs ${type.color}`}>
                  {type.icon}
                </span>
                {type.name}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
