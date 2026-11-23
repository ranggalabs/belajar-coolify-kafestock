import { Coffee, Milk, Croissant, MoreVertical } from 'lucide-react';
import { getCategoryTheme, type CategoryStat } from '../types/inventory';

interface CategoryCardsProps {
  categories: CategoryStat[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export function CategoryCards({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryCardsProps) {
  const getIcon = (name: string) => {
    if (name === 'Biji Kopi & Teh') return Coffee;
    if (name === 'Susu & Sirup') return Milk;
    return Croissant;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {categories.map((cat) => {
        const theme = getCategoryTheme(cat.name);
        const Icon = getIcon(cat.name);
        const isSelected = selectedCategory === cat.name;

        return (
          <button
            key={cat.name}
            type="button"
            onClick={() => onSelectCategory(isSelected ? 'all' : cat.name)}
            className={`group relative text-left rounded-[22px] p-5 text-white transition-all cursor-pointer ${
              theme.cardBg
            } ${
              isSelected
                ? 'ring-4 ring-[#1A1A2E]/20 scale-[1.01] shadow-lg'
                : 'hover:-translate-y-0.5 hover:shadow-md'
            }`}
          >
            {/* Top row: dark pill badge + icon + kebab */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-[#181828] text-white text-[11px] font-bold">
                  +{cat.itemCount}
                </span>
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/20 backdrop-blur-xs">
                  <Icon className="w-4 h-4 text-white" />
                </span>
              </div>
              <MoreVertical className="w-4 h-4 text-white/75 group-hover:text-white transition-colors" />
            </div>

            {/* Title */}
            <h3 className="text-[16px] font-bold leading-snug mb-5 pr-2">
              {cat.name}
            </h3>

            {/* Stats + Progress bar */}
            <div className="flex items-center justify-between text-[11px] text-white/85 font-medium mb-2">
              <span>
                {cat.totalStock} unit &nbsp;|&nbsp; {cat.fillPercent}%
              </span>
              {cat.lowCount > 0 && (
                <span className="px-1.5 py-0.5 rounded bg-black/20 text-[10px] font-semibold">
                  {cat.lowCount} menipis
                </span>
              )}
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/25 overflow-hidden">
              <div
                className="h-full rounded-full bg-white transition-all duration-500"
                style={{ width: `${Math.max(8, cat.fillPercent)}%` }}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
}
