CREATE TABLE IF NOT EXISTS scores (
  id UUID PRIMARY KEY,
  nickname VARCHAR(16) NOT NULL,
  score INT NOT NULL CHECK (score >= 0),
  mode VARCHAR(16) NOT NULL,
  duration_ms INT NOT NULL CHECK (duration_ms >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scores_mode_score_created
ON scores (mode, score DESC, created_at ASC);
