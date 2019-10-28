export type Post = {
  hash: string;
  toread: "yes" | "no";
  id: string;
  href: string;
  description: string;
  tags: string;
  time: string;
  extended: string;
};

export type PublicPost = Omit<Post, "hash" | "toread">;

export type UID = string;

export interface ClassName {
  className?: string;
}

export interface Intent {
  intent?: "none" | "success" | "error" | "warning";
}
