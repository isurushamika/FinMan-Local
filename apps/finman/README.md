# FinMan - Financial Management System

A modern, full-stack web application for managing personal finances with income/expense tracking, budgeting, recurring transactions, trend analysis, and beautiful data visualizations.

## 🌟 Features

### Frontend
- 📊 **Dashboard** - Overview of your financial status with beautiful charts
- 💰 **Income & Expense Tracking** - Record all your transactions
- 📷 **Receipt Upload** - Attach receipt images to expense records
- 📈 **Trend Analysis** - View spending patterns over time
- � **Budget Management** - Set and track budgets by category
- 🔄 **Recurring Transactions** - Auto-generate recurring income/expenses
- 🔍 **Advanced Search** - Filter transactions by type, category, account, and date
- 📤 **Data Export/Import** - Export to CSV/JSON and import data
- 🏦 **Account Selection** - Track transactions across multiple accounts
- �📱 **Responsive Design** - Works perfectly on desktop and mobile
- � **Dark Mode Support** - Easy on the eyes

### Backend
- � **User Authentication** - JWT-based secure authentication
- 🗄️ **PostgreSQL Database** - Robust data storage with Prisma ORM
- 📁 **File Storage** - Server-side receipt image storage (up to 5MB per file)
- 🔒 **Security** - Helmet, CORS, rate limiting, password hashing
- ⚡ **Fast API** - Express.js RESTful API
- 📊 **Statistics** - Real-time financial statistics and analytics
- 🔄 **Automatic Processing** - Process recurring transactions automatically

## 🚀 Quick Start

### Frontend

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open `http://localhost:5173` in your browser

### Backend

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Setup PostgreSQL database (see `backend/QUICKSTART.md`)

4. Run database migrations:
```bash
npx prisma migrate dev --name init
```

5. Start the backend server:
```bash
npm run dev
```

6. Backend runs on `http://localhost:3000`

## 📚 Documentation

- **[Backend Quick Start](backend/QUICKSTART.md)** - Get the backend running quickly
- **[API Documentation](backend/docs/API.md)** - Complete API reference
- **[Deployment Guide](DEPLOYMENT_GUIDE.md)** - Deploy to Ubuntu server
- **[Features Overview](FEATURES.md)** - Detailed feature descriptions
- **[UI Updates](UI_UPDATES.md)** - UI design system and components

## 🏗️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS
- **Chart.js** - Beautiful data visualizations
- **Lucide React** - Modern icon library
- **date-fns** - Date manipulation

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **PostgreSQL** - Database
- **Prisma** - Type-safe ORM
- **JWT** - Authentication
- **Multer** - File uploads
- **Bcrypt** - Password hashing
- **Helmet** - Security headers

## 📁 Project Structure

```
financial/
├── src/                    # Frontend source
│   ├── components/         # React components
│   ├── types/              # TypeScript types
│   └── utils/              # Utilities
├── backend/                # Backend source
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Business logic
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Middleware
│   │   └── server.ts       # Entry point
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   └── docs/               # API documentation
├── public/                 # Static assets
└── dist/                   # Production build
```

## 🔐 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://finman:password@localhost:5432/finman
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
CORS_ORIGIN=http://localhost:5173
```

## 🔧 Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend
- `npm run dev` - Start development server with auto-reload
- `npm run build` - Build TypeScript
- `npm start` - Start production server
- `npx prisma studio` - Open database GUI
- `npx prisma migrate dev` - Run migrations

## 🎯 Key Features Explained

### Budget Management
Set monthly or yearly budgets for each spending category. Visual progress bars show spending vs. budget with color-coded warnings (green < 70%, yellow < 90%, red ≥ 90%).

### Recurring Transactions
Create recurring income or expenses (daily, weekly, monthly, yearly). The system automatically generates transactions when due.

### Receipt Storage
Upload receipt images with expenses. Images are stored on the server filesystem (not Base64 in database) for better performance and unlimited capacity.

### Advanced Search & Filtering
Filter transactions by:
- Type (income/expense)
- Category
- Account
- Date range
- Search description

### Data Export/Import
- Export transactions to CSV or JSON
- Import data from JSON backups
- Preserve all transaction data including receipts

## 🚀 Deployment

For production deployment to an Ubuntu server:

1. Follow the complete guide in **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)**
2. Includes:
   - PostgreSQL setup
   - Nginx configuration
   - SSL with Let's Encrypt
   - PM2 process management
   - Domain configuration

## 🔒 Security

- JWT authentication with secure token storage
- Password hashing with bcrypt (10 rounds)
- Helmet.js security headers
- CORS protection
- Rate limiting (100 requests/15 min)
- File upload validation (type and size)
- SQL injection prevention (Prisma ORM)
- XSS protection

## 📊 Database Schema

- **Users** - User accounts with authentication
- **Transactions** - Income/expense records with receipts
- **Budgets** - Budget limits by category
- **RecurringTransactions** - Recurring transaction templates

See `backend/prisma/schema.prisma` for complete schema.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

MIT

## 🆘 Support

For issues and questions:
- Check documentation in `/backend/docs/`
- Review `DEPLOYMENT_GUIDE.md` for deployment issues
- See `backend/QUICKSTART.md` for setup help

---

**Made with ❤️ for better financial management**
