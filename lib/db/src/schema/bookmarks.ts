import { pgTable, uuid, varchar, timestamp, unique } from "drizzle-orm/pg-core";
import { usersTable } from "./auth";
import { postsTable } from "./posts";

export const bookmarksTable = pgTable(
  "bookmarks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    postId: uuid("post_id")
      .notNull()
      .references(() => postsTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    uniqueBookmark: unique().on(table.userId, table.postId),
  }),
);
