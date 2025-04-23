**🚀 Stripe Subscription Backend (Express.js)**

This backend repo enables subscription-based payments using Stripe Checkout Sessions. It securely integrates Stripe with JWT-based authentication and provides an API endpoint for creating subscription sessions.

project-root/
├── controllers/
│   └── stripeController.js      # Core logic for Stripe subscription
├── middlewares/
│   └── auth.js                  # JWT token verification
├── models/
│   └── user.model.js            # Mongoose User schema
├── routes/
│   └── stripe.js                # Stripe API route
├── utils/
│   └── asyncHandler.js          # Error-handling middleware
├── .env                         # Environment variables
└── server.js                    # Entry point (Express app)


🧪 Requirements
Node.js v16+

MongoDB

Stripe account

⚙️ Installation & Setup
1. Clone the Repository
    git clone https://github.com/your-username/your-repo.git
    cd your-repo
2. Install Dependencies

    npm install
    
3. Environment Variables

    Create a .env file:

PORT=8000
MONGO_URI=your_mongodb_connection_string
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your_jwt_secret

4. Run the Server

    npm run dev

📡 API Endpoints

🧑‍💼 Authentication & User

Method | Endpoint | Description | Auth Required
POST | /api/register | Register a new user | ❌
POST | /api/login | Login and receive JWT token | ❌
GET | /api/auth-me | Get currently logged-in user | ✅


