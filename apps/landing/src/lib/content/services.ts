// DRAFT: written from what the product does. Adjust to the services the agency actually sells.

export const SERVICES: { id: string; title: string; body: string; points: string[] }[] = [
  {
    id: "brand-kit",
    title: "A brand kit from your website",
    body: "Before anything is written, the agent reads your site and sets down who you are: colours, fonts, tone of voice, what you sell and who buys it. Every post is made from that kit, so your feed looks like your business and not like a template.",
    points: ["Colours and tone taken from your own pages", "You can correct any of it", "Updated when your website changes"],
  },
  {
    id: "strategy",
    title: "A content strategy you can read in two minutes",
    body: "The plan names the topics worth posting about, the networks that suit your customers and how often to post on each. It is rewritten every month from what the last month's posts did.",
    points: ["Three to five content pillars", "A posting rhythm for each network", "A reason given for every choice"],
  },
  {
    id: "content",
    title: "Posts written and designed for you",
    body: "Images, carousels, reels and stories, with captions and hashtags, each made for the network it is going to. You can swap in your own photos and videos at any point.",
    points: ["Instagram, Facebook, LinkedIn and TikTok", "Your own media whenever you have it", "A short note on why each post was made"],
  },
  {
    id: "approval",
    title: "Approval that takes minutes",
    body: "Posts arrive as a stack of cards. Approve, edit or reject each one from your phone. The agent learns from what you reject as much as from what you approve.",
    points: ["Nothing is published without your yes", "Edit the caption, image or time", "Undo an approval until the post goes out"],
  },
  {
    id: "publishing",
    title: "Scheduling and publishing",
    body: "Approved posts go onto a calendar at the times your followers are usually online, and are published for you. Drag a post to another day if something comes up.",
    points: ["Best times worked out for each network", "One calendar across every account", "Pause everything with one switch"],
  },
  {
    id: "managed",
    title: "A managed service, if you would rather not do it yourself",
    body: "On the Managed plan our team works alongside the agent. A person reviews every post before it reaches you, replies to comments and messages, and talks the results through with you once a month.",
    points: ["A named person who knows your account", "Replies to comments and messages", "A monthly call about what worked"],
  },
];
