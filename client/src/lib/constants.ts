// Trade enum for consistency across client and server
export const tradeEnum = {
  name: "trade_type",
  enumValues: {
    carpentry: "Carpentry",
    electrical: "Electrical",
    plumbing: "Plumbing",
    painting: "Painting",
    roofing: "Roofing",
    landscaping: "Landscaping",
    masonry: "Masonry",
    flooring: "Flooring", 
    hvac: "HVAC",
    general_contractor: "General Contractor",
    other: "Other"
  }
};

// Array of trade options for select dropdowns
export const TRADES = [
  { value: "carpentry", label: "Carpentry" },
  { value: "electrical", label: "Electrical" },
  { value: "plumbing", label: "Plumbing" },
  { value: "painting", label: "Painting" },
  { value: "roofing", label: "Roofing" },
  { value: "landscaping", label: "Landscaping" },
  { value: "masonry", label: "Masonry" },
  { value: "flooring", label: "Flooring" },
  { value: "hvac", label: "HVAC" },
  { value: "general_contractor", label: "General Contractor" },
  { value: "other", label: "Other" },
];

// Stock images for use in components
export const STOCK_IMAGES = {
  hero: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2574&auto=format&fit=crop",
  tradesman1: "https://images.unsplash.com/photo-1570649243616-da99c0e4d1a0?q=80&w=2000&auto=format&fit=crop",
  tradesman2: "https://images.unsplash.com/photo-1512314889357-e157c22f938d?q=80&w=2000&auto=format&fit=crop",
  tradesman3: "https://images.unsplash.com/photo-1574359411659-15573ec9f27d?q=80&w=2000&auto=format&fit=crop",
  project1: "https://images.unsplash.com/photo-1581141849291-85d4d3aea042?q=80&w=2000&auto=format&fit=crop",
  project2: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2000&auto=format&fit=crop",
  project3: "https://images.unsplash.com/photo-1510137372525-c23c3ff89c80?q=80&w=2000&auto=format&fit=crop",
  howItWorks1: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2000&auto=format&fit=crop",
  howItWorks2: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=2000&auto=format&fit=crop", 
  howItWorks3: "https://images.unsplash.com/photo-1521459382675-a3f3b234cc58?q=80&w=2000&auto=format&fit=crop",
  tradeCarpentry: "https://images.unsplash.com/photo-1594818379496-da1e345b0ded?q=80&w=2000&auto=format&fit=crop",
  tradeElectrical: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?q=80&w=2000&auto=format&fit=crop",
  tradePlumbing: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?q=80&w=2000&auto=format&fit=crop",
  tradePainting: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=2000&auto=format&fit=crop",
  tradeRoofing: "https://images.unsplash.com/photo-1607537698449-e82b5f29d333?q=80&w=2000&auto=format&fit=crop",
  tradeLandscaping: "https://images.unsplash.com/photo-1600698479098-5c93bbc05673?q=80&w=2000&auto=format&fit=crop",
  defaultUser: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=387&auto=format&fit=crop",
  
  // Organized by category for component use
  tradesmen: [
    "https://images.unsplash.com/photo-1594818379496-da1e345b0ded?q=80&w=2000&auto=format&fit=crop", // carpentry
    "https://images.unsplash.com/photo-1621905251918-48416bd8575a?q=80&w=2000&auto=format&fit=crop", // electrical
    "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?q=80&w=2000&auto=format&fit=crop", // plumbing
    "https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=2000&auto=format&fit=crop", // painting
    "https://images.unsplash.com/photo-1607537698449-e82b5f29d333?q=80&w=2000&auto=format&fit=crop", // roofing
    "https://images.unsplash.com/photo-1600698479098-5c93bbc05673?q=80&w=2000&auto=format&fit=crop"  // landscaping
  ],
  projects: [
    "https://images.unsplash.com/photo-1581141849291-85d4d3aea042?q=80&w=2000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1510137372525-c23c3ff89c80?q=80&w=2000&auto=format&fit=crop"
  ],
  construction: [
    "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?q=80&w=2000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2000&auto=format&fit=crop"
  ]
};

// Validation patterns
export const VALIDATION_PATTERNS = {
  phone: /^(\+?1\s?)?(\(\d{3}\)|\d{3})[\s.-]?\d{3}[\s.-]?\d{4}$/,
  email: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  url: /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  zipcode: /^\d{5}(-\d{4})?$/,
};

// SEO descriptions for pages
export const SEO_DESCRIPTIONS = {
  home: "Find skilled tradesmen in Trinidad and Tobago for your home improvement and construction projects. Connect with verified professionals for quality workmanship.",
  search: "Search for skilled tradesmen in Trinidad and Tobago by trade, location, or specialty. Find the perfect professional for your project.",
  profiles: "View detailed tradesman profiles with portfolios, reviews, and qualifications. Make informed decisions when hiring professionals.",
  contracts: "Manage your project contracts securely online. Create agreements, track progress, and process payments all in one place.",
  payments: "Secure payment processing for construction and home improvement projects in Trinidad and Tobago. Pay with confidence using our escrow payment system."
};

// Contract status enum
export const contractStatusEnum = {
  name: "contract_status",
  enumValues: {
    draft: "Draft",
    sent: "Sent",
    signed: "Signed",
    completed: "Completed",
    cancelled: "Cancelled"
  }
};

