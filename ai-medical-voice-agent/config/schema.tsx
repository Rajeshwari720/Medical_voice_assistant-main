import SuggestedDoctorCard from "@/app/(routes)/dashboard/_components/SuggestedDoctorCard";
import { number } from "motion";
import { integer, pgTable, json, text, varchar, timestamp } from "drizzle-orm/pg-core";

// Users table
export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  credits: integer(),
});

// Session Chat Table
export const SessionChatTable = pgTable('SessionChatTable', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  sessionId: varchar({ length: 255 }).notNull(),
  notes: text(),
  selectedDoctor: json(),
  conversation: json(),
  createdBy: varchar({ length: 255 }).references(() => usersTable.email).notNull(),
  createdOn: timestamp("createdOn").defaultNow(),
  report: text(),
});

