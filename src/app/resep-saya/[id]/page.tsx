import { RecipeView } from "../../resep/[i]/RecipeView";

// Resep tersimpan dibaca dari Rantang Resep di browser; params hanya berisi id simpanan.
export const instant = false;

export default async function SavedRecipePage({ params }: PageProps<"/resep-saya/[id]">) {
  const { id } = await params;
  return <RecipeView source={{ kind: "saved", id }} />;
}
