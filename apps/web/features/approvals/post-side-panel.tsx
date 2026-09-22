"use client";

import { AnimatePresence, motion } from "motion/react";
import { Maximize2, Pencil } from "lucide-react";
import type { Post } from "@/lib/types";
import { spring } from "@repo/ui/lib/motion";
import { Button } from "@repo/ui/components/button";
import { Panel } from "@repo/ui/components/states";
import { PostDetails } from "@repo/ui/components/social/post-details";

interface Props {
  post: Post;
  pillar: string | undefined;
  onViewImage: () => void;
  onEdit: () => void;
}

/** Wide screens: the whole post is readable without opening anything. */
export function PostSidePanel({ post, pillar, onViewImage, onEdit }: Props) {
  return (
    <aside className="hidden lg:block" aria-label="Full post">
      <Panel>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={spring.snappy}
          >
            <PostDetails post={post} pillar={pillar} />
            <div className="mt-6 flex flex-wrap gap-2.5">
              <Button variant="secondary" onClick={onViewImage}><Maximize2 /> View image full size</Button>
              <Button variant="secondary" onClick={onEdit}><Pencil /> Edit post</Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </Panel>
    </aside>
  );
}
