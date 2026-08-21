# AI DebateCoach

A powerful Vanilla JS Single Page Application (SPA) designed to provide AI-driven speech and debate coaching across four user roles: Learners, Coaches, Educators, and Administrators.

## 🚀 Features
- **Learner Portal**: Track improvement trends, get recommended exercises, view AI evaluations, and practice speaking.
- **Coach Portal**: Skill gap analysis, evaluation queue, learner directory, and manual feedback.
- **Educator Portal**: Class analytics, student ranking, assignment management, and debate performance reports.
- **Admin Console**: AI monitoring, system reports, user management.
- **Global Notification System**: Real-time alerts for assignments, coaching feedback, and system announcements.
- **Exports**: Generate and download PDF and Excel reports dynamically.
- **Role-Based Access Control**: Strict client-side route and component guards.

## 🛠️ Architecture
- **Frontend**: HTML5, Vanilla JavaScript, CSS3 (No framework).
- **Backend / Database**: Fully mocked via an interceptor (`db.js`) reading from/writing to `localStorage`.
- **Libraries Used (via CDN)**: Chart.js, jsPDF, SheetJS.

## 💻 Local Development

### Option 1: Python HTTP Server (Recommended)
Since this is a static site, you can serve it with Python:
```bash
python -m http.server 3000
```
Open: [http://localhost:3000](http://localhost:3000)

### Option 2: Node.js / `http-server`
```bash
npx http-server -p 3000
```

## 🐳 Docker Deployment
The application is fully containerized using an Nginx alpine image to serve the static files.

### Build the Image
```bash
docker build -t ai-debatecoach .
```

### Run the Container
```bash
docker run -d -p 8080:80 ai-debatecoach
```
The site will be available at [http://localhost:8080](http://localhost:8080).

## 🔒 Test Accounts
All test accounts share the password: **password123**
- Learner: `sarah@learner.com`
- Coach: `coach.michael@debate.org`
- Educator: `prof.roberts@university.edu`
- Admin: `admin@debatecoach.com`
