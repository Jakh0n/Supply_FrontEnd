export function getCategoryDisplayName(category: string): string {
  const categoryMap: Record<string, string> = {
    "store-supplies": "Store Supplies",
    "food-products": "Food Products",
    "frozen-products": "Frozen Products",
    "main-products": "Main Products",
    desserts: "Desserts",
    drinks: "Drinks",
    beverages: "Beverages",
    "packaging-materials": "Packaging Materials",
    "cleaning-materials": "Cleaning Materials",
    "desserts-drinks": "Desserts and Drinks",
    food: "Food",
    cleaning: "Cleaning",
    equipment: "Equipment",
    packaging: "Packaging",
    other: "Other",
    others: "Other",
  };
  return categoryMap[category] || "Main Products";
}

export function getCategorySortOrder(category: string): number {
  const displayName = getCategoryDisplayName(category);
  const sortOrder: Record<string, number> = {
    "Frozen Products": 1,
    "Main Products": 2,
    Desserts: 3,
    Drinks: 4,
    "Packaging Materials": 5,
    "Cleaning Materials": 6,
    "Desserts and Drinks": 3,
  };
  return sortOrder[displayName] ?? 6;
}