// Payment status enum
export const paymentStatusEnum = {
  name: "payment_status",
  enumValues: {
    pending: "Pending",
    processing: "Processing",
    completed: "Completed",
    failed: "Failed"
  }
};

// API Routes for frontend usage
export const API_ROUTES = {
  AUTH: {
    REGISTER: "/api/register",
    LOGIN: "/api/login",
    LOGOUT: "/api/logout",
    ME: "/api/me",
  },
  USERS: {
    UPDATE: (id: number) => `/api/users/${id}`,
    GET: (id: number) => `/api/users/${id}`,
  },
  TRADESMAN_PROFILES: {
    CREATE: "/api/tradesman-profiles",
    UPDATE: (id: number) => `/api/tradesman-profiles/${id}`,
    GET: (id: number) => `/api/tradesman-profiles/${id}`,
    SEARCH: "/api/tradesman-profiles",
  },
  PROJECTS: {
    CREATE: "/api/projects",
    UPDATE: (id: number) => `/api/projects/${id}`,
    GET: (id: number) => `/api/projects/${id}`,
    DELETE: (id: number) => `/api/projects/${id}`,
    FEATURED: "/api/featured-projects",
  },
  PROJECT_IMAGES: {
    UPLOAD: "/api/project-images",
    DELETE: (id: number) => `/api/project-images/${id}`,
    SET_MAIN: (projectId: number, imageId: number) => 
      `/api/projects/${projectId}/set-main-image/${imageId}`,
  },
  REVIEWS: {
    CREATE: "/api/reviews",
    GET_BY_TRADESMAN: (tradesmanId: number) => `/api/tradesman/${tradesmanId}/reviews`,
    DELETE: (id: number) => `/api/reviews/${id}`,
  },
  CONTRACTS: {
    CREATE: "/api/contracts",
    UPDATE: (id: number) => `/api/contracts/${id}`,
    GET: (id: number) => `/api/contracts/${id}`,
    DELETE: (id: number) => `/api/contracts/${id}`,
    CLIENT: (clientId: number) => `/api/client/${clientId}/contracts`,
    TRADESMAN: (tradesmanId: number) => `/api/tradesman/${tradesmanId}/contracts`,
  },
  MILESTONES: {
    CREATE: "/api/milestones",
    UPDATE: (id: number) => `/api/milestones/${id}`,
    GET_BY_CONTRACT: (contractId: number) => `/api/contracts/${contractId}/milestones`,
    DELETE: (id: number) => `/api/milestones/${id}`,
  },
  PAYMENTS: {
    CREATE_INTENT: "/api/create-payment-intent",
    PROCESS_WIPAY: "/api/payments/process-wipay",
    PAYMENT_STATUS: (id: number) => `/api/payment-status/${id}`,
    COMPLETE: "/api/payment-complete",
    GET_PAYMENT: (id: number) => `/api/payments/${id}`,
    CLIENT_PAYMENTS: (clientId: number) => `/api/client/${clientId}/payments`,
    TRADESMAN_PAYMENTS: (tradesmanId: number) => `/api/tradesman/${tradesmanId}/payments`,
  },
  MESSAGES: {
    SEND: "/api/messages",
    GET: "/api/messages",
    MARK_READ: (id: number) => `/api/messages/${id}/read`,
    BETWEEN_USERS: (otherUserId: number) => `/api/messages/with/${otherUserId}`,
    UNREAD_COUNT: "/api/messages/unread-count",
  },
};

// Frontend page routes
export const PAGE_ROUTES = {
  HOME: "/",
  REGISTER: "/register",
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
  EDIT_PROFILE: "/edit-profile",
  TRADESMAN_PROFILE: (id: number) => `/tradesman/${id}`,
  PROJECT: (id: number) => `/project/${id}`,
  CREATE_PROJECT: "/create-project",
  EDIT_PROJECT: (id: number) => `/edit-project/${id}`,
  SEARCH: "/search",
  CONTRACTS: "/contracts",
  CONTRACT: (id: number) => `/contracts/${id}`,
  CREATE_CONTRACT: "/create-contract",
  MESSAGES: "/messages",
  PAYMENTS: "/payments",
  PAYMENT_STATUS: "/payment-status",
  CHECKOUT: (id: number) => `/checkout/${id}`,
};

// Milestone status enum
export const milestoneStatusEnum = {
  name: "milestone_status",
  enumValues: {
    pending: "Pending",
    completed: "Completed",
    paid: "Paid"
  }
};

// Message status enum
export const messageStatusEnum = {
  name: "message_status",
  enumValues: {
    unread: "Unread",
    read: "Read"
  }
};

// Deprecated routes - keeping for backward compatibility
// Use the API_ROUTES and PAGE_ROUTES declared above instead

// Site configuration
export const SITE_CONFIG = {
  NAME: "TnT Tradesmen",
  DESCRIPTION: "Find skilled tradesmen in Trinidad and Tobago",
  SUPPORT_EMAIL: "support@tnttradesmen.com",
  MAX_UPLOAD_SIZE_MB: 5,
  CURRENCY: "TTD",
  CURRENCY_SYMBOL: "$"
};