import { redirect } from "next/navigation";

export default function CausesPage() {
  redirect("/explore?type=campaigns");
}
