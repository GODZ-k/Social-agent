import { TextLink } from "./text-link";

/** The one link in the top corner of an auth screen. The prompt hides on phones to keep the bar on one line. */
export function SwitchLink({ prompt, href, label }: { prompt?: string; href: string; label: string }) {
  return (
    <>
      {prompt ? <span className="max-sm:hidden">{prompt} </span> : null}
      <TextLink href={href}>{label}</TextLink>
    </>
  );
}
