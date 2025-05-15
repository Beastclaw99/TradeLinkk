import {
  User, InsertUser,
  TradesmanProfile, InsertTradesmanProfile,
  Project, InsertProject,
  ProjectImage, InsertProjectImage,
  Review, InsertReview,
  Contract, InsertContract,
  Milestone, InsertMilestone,
  Payment, InsertPayment,
  Message, InsertMessage,
  userRoleEnum, tradeEnum, contractStatusEnum, messageStatusEnum, paymentStatusEnum, milestoneStatusEnum
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User>;
  
  // Tradesman profile operations
  getTradesmanProfile(id: number): Promise<TradesmanProfile | undefined>;
  getTradesmanProfileByUserId(userId: number): Promise<TradesmanProfile | undefined>;
  createTradesmanProfile(profile: InsertTradesmanProfile): Promise<TradesmanProfile>;
  updateTradesmanProfile(id: number, data: Partial<TradesmanProfile>): Promise<TradesmanProfile>;
  getAllTradesmanProfiles(): Promise<TradesmanProfile[]>;
  searchTradesmanProfiles(query: string, trade?: string): Promise<TradesmanProfile[]>;
  
  // Project operations
  getProject(id: number): Promise<Project | undefined>;
  getProjectsByTradesmanId(tradesmanId: number): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, data: Partial<Project>): Promise<Project>;
  deleteProject(id: number): Promise<boolean>;
  getFeaturedProjects(limit: number): Promise<Project[]>;
  
  // Project image operations
  getProjectImages(projectId: number): Promise<ProjectImage[]>;
  createProjectImage(image: InsertProjectImage): Promise<ProjectImage>;
  deleteProjectImage(id: number): Promise<boolean>;
  setMainProjectImage(projectId: number, imageId: number): Promise<boolean>;
  
  // Review operations
  getReviewsByTradesmanId(tradesmanId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  deleteReview(id: number): Promise<boolean>;
  getAverageRatingForTradesman(tradesmanId: number): Promise<number>;
  
  // Contract operations
  getContract(id: number): Promise<Contract | undefined>;
  getContractsByTradesmanId(tradesmanId: number): Promise<Contract[]>;
  getContractsByClientId(clientId: number): Promise<Contract[]>;
  createContract(contract: InsertContract): Promise<Contract>;
  updateContract(id: number, data: Partial<Contract>): Promise<Contract>;
  deleteContract(id: number): Promise<boolean>;
  
  // Milestone operations
  getMilestonesByContractId(contractId: number): Promise<Milestone[]>;
  createMilestone(milestone: InsertMilestone): Promise<Milestone>;
  updateMilestone(id: number, data: Partial<Milestone>): Promise<Milestone>;
  deleteMilestone(id: number): Promise<boolean>;
  
  // Payment operations
  getPayment(id: number): Promise<Payment | undefined>;
  getPaymentsByContractId(contractId: number): Promise<Payment[]>;
  getPaymentsByMilestoneId(milestoneId: number): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: number, data: Partial<Payment>): Promise<Payment>;
  updateStripePaymentId(id: number, stripePaymentId: string): Promise<Payment>;
  
  // Message operations
  getMessagesByUser(userId: number): Promise<Message[]>;
  getMessagesBetweenUsers(user1Id: number, user2Id: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: number): Promise<Message>;
  getUnreadMessageCount(userId: number): Promise<number>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tradesmanProfiles: Map<number, TradesmanProfile>;
  private projects: Map<number, Project>;
  private projectImages: Map<number, ProjectImage>;
  private reviews: Map<number, Review>;
  private contracts: Map<number, Contract>;
  private milestones: Map<number, Milestone>;
  private payments: Map<number, Payment>;
  private messages: Map<number, Message>;
  
  private userId: number;
  private tradesmanProfileId: number;
  private projectId: number;
  private projectImageId: number;
  private reviewId: number;
  private contractId: number;
  private milestoneId: number;
  private paymentId: number;
  private messageId: number;

  constructor() {
    this.users = new Map();
    this.tradesmanProfiles = new Map();
    this.projects = new Map();
    this.projectImages = new Map();
    this.reviews = new Map();
    this.contracts = new Map();
    this.milestones = new Map();
    this.payments = new Map();
    this.messages = new Map();
    
    this.userId = 1;
    this.tradesmanProfileId = 1;
    this.projectId = 1;
    this.projectImageId = 1;
    this.reviewId = 1;
    this.contractId = 1;
    this.milestoneId = 1;
    this.paymentId = 1;
    this.messageId = 1;

    // Add some initial data for testing
    this.initializeData();
  }

  // Initialize with some sample data for testing
  private initializeData() {
    // Create example users (we'll add these directly to maps)
    const user1: User = {
      id: this.userId++,
      email: "john@example.com",
      password: "password123", // In real app, this would be hashed
      username: "johndoe",
      role: 'client',
      fullName: "John Doe",
      phone: "555-123-4567",
      location: "New York, NY",
      bio: "Homeowner looking for quality work",
      avatarUrl: null,
      stripeCustomerId: null,
      createdAt: new Date()
    };
    
    const user2: User = {
      id: this.userId++,
      email: "jane@example.com",
      password: "password123", // In real app, this would be hashed
      username: "janesmith",
      role: 'tradesman',
      fullName: "Jane Smith",
      phone: "555-987-6543",
      location: "Chicago, IL",
      bio: "Professional carpenter with 10 years of experience",
      avatarUrl: null,
      stripeCustomerId: null,
      createdAt: new Date()
    };
    
    this.users.set(user1.id, user1);
    this.users.set(user2.id, user2);
    
    // Create tradesman profile
    const tradesmanProfile: TradesmanProfile = {
      id: this.tradesmanProfileId++,
      userId: user2.id,
      businessName: "Smith Carpentry",
      trade: 'carpentry',
      experience: 10,
      hourlyRate: 75,
      licenseNumber: "CARP-12345",
      insuranceInfo: "Insured with HomeGuard",
      qualifications: "Certified Master Carpenter",
      completenessScore: 90,
      availability: "Weekdays 8am-5pm"
    };
    
    this.tradesmanProfiles.set(tradesmanProfile.id, tradesmanProfile);
    
    // Create a project
    const project: Project = {
      id: this.projectId++,
      tradesmanId: tradesmanProfile.id,
      title: "Kitchen Renovation",
      description: "Complete kitchen remodel with custom cabinets",
      location: "Chicago, IL",
      completionDate: "2023-10-15",
      budget: "$15,000",
      featured: true,
      createdAt: new Date()
    };
    
    this.projects.set(project.id, project);
    
    // Create project images
    const image1: ProjectImage = {
      id: this.projectImageId++,
      projectId: project.id,
      imageUrl: "/images/kitchen-before.jpg",
      caption: "Before renovation",
      isMainImage: false
    };
    
    const image2: ProjectImage = {
      id: this.projectImageId++,
      projectId: project.id,
      imageUrl: "/images/kitchen-after.jpg",
      caption: "After renovation",
      isMainImage: true
    };
    
    this.projectImages.set(image1.id, image1);
    this.projectImages.set(image2.id, image2);
    
    // Create a review
    const review: Review = {
      id: this.reviewId++,
      tradesmanId: tradesmanProfile.id,
      clientId: user1.id,
      projectId: project.id,
      rating: 5,
      comment: "Exceptional work on our kitchen renovation. Highly recommend!",
      createdAt: new Date()
    };
    
    this.reviews.set(review.id, review);
    
    // Create a contract
    const contract: Contract = {
      id: this.contractId++,
      tradesmanId: tradesmanProfile.id,
      clientId: user1.id,
      title: "Bathroom Remodel Agreement",
      description: "Complete remodel of master bathroom including new fixtures and tile work.",
      startDate: "2023-11-01",
      endDate: "2023-12-15",
      totalAmount: 8500,
      status: 'signed',
      documentUrl: "/contracts/bathroom-contract.pdf",
      signedByClient: true,
      signedByTradesman: true,
      createdAt: new Date()
    };
    
    this.contracts.set(contract.id, contract);
    
    // Create milestones
    const milestone1: Milestone = {
      id: this.milestoneId++,
      contractId: contract.id,
      title: "Initial Demolition",
      description: "Remove existing fixtures and prepare space",
      amount: 2000,
      dueDate: "2023-11-07",
      status: 'completed',
      paymentId: "pay_123456",
      completedAt: new Date("2023-11-06")
    };
    
    const milestone2: Milestone = {
      id: this.milestoneId++,
      contractId: contract.id,
      title: "Installation of New Fixtures",
      description: "Install new toilet, sink, and shower",
      amount: 3500,
      dueDate: "2023-11-25",
      status: 'pending',
      paymentId: null,
      completedAt: null
    };
    
    const milestone3: Milestone = {
      id: this.milestoneId++,
      contractId: contract.id,
      title: "Tile Work and Finishing",
      description: "Complete tile work and final touches",
      amount: 3000,
      dueDate: "2023-12-10",
      status: 'pending',
      paymentId: null,
      completedAt: null
    };
    
    this.milestones.set(milestone1.id, milestone1);
    this.milestones.set(milestone2.id, milestone2);
    this.milestones.set(milestone3.id, milestone3);
    
    // Create a payment
    const payment: Payment = {
      id: this.paymentId++,
      milestoneId: milestone1.id,
      contractId: contract.id,
      clientId: user1.id,
      tradesmanId: tradesmanProfile.id,
      amount: 2000,
      status: 'completed',
      stripePaymentId: "pi_123456",
      invoiceUrl: "/invoices/invoice-1.pdf",
      createdAt: new Date("2023-11-05"),
      completedAt: new Date("2023-11-05")
    };
    
    this.payments.set(payment.id, payment);
    
    // Create some messages
    const message1: Message = {
      id: this.messageId++,
      senderId: user1.id,
      receiverId: user2.id,
      content: "Hi Jane, I'm interested in getting a quote for some custom cabinets.",
      status: 'read',
      createdAt: new Date("2023-10-10")
    };
    
    const message2: Message = {
      id: this.messageId++,
      senderId: user2.id,
      receiverId: user1.id,
      content: "Hi John, I'd be happy to provide a quote. What dimensions are you looking for?",
      status: 'read',
      createdAt: new Date("2023-10-10")
    };
    
    this.messages.set(message1.id, message1);
    this.messages.set(message2.id, message2);
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = {
      ...userData,
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Tradesman profile operations
  async getTradesmanProfile(id: number): Promise<TradesmanProfile | undefined> {
    return this.tradesmanProfiles.get(id);
  }

  async getTradesmanProfileByUserId(userId: number): Promise<TradesmanProfile | undefined> {
    for (const profile of this.tradesmanProfiles.values()) {
      if (profile.userId === userId) {
        return profile;
      }
    }
    return undefined;
  }

  async createTradesmanProfile(profile: InsertTradesmanProfile): Promise<TradesmanProfile> {
    const id = this.tradesmanProfileId++;
    const tradesmanProfile: TradesmanProfile = {
      ...profile,
      id,
      completenessScore: this.calculateProfileCompleteness(profile)
    };
    this.tradesmanProfiles.set(id, tradesmanProfile);
    return tradesmanProfile;
  }

  async updateTradesmanProfile(id: number, data: Partial<TradesmanProfile>): Promise<TradesmanProfile> {
    const profile = await this.getTradesmanProfile(id);
    if (!profile) {
      throw new Error(`Tradesman profile with id ${id} not found`);
    }
    
    const updatedProfile = { ...profile, ...data };
    // Recalculate completeness score
    updatedProfile.completenessScore = this.calculateProfileCompleteness(updatedProfile);
    
    this.tradesmanProfiles.set(id, updatedProfile);
    return updatedProfile;
  }

  async getAllTradesmanProfiles(): Promise<TradesmanProfile[]> {
    return Array.from(this.tradesmanProfiles.values());
  }

  async searchTradesmanProfiles(query: string, trade?: string): Promise<TradesmanProfile[]> {
    let results = Array.from(this.tradesmanProfiles.values());
    
    if (trade) {
      results = results.filter(profile => profile.trade === trade);
    }
    
    if (query) {
      const lowerQuery = query.toLowerCase();
      results = results.filter(profile => {
        const user = this.users.get(profile.userId);
        return (
          profile.businessName.toLowerCase().includes(lowerQuery) ||
          profile.qualifications?.toLowerCase().includes(lowerQuery) ||
          user?.fullName.toLowerCase().includes(lowerQuery) ||
          user?.location?.toLowerCase().includes(lowerQuery)
        );
      });
    }
    
    return results;
  }

  // Helper method to calculate profile completeness
  private calculateProfileCompleteness(profile: Partial<TradesmanProfile>): number {
    const fields = [
      'businessName', 'trade', 'experience', 'hourlyRate',
      'licenseNumber', 'insuranceInfo', 'qualifications', 'availability'
    ];
    
    const filledFields = fields.filter(field => 
      profile[field as keyof TradesmanProfile] !== undefined && 
      profile[field as keyof TradesmanProfile] !== null
    );
    
    return Math.floor((filledFields.length / fields.length) * 100);
  }

  // Project operations
  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getProjectsByTradesmanId(tradesmanId: number): Promise<Project[]> {
    return Array.from(this.projects.values())
      .filter(project => project.tradesmanId === tradesmanId);
  }

  async createProject(project: InsertProject): Promise<Project> {
    const id = this.projectId++;
    const newProject: Project = {
      ...project,
      id,
      createdAt: new Date()
    };
    this.projects.set(id, newProject);
    return newProject;
  }

  async updateProject(id: number, data: Partial<Project>): Promise<Project> {
    const project = await this.getProject(id);
    if (!project) {
      throw new Error(`Project with id ${id} not found`);
    }
    
    const updatedProject = { ...project, ...data };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: number): Promise<boolean> {
    // Delete associated images first
    const images = await this.getProjectImages(id);
    for (const image of images) {
      await this.deleteProjectImage(image.id);
    }
    
    return this.projects.delete(id);
  }

  async getFeaturedProjects(limit: number): Promise<Project[]> {
    return Array.from(this.projects.values())
      .filter(project => project.featured)
      .slice(0, limit);
  }

  // Project image operations
  async getProjectImages(projectId: number): Promise<ProjectImage[]> {
    return Array.from(this.projectImages.values())
      .filter(image => image.projectId === projectId);
  }

  async createProjectImage(image: InsertProjectImage): Promise<ProjectImage> {
    const id = this.projectImageId++;
    const newImage: ProjectImage = {
      ...image,
      id
    };
    
    // If this is set as the main image, unset any existing main images
    if (newImage.isMainImage) {
      for (const [key, existingImage] of this.projectImages.entries()) {
        if (existingImage.projectId === newImage.projectId && existingImage.isMainImage) {
          this.projectImages.set(key, { ...existingImage, isMainImage: false });
        }
      }
    }
    
    this.projectImages.set(id, newImage);
    return newImage;
  }

  async deleteProjectImage(id: number): Promise<boolean> {
    return this.projectImages.delete(id);
  }

  async setMainProjectImage(projectId: number, imageId: number): Promise<boolean> {
    // Set all project images' isMainImage to false
    for (const [key, image] of this.projectImages.entries()) {
      if (image.projectId === projectId) {
        this.projectImages.set(key, { ...image, isMainImage: image.id === imageId });
      }
    }
    return true;
  }

  // Review operations
  async getReviewsByTradesmanId(tradesmanId: number): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter(review => review.tradesmanId === tradesmanId);
  }

  async createReview(review: InsertReview): Promise<Review> {
    const id = this.reviewId++;
    const newReview: Review = {
      ...review,
      id,
      createdAt: new Date()
    };
    this.reviews.set(id, newReview);
    return newReview;
  }

  async deleteReview(id: number): Promise<boolean> {
    return this.reviews.delete(id);
  }

  async getAverageRatingForTradesman(tradesmanId: number): Promise<number> {
    const reviews = await this.getReviewsByTradesmanId(tradesmanId);
    if (reviews.length === 0) {
      return 0;
    }
    
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
  }

  // Contract operations
  async getContract(id: number): Promise<Contract | undefined> {
    return this.contracts.get(id);
  }

  async getContractsByTradesmanId(tradesmanId: number): Promise<Contract[]> {
    return Array.from(this.contracts.values())
      .filter(contract => contract.tradesmanId === tradesmanId);
  }

  async getContractsByClientId(clientId: number): Promise<Contract[]> {
    return Array.from(this.contracts.values())
      .filter(contract => contract.clientId === clientId);
  }

  async createContract(contract: InsertContract): Promise<Contract> {
    const id = this.contractId++;
    const newContract: Contract = {
      ...contract,
      id,
      createdAt: new Date()
    };
    this.contracts.set(id, newContract);
    return newContract;
  }

  async updateContract(id: number, data: Partial<Contract>): Promise<Contract> {
    const contract = await this.getContract(id);
    if (!contract) {
      throw new Error(`Contract with id ${id} not found`);
    }
    
    const updatedContract = { ...contract, ...data };
    this.contracts.set(id, updatedContract);
    return updatedContract;
  }

  async deleteContract(id: number): Promise<boolean> {
    // Delete associated milestones and payments first
    const milestones = await this.getMilestonesByContractId(id);
    for (const milestone of milestones) {
      await this.deleteMilestone(milestone.id);
    }
    
    const payments = await this.getPaymentsByContractId(id);
    for (const payment of payments) {
      // In a real app, we'd need to handle refunds through Stripe
      // Here we'll just delete the payment record
      this.payments.delete(payment.id);
    }
    
    return this.contracts.delete(id);
  }

  // Milestone operations
  async getMilestonesByContractId(contractId: number): Promise<Milestone[]> {
    return Array.from(this.milestones.values())
      .filter(milestone => milestone.contractId === contractId);
  }

  async createMilestone(milestone: InsertMilestone): Promise<Milestone> {
    const id = this.milestoneId++;
    const newMilestone: Milestone = {
      ...milestone,
      id,
      completedAt: null
    };
    this.milestones.set(id, newMilestone);
    return newMilestone;
  }

  async updateMilestone(id: number, data: Partial<Milestone>): Promise<Milestone> {
    const milestone = this.milestones.get(id);
    if (!milestone) {
      throw new Error(`Milestone with id ${id} not found`);
    }
    
    const updatedMilestone = { ...milestone, ...data };
    this.milestones.set(id, updatedMilestone);
    return updatedMilestone;
  }

  async deleteMilestone(id: number): Promise<boolean> {
    return this.milestones.delete(id);
  }

  // Payment operations
  async getPayment(id: number): Promise<Payment | undefined> {
    return this.payments.get(id);
  }

  async getPaymentsByContractId(contractId: number): Promise<Payment[]> {
    return Array.from(this.payments.values())
      .filter(payment => payment.contractId === contractId);
  }
  
  async getPaymentsByMilestoneId(milestoneId: number): Promise<Payment[]> {
    return Array.from(this.payments.values())
      .filter(payment => payment.milestoneId === milestoneId);
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const id = this.paymentId++;
    const newPayment: Payment = {
      ...payment,
      id,
      createdAt: new Date(),
      completedAt: null
    };
    this.payments.set(id, newPayment);
    return newPayment;
  }

  async updatePayment(id: number, data: Partial<Payment>): Promise<Payment> {
    const payment = await this.getPayment(id);
    if (!payment) {
      throw new Error(`Payment with id ${id} not found`);
    }
    
    const updatedPayment = { ...payment, ...data };
    this.payments.set(id, updatedPayment);
    return updatedPayment;
  }

  async updateStripePaymentId(id: number, stripePaymentId: string): Promise<Payment> {
    return this.updatePayment(id, { 
      stripePaymentId,
      status: 'completed',
      completedAt: new Date()
    });
  }

  // Message operations
  async getMessagesByUser(userId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.senderId === userId || message.receiverId === userId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async getMessagesBetweenUsers(user1Id: number, user2Id: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => 
        (message.senderId === user1Id && message.receiverId === user2Id) ||
        (message.senderId === user2Id && message.receiverId === user1Id)
      )
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const id = this.messageId++;
    const newMessage: Message = {
      ...message,
      id,
      createdAt: new Date()
    };
    this.messages.set(id, newMessage);
    return newMessage;
  }

  async markMessageAsRead(id: number): Promise<Message> {
    const message = this.messages.get(id);
    if (!message) {
      throw new Error(`Message with id ${id} not found`);
    }
    
    const updatedMessage = { ...message, status: 'read' as const };
    this.messages.set(id, updatedMessage);
    return updatedMessage;
  }

  async getUnreadMessageCount(userId: number): Promise<number> {
    return Array.from(this.messages.values())
      .filter(message => message.receiverId === userId && message.status === 'unread')
      .length;
  }
}

export const storage = new MemStorage();
