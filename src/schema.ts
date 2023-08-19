import {
  pgTable,
  unique,
  serial,
  varchar,
  primaryKey,
  integer,
} from 'drizzle-orm/pg-core';

import { InferModel } from 'drizzle-orm';

export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey().notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
  },
  (table) => {
    return {
      usersEmailKey: unique('users_email_key').on(table.email),
    };
  },
);

export const friends = pgTable(
  'friends',
  {
    userId1: integer('user_id1')
      .notNull()
      .references(() => users.id),
    userId2: integer('user_id2')
      .notNull()
      .references(() => users.id),
  },
  (table) => {
    return {
      friendsPkey: primaryKey(table.userId1, table.userId2),
    };
  },
);

export type User = InferModel<typeof users, 'select'>;
