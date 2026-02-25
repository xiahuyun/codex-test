package repo

import (
	"context"
	"database/sql"
	"fmt"
	"sort"
	"sync"
	"time"

	"github.com/google/uuid"

	"snake-backend/internal/model"
)

type CreateScoreInput struct {
	Nickname   string
	Score      int
	Mode       model.Mode
	DurationMS int

	CreatedAt time.Time
}

type ScoreRepository interface {
	CreateScore(ctx context.Context, input CreateScoreInput) (model.Score, error)
	ListLeaderboard(ctx context.Context, mode model.Mode, limit int) ([]model.Score, error)
}

type PostgresRepo struct {
	db *sql.DB
}

func NewPostgresRepo(db *sql.DB) *PostgresRepo {
	return &PostgresRepo{db: db}
}

func (r *PostgresRepo) EnsureSchema(ctx context.Context) error {
	statements := []string{
		`CREATE TABLE IF NOT EXISTS scores (
			id UUID PRIMARY KEY,
			nickname VARCHAR(16) NOT NULL,
			score INT NOT NULL CHECK (score >= 0),
			mode VARCHAR(16) NOT NULL,
			duration_ms INT NOT NULL CHECK (duration_ms >= 0),
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)`,
		`CREATE INDEX IF NOT EXISTS idx_scores_mode_score_created
		ON scores (mode, score DESC, created_at ASC)`,
	}

	for _, statement := range statements {
		if _, err := r.db.ExecContext(ctx, statement); err != nil {
			return fmt.Errorf("ensure schema failed: %w", err)
		}
	}
	return nil
}

func (r *PostgresRepo) CreateScore(ctx context.Context, input CreateScoreInput) (model.Score, error) {
	id := uuid.NewString()
	query := `
		INSERT INTO scores (id, nickname, score, mode, duration_ms, created_at)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, nickname, score, mode, duration_ms, created_at`

	var score model.Score
	err := r.db.QueryRowContext(ctx, query, id, input.Nickname, input.Score, input.Mode, input.DurationMS, input.CreatedAt).
		Scan(&score.ID, &score.Nickname, &score.Score, &score.Mode, &score.DurationMS, &score.CreatedAt)
	return score, err
}

func (r *PostgresRepo) ListLeaderboard(ctx context.Context, mode model.Mode, limit int) ([]model.Score, error) {
	query := `
		SELECT id, nickname, score, mode, duration_ms, created_at
		FROM scores
		WHERE mode = $1
		ORDER BY score DESC, created_at ASC
		LIMIT $2`

	rows, err := r.db.QueryContext(ctx, query, mode, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := make([]model.Score, 0, limit)
	for rows.Next() {
		var score model.Score
		if err := rows.Scan(&score.ID, &score.Nickname, &score.Score, &score.Mode, &score.DurationMS, &score.CreatedAt); err != nil {
			return nil, err
		}
		items = append(items, score)
	}

	return items, rows.Err()
}

type MemoryRepo struct {
	mu    sync.RWMutex
	items []model.Score
}

func NewMemoryRepo() *MemoryRepo {
	return &MemoryRepo{items: make([]model.Score, 0, 128)}
}

func (r *MemoryRepo) CreateScore(_ context.Context, input CreateScoreInput) (model.Score, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	score := model.Score{
		ID:         uuid.NewString(),
		Nickname:   input.Nickname,
		Score:      input.Score,
		Mode:       input.Mode,
		DurationMS: input.DurationMS,
		CreatedAt:  input.CreatedAt,
	}
	r.items = append(r.items, score)
	return score, nil
}

func (r *MemoryRepo) ListLeaderboard(_ context.Context, mode model.Mode, limit int) ([]model.Score, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	filtered := make([]model.Score, 0, len(r.items))
	for _, item := range r.items {
		if item.Mode == mode {
			filtered = append(filtered, item)
		}
	}

	sort.Slice(filtered, func(i, j int) bool {
		if filtered[i].Score == filtered[j].Score {
			return filtered[i].CreatedAt.Before(filtered[j].CreatedAt)
		}
		return filtered[i].Score > filtered[j].Score
	})

	if limit > len(filtered) {
		limit = len(filtered)
	}
	return filtered[:limit], nil
}
