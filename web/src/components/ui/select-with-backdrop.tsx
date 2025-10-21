import * as React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  SelectScrollUpButton,
  SelectScrollDownButton,
  SelectSeparator,
} from "@/components/ui/select";

/**
 * Select com backdrop escuro quando aberto
 * Melhora a visibilidade em fundos escuros
 */
interface SelectWithBackdropProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  children: React.ReactNode;
  triggerClassName?: string;
}

export function SelectWithBackdrop({
  value,
  onValueChange,
  placeholder,
  disabled,
  children,
  triggerClassName,
}: SelectWithBackdropProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      {/* Backdrop quando select aberto */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-[140]"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <Select 
        value={value} 
        onValueChange={onValueChange} 
        disabled={disabled}
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <SelectTrigger className={triggerClassName}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        {children}
      </Select>
    </>
  );
}

// Re-exportar componentes do Select original para facilitar uso
export {
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollUpButton,
  SelectScrollDownButton,
  SelectSeparator,
};
