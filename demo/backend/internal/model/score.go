package model

import "time"

type Mode string

const (
	ModeClassic  Mode = "classic"
	ModeObstacle Mode = "obstacle"
)

type Score struct {
	ID         string    `json:"id"`
	Nickname   string    `json:"nickname"`
	Score      int       `json:"score"`
	Mode       Mode      `json:"mode"`
	DurationMS int       `json:"duration_ms"`
	CreatedAt  time.Time `json:"created_at"`
}
