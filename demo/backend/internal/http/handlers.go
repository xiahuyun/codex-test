package http

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"

	"snake-backend/internal/model"
	"snake-backend/internal/service"
)

type Handlers struct {
	scoreService *service.ScoreService
}

func NewHandlers(scoreService *service.ScoreService) *Handlers {
	return &Handlers{scoreService: scoreService}
}

type createScoreRequest struct {
	Nickname   string `json:"nickname"`
	Score      int    `json:"score"`
	Mode       string `json:"mode"`
	DurationMS int    `json:"duration_ms"`
	ClientTS   string `json:"client_ts"`
}

func (h *Handlers) CreateScore(c *gin.Context) {
	var req createScoreRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid JSON body"})
		return
	}

	var ts time.Time
	if req.ClientTS != "" {
		parsed, err := time.Parse(time.RFC3339, req.ClientTS)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "client_ts must be ISO-8601 RFC3339"})
			return
		}
		ts = parsed
	}

	score, err := h.scoreService.SubmitScore(c.Request.Context(), service.SubmitScoreInput{
		Nickname:   req.Nickname,
		Score:      req.Score,
		Mode:       model.Mode(req.Mode),
		DurationMS: req.DurationMS,
		ClientTS:   ts,
	})
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, score)
}

func (h *Handlers) GetLeaderboard(c *gin.Context) {
	mode := model.Mode(c.DefaultQuery("mode", string(model.ModeClassic)))
	limit := 50
	if value := c.Query("limit"); value != "" {
		parsed, err := strconv.Atoi(value)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "limit must be an integer"})
			return
		}
		limit = parsed
	}

	items, err := h.scoreService.Leaderboard(c.Request.Context(), mode, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"items": items,
		"total": len(items),
	})
}
