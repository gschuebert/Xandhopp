import { redirect } from "next/navigation";

export default function RootPage() {
  // Redirect to simple working page
  redirect('/simple');
}
