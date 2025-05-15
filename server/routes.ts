import express, { type Express, type Request, type Response } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { ZodError } from "zod";
import {
  insertUserSchema,
  insertTradesmanProfileSchema,
  insertProjectSchema,
  insertProjectImageSchema,
  insertReviewSchema,
  insertContractSchema,
  insertMilestoneSchema,
  insertPaymentSchema,
  insertMessageSchema
} from "@shared/schema";
import { createPayment, verifyPayment } from './wipay';

// Placeholder for backward compatibility - will be removed when WiPay is fully integrated
import Stripe from "stripe";
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "sk_test_your_key";
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2023-10-16",
});

// Initialize multer for file uploads
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const projectImagesDir = path.join(uploadsDir, "project-images");
    if (!fs.existsSync(projectImagesDir)) {
      fs.mkdirSync(projectImagesDir, { recursive: true });
    }
    cb(null, projectImagesDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ 
  storage: imageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// Session middleware for auth
const sessions: Map<string, { userId: number; expires: Date }> = new Map();

// Generate a session token
function generateSessionToken(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// Auth middleware
function requireAuth(req: Request, res: Response, next: Function) {
  const sessionToken = req.headers.authorization?.split(" ")[1];
  
  if (!sessionToken) {
    return res.status(401).json({ message: "Unauthorized: No session token" });
  }
  
  const session = sessions.get(sessionToken);
  if (!session) {
    return res.status(401).json({ message: "Unauthorized: Invalid session" });
  }
  
  if (session.expires < new Date()) {
    sessions.delete(sessionToken);
    return res.status(401).json({ message: "Unauthorized: Session expired" });
  }
  
  // Add user to request
  (req as any).userId = session.userId;
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes
  
  // Auth Routes
  app.post("/api/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }
      
      const user = await storage.createUser(userData);
      
      // Generate a session
      const token = generateSessionToken();
      const expires = new Date();
      expires.setDate(expires.getDate() + 7); // 7 days expiration
      
      sessions.set(token, {
        userId: user.id,
        expires,
      });
      
      // Don't return the password
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json({ 
        user: userWithoutPassword,
        token,
      });
      
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating user" });
    }
  });
  
  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      const user = await storage.getUserByEmail(email);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Generate a session
      const token = generateSessionToken();
      const expires = new Date();
      expires.setDate(expires.getDate() + 7); // 7 days expiration
      
      sessions.set(token, {
        userId: user.id,
        expires,
      });
      
      // Don't return the password
      const { password: _, ...userWithoutPassword } = user;
      
      res.json({ 
        user: userWithoutPassword,
        token,
      });
      
    } catch (error) {
      res.status(500).json({ message: "Error logging in" });
    }
  });
  
  app.post("/api/logout", requireAuth, (req, res) => {
    const sessionToken = req.headers.authorization?.split(" ")[1];
    if (sessionToken) {
      sessions.delete(sessionToken);
    }
    
    res.json({ message: "Logged out successfully" });
  });
  
  app.get("/api/me", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if user is a tradesman and has a profile
      let tradesmanProfile = null;
      if (user.role === 'tradesman') {
        tradesmanProfile = await storage.getTradesmanProfileByUserId(userId);
      }
      
      // Don't return the password
      const { password, ...userWithoutPassword } = user;
      
      res.json({ 
        user: userWithoutPassword,
        tradesmanProfile,
      });
      
    } catch (error) {
      res.status(500).json({ message: "Error fetching user data" });
    }
  });
  
  // User Routes
  app.put("/api/users/:id", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const currentUserId = (req as any).userId;
      
      // Users can only update their own profile
      if (userId !== currentUserId) {
        return res.status(403).json({ message: "Forbidden: Cannot update another user's profile" });
      }
      
      const updatedUser = await storage.updateUser(userId, req.body);
      
      // Don't return the password
      const { password, ...userWithoutPassword } = updatedUser;
      
      res.json(userWithoutPassword);
      
    } catch (error) {
      res.status(500).json({ message: "Error updating user" });
    }
  });
  
  // Tradesman Profile Routes
  app.post("/api/tradesman-profiles", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if user already has a profile
      const existingProfile = await storage.getTradesmanProfileByUserId(userId);
      if (existingProfile) {
        return res.status(400).json({ message: "User already has a tradesman profile" });
      }
      
      // Update user role to tradesman
      await storage.updateUser(userId, { role: 'tradesman' });
      
      // Validate and create the profile
      const profileData = insertTradesmanProfileSchema.parse({
        ...req.body,
        userId,
      });
      
      const profile = await storage.createTradesmanProfile(profileData);
      
      res.status(201).json(profile);
      
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating tradesman profile" });
    }
  });
  
  app.put("/api/tradesman-profiles/:id", requireAuth, async (req, res) => {
    try {
      const profileId = parseInt(req.params.id);
      const userId = (req as any).userId;
      
      // Get the profile
      const profile = await storage.getTradesmanProfile(profileId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      // Check if the profile belongs to the user
      if (profile.userId !== userId) {
        return res.status(403).json({ message: "Forbidden: Cannot update another user's profile" });
      }
      
      const updatedProfile = await storage.updateTradesmanProfile(profileId, req.body);
      
      res.json(updatedProfile);
      
    } catch (error) {
      res.status(500).json({ message: "Error updating tradesman profile" });
    }
  });
  
  app.get("/api/tradesman-profiles/:id", async (req, res) => {
    try {
      const profileId = parseInt(req.params.id);
      const profile = await storage.getTradesmanProfile(profileId);
      
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      // Get user data for the profile
      const user = await storage.getUser(profile.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get reviews for this tradesman
      const reviews = await storage.getReviewsByTradesmanId(profileId);
      
      // Get average rating
      const averageRating = await storage.getAverageRatingForTradesman(profileId);
      
      // Get projects for this tradesman
      const projects = await storage.getProjectsByTradesmanId(profileId);
      
      // For each project, get the main image
      const projectsWithMainImage = await Promise.all(
        projects.map(async (project) => {
          const images = await storage.getProjectImages(project.id);
          const mainImage = images.find(img => img.isMainImage) || images[0] || null;
          return {
            ...project,
            mainImage,
          };
        })
      );
      
      // Don't return the user's password
      const { password, ...userWithoutPassword } = user;
      
      res.json({
        profile,
        user: userWithoutPassword,
        reviews,
        averageRating,
        projects: projectsWithMainImage,
      });
      
    } catch (error) {
      res.status(500).json({ message: "Error fetching tradesman profile" });
    }
  });
  
  app.get("/api/tradesman-profiles", async (req, res) => {
    try {
      const { search, trade, verified } = req.query;
      
      let profiles;
      if (search || trade) {
        profiles = await storage.searchTradesmanProfiles(
          search as string || "",
          trade as string
        );
      } else {
        profiles = await storage.getAllTradesmanProfiles();
      }
      
      // Filter by verification status if specified
      if (verified === 'true') {
        profiles = profiles.filter(profile => profile.verificationStatus === 'verified');
      }
      
      // Enhance profiles with user data, ratings, and a main project image
      const enhancedProfiles = await Promise.all(
        profiles.map(async (profile) => {
          const user = await storage.getUser(profile.userId);
          if (!user) return null;
          
          const { password, ...userWithoutPassword } = user;
          
          const averageRating = await storage.getAverageRatingForTradesman(profile.id);
          
          // Get a featured project or the first project
          const projects = await storage.getProjectsByTradesmanId(profile.id);
          const featuredProject = projects.find(p => p.featured) || projects[0] || null;
          
          let mainImage = null;
          if (featuredProject) {
            const images = await storage.getProjectImages(featuredProject.id);
            mainImage = images.find(img => img.isMainImage) || images[0] || null;
          }
          
          return {
            profile,
            user: userWithoutPassword,
            averageRating,
            featuredProject,
            mainImage,
          };
        })
      );
      
      // Filter out null values (cases where user wasn't found)
      const filteredProfiles = enhancedProfiles.filter(Boolean);
      
      res.json(filteredProfiles);
      
    } catch (error) {
      res.status(500).json({ message: "Error fetching tradesman profiles" });
    }
  });
  
  // Project Routes
  app.post("/api/projects", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      
      // Get tradesman profile
      const profile = await storage.getTradesmanProfileByUserId(userId);
      if (!profile) {
        return res.status(400).json({ message: "Tradesman profile not found. Create a profile first." });
      }
      
      const projectData = insertProjectSchema.parse({
        ...req.body,
        tradesmanId: profile.id,
      });
      
      const project = await storage.createProject(projectData);
      
      res.status(201).json(project);
      
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating project" });
    }
  });
  
  app.get("/api/projects/:id", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Get images for the project
      const images = await storage.getProjectImages(projectId);
      
      // Get the tradesman profile
      const profile = await storage.getTradesmanProfile(project.tradesmanId);
      if (!profile) {
        return res.status(404).json({ message: "Tradesman profile not found" });
      }
      
      // Get user data
      const user = await storage.getUser(profile.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't return the password
      const { password, ...userWithoutPassword } = user;
      
      res.json({
        project,
        images,
        profile,
        user: userWithoutPassword,
      });
      
    } catch (error) {
      res.status(500).json({ message: "Error fetching project" });
    }
  });
  
  app.put("/api/projects/:id", requireAuth, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const userId = (req as any).userId;
      
      // Get the project
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Get the tradesman profile
      const profile = await storage.getTradesmanProfile(project.tradesmanId);
      if (!profile || profile.userId !== userId) {
        return res.status(403).json({ message: "Forbidden: Cannot update another tradesman's project" });
      }
      
      const updatedProject = await storage.updateProject(projectId, req.body);
      
      res.json(updatedProject);
      
    } catch (error) {
      res.status(500).json({ message: "Error updating project" });
    }
  });
  
  app.delete("/api/projects/:id", requireAuth, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const userId = (req as any).userId;
      
      // Get the project
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Get the tradesman profile
      const profile = await storage.getTradesmanProfile(project.tradesmanId);
      if (!profile || profile.userId !== userId) {
        return res.status(403).json({ message: "Forbidden: Cannot delete another tradesman's project" });
      }
      
      await storage.deleteProject(projectId);
      
      res.json({ message: "Project deleted successfully" });
      
    } catch (error) {
      res.status(500).json({ message: "Error deleting project" });
    }
  });
  
  app.get("/api/tradesman/:tradesmanId/projects", async (req, res) => {
    try {
      const tradesmanId = parseInt(req.params.tradesmanId);
      
      // Get all projects for this tradesman
      const projects = await storage.getProjectsByTradesmanId(tradesmanId);
      
      // For each project, get the main image
      const projectsWithMainImage = await Promise.all(
        projects.map(async (project) => {
          const images = await storage.getProjectImages(project.id);
          const mainImage = images.find(img => img.isMainImage) || images[0] || null;
          return {
            ...project,
            mainImage,
          };
        })
      );
      
      res.json(projectsWithMainImage);
      
    } catch (error) {
      res.status(500).json({ message: "Error fetching projects" });
    }
  });
  
  app.get("/api/featured-projects", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string || "6");
      
      // Get featured projects
      const projects = await storage.getFeaturedProjects(limit);
      
      // For each project, get the main image and tradesman info
      const enhancedProjects = await Promise.all(
        projects.map(async (project) => {
          const images = await storage.getProjectImages(project.id);
          const mainImage = images.find(img => img.isMainImage) || images[0] || null;
          
          const profile = await storage.getTradesmanProfile(project.tradesmanId);
          if (!profile) return null;
          
          const user = await storage.getUser(profile.userId);
          if (!user) return null;
          
          // Don't return the password
          const { password, ...userWithoutPassword } = user;
          
          return {
            ...project,
            mainImage,
            profile,
            user: userWithoutPassword,
          };
        })
      );
      
      // Filter out null values
      const filteredProjects = enhancedProjects.filter(Boolean);
      
      res.json(filteredProjects);
      
    } catch (error) {
      res.status(500).json({ message: "Error fetching featured projects" });
    }
  });
  
  // Client project marketplace APIs
  
  // Get client projects (with filters)
  app.get("/api/client-projects", async (req, res) => {
    try {
      // In a real implementation, we would use query params to filter
      // For now, we'll just return some sample data in the client
      res.json([]);
    } catch (error) {
      console.error("Error fetching client projects:", error);
      res.status(500).json({ message: "Error fetching client projects" });
    }
  });
  
  // Verification endpoints - for admin use
  app.get("/api/verification/pending", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const user = await storage.getUser(userId);
      
      // Only admins can access this endpoint
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }
      
      const pendingProfiles = await storage.getVerificationPendingProfiles();
      
      // Enhance profiles with user data
      const enhancedProfiles = await Promise.all(
        pendingProfiles.map(async (profile) => {
          const profileUser = await storage.getUser(profile.userId);
          if (!profileUser) return null;
          
          const { password, ...userWithoutPassword } = profileUser;
          
          return {
            profile,
            user: userWithoutPassword
          };
        })
      );
      
      // Filter out null values
      const filteredProfiles = enhancedProfiles.filter(Boolean);
      
      res.json(filteredProfiles);
      
    } catch (error) {
      res.status(500).json({ message: "Error fetching pending verification profiles" });
    }
  });
  
  app.post("/api/verification/:profileId", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const user = await storage.getUser(userId);
      
      // Only admins can access this endpoint
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }
      
      const profileId = parseInt(req.params.profileId);
      const { status, notes } = req.body;
      
      if (!['pending', 'verified', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid verification status" });
      }
      
      const updatedProfile = await storage.updateVerificationStatus(
        profileId, 
        status as 'pending' | 'verified' | 'rejected',
        notes
      );
      
      res.json(updatedProfile);
      
    } catch (error) {
      res.status(500).json({ message: "Error updating verification status" });
    }
  });
  
  // Document upload for verification
  app.post("/api/verification/documents/:profileId", requireAuth, upload.array("documents"), async (req, res) => {
    try {
      const userId = (req as any).userId;
      const profileId = parseInt(req.params.profileId);
      
      // Get the profile
      const profile = await storage.getTradesmanProfile(profileId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      // Check if the profile belongs to the user
      if (profile.userId !== userId) {
        return res.status(403).json({ message: "Forbidden: Cannot upload documents for another user's profile" });
      }
      
      // In a real implementation, we would process and store the files
      // For now, just record that documents were uploaded and set to pending
      const updatedProfile = await storage.updateTradesmanProfile(profileId, { 
        verificationStatus: 'pending',
        verificationDocuments: 'Documents uploaded on ' + new Date().toISOString(),
        verificationNotes: 'Pending review by admin'
      });
      
      res.json(updatedProfile);
      
    } catch (error) {
      res.status(500).json({ message: "Error uploading verification documents" });
    }
  });

  app.post("/api/client-projects", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== "client") {
        return res.status(403).json({ message: "Only clients can post projects" });
      }
      
      // In a real implementation, we would validate and store the project
      // For now, we'll just return a mock successful response
      const projectId = Math.floor(Math.random() * 1000) + 200;
      res.status(201).json({ 
        id: projectId,
        message: "Project created successfully",
        ...req.body
      });
    } catch (error) {
      console.error("Error creating client project:", error);
      res.status(500).json({ message: "Error creating client project" });
    }
  });
  
  // Get a specific client project
  app.get("/api/project-details/:id", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      
      // In a real implementation, we would fetch the project from the database
      // For now, we'll handle this in the frontend
      res.json({});
    } catch (error) {
      console.error(`Error fetching project ${req.params.id}:`, error);
      res.status(500).json({ message: "Error fetching project details" });
    }
  });
  
  // Apply to a project
  app.post("/api/projects/:id/apply", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== "tradesman") {
        return res.status(403).json({ message: "Only tradesmen can apply to projects" });
      }
      
      const projectId = parseInt(req.params.id);
      
      // In a real implementation, we would store the application
      // For now, we'll just return a mock successful response
      res.status(201).json({ 
        id: Math.floor(Math.random() * 1000) + 100,
        projectId,
        tradesmanId: userId,
        applicationData: req.body,
        status: "pending",
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error applying to project ${req.params.id}:`, error);
      res.status(500).json({ message: "Error submitting application" });
    }
  });
  
  // Upload project attachments
  app.post("/api/project-attachments", requireAuth, upload.array("files"), async (req, res) => {
    try {
      const userId = (req as any).userId;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== "client") {
        return res.status(403).json({ message: "Only clients can upload project attachments" });
      }
      
      const projectId = parseInt(req.body.projectId);
      
      // In a real implementation, we would process and store the files
      // For now, we'll just return a mock successful response
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No files were uploaded" });
      }
      
      const fileData = files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
        path: file.path
      }));
      
      res.status(201).json({
        projectId,
        files: fileData
      });
    } catch (error) {
      console.error("Error uploading project attachments:", error);
      res.status(500).json({ message: "Error uploading project attachments" });
    }
  });
  
  // Project Image Routes
  app.post("/api/projects/:projectId/images", requireAuth, upload.single("image"), async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const userId = (req as any).userId;
      
      // Get the project
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Get the tradesman profile
      const profile = await storage.getTradesmanProfile(project.tradesmanId);
      if (!profile || profile.userId !== userId) {
        return res.status(403).json({ message: "Forbidden: Cannot add images to another tradesman's project" });
      }
      
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }
      
      // Create relative URL to the uploaded file
      const imageUrl = `/uploads/project-images/${req.file.filename}`;
      
      // Check if this is the first image for the project
      const existingImages = await storage.getProjectImages(projectId);
      const isMainImage = existingImages.length === 0;
      
      const imageData = insertProjectImageSchema.parse({
        projectId,
        imageUrl,
        caption: req.body.caption || null,
        isMainImage,
      });
      
      const image = await storage.createProjectImage(imageData);
      
      res.status(201).json(image);
      
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error uploading project image" });
    }
  });
  
  app.delete("/api/project-images/:id", requireAuth, async (req, res) => {
    try {
      const imageId = parseInt(req.params.id);
      const userId = (req as any).userId;
      
      // Get the image
      const images = Array.from(storage.projectImages.values());
      const image = images.find(img => img.id === imageId);
      
      if (!image) {
        return res.status(404).json({ message: "Image not found" });
      }
      
      // Get the project
      const project = await storage.getProject(image.projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Get the tradesman profile
      const profile = await storage.getTradesmanProfile(project.tradesmanId);
      if (!profile || profile.userId !== userId) {
        return res.status(403).json({ message: "Forbidden: Cannot delete images from another tradesman's project" });
      }
      
      // Delete the image file
      if (image.imageUrl.startsWith("/uploads/")) {
        const filePath = path.join(process.cwd(), image.imageUrl);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      
      await storage.deleteProjectImage(imageId);
      
      // If this was the main image, set another image as main if available
      if (image.isMainImage) {
        const remainingImages = await storage.getProjectImages(image.projectId);
        if (remainingImages.length > 0) {
          await storage.setMainProjectImage(image.projectId, remainingImages[0].id);
        }
      }
      
      res.json({ message: "Image deleted successfully" });
      
    } catch (error) {
      res.status(500).json({ message: "Error deleting project image" });
    }
  });
  
  app.post("/api/project-images/:id/set-main", requireAuth, async (req, res) => {
    try {
      const imageId = parseInt(req.params.id);
      const userId = (req as any).userId;
      
      // Get the image
      const images = Array.from(storage.projectImages.values());
      const image = images.find(img => img.id === imageId);
      
      if (!image) {
        return res.status(404).json({ message: "Image not found" });
      }
      
      // Get the project
      const project = await storage.getProject(image.projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Get the tradesman profile
      const profile = await storage.getTradesmanProfile(project.tradesmanId);
      if (!profile || profile.userId !== userId) {
        return res.status(403).json({ message: "Forbidden: Cannot modify images from another tradesman's project" });
      }
      
      await storage.setMainProjectImage(image.projectId, imageId);
      
      res.json({ message: "Main image set successfully" });
      
    } catch (error) {
      res.status(500).json({ message: "Error setting main image" });
    }
  });
  
  // Review Routes
  app.post("/api/reviews", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      
      // Validate the review data
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        clientId: userId,
      });
      
      // Create the review
      const review = await storage.createReview(reviewData);
      
      // Get the user who wrote the review
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't return the password
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json({
        ...review,
        client: userWithoutPassword,
      });
      
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating review" });
    }
  });
  
  app.get("/api/tradesman/:tradesmanId/reviews", async (req, res) => {
    try {
      const tradesmanId = parseInt(req.params.tradesmanId);
      
      // Get all reviews for this tradesman
      const reviews = await storage.getReviewsByTradesmanId(tradesmanId);
      
      // Enhance reviews with client info
      const enhancedReviews = await Promise.all(
        reviews.map(async (review) => {
          const user = await storage.getUser(review.clientId);
          if (!user) return null;
          
          // Don't return the password
          const { password, ...userWithoutPassword } = user;
          
          return {
            ...review,
            client: userWithoutPassword,
          };
        })
      );
      
      // Filter out null values
      const filteredReviews = enhancedReviews.filter(Boolean);
      
      // Get average rating
      const averageRating = await storage.getAverageRatingForTradesman(tradesmanId);
      
      res.json({
        reviews: filteredReviews,
        averageRating,
      });
      
    } catch (error) {
      res.status(500).json({ message: "Error fetching reviews" });
    }
  });
  
  // Contract Routes
  app.post("/api/contracts", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      
      // Validate the contract data
      const contractData = insertContractSchema.parse({
        ...req.body,
        clientId: req.body.clientId || userId,
      });
      
      // Verify the tradesman exists
      const tradesmanProfile = await storage.getTradesmanProfile(contractData.tradesmanId);
      if (!tradesmanProfile) {
        return res.status(404).json({ message: "Tradesman profile not found" });
      }
      
      // Verify the client exists
      const client = await storage.getUser(contractData.clientId);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      // Create the contract
      const contract = await storage.createContract(contractData);
      
      res.status(201).json(contract);
      
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating contract" });
    }
  });
  
  app.get("/api/contracts/:id", requireAuth, async (req, res) => {
    try {
      const contractId = parseInt(req.params.id);
      const userId = (req as any).userId;
      
      // Get the contract
      const contract = await storage.getContract(contractId);
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }
      
      // Verify the user is associated with this contract
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if user is either the client or the tradesman
      const profile = await storage.getTradesmanProfileByUserId(userId);
      const isClient = contract.clientId === userId;
      const isTradesman = profile && contract.tradesmanId === profile.id;
      
      if (!isClient && !isTradesman) {
        return res.status(403).json({ message: "Forbidden: Not authorized to view this contract" });
      }
      
      // Get milestones
      const milestones = await storage.getMilestonesByContractId(contractId);
      
      // Get payments
      const payments = await storage.getPaymentsByContractId(contractId);
      
      // Get client and tradesman info
      const client = await storage.getUser(contract.clientId);
      const tradesman = await storage.getTradesmanProfile(contract.tradesmanId);
      const tradesmanUser = tradesman ? await storage.getUser(tradesman.userId) : null;
      
      // Don't return passwords
      let clientData = null;
      let tradesmanUserData = null;
      
      if (client) {
        const { password, ...userWithoutPassword } = client;
        clientData = userWithoutPassword;
      }
      
      if (tradesmanUser) {
        const { password, ...userWithoutPassword } = tradesmanUser;
        tradesmanUserData = userWithoutPassword;
      }
      
      res.json({
        contract,
        milestones,
        payments,
        client: clientData,
        tradesman,
        tradesmanUser: tradesmanUserData,
      });
      
    } catch (error) {
      res.status(500).json({ message: "Error fetching contract" });
    }
  });
  
  app.put("/api/contracts/:id", requireAuth, async (req, res) => {
    try {
      const contractId = parseInt(req.params.id);
      const userId = (req as any).userId;
      
      // Get the contract
      const contract = await storage.getContract(contractId);
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }
      
      // Verify the user is associated with this contract
      const profile = await storage.getTradesmanProfileByUserId(userId);
      const isClient = contract.clientId === userId;
      const isTradesman = profile && contract.tradesmanId === profile.id;
      
      if (!isClient && !isTradesman) {
        return res.status(403).json({ message: "Forbidden: Not authorized to update this contract" });
      }
      
      // Handle special case for signing
      if (req.body.signedByClient !== undefined || req.body.signedByTradesman !== undefined) {
        let updates: any = {};
        
        // Only clients can sign as client
        if (req.body.signedByClient !== undefined) {
          if (!isClient) {
            return res.status(403).json({ message: "Only the client can sign as client" });
          }
          updates.signedByClient = req.body.signedByClient;
        }
        
        // Only tradesmen can sign as tradesman
        if (req.body.signedByTradesman !== undefined) {
          if (!isTradesman) {
            return res.status(403).json({ message: "Only the tradesman can sign as tradesman" });
          }
          updates.signedByTradesman = req.body.signedByTradesman;
        }
        
        // Update contract status if both parties have signed
        if (
          (updates.signedByClient === true || contract.signedByClient) &&
          (updates.signedByTradesman === true || contract.signedByTradesman)
        ) {
          updates.status = 'signed';
        }
        
        const updatedContract = await storage.updateContract(contractId, updates);
        return res.json(updatedContract);
      }
      
      // For other updates, only tradesmen can update the contract
      if (!isTradesman) {
        return res.status(403).json({ message: "Only the tradesman can update this contract" });
      }
      
      const updatedContract = await storage.updateContract(contractId, req.body);
      
      res.json(updatedContract);
      
    } catch (error) {
      res.status(500).json({ message: "Error updating contract" });
    }
  });
  
  app.get("/api/user/contracts", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      let contracts = [];
      
      // Get contracts based on user role
      if (user.role === 'client') {
        contracts = await storage.getContractsByClientId(userId);
      } else if (user.role === 'tradesman') {
        const profile = await storage.getTradesmanProfileByUserId(userId);
        if (profile) {
          contracts = await storage.getContractsByTradesmanId(profile.id);
        }
      }
      
      // Enhance contracts with client/tradesman info
      const enhancedContracts = await Promise.all(
        contracts.map(async (contract) => {
          let clientData = null;
          let tradesmanData = null;
          let tradesmanUserData = null;
          
          const client = await storage.getUser(contract.clientId);
          if (client) {
            const { password, ...userWithoutPassword } = client;
            clientData = userWithoutPassword;
          }
          
          const tradesman = await storage.getTradesmanProfile(contract.tradesmanId);
          if (tradesman) {
            tradesmanData = tradesman;
            
            const tradesmanUser = await storage.getUser(tradesman.userId);
            if (tradesmanUser) {
              const { password, ...userWithoutPassword } = tradesmanUser;
              tradesmanUserData = userWithoutPassword;
            }
          }
          
          return {
            ...contract,
            client: clientData,
            tradesman: tradesmanData,
            tradesmanUser: tradesmanUserData,
          };
        })
      );
      
      res.json(enhancedContracts);
      
    } catch (error) {
      res.status(500).json({ message: "Error fetching contracts" });
    }
  });
  
  // Milestone Routes
  app.post("/api/contracts/:contractId/milestones", requireAuth, async (req, res) => {
    try {
      const contractId = parseInt(req.params.contractId);
      const userId = (req as any).userId;
      
      // Get the contract
      const contract = await storage.getContract(contractId);
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }
      
      // Only the tradesman can add milestones
      const profile = await storage.getTradesmanProfileByUserId(userId);
      if (!profile || contract.tradesmanId !== profile.id) {
        return res.status(403).json({ message: "Forbidden: Only the tradesman can add milestones" });
      }
      
      // Validate the milestone data
      const milestoneData = insertMilestoneSchema.parse({
        ...req.body,
        contractId,
      });
      
      // Create the milestone
      const milestone = await storage.createMilestone(milestoneData);
      
      res.status(201).json(milestone);
      
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating milestone" });
    }
  });
  
  app.put("/api/milestones/:id", requireAuth, async (req, res) => {
    try {
      const milestoneId = parseInt(req.params.id);
      const userId = (req as any).userId;
      
      // Get the milestone
      const milestone = storage.milestones.get(milestoneId);
      if (!milestone) {
        return res.status(404).json({ message: "Milestone not found" });
      }
      
      // Get the contract
      const contract = await storage.getContract(milestone.contractId);
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }
      
      // Only the tradesman can update milestones
      const profile = await storage.getTradesmanProfileByUserId(userId);
      if (!profile || contract.tradesmanId !== profile.id) {
        return res.status(403).json({ message: "Forbidden: Only the tradesman can update milestones" });
      }
      
      // Special case for completing a milestone
      if (req.body.status === 'completed' && milestone.status !== 'completed') {
        const updatedMilestone = await storage.updateMilestone(milestoneId, {
          status: 'completed',
          completedAt: new Date(),
        });
        return res.json(updatedMilestone);
      }
      
      const updatedMilestone = await storage.updateMilestone(milestoneId, req.body);
      
      res.json(updatedMilestone);
      
    } catch (error) {
      res.status(500).json({ message: "Error updating milestone" });
    }
  });
  
  app.delete("/api/milestones/:id", requireAuth, async (req, res) => {
    try {
      const milestoneId = parseInt(req.params.id);
      const userId = (req as any).userId;
      
      // Get the milestone
      const milestone = storage.milestones.get(milestoneId);
      if (!milestone) {
        return res.status(404).json({ message: "Milestone not found" });
      }
      
      // Get the contract
      const contract = await storage.getContract(milestone.contractId);
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }
      
      // Only the tradesman can delete milestones
      const profile = await storage.getTradesmanProfileByUserId(userId);
      if (!profile || contract.tradesmanId !== profile.id) {
        return res.status(403).json({ message: "Forbidden: Only the tradesman can delete milestones" });
      }
      
      // Cannot delete milestones that have been paid
      if (milestone.status === 'paid') {
        return res.status(400).json({ message: "Cannot delete milestone that has been paid" });
      }
      
      await storage.deleteMilestone(milestoneId);
      
      res.json({ message: "Milestone deleted successfully" });
      
    } catch (error) {
      res.status(500).json({ message: "Error deleting milestone" });
    }
  });
  
  // Payment Routes
  app.post("/api/create-payment-intent", requireAuth, async (req, res) => {
    try {
      const { milestoneId } = req.body;
      const userId = (req as any).userId;
      
      // Get the milestone
      const milestone = storage.milestones.get(parseInt(milestoneId));
      if (!milestone) {
        return res.status(404).json({ message: "Milestone not found" });
      }
      
      // Get the contract
      const contract = await storage.getContract(milestone.contractId);
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }
      
      // Verify the user is the client for this contract
      if (contract.clientId !== userId) {
        return res.status(403).json({ message: "Forbidden: Only the client can make payments" });
      }
      
      // Create a new payment record
      const payment = await storage.createPayment({
        milestoneId: milestone.id,
        contractId: contract.id,
        clientId: userId,
        tradesmanId: contract.tradesmanId,
        amount: milestone.amount,
        status: 'pending',
        stripePaymentId: null,
        invoiceUrl: null,
      });
      
      // Create a Payment Intent with Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: milestone.amount * 100, // Convert to cents
        currency: "usd",
        metadata: {
          paymentId: payment.id.toString(),
          milestoneId: milestone.id.toString(),
          contractId: contract.id.toString(),
        },
      });
      
      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentId: payment.id,
      });
      
    } catch (error) {
      res.status(500).json({ message: "Error creating payment intent" });
    }
  });
  
  // Process payment with WiPay
  app.post("/api/payments/process-wipay", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const { paymentId, name, email, amount, description } = req.body;
      
      // Get user to check role
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Only clients can make payments
      if (user.role !== 'client') {
        return res.status(403).json({ message: "Forbidden: Only the client can make payments" });
      }
      
      // Get the payment
      const payment = await storage.getPayment(parseInt(paymentId));
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      
      // Verify the user is the client who made the payment
      if (payment.clientId !== userId) {
        return res.status(403).json({ message: "Forbidden: Not your payment" });
      }
      
      // Update payment status to processing
      await storage.updatePayment(payment.id, {
        status: 'processing',
      });
      
      // Create a callback URL that WiPay will redirect to after payment
      const callbackUrl = `${req.protocol}://${req.get('host')}/api/wipay-callback`;
      
      // Generate a WiPay payment URL
      const paymentResult = await createPayment({
        amount: payment.amount,
        name: name || user.fullName,
        email: email || user.email,
        description: description || `Payment for Contract #${payment.contractId}`,
        orderId: `payment-${payment.id}`,
        returnUrl: callbackUrl,
      });
      
      // Update payment with WiPay transaction ID
      await storage.updateStripePaymentId(payment.id, paymentResult.transactionId);
      
      // Return the WiPay payment URL and transaction ID
      res.json({
        url: paymentResult.url,
        transactionId: paymentResult.transactionId,
        paymentId: payment.id,
      });
      
    } catch (error) {
      console.error("Error processing WiPay payment:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Error processing payment" });
    }
  });
  
  // API endpoint to check payment status
  app.get("/api/payment-status/:paymentId", requireAuth, async (req, res) => {
    try {
      const paymentId = parseInt(req.params.paymentId);
      const userId = (req as any).userId;
      
      // Get the payment
      const payment = await storage.getPayment(paymentId);
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      
      // Verify the user is either the client or tradesman for this payment
      if (payment.clientId !== userId && payment.tradesmanId !== userId) {
        return res.status(403).json({ message: "Forbidden: You don't have access to this payment" });
      }
      
      // If payment has a WiPay transaction ID, check its status
      if (payment.stripePaymentId && payment.stripePaymentId.startsWith('dev-')) {
        try {
          // This will be replaced with actual WiPay verification when account is verified
          const verification = await verifyPayment(payment.stripePaymentId);
          
          if (verification.status === 'completed' || verification.status === 'successful') {
            // Update payment status to completed if not already
            if (payment.status !== 'completed') {
              await storage.updatePayment(payment.id, {
                status: 'completed',
                completedAt: new Date()
              });
              
              // Also update milestone status if applicable
              if (payment.milestoneId) {
                await storage.updateMilestone(payment.milestoneId, {
                  status: 'paid',
                  completedAt: new Date()
                });
              }
            }
          }
        } catch (verifyError) {
          console.error("WiPay verification error:", verifyError);
        }
      }
      
      // Return the current payment status
      res.json({
        status: payment.status,
        paymentId: payment.id,
        milestoneId: payment.milestoneId,
        amount: payment.amount,
        completedAt: payment.completedAt
      });
      
    } catch (error) {
      console.error("Error checking payment status:", error);
      res.status(500).json({ message: "Error checking payment status" });
    }
  });

  // WiPay callback endpoint - handles payment status updates from WiPay
  app.get("/api/wipay-callback", async (req, res) => {
    try {
      const { wipay_status, order_id, transaction_id } = req.query;
      
      if (!order_id) {
        return res.status(400).json({ message: "Missing order ID" });
      }
      
      // Extract milestone ID from order ID (format: milestone-{id}-{timestamp})
      const milestoneIdMatch = String(order_id).match(/milestone-(\d+)-/);
      
      if (!milestoneIdMatch) {
        return res.status(400).json({ message: "Invalid order ID format" });
      }
      
      const milestoneId = parseInt(milestoneIdMatch[1]);
      
      // Get the milestone's payment
      const payments = await storage.getPaymentsByMilestoneId(milestoneId);
      const payment = payments.find(p => p.status === 'pending' || p.status === 'processing');
      
      if (!payment) {
        return res.status(404).json({ message: "Payment record not found" });
      }
      
      // Verify payment status with WiPay if transaction_id is provided
      if (transaction_id) {
        try {
          const verification = await verifyPayment(String(transaction_id));
          
          if (verification.status === 'completed' || verification.status === 'successful') {
            // Update payment status to completed
            await storage.updatePayment(payment.id, {
              status: 'completed',
              completedAt: new Date()
            });
            
            // Update milestone status to paid
            await storage.updateMilestone(milestoneId, {
              status: 'paid',
              completedAt: new Date()
            });
          } else if (verification.status === 'failed') {
            // Update payment status to failed
            await storage.updatePayment(payment.id, {
              status: 'failed'
            });
          }
        } catch (verifyError) {
          console.error("WiPay verification error:", verifyError);
        }
      }
      
      // Redirect to the payment status page
      res.redirect(`/payment-status?id=${payment.id}&status=${wipay_status || 'pending'}`);
      
    } catch (error) {
      console.error("Error in WiPay callback:", error);
      res.status(500).json({ message: "Error processing payment callback" });
    }
  });

  app.post("/api/payment-complete", requireAuth, async (req, res) => {
    try {
      const { paymentId, stripePaymentId } = req.body;
      const userId = (req as any).userId;
      
      // Get the payment
      const payment = await storage.getPayment(parseInt(paymentId));
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      
      // Verify the user is the client who made the payment
      if (payment.clientId !== userId) {
        return res.status(403).json({ message: "Forbidden: Not your payment" });
      }
      
      // Update the payment with Stripe payment ID
      const updatedPayment = await storage.updateStripePaymentId(payment.id, stripePaymentId);
      
      // Update the milestone status to paid
      if (payment.milestoneId) {
        await storage.updateMilestone(payment.milestoneId, {
          status: 'paid',
          paymentId: stripePaymentId,
        });
      }
      
      res.json(updatedPayment);
      
    } catch (error) {
      res.status(500).json({ message: "Error completing payment" });
    }
  });
  
  app.get("/api/user/payments", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      let payments = [];
      
      // Find all payments where this user is either the client or tradesman
      for (const payment of storage.payments.values()) {
        if (payment.clientId === userId) {
          // This user is the client
          payments.push({ ...payment, role: 'client' });
        } else if (user.role === 'tradesman') {
          // Check if this user is the tradesman
          const profile = await storage.getTradesmanProfileByUserId(userId);
          if (profile && payment.tradesmanId === profile.id) {
            payments.push({ ...payment, role: 'tradesman' });
          }
        }
      }
      
      // Enhance payments with contract and milestone info
      const enhancedPayments = await Promise.all(
        payments.map(async (payment) => {
          const contract = await storage.getContract(payment.contractId);
          let milestone = null;
          
          if (payment.milestoneId) {
            milestone = storage.milestones.get(payment.milestoneId);
          }
          
          let clientData = null;
          let tradesmanData = null;
          let tradesmanUserData = null;
          
          if (contract) {
            const client = await storage.getUser(contract.clientId);
            if (client) {
              const { password, ...userWithoutPassword } = client;
              clientData = userWithoutPassword;
            }
            
            const tradesman = await storage.getTradesmanProfile(contract.tradesmanId);
            if (tradesman) {
              tradesmanData = tradesman;
              
              const tradesmanUser = await storage.getUser(tradesman.userId);
              if (tradesmanUser) {
                const { password, ...userWithoutPassword } = tradesmanUser;
                tradesmanUserData = userWithoutPassword;
              }
            }
          }
          
          return {
            ...payment,
            contract,
            milestone,
            client: clientData,
            tradesman: tradesmanData,
            tradesmanUser: tradesmanUserData,
          };
        })
      );
      
      res.json(enhancedPayments);
      
    } catch (error) {
      res.status(500).json({ message: "Error fetching payments" });
    }
  });
  
  // Message Routes
  app.post("/api/messages", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      
      // Validate the message data
      const messageData = insertMessageSchema.parse({
        ...req.body,
        senderId: userId,
      });
      
      // Verify the receiver exists
      const receiver = await storage.getUser(messageData.receiverId);
      if (!receiver) {
        return res.status(404).json({ message: "Receiver not found" });
      }
      
      // Create the message
      const message = await storage.createMessage(messageData);
      
      // Get the sender info
      const sender = await storage.getUser(userId);
      if (!sender) {
        return res.status(404).json({ message: "Sender not found" });
      }
      
      // Don't return passwords
      const { password: senderPass, ...senderWithoutPassword } = sender;
      const { password: receiverPass, ...receiverWithoutPassword } = receiver;
      
      res.status(201).json({
        ...message,
        sender: senderWithoutPassword,
        receiver: receiverWithoutPassword,
      });
      
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error sending message" });
    }
  });
  
  app.get("/api/messages/:userId", requireAuth, async (req, res) => {
    try {
      const currentUserId = (req as any).userId;
      const otherUserId = parseInt(req.params.userId);
      
      // Get messages between the two users
      const messages = await storage.getMessagesBetweenUsers(currentUserId, otherUserId);
      
      // Mark unread messages as read if the current user is the receiver
      for (const message of messages) {
        if (message.receiverId === currentUserId && message.status === 'unread') {
          await storage.markMessageAsRead(message.id);
        }
      }
      
      // Get fresh messages after marking them as read
      const updatedMessages = await storage.getMessagesBetweenUsers(currentUserId, otherUserId);
      
      // Get user info
      const currentUser = await storage.getUser(currentUserId);
      const otherUser = await storage.getUser(otherUserId);
      
      if (!currentUser || !otherUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't return passwords
      const { password: currentPass, ...currentUserWithoutPassword } = currentUser;
      const { password: otherPass, ...otherUserWithoutPassword } = otherUser;
      
      // Check if other user is a tradesman and get profile
      let tradesmanProfile = null;
      if (otherUser.role === 'tradesman') {
        tradesmanProfile = await storage.getTradesmanProfileByUserId(otherUserId);
      }
      
      res.json({
        messages: updatedMessages,
        currentUser: currentUserWithoutPassword,
        otherUser: otherUserWithoutPassword,
        tradesmanProfile,
      });
      
    } catch (error) {
      res.status(500).json({ message: "Error fetching messages" });
    }
  });
  
  app.get("/api/conversations", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      
      // Get all messages for this user
      const allMessages = await storage.getMessagesByUser(userId);
      
      // Group messages by the other user
      const conversationMap = new Map();
      
      for (const message of allMessages) {
        const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
        
        if (!conversationMap.has(otherUserId)) {
          conversationMap.set(otherUserId, []);
        }
        
        conversationMap.get(otherUserId).push(message);
      }
      
      // For each conversation, get the last message and user info
      const conversations = await Promise.all(
        Array.from(conversationMap.entries()).map(async ([otherUserId, messages]) => {
          // Sort messages by date and get the latest
          const sortedMessages = messages.sort((a, b) => 
            b.createdAt.getTime() - a.createdAt.getTime()
          );
          const lastMessage = sortedMessages[0];
          
          // Get unread count
          const unreadCount = sortedMessages.filter(
            msg => msg.receiverId === userId && msg.status === 'unread'
          ).length;
          
          // Get the other user info
          const otherUser = await storage.getUser(otherUserId);
          if (!otherUser) return null;
          
          // Don't return the password
          const { password, ...userWithoutPassword } = otherUser;
          
          // Check if other user is a tradesman and get profile
          let tradesmanProfile = null;
          if (otherUser.role === 'tradesman') {
            tradesmanProfile = await storage.getTradesmanProfileByUserId(otherUserId);
          }
          
          return {
            otherUser: userWithoutPassword,
            tradesmanProfile,
            lastMessage,
            unreadCount,
          };
        })
      );
      
      // Filter out null values and sort by last message date
      const filteredConversations = conversations
        .filter(Boolean)
        .sort((a, b) => 
          b.lastMessage.createdAt.getTime() - a.lastMessage.createdAt.getTime()
        );
      
      res.json(filteredConversations);
      
    } catch (error) {
      res.status(500).json({ message: "Error fetching conversations" });
    }
  });
  
  app.get("/api/unread-message-count", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      
      const count = await storage.getUnreadMessageCount(userId);
      
      res.json({ count });
      
    } catch (error) {
      res.status(500).json({ message: "Error fetching unread message count" });
    }
  });
  
  // Set up HTTP server
  const httpServer = createServer(app);
  
  // Define a route for serving uploaded files
  app.use("/uploads", express.static(uploadsDir));
  
  return httpServer;
}
