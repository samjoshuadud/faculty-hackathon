### Faculty Profile Management System

A centralized platform that enables CCIS faculty to manage their academic profiles and allows administrators to oversee faculty records for CHED compliance and the promotion of institutional excellence.

#### Features
* **User Authentication**: Secure login for faculty and administrators using Google Accounts with `NextAuth`/route.tsx].
* **Profile Management**: Faculty can manage their education, experience, and certifications through a dedicated profile page.
* **Automated Data Extraction**: The system uses `pdfjs-dist`, `Tesseract.js`, and the `GoogleGenerativeAI` API to scan resumes and certifications to auto-fill profile information.
* **Role-Based Access**: The application distinguishes between `faculty` and `admin` users, providing different dashboard views and functionalities.

#### Tech Stack
* **Frontend**: Next.js, React.js, TypeScript
* **Styling**: Tailwind CSS
* **Authentication**: Next-Auth.js with Google Provider/route.tsx]
* **Database**: MongoDB with Mongoose
* **AI/Utility**: `@google/generative-ai`, `tesseract.js`, `pdfjs-dist`, `jspdf`

#### Getting Started

**Prerequisites**
* Node.js (LTS version)
* npm or another package manager (yarn, pnpm, bun)
* A MongoDB instance (local or cloud-based)
* A Google Cloud project with OAuth credentials and Generative AI API key

**Installation**
1.  Clone the repository:
    ```bash
    git clone [https://github.com/samjoshuadud/faculty-hackathon.git](https://github.com/samjoshuadud/faculty-hackathon.git)
    cd faculty-hackathon
    ```
2.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    # or
    bun install
    ```
3.  Create a `.env.local` file in the root directory and add your environment variables:
    ```
    # MongoDB Connection String
    DATABASE_URL=mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/<database>?retryWrites=true&w=majority
    
    # Next-Auth Configuration
    NEXTAUTH_URL=http://localhost:3000
    NEXTAUTH_SECRET=your_nextauth_secret
    
    # Google OAuth Credentials
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret
    
    # Google Generative AI API Key
    NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
    ```
4.  Run the development server:
    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    # or
    bun dev
    ```
5.  Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

#### Deployment
The easiest way to deploy a Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme). For more details, refer to the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).
