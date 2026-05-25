-- ============================================================
-- 메시지 컨펌 협업 시스템 — Supabase 스키마
-- 로그인 없는 오픈 액세스 (URL이 곧 접근 권한)
-- ============================================================
--
-- 사용법:
--   1. Supabase 대시보드 → SQL Editor 열기
--   2. 이 파일 전체를 붙여넣기 → Run
--   3. 정상 실행되면 3개 테이블 + 5개 인덱스 + 트리거 생성
--
-- 보안 정책:
--   - RLS(Row Level Security) 활성화하지 않음 — anon key로 직접 read/write 가능
--   - URL slug 추측 불가능하게 유지 = 사실상의 접근 권한
-- ============================================================

-- 기존 테이블 정리 (개발 단계에서만 사용. 운영 시엔 주석)
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS message_versions CASCADE;
DROP TABLE IF EXISTS messages CASCADE;

-- ============================================================
-- 1) messages: 메시지 본 항목 (Top50 v5 — 한 명당 1행)
-- ============================================================
CREATE TABLE messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rank            INTEGER NOT NULL,                      -- 1 ~ 50
  customer_id     TEXT NOT NULL,                         -- v5 ID (예: 482108_012)
  tail4           TEXT NOT NULL,                         -- 끝4자리 (번호)
  name_guess      TEXT,                                  -- 추정이름 (선생님 폴백 가능)
  field           TEXT NOT NULL,                         -- 분야 (논문/자서전/...)
  period          TEXT,                                  -- 시기 (2026-01)
  total_score     NUMERIC(5,1),                          -- 총점 (3축 합)
  recency_score   NUMERIC(5,1),
  richness_score  NUMERIC(5,1),
  potential_score NUMERIC(5,1),
  body_len        INTEGER,
  raw_text        TEXT,                                  -- 원문 body_full
  raw_excerpt     TEXT,                                  -- 본문발췌 (120자)
  source_file     TEXT,                                  -- 원본 docx
  status          TEXT NOT NULL DEFAULT 'pending'        -- draft/pending/feedback/revised/fixed/excluded
                  CHECK (status IN ('draft','pending','feedback','revised','fixed','excluded')),
  current_version INTEGER NOT NULL DEFAULT 1,
  fixed_at        TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_status   ON messages(status);
CREATE INDEX idx_messages_rank     ON messages(rank);
CREATE INDEX idx_messages_tail4    ON messages(tail4);

COMMENT ON TABLE messages IS 'Top50 메시지 본 항목. 한 명당 1행.';
COMMENT ON COLUMN messages.status IS 'draft → pending → feedback ↔ revised → fixed / excluded';

-- ============================================================
-- 2) message_versions: 메시지 본문 버전 히스토리
-- ============================================================
CREATE TABLE message_versions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id   UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  version_num  INTEGER NOT NULL,
  body_text    TEXT NOT NULL,
  author_name  TEXT,                                     -- "이서진" / "김진" / NULL(익명)
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (message_id, version_num)
);

CREATE INDEX idx_versions_message ON message_versions(message_id, version_num DESC);

COMMENT ON TABLE message_versions IS '메시지 본문 버전 히스토리 (v1, v2, v3, ...). 현재 버전은 messages.current_version 참조.';

-- ============================================================
-- 3) comments: 피드백 코멘트 스레드
-- ============================================================
CREATE TABLE comments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id          UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  author_name         TEXT,                              -- 자유 입력 (NULL = 익명)
  body                TEXT NOT NULL,
  replied_to_version  INTEGER,                           -- 어느 버전 보고 작성한 코멘트인지
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_comments_message ON comments(message_id, created_at);

COMMENT ON TABLE comments IS '피드백 코멘트. author_name은 자유 입력(이름 강제 X).';

-- ============================================================
-- 4) updated_at 자동 갱신 트리거
-- ============================================================
CREATE OR REPLACE FUNCTION trg_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER messages_set_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION trg_set_updated_at();

-- ============================================================
-- 5) Realtime 활성화 (Supabase 대시보드에서도 가능)
-- ============================================================
-- 대시보드 → Database → Replication → supabase_realtime publication
-- 에 다음 세 테이블 추가하거나, 아래 SQL 실행:

ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE message_versions;
ALTER PUBLICATION supabase_realtime ADD TABLE comments;

-- ============================================================
-- 완료
-- ============================================================
-- 검증 쿼리:
--   SELECT count(*) FROM messages;          -- 0 (seed 전)
--   SELECT count(*) FROM message_versions;  -- 0
--   SELECT count(*) FROM comments;          -- 0
--
-- 다음 단계: seed.sql 실행 → Top50 50건 import
