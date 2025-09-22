# 🚛 Freight CRM Frontend

> A modern, responsive web application for freight management and document conversion built with React, TypeScript, and Supabase.

[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.3+-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.1+-06B6D4.svg)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth-3ECF8E.svg)](https://supabase.com/)

## ✨ Features

### 🔐 Authentication

- **Secure Login/Logout** - Powered by Supabase Auth
- **Session Management** - Automatic session handling and route protection
- **User-friendly Interface** - Clean, intuitive login form with error handling

### 📄 Document Management

- **PDF Upload** - Drag & drop or click to upload multiple PDF files
- **Format Conversion** - Convert PDFs to DOCX, PNG, JPG, or TXT
- **Batch Processing** - Handle multiple files simultaneously (minimum 3 files)
- **Real-time Validation** - Instant feedback on file types and requirements
- **Progress Tracking** - Visual indicators for upload status and requirements

### 🎨 User Experience

- **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **Modern UI/UX** - Built with Tailwind CSS for a polished look
- **Interactive Elements** - Smooth animations and hover effects
- **File Management** - Easy file selection, preview, and removal

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+
- **npm** or **yarn**
- **Supabase Project** with authentication enabled

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/feight_crm_front.git
   cd feight_crm_front
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**

   ```bash
   cp .env.example .env
   ```

   Update `.env` with your Supabase credentials:

   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 🏗️ Tech Stack

| Technology       | Purpose        | Version |
| ---------------- | -------------- | ------- |
| **React**        | UI Framework   | 19.1.0  |
| **TypeScript**   | Type Safety    | 5.8.3   |
| **Vite**         | Build Tool     | 6.3.5   |
| **Tailwind CSS** | Styling        | 4.1.8   |
| **Supabase**     | Backend & Auth | 2.49.8  |
| **React Router** | Navigation     | 7.6.1   |
| **ESLint**       | Code Linting   | 9.25.0  |

## 📁 Project Structure

```
feight_crm_front/
├── 📁 src/
│   ├── 📁 pages/
│   │   ├── 📄 login.tsx          # Authentication page
│   │   └── 📄 main.tsx           # Main application page
│   ├── 📄 App.tsx                # Root component with routing
│   ├── 📄 main.tsx               # Application entry point
│   ├── 📄 index.css              # Global styles
│   └── 📄 vite-env.d.ts          # Vite type definitions
├── 📄 supabaseClient.ts          # Supabase configuration
├── 📄 package.json               # Dependencies and scripts
├── 📄 vite.config.ts             # Vite configuration
├── 📄 tailwind.config.js         # Tailwind CSS configuration
├── 📄 tsconfig.json              # TypeScript configuration
└── 📄 README.md                  # Project documentation
```

## 🛠️ Available Scripts

| Script            | Description                              |
| ----------------- | ---------------------------------------- |
| `npm run dev`     | Start development server with hot reload |
| `npm run build`   | Build production-ready application       |
| `npm run preview` | Preview production build locally         |
| `npm run lint`    | Run ESLint for code quality checks       |

## 🔧 Configuration

### TypeScript

The project uses strict TypeScript configuration with:

- ✅ Strict type checking
- ✅ Unused variable detection
- ✅ ESNext module support
- ✅ React JSX support

### ESLint

Configured with:

- ✅ React Hooks rules
- ✅ React Refresh plugin
- ✅ TypeScript ESLint integration
- ✅ Browser globals

### Tailwind CSS

- ✅ Latest v4 with Vite plugin
- ✅ Responsive design utilities
- ✅ Custom component styling

## 🔐 Authentication Flow

1. **Login Page** (`/`) - Users enter credentials
2. **Session Check** - Supabase validates authentication
3. **Protected Routes** - Authenticated users access main features
4. **Auto Redirect** - Unauthenticated users redirected to login

## 📱 Features Overview

### Main Dashboard

- **File Upload Zone** - Drag & drop interface for PDF files
- **Format Selection** - Choose output format (DOCX, PNG, JPG, TXT)
- **File Management** - View, organize, and remove uploaded files
- **Batch Processing** - Submit multiple files for conversion
- **Status Indicators** - Real-time feedback on requirements

### Security

- **Environment Variables** - Secure credential management
- **Route Protection** - Authenticated access to main features
- **Session Management** - Automatic logout and session handling

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

This creates a `dist/` folder with optimized production files.

### Deploy to Vercel (Recommended)

```bash
npm install -g vercel
vercel --prod
```

### Deploy to Netlify

```bash
npm run build
# Upload dist/ folder to Netlify
```

## 🧪 Development

### Code Quality

- **TypeScript** for type safety
- **ESLint** for code consistency
- **Prettier** for code formatting (recommended)
- **Strict mode** for React development

### Best Practices

- ✅ Component composition over inheritance
- ✅ Custom hooks for reusable logic
- ✅ Environment-based configuration
- ✅ Responsive design patterns
- ✅ Accessibility considerations

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues** - [GitHub Issues](https://github.com/yourusername/feight_crm_front/issues)
- **Documentation** - [Project Wiki](https://github.com/yourusername/feight_crm_front/wiki)
- **Email** - your.email@example.com

## 🙏 Acknowledgments

- **React Team** for the amazing framework
- **Vite Team** for the lightning-fast build tool
- **Supabase** for the excellent backend-as-a-service
- **Tailwind CSS** for the utility-first CSS framework

---

<div align="center">
  <strong>Built with ❤️ using modern web technologies</strong>
</div>
