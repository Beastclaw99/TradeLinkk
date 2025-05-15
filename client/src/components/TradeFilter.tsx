import { useState } from "react";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TRADES } from "@/lib/constants";

interface TradeFilterProps {
  selectedTrade: string;
  onTradeChange: (trade: string) => void;
  disabled?: boolean;
}

const TradeFilter = ({ selectedTrade, onTradeChange, disabled = false }: TradeFilterProps) => {
  const [open, setOpen] = useState(false);
  
  // Find the label for the current value
  const selectedTradeLabel = TRADES.find(trade => trade.value === selectedTrade)?.label || "All Trades";
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between min-w-[200px]"
          disabled={disabled}
        >
          {selectedTrade ? selectedTradeLabel : "All Trades"}
          <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[200px]">
        <Command>
          <CommandInput placeholder="Search trades..." className="h-9" />
          <CommandList>
            <CommandEmpty>No trade found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  onTradeChange("");
                  setOpen(false);
                }}
              >
                <div className="flex items-center">
                  <span>All Trades</span>
                  {!selectedTrade && <CheckIcon className="ml-auto h-4 w-4" />}
                </div>
              </CommandItem>
              {TRADES.map((trade) => (
                <CommandItem
                  key={trade.value}
                  onSelect={() => {
                    onTradeChange(trade.value);
                    setOpen(false);
                  }}
                >
                  <div className="flex items-center">
                    <span>{trade.label}</span>
                    {selectedTrade === trade.value && (
                      <CheckIcon className="ml-auto h-4 w-4" />
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default TradeFilter;
