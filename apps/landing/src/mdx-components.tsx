import type { MDXComponents } from "mdx/types";

// Articles use the same type classes and tokens as every other page, so a post
// can't drift into its own typography.
const components: MDXComponents = {
  h2: (props) => <h2 className="type-heading mt-10 text-[1.375rem]" {...props} />,
  h3: (props) => <h3 className="type-heading mt-8" {...props} />,
  p: (props) => <p className="mt-4" {...props} />,
  ul: (props) => <ul className="mt-4 grid list-disc gap-2 pl-5 marker:text-muted-foreground" {...props} />,
  ol: (props) => <ol className="mt-4 grid list-decimal gap-2 pl-5 marker:text-muted-foreground" {...props} />,
  a: (props) => <a className="font-medium text-tint-foreground underline underline-offset-4" {...props} />,
  strong: (props) => <strong className="font-medium" {...props} />,
  blockquote: (props) => <blockquote className="mt-6 rounded-xl bg-tint px-5 pt-1 pb-5 text-tint-foreground" {...props} />,
  hr: () => <hr className="mt-10 border-border" />,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
