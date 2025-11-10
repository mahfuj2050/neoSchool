# School Information Management System (SIMS)

A comprehensive web-based School Information Management System built with React, TypeScript, Vite, Spring Boot, and MySQL. This application helps schools manage student information, staff records, academic progress, and administrative tasks efficiently.

## Features

- **Student Management**: Track student information, attendance, and academic records
- **Staff Management**: Manage teacher and staff details, subjects, and class assignments
- **Course Management**: Create and manage courses, subjects, and class schedules
- **Gradebook**: Record and track student grades and academic performance
- **Attendance Tracking**: Monitor and report on student and staff attendance
- **User Authentication**: Secure login with role-based access control
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, React Router, Axios
- **Backend**: Spring Boot, Spring Security, JPA
- **Database**: MySQL
- **Build Tools**: Maven, npm/yarn

## Prerequisites

- Node.js (v16 or higher)
- Java JDK 17 or higher
- MySQL Server 8.0 or higher
- Maven 3.8.1 or higher

## Getting Started

### Backend Setup

1. Clone the repository
2. Navigate to the backend directory: `cd ../backend`
3. Update the database configuration in `src/main/resources/application.properties`
4. Build the project: `mvn clean install`
5. Run the application: `mvn spring-boot:run`

### Frontend Setup

1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install` or `yarn install`
3. Start the development server: `npm run dev` or `yarn dev`
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

Create a `.env` file in the frontend directory with the following variables:

```
VITE_API_BASE_URL=http://localhost:8080/api
```

## Available Scripts

- `npm run dev` or `yarn dev`: Start the development server
- `npm run build` or `yarn build`: Build for production
- `npm run preview` or `yarn preview`: Preview the production build
- `npm run lint` or `yarn lint`: Run ESLint

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team.
