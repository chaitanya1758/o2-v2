# OpenObserve Query Assistant

A React-based frontend application for the OpenObserve Query Assistant, built with Tachyons CSS framework. This application provides an intuitive interface for generating and managing SQL queries for OpenObserve.

## Features

### 🎯 Core Functionality
- **Smart Query Generation**: AI-powered SQL query generation based on natural language input
- **Environment Management**: Support for multiple environments (Production/Staging)
- **Index Selection**: Dynamic index/stream selection based on environment
- **Real-time Chat Interface**: Interactive chat-based query assistance

### 💾 Query Management
- **Saved Queries**: Store and manage frequently used queries
- **Quick Access**: One-click execution of saved queries
- **Query History**: Browse previous queries and results
- **Export/Copy**: Easy copying of generated SQL queries

### 🎨 User Interface
- **Modern Design**: Clean, professional interface built with Tachyons
- **Responsive Layout**: Works seamlessly on desktop and mobile
- **Dark Code Editor**: Syntax-highlighted SQL and VRL display
- **Interactive Elements**: Hover effects, smooth transitions

### 🔧 Advanced Features
- **VRL Support**: Vector Remapping Language query generation
- **Query Confidence**: Confidence badges for generated queries
- **Error Handling**: Graceful error states and user feedback
- **Toast Notifications**: Real-time feedback for user actions

## Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Styling**: Tachyons CSS framework
- **Icons**: Lucide React
- **Build Tool**: Create React App
- **Package Manager**: npm

## Project Structure

```
src/
├── components/           # React components
│   ├── QueryAssistant.tsx    # Main application component
│   ├── Sidebar.tsx           # Left sidebar with navigation
│   ├── MainContent.tsx       # Main chat area
│   ├── ChatMessage.tsx       # Individual chat messages
│   ├── QueryResult.tsx       # SQL query results display
│   └── Toast.tsx             # Notification component
├── data/                # Mock data and utilities
│   └── mockData.ts          # Sample data for development
├── types.ts             # TypeScript type definitions
├── App.tsx             # Root application component
└── App.css             # Custom styles and Tachyons imports
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Navigate to the project directory**
   ```bash
   cd /path/to/o2-v2/open-observe
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
