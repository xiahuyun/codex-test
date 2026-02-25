package service

import (
	"context"
	"testing"
	"time"

	"snake-backend/internal/model"
	"snake-backend/internal/repo"
)

func TestSubmitScoreValidation(t *testing.T) {
	svc := NewScoreService(repo.NewMemoryRepo())

	_, err := svc.SubmitScore(context.Background(), SubmitScoreInput{
		Nickname:   "bad nickname",
		Score:      10,
		Mode:       model.ModeClassic,
		DurationMS: 100,
		ClientTS:   time.Now().UTC(),
	})
	if err == nil {
		t.Fatal("expected validation error")
	}
}

func TestLeaderboardSorting(t *testing.T) {
	memory := repo.NewMemoryRepo()
	svc := NewScoreService(memory)
	ctx := context.Background()
	now := time.Now().UTC()

	_, _ = svc.SubmitScore(ctx, SubmitScoreInput{Nickname: "u1", Score: 30, Mode: model.ModeClassic, DurationMS: 1000, ClientTS: now.Add(2 * time.Second)})
	_, _ = svc.SubmitScore(ctx, SubmitScoreInput{Nickname: "u2", Score: 50, Mode: model.ModeClassic, DurationMS: 1000, ClientTS: now.Add(3 * time.Second)})
	_, _ = svc.SubmitScore(ctx, SubmitScoreInput{Nickname: "u3", Score: 50, Mode: model.ModeClassic, DurationMS: 1000, ClientTS: now.Add(1 * time.Second)})

	items, err := svc.Leaderboard(ctx, model.ModeClassic, 50)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(items) != 3 {
		t.Fatalf("expected 3 items, got %d", len(items))
	}
	if items[0].Nickname != "u3" || items[1].Nickname != "u2" {
		t.Fatalf("unexpected order: %#v", items)
	}
}
