import { pgTable, uuid, varchar, timestamp, unique } from "drizzle-orm/pg-core";
import { usersTable } from "./auth";
import { postsTable } from "./posts";

export const likesTable = pgTable(
  "likes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    postId: uuid("post_id")
      .notNull()
      .references(() => postsTable.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    uniqueLike: unique().on(table.postId, table.userId),
  }),
);
