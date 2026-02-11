# 🎯 Darji Pro - Enterprise Smart Tailoring Platform

> AI-powered smart tailoring platform with comprehensive backend API, ML recommendations, and modern frontend applications.

![Status](https://img.shields.io/badge/status-active-success.svg)
![Python](https://img.shields.io/badge/python-3.12-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-14.1-black.svg)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [ML Features](#ml-features)
- [Contributing](#contributing)

## 🚧 Project Status

### ✅ Recently Completed
- **Monolith Deployment**: Successfully deployed to Render using a single service architecture (FastAPI serving Next.js static export).
- **Fabric Catalog**: Complete management system for fabrics with Admin UI and backend APIs.
- **Measurements UI**: Redesigned with a premium aesthetic, dark mode support, and improved UX.
- **Notification System**: Implemented backend architecture, database models, and APIs for multi-channel notifications.
- **Booking Wizard**: Enhancing the appointment booking flow with a step-by-step wizard.
- **Notification UI**: integrated notification bell and management interface for users.
- **Admin Dashboard**: Comprehensive analytics and management tools.

### 🚀 Upcoming Features
- **Payment Integration**: Secure payment processing for orders.
- **Customer Chat**: Real-time chat with tailors.

## ✨ Features

### Backend API (FastAPI)
- ✅ **60+ REST API endpoints** with OpenAPI documentation
- ✅ **JWT Authentication** with access & refresh tokens
- ✅ **Role-Based Access Control** (Customer, Tailor, Admin, Staff)
- ✅ **Multi-Branch Management** with tailor availability
- ✅ **Smart Appointment Scheduling** with conflict detection
- ✅ **Measurement Management** with version control
- ✅ **Audit Logging** for all system activities
- ✅ **Rate Limiting** and security middleware

### ML/AI Features
- 🤖 **AI Size Prediction** using Random Forest classifier
- 🔍 **Anomaly Detection** for measurement validation
- ✂️ **Alteration Suggestions** based on fit preferences
- 📊 **Confidence Scoring** for recommendations
- 💾 **Model Persistence** with joblib

### Frontend Applications
- 🎨 **Customer Portal** (Next.js 14 + TypeScript)
- 👔 **Admin Dashboard** (Next.js 14 + TypeScript)
- 🎭 **Beautiful UI** with Framer Motion animations
- 📱 **Responsive Design** with Tailwind CSS

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI 0.109
- **Database**: PostgreSQL 15 (Neon Cloud)
- **ORM**: SQLAlchemy 2.0 (async)
- **Migrations**: Alembic
- **Cache**: Redis
- **Task Queue**: Celery
- **ML**: scikit-learn, pandas, numpy
- **Auth**: python-jose, passlib

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Data Fetching**: React Query
- **Forms**: React Hook Form + Zod

### DevOps
- **Containerization**: Docker & Docker Compose
- **Server**: Uvicorn (ASGI)
- **Testing**: pytest, pytest-asyncio

## 📁 Project Structure

```
darji-pro/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/            # API routes (auth, users, appointments, etc.)
│   │   ├── core/           # Config, security, database
│   │   ├── models/         # SQLAlchemy models (8 models)
│   │   ├── schemas/        # Pydantic schemas (30+ schemas)
│   │   ├── ml/             # ML recommendation engine
│   │   └── db/             # Database utilities
│   ├── alembic/            # Database migrations
│   ├── tests/              # Test suite
│   └── requirements.txt    # Python dependencies
├── frontend/
│   └── customer/           # Customer-facing Next.js app
│       ├── src/
│       │   ├── app/        # App router pages
│       │   ├── components/ # React components
│       │   └── lib/        # Utilities
│       └── package.json
├── docker/                 # Docker configurations
├── docker-compose.yml
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 15+ (or use Neon cloud)
- Redis (optional)

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/darji-pro.git
   cd darji-pro
   ```

2. **Set up Python environment**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Run migrations**
   ```bash
   alembic upgrade head
   # Or use direct table creation:
   python -m app.db.create_tables
   ```

5. **Seed test data (optional)**
   ```bash
   python -m app.db.seed
   ```

6. **Start the server**
   ```bash
   uvicorn app.main:app --reload
   ```

   Server will be available at:
   - API: http://localhost:8000
   - Swagger Docs: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

### Frontend Setup

1. **Install dependencies**
   ```bash
   cd frontend/customer
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env.local
   # Update NEXT_PUBLIC_API_URL if needed
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

   Frontend will be available at http://localhost:3000

### Docker Setup (Alternative)

```bash
docker-compose up -d
```

This will start:
- Backend API (port 8000)
- PostgreSQL (port 5432)
- Redis (port 6379)
- Frontend (port 3000)

## 📚 API Documentation

### Authentication Endpoints

```
POST   /api/auth/register          # Register new user
POST   /api/auth/login             # Login (OAuth2)
POST   /api/auth/login/json        # Login (JSON)
POST   /api/auth/refresh           # Refresh access token
GET    /api/auth/me                # Get current user
POST   /api/auth/logout            # Logout
```

### User Management

```
GET    /api/users/me               # Get own profile
PUT    /api/users/me               # Update own profile
GET    /api/users                  # List users (Admin/Staff)
GET    /api/users/{id}             # Get user by ID
PUT    /api/users/{id}             # Update user (Admin)
DELETE /api/users/{id}             # Delete user (Admin)
```

### Appointments

```
POST   /api/appointments           # Create appointment
GET    /api/appointments           # List appointments
GET    /api/appointments/{id}      # Get appointment
PUT    /api/appointments/{id}      # Update appointment
PATCH  /api/appointments/{id}/status  # Update status
POST   /api/appointments/{id}/reschedule  # Reschedule
POST   /api/appointments/{id}/cancel     # Cancel
```

### ML Recommendations

```
POST   /api/ml/predict-size        # Predict clothing size
POST   /api/ml/detect-anomalies    # Detect measurement errors
POST   /api/ml/suggest-alterations # Get alteration suggestions
POST   /api/ml/fit-recommendation  # Complete fit analysis
GET    /api/ml/health              # ML service health
```

**Full API documentation**: http://localhost:8000/docs

## 🤖 ML Features

### Size Prediction
Uses Random Forest classifier to predict clothing sizes based on body measurements.

```python
# Example request
POST /api/ml/predict-size
{
  "chest": 100,
  "waist": 85,
  "hip": 95,
  "shoulder": 45,
  "arm_length": 60
}

# Response
{
  "predicted_size": "L",
  "confidence": 0.87
}
```

### Anomaly Detection
Identifies unusual measurements that may indicate data entry errors.

```python
# Detects if measurements are outside normal ranges
# or have unusual proportions
```

### Fit Recommendations
Provides personalized alteration suggestions based on:
- Body measurements
- Fit preference (Slim/Regular/Loose)
- Historical order data

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
pytest --cov=app tests/  # With coverage
```

### Frontend Tests
```bash
cd frontend/customer
npm test
```

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting (SlowAPI)
- CORS protection
- Input validation (Pydantic)
- SQL injection prevention (SQLAlchemy ORM)
- XSS protection

## 📊 Database Models

1. **User** - Multi-role user management
2. **Branch** - Multi-location support
3. **TailorAvailability** - Working hours & scheduling
4. **Appointment** - Booking management
5. **MeasurementProfile** - Customer measurements
6. **MeasurementVersion** - Version history
7. **AuditLog** - Activity tracking
8. **Notification** - Multi-channel notifications

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- FastAPI for the amazing framework
- Next.js team for the excellent React framework
- scikit-learn for ML capabilities

## 📞 Support

For support, email support@darjipro.com or open an issue.

---

**Built with ❤️ using FastAPI, Next.js, and AI**
