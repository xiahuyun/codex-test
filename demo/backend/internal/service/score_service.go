package service

import (
	"context"
	"errors"
	"regexp"
	"time"

	"snake-backend/internal/model"
	"snake-backend/internal/repo"
)

var nicknamePattern = regexp.MustCompile(`^[A-Za-z0-9_]{1,16}$`)

type SubmitScoreInput struct {
	Nickname   string
	Score      int
	Mode       model.Mode
	DurationMS int
	ClientTS   time.Time
}

type ScoreService struct {
	repo repo.ScoreRepository
}

func NewScoreService(repository repo.ScoreRepository) *ScoreService {
	return &ScoreService{repo: repository}
}

func (s *ScoreService) SubmitScore(ctx context.Context, input SubmitScoreInput) (model.Score, error) {
	if !nicknamePattern.MatchString(input.Nickname) {
		return model.Score{}, errors.New("nickname must be 1-16 chars: letters, numbers, underscore")
	}
	if input.Score < 0 || input.Score > 1000000 {
		return model.Score{}, errors.New("score out of range")
	}
	if input.DurationMS < 0 || input.DurationMS > 24*60*60*1000 {
		return model.Score{}, errors.New("duration_ms out of range")
	}
	if input.Mode != model.ModeClassic && input.Mode != model.ModeObstacle {
		return model.Score{}, errors.New("invalid mode")
	}

	createdAt := input.ClientTS
	if createdAt.IsZero() {
		createdAt = time.Now().UTC()
	}

	return s.repo.CreateScore(ctx, repo.CreateScoreInput{
		Nickname:   input.Nickname,
		Score:      input.Score,
		Mode:       input.Mode,
		DurationMS: input.DurationMS,
		CreatedAt:  createdAt,
	})
}

func (s *ScoreService) Leaderboard(ctx context.Context, mode model.Mode, limit int) ([]model.Score, error) {
	if mode != model.ModeClassic && mode != model.ModeObstacle {
		mode = model.ModeClassic
	}
	if limit <= 0 || limit > 50 {
		limit = 50
	}
	return s.repo.ListLeaderboard(ctx, mode, limit)
}
