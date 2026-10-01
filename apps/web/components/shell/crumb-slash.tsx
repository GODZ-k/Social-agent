/** The "/" between a back link and what it leads to, hidden once the bar is tight. Shared by the admin headers that read like a path. */
export function CrumbSlash() {
  return (
    <span aria-hidden className="text-lg leading-none text-input max-[560px]:hidden">
      /
    </span>
  );
}
