import { cn } from "cn";
import { Loader2Icon } from "lucide-react";

// Спиннер стоит в кнопках рядом с текстом («Saving…»): состояние объявляет текст, поэтому сам
// значок скрыт от скринридеров (в shadcn у него role="status")
function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <Loader2Icon
      data-slot="spinner"
      aria-hidden="true"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  );
}

export { Spinner };
