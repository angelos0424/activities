CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE SCHEMA IF NOT EXISTS meetings;

CREATE TABLE meetings.embedding_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_name VARCHAR(100) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    dimensions INTEGER NOT NULL CHECK (dimensions > 0),
    is_active BOOLEAN NOT NULL DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_embedding_configs_active
    ON meetings.embedding_configs (is_active)
    WHERE is_active = true;

INSERT INTO meetings.embedding_configs
    (model_name, provider, dimensions, is_active, notes)
VALUES
    ('text-embedding-3-small', 'openai', 1536, true, 'Initial model');

CREATE TABLE meetings.meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_name VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    meeting_date TIMESTAMPTZ NOT NULL,
    location VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'completed'
        CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    raw_file_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_meetings_org ON meetings.meetings (organization_name);
CREATE INDEX idx_meetings_date ON meetings.meetings (meeting_date DESC);

CREATE TABLE meetings.attendees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID NOT NULL REFERENCES meetings.meetings(id) ON DELETE CASCADE,
    user_id UUID,
    display_name VARCHAR(100) NOT NULL,
    role VARCHAR(50),
    attendance_status VARCHAR(20) NOT NULL DEFAULT 'present'
        CHECK (attendance_status IN ('present', 'absent', 'late')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_attendees_meeting ON meetings.attendees (meeting_id);

CREATE TABLE meetings.transcripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID NOT NULL UNIQUE REFERENCES meetings.meetings(id) ON DELETE CASCADE,
    raw_text TEXT NOT NULL,
    cleaned_text TEXT,
    summary TEXT,
    language_code VARCHAR(10) DEFAULT 'ko',
    token_count INTEGER CHECK (token_count IS NULL OR token_count >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE meetings.transcript_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transcript_id UUID NOT NULL REFERENCES meetings.transcripts(id) ON DELETE CASCADE,
    embedding_config_id UUID REFERENCES meetings.embedding_configs(id),
    chunk_index INTEGER NOT NULL CHECK (chunk_index >= 0),
    speaker_name VARCHAR(100),
    started_at_seconds INTEGER CHECK (started_at_seconds IS NULL OR started_at_seconds >= 0),
    ended_at_seconds INTEGER CHECK (ended_at_seconds IS NULL OR ended_at_seconds >= 0),
    content TEXT NOT NULL,
    token_count INTEGER CHECK (token_count IS NULL OR token_count >= 0),
    embedding VECTOR(1536),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (transcript_id, chunk_index),
    CHECK (
        started_at_seconds IS NULL
        OR ended_at_seconds IS NULL
        OR ended_at_seconds >= started_at_seconds
    )
);

CREATE INDEX idx_chunks_transcript ON meetings.transcript_chunks (transcript_id);
CREATE INDEX idx_chunks_config ON meetings.transcript_chunks (embedding_config_id);
CREATE INDEX idx_chunks_embedding
    ON meetings.transcript_chunks
    USING hnsw (embedding vector_cosine_ops);

CREATE TABLE meetings.action_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID NOT NULL REFERENCES meetings.meetings(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assignee_name VARCHAR(100),
    assignee_user_id UUID,
    due_date DATE,
    priority VARCHAR(10) DEFAULT 'medium'
        CHECK (priority IN ('low', 'medium', 'high')),
    approval_status VARCHAR(20) NOT NULL DEFAULT 'proposed'
        CHECK (approval_status IN ('proposed', 'approved', 'rejected')),
    source_chunk_id UUID REFERENCES meetings.transcript_chunks(id) ON DELETE SET NULL,
    kanban_card_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_action_meeting ON meetings.action_items (meeting_id);
CREATE INDEX idx_action_approval ON meetings.action_items (approval_status);

CREATE TABLE meetings.decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID NOT NULL REFERENCES meetings.meetings(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    source_chunk_id UUID REFERENCES meetings.transcript_chunks(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_decisions_meeting ON meetings.decisions (meeting_id);
