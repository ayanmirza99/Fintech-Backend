**🚀 Stripe Subscription Backend (Express.js)**

This backend repo enables subscription-based payments using Stripe Checkout Sessions. It securely integrates Stripe with JWT-based authentication and provides an API endpoint for creating subscription sessions.
```
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
```

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
```
Method | Endpoint | Description | Auth Required
POST | /api/v1/users/register | Register a new user | ❌
POST | /api/v1/users/login | Login and receive JWT token | ❌
GET | /api/v1/users/auth-me | Get currently logged-in user | ✅

```

💳 Subscription

```
Method	Endpoint	Description	Auth Required
POST	/api/v1/users/subscription	Create subscription	✅



```

💰 Financial Operations
```
Method	Endpoint	Description	Auth Required

GET	/api/v1/fintechbalance	Get current user balance	✅
POST	/api/v1/fintechtransfer	Transfer funds to another account	✅
GET	/api/v1/fintechtransactions	Get transaction history	✅
GET	/api/v1/fintechinvoice	Generate and download invoice PDF	✅
```


🔐 Admin API Endpoints

All admin routes are protected by verifyJwt and isAdmin middleware.

```
Method | Endpoint | Description
GET | /api/v1/admin/users | Get all registered users.
POST | /api/v1/admin/subscriptions/cancel | Cancel a user's subscription.
GET | /api/v1/admin/logs | Retrieve system logs.
GET | /api/v1/admin/recentSignUps | Get recently registered users.
GET | /api/v1/admin/subscription-distribution | Get subscription plan analytics.

```
