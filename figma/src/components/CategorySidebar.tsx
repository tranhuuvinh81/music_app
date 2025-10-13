import { Music, Disc3, Guitar, Radio, Piano, Mic2, Library } from "lucide-react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";

interface Category {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  count: number;
}

interface CategorySidebarProps {
  categories: Category[];
  selectedCategory: string;
  onCategorySelect: (categoryId: string) => void;
}

export function CategorySidebar({
  categories,
  selectedCategory,
  onCategorySelect,
}: CategorySidebarProps) {
  return (
    <div className="w-64 border-r border-border bg-card flex flex-col">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2">
          <Library className="h-5 w-5 text-primary" />
          <h3>Library</h3>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-1">
          {categories.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.id;
            return (
              <Button
                key={category.id}
                variant={isSelected ? "secondary" : "ghost"}
                className="w-full justify-start gap-3"
                onClick={() => onCategorySelect(category.id)}
              >
                <Icon className="h-4 w-4" />
                <span className="flex-1 text-left">{category.name}</span>
                <span className="text-muted-foreground text-[12px]">
                  {category.count}
                </span>
              </Button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
