import { pgTable, text, serial, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum('user_role', ['client', 'tradesman']);
export const tradeEnum = pgEnum('trade_type', [
  'carpentry', 'electrical', 'plumbing', 'painting', 'roofing', 
  'landscaping', 'masonry', 'flooring', 'hvac', 'general_contractor', 'other'
]);
export const contractStatusEnum = pgEnum('contract_status', ['draft', 'sent', 'signed', 'completed', 'cancelled']);
export const messageStatusEnum = pgEnum('message_status', ['unread', 'read']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'processing', 'completed', 'failed']);
export const milestoneStatusEnum = pgEnum('milestone_status', ['pending', 'completed', 'paid']);

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  username: text("username").notNull().unique(),
  role: userRoleEnum("role").notNull().default('client'),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  location: text("location"),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  stripeCustomerId: text("stripe_customer_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tradesman Profiles
export const tradesmanProfiles = pgTable("tradesman_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  businessName: text("business_name").notNull(),
  trade: tradeEnum("trade").notNull(),
  experience: integer("experience").notNull(),
  hourlyRate: integer("hourly_rate"),
  licenseNumber: text("license_number"),
  insuranceInfo: text("insurance_info"),
  qualifications: text("qualifications"),
  completenessScore: integer("completeness_score").default(0),
  availability: text("availability"),
});

// Portfolio Projects
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  tradesmanId: integer("tradesman_id").notNull().references(() => tradesmanProfiles.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location"),
  completionDate: text("completion_date"),
  budget: text("budget"),
  featured: boolean("featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Project Images
export const projectImages = pgTable("project_images", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id),
  imageUrl: text("image_url").notNull(),
  caption: text("caption"),
  isMainImage: boolean("is_main_image").default(false),
});

// Reviews
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  tradesmanId: integer("tradesman_id").notNull().references(() => tradesmanProfiles.id),
  clientId: integer("client_id").notNull().references(() => users.id),
  projectId: integer("project_id").references(() => projects.id),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Contracts
export const contracts = pgTable("contracts", {
  id: serial("id").primaryKey(),
  tradesmanId: integer("tradesman_id").notNull().references(() => tradesmanProfiles.id),
  clientId: integer("client_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  startDate: text("start_date"),
  endDate: text("end_date"),
  totalAmount: integer("total_amount"),
  status: contractStatusEnum("status").notNull().default('draft'),
  documentUrl: text("document_url"),
  signedByClient: boolean("signed_by_client").default(false),
  signedByTradesman: boolean("signed_by_tradesman").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Payment Milestones
export const milestones = pgTable("milestones", {
  id: serial("id").primaryKey(),
  contractId: integer("contract_id").notNull().references(() => contracts.id),
  title: text("title").notNull(),
  description: text("description"),
  amount: integer("amount").notNull(),
  dueDate: text("due_date"),
  status: milestoneStatusEnum("status").notNull().default('pending'),
  paymentId: text("payment_id"),
  completedAt: timestamp("completed_at"),
});

// Payments
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  milestoneId: integer("milestone_id").references(() => milestones.id),
  contractId: integer("contract_id").notNull().references(() => contracts.id),
  clientId: integer("client_id").notNull().references(() => users.id),
  tradesmanId: integer("tradesman_id").notNull().references(() => tradesmanProfiles.id),
  amount: integer("amount").notNull(),
  status: paymentStatusEnum("status").notNull().default('pending'),
  stripePaymentId: text("stripe_payment_id"),
  invoiceUrl: text("invoice_url"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Messages
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull().references(() => users.id),
  receiverId: integer("receiver_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  status: messageStatusEnum("status").notNull().default('unread'),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertTradesmanProfileSchema = createInsertSchema(tradesmanProfiles).omit({ id: true, completenessScore: true });
export const insertProjectSchema = createInsertSchema(projects).omit({ id: true, createdAt: true });
export const insertProjectImageSchema = createInsertSchema(projectImages).omit({ id: true });
export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true, createdAt: true });
export const insertContractSchema = createInsertSchema(contracts).omit({ id: true, createdAt: true });
export const insertMilestoneSchema = createInsertSchema(milestones).omit({ id: true, completedAt: true });
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, createdAt: true, completedAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type TradesmanProfile = typeof tradesmanProfiles.$inferSelect;
export type InsertTradesmanProfile = z.infer<typeof insertTradesmanProfileSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type ProjectImage = typeof projectImages.$inferSelect;
export type InsertProjectImage = z.infer<typeof insertProjectImageSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export type Contract = typeof contracts.$inferSelect;
export type InsertContract = z.infer<typeof insertContractSchema>;

export type Milestone = typeof milestones.$inferSelect;
export type InsertMilestone = z.infer<typeof insertMilestoneSchema>;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
