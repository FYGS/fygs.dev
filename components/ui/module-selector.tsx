"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Module {
  id: string;
  title: string;
  order: number;
}

interface ModuleSelectorProps {
  modules: Module[];
  value: number | null;
  onValueChange: (value: number) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export function ModuleSelector({
  modules,
  value,
  onValueChange,
  label = "Module",
  placeholder = "Sélectionner un module",
  required = false,
  className,
}: ModuleSelectorProps) {
  return (
    <div className={className}>
      {label && (
        <Label htmlFor="module-selector">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <Select
        value={value?.toString() || ""}
        onValueChange={(val) => onValueChange(parseInt(val))}
      >
        <SelectTrigger id="module-selector">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {modules.map((module) => (
            <SelectItem key={module.id} value={module.order.toString()}>
              Module {module.order}: {module.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}