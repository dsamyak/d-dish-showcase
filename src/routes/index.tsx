import { createFileRoute } from "@tanstack/react-router";
import { MenuExperience } from "@/components/menu/MenuExperience";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Maison Spice · 3D Menu" },
      { name: "description", content: "An interactive 3D restaurant menu. Scroll vertically through categories, horizontally through dishes." },
    ],
  }),
});

function Index() {
  return <MenuExperience />;
}
