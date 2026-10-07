import Link from "next/link";
import { format, parseISO } from "date-fns";
import { CircleAlert } from "lucide-react";
import type { Brand, PostView } from "@/lib/types";
import { workspaceHref, type WorkspaceBasePath } from "@/lib/workspace-path";
import { PLATFORM_LABEL, PlatformIcon } from "@repo/ui/components/social/platform";
import { FORMAT_NAME } from "@repo/ui/components/social/format-badge";
import { PostArt } from "@repo/ui/components/social/post-art";
import { Button } from "@repo/ui/components/button";
import { IconCircle } from "@repo/ui/components/icon-circle";

/**
 * FL-2 on the overview: posts that didn't go out come before everything else, each with its own
 * one-tap fix. A post whose account is still connected opens straight to the fix; one whose
 * account expired opens straight to reconnecting — both are the same `?post=` panel, so this is
 * a link, not a separate action.
 */
export function FailedNextStep({ posts, brand, basePath = "/c" }: { posts: PostView[]; brand: Brand; basePath?: WorkspaceBasePath }) {
  const base = workspaceHref(basePath, brand.id);
  const isConnected = (platform: PostView["platform"]) => brand.accounts.some((a) => a.platform === platform && a.status === "connected");

  return (
    <section role="alert" className="rounded-xl bg-destructive/8 p-5 md:p-6">
      <div className="flex items-start gap-3.5">
        <IconCircle className="size-10 bg-destructive/14 text-destructive">
          <CircleAlert className="size-4.5" />
        </IconCircle>
        <div>
          <h2 className="type-heading">
            {posts.length} {posts.length === 1 ? "post" : "posts"} didn&rsquo;t go out
          </h2>
          <p className="mt-1 text-muted-foreground">
            Nothing was posted for {posts.length === 1 ? "it" : "either"}. Fix {posts.length === 1 ? "it" : "them"} and{" "}
            {posts.length === 1 ? "it goes" : "they go"} out straight away.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-2">
        {posts.map((post) => {
          const connected = isConnected(post.platform);
          const when = post.scheduledFor ? format(parseISO(post.scheduledFor), "EEE d MMM") : "";
          return (
            <div key={post.id} className="flex items-center gap-3.5 rounded-2xl bg-card p-3.5 shadow-raised">
              <span className="relative shrink-0">
                <PostArt post={post} brand={brand.brand} fixedAspect="aspect-square" className="size-11 rounded-lg" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">
                  {PLATFORM_LABEL[post.platform]} {FORMAT_NAME[post.format].toLowerCase()}
                  {when && `, ${when}`}
                </p>
                {post.failure && <p className="mt-0.5 text-[0.8125rem] text-destructive">{post.failure.reason}</p>}
              </div>
              <Button asChild size="sm" className="shrink-0">
                <Link href={`${base}?post=${post.id}`}>
                  {!connected && <PlatformIcon platform={post.platform} />}
                  {connected ? "Fix it" : `Reconnect ${PLATFORM_LABEL[post.platform]}`}
                </Link>
              </Button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
