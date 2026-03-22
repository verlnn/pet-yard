import { redirect } from "next/navigation";

import { ROUTES } from "@/src/lib/routes";

export default function PetsPage() {
  redirect(`${ROUTES.setting}?section=pet-manage`);
}
