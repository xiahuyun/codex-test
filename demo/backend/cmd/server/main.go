package main

import (
	"context"
	"database/sql"
	"log"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"

	httpapi "snake-backend/internal/http"
	"snake-backend/internal/repo"
	"snake-backend/internal/service"
)

func main() {
	port := env("PORT", "8080")
	origin := env("CORS_ORIGIN", "http://localhost:5173")
	dbURL := strings.TrimSpace(os.Getenv("DATABASE_URL"))

	var scoreRepo repo.ScoreRepository
	if dbURL == "" {
		log.Println("DATABASE_URL is empty; using in-memory repo")
		scoreRepo = repo.NewMemoryRepo()
	} else {
		db, err := connectWithRetry(dbURL, 12, 2*time.Second)
		if err != nil {
			log.Printf("database unavailable after retries (%v); using in-memory repo", err)
			scoreRepo = repo.NewMemoryRepo()
		} else {
			pgRepo := repo.NewPostgresRepo(db)
			if err = pgRepo.EnsureSchema(context.Background()); err != nil {
				log.Printf("schema initialization failed (%v); using in-memory repo", err)
				scoreRepo = repo.NewMemoryRepo()
			} else {
				scoreRepo = pgRepo
			}
		}
	}

	scoreService := service.NewScoreService(scoreRepo)
	handlers := httpapi.NewHandlers(scoreService)

	router := gin.Default()
	router.Use(httpapi.CORSMiddleware(origin))
	router.Use(httpapi.IPRateLimitMiddleware(10, 3))

	v1 := router.Group("/api/v1")
	{
		v1.POST("/scores", handlers.CreateScore)
		v1.GET("/leaderboard", handlers.GetLeaderboard)
	}

	log.Printf("server listening on :%s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("server failed: %v", err)
	}
}

func env(key, fallback string) string {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return fallback
	}
	return value
}

func connectWithRetry(dbURL string, attempts int, delay time.Duration) (*sql.DB, error) {
	var lastErr error
	for i := 0; i < attempts; i += 1 {
		db, err := sql.Open("postgres", dbURL)
		if err == nil {
			err = db.Ping()
		}
		if err == nil {
			return db, nil
		}
		lastErr = err
		time.Sleep(delay)
	}
	return nil, lastErr
}
