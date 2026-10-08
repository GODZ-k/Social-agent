import { signOut } from "@/lib/auth/actions";
import { textLinkClass } from "./text-link";

/** Sign out as a plain form post, so it works before any JavaScript loads. */
export function SignOutButton() {
  return (
    <form action={signOut} className="inline">
      <button type="submit" className={textLinkClass}>
        Sign out
      </button>
    </form>
  );
}
