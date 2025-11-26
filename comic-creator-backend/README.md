# Comic Creator Backend

Spring Boot 3 backend API for the Comic Creator Web Application.

## 🛠️ Technology Stack

- **Java 17**
- **Spring Boot 3.2**
- **Spring Security** with JWT authentication
- **Spring Data JPA** with MySQL 8.0
- **Redis** for caching (optional)
- **Lombok** for boilerplate reduction
- **SpringDoc OpenAPI** for API documentation

## 🚀 Quick Start

### Prerequisites

- Java 17+
- Maven 3.9+
- Docker & Docker Compose

### 1. Start Infrastructure

```bash
# Start MySQL and Redis
docker-compose up -d mysql redis

# (Optional) Start phpMyAdmin for database management
docker-compose up -d phpmyadmin
# Access at http://localhost:8081
```

### 2. Run Application

```bash
# Run with Maven
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# Or on Windows
mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=dev
```

### 3. Access API

- **API Base URL**: http://localhost:8080/api
- **Health Check**: http://localhost:8080/api/health
- **Swagger UI**: http://localhost:8080/api/swagger-ui.html

## 📁 Project Structure

```
src/main/java/com/comicstudio/
├── ComicStudioApplication.java    # Main entry point
├── config/                         # Configuration classes
│   ├── CorsConfig.java
│   ├── JwtConfig.java
│   ├── OpenApiConfig.java
│   └── SecurityConfig.java
├── controller/                     # REST controllers
│   ├── AuthController.java
│   ├── SeriesController.java
│   ├── EpisodeController.java
│   ├── PanelController.java
│   ├── TextController.java
│   ├── AIController.java
│   ├── CreditController.java
│   └── HealthController.java
├── service/                        # Business logic
│   ├── AuthService.java
│   ├── SeriesService.java
│   ├── EpisodeService.java
│   ├── AIService.java
│   └── CreditService.java
├── repository/                     # Data access layer
├── model/
│   ├── entity/                     # JPA entities
│   └── dto/                        # Data transfer objects
├── security/                       # JWT & Security
│   ├── JwtTokenProvider.java
│   ├── JwtAuthenticationFilter.java
│   ├── UserDetailsServiceImpl.java
│   └── SecurityUtils.java
└── exception/                      # Exception handling
    ├── GlobalExceptionHandler.java
    └── Custom exceptions...
```

## 🔗 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login |
| POST | `/auth/refresh` | Refresh token |
| POST | `/auth/logout` | Logout |

### Series
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/series` | Get all user's series |
| GET | `/series/{id}` | Get series by ID |
| POST | `/series` | Create series |
| PUT | `/series/{id}` | Update series |
| DELETE | `/series/{id}` | Delete series |

### Episodes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/series/{id}/episodes` | Get episodes |
| POST | `/series/{id}/episodes` | Create episode |
| GET | `/episodes/{id}` | Get episode |
| GET | `/episodes/{id}/full` | Get full episode data |
| PUT | `/episodes/{id}` | Update episode |
| PUT | `/episodes/{id}/save` | Save full episode |
| DELETE | `/episodes/{id}` | Delete episode |

### Panels & Text
| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/panels/{id}` | Update panel |
| DELETE | `/panels/{id}` | Delete panel |
| POST | `/panels/{id}/texts` | Add text element |
| PUT | `/texts/{id}` | Update text |
| DELETE | `/texts/{id}` | Delete text |

### AI Generation
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ai/generate` | Create AI job |
| GET | `/ai/jobs/{id}` | Get job status |
| POST | `/ai/jobs/{id}/cancel` | Cancel job |

### Credits
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/credits` | Get balance |
| GET | `/credits/transactions` | Get history |
| POST | `/credits/purchase` | Purchase credits |

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication.

```bash
# Register
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"password123"}'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Use token for protected endpoints
curl http://localhost:8080/api/series \
  -H "Authorization: Bearer <your_access_token>"
```

## ⚙️ Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `JWT_SECRET` | (generated) | JWT signing secret |
| `DATABASE_URL` | localhost:3306 | MySQL URL |
| `DATABASE_USERNAME` | comic_user | Database user |
| `DATABASE_PASSWORD` | comic_password | Database password |
| `REDIS_HOST` | localhost | Redis host |
| `REDIS_PORT` | 6379 | Redis port |

### Application Profiles

- `dev` - Development (default)
- `prod` - Production

## 🧪 Testing

```bash
# Run all tests
./mvnw test

# Run specific test class
./mvnw test -Dtest=AuthControllerTest
```

## 📦 Build & Deploy

### Build JAR

```bash
./mvnw clean package -DskipTests
```

### Docker Build

```bash
docker build -t comic-creator-backend .
```

### Deploy to Render

1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically on push

## 📝 Database Schema

The application uses MySQL with the following main tables:
- `users` - User accounts
- `series` - Comic series
- `episodes` - Episodes within series
- `pages` - Pages within episodes
- `panels` - Panels on pages
- `text_elements` - Text bubbles on panels
- `characters` - Series characters
- `ai_jobs` - AI generation jobs
- `credit_transactions` - Credit history

Tables are auto-created via JPA (`ddl-auto: update` in dev).

## 🔮 Future Improvements

- [ ] Google Gemini API integration (currently mocked)
- [ ] AWS S3 for image storage
- [ ] WebSocket for real-time updates
- [ ] Rate limiting with Redis
- [ ] Email verification
- [ ] OAuth2 (Google, GitHub)

---

*Version: 1.0.0*
*Spring Boot: 3.2.0*
*Java: 17*
