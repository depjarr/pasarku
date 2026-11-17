import { RecipeView } from "./RecipeView";

// Resep dibaca dari hasil AI yang tersimpan di browser; params hanya berisi nomor menu.
export const instant = false;

export default async function RecipePage({ params }: PageProps<"/resep/[i]">) {
  const { i } = await params;
  return <RecipeView index={Number(i)} />;
}
