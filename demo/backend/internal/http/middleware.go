package http

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

func CORSMiddleware(origin string) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	}
}

type ipWindow struct {
	timestamps []time.Time
}

func IPRateLimitMiddleware(windowSec int, limit int) gin.HandlerFunc {
	var mu sync.Mutex
	windows := map[string]*ipWindow{}
	windowDuration := time.Duration(windowSec) * time.Second

	return func(c *gin.Context) {
		ip := c.ClientIP()
		now := time.Now()
		cutoff := now.Add(-windowDuration)

		mu.Lock()
		bucket, ok := windows[ip]
		if !ok {
			bucket = &ipWindow{}
			windows[ip] = bucket
		}

		filtered := bucket.timestamps[:0]
		for _, t := range bucket.timestamps {
			if t.After(cutoff) {
				filtered = append(filtered, t)
			}
		}
		bucket.timestamps = filtered

		if c.Request.Method == http.MethodPost {
			if len(bucket.timestamps) >= limit {
				mu.Unlock()
				c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{"error": "rate limit exceeded"})
				return
			}
			bucket.timestamps = append(bucket.timestamps, now)
		}
		mu.Unlock()

		c.Next()
	}
}
