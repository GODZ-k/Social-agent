// Destinations are not decided yet (no legal or help pages in this app); placeholders match the design.
const LINKS = [
  { href: "#", label: "Terms" },
  { href: "#", label: "Privacy" },
  { href: "#", label: "Help" },
];

/** The three quiet links at the bottom of every signed-out screen. */
export function AuthFooter() {
  return (
    <footer className="flex flex-wrap gap-x-5 gap-y-2 pt-6 text-[0.8125rem] text-muted-foreground">
      {LINKS.map((link) => (
        <a key={link.label} href={link.href} className="hover:text-foreground">
          {link.label}
        </a>
      ))}
    </footer>
  );
}
