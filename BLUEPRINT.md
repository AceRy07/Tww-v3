📄 MASTER BLUEPRINT: The West Wing - Modern Furniture Catalog
1. Project Overview
Brand Name: The West Wing

Concept: Minimalist, high-end furniture catalog specializing in modern aesthetics and durable materials (e.g., 12mm compact laminate).

Primary Goal: To showcase products with a premium feel, provide advanced filtering, and capture leads via a custom "Inquiry" system instead of direct checkout.

2. Tech Stack
Framework: Next.js 15 (App Router)

Language: TypeScript

Styling: Tailwind CSS + Framer Motion (for micro-interactions)

UI Components: Shadcn UI + Lucide Icons

Smooth Scroll: @studio-freight/react-lenis (Lenis)

Form/Email: React Hook Form + Zod + Resend (to receive inquiries via email)

State Management: URL Search Params (for a shareable and SEO-friendly filtering state)

3. Folder Structure
Plaintext
/src
  /app
    /catalog
      page.tsx        # Main catalog page with filtering and grid
    /product/[slug]
      page.tsx        # Product details and dynamic inquiry form
    /contact
      page.tsx        # General contact info and lead form
    layout.tsx        # Root layout with Lenis Smooth Scroll Provider
    page.tsx          # Landing page (Hero section + Featured products)
  /components
    /layout
      Navbar.tsx      # Transparent-to-Solid glassmorphism header
      Footer.tsx
      SmoothScroll.tsx # Lenis configuration wrapper
    /catalog
      FilterBar.tsx   # Sidebar or Drawer with Category, Price, and Size filters
      ProductCard.tsx # Elegant card with hover-reveal effects
      SearchInput.tsx # Debounced search functionality
    /forms
      InquiryForm.tsx # Lead generation form integrated with Resend
  /lib
    data.ts           # Local DB/Mock data (Title, Price, Dims, Material, Color, Images)
    utils.ts
4. Core Features & Logic
A. Lenis Smooth Scroll Integration
A dedicated SmoothScroll.tsx component will wrap the children in layout.tsx.

Configuration: lerp: 0.1, duration: 1.2 for a silky, premium browsing experience typical of high-end design brands.

B. Extended Filtering System
The catalog logic will utilize URL parameters to ensure users can share filtered results:

Search: Instant filtering by product title.

Categories: Multi-select for categories (Tables, Coffee Tables, Stools, etc.).

Dimensions: Specific filters for Width, Height, and Depth (crucial for furniture).

Price Range: A dual-range slider for budget filtering.

Color/Finish: Visual color swatches (Anthracite, Oak, Matte Black).

C. Product Inquiry System (Lead Gen)
Since this is a catalog-first site:

Contextual Inquiries: Every product page features a "Request a Quote" button.

Automated Metadata: The form automatically captures the Product Name and SKU.

User Inputs: Name, Email, Requested Dimensions, and Custom Message.

Resend Integration: Submitting the form sends a beautifully formatted HTML email to the owner, containing the user's request and the specific product link.

5. UI/UX Design Guidelines
Color Palette: Pure White (#FFFFFF), Deep Charcoal (#1A1A1A), and subtle slate accents.

Typography: Modern Sans-Serif (Geist, Inter, or Montserrat).

Animations:

Scroll Reveal: Components should fade and slide upward as they enter the viewport.

Image Hover: Subtle scale-up with an overlay showing "View Details."

Responsiveness: Filters will transform into a "Bottom Drawer" on mobile devices for better thumb-reach.

6. Setup Instructions
Initialize the project: npx create-next-app@latest .

Install dependencies: npm install @studio-freight/react-lenis framer-motion resend lucide-react

Add Shadcn UI components: button, input, drawer, card, accordion, slider, toast.

Populate src/lib/data.ts with your initial furniture collection.

Setup Resend API key in .env.local to handle form submissions.