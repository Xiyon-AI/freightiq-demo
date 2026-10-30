export interface VoiceTurnLike {
  role?: string | null
  content?: string | null
  delivered_content?: string | null
  interrupted?: boolean | null
  metadata?: Record<string, unknown> | null
  turn_index?: number | null
  created_at?: string | null
}

function asMetadataRecord(metadata: unknown): Record<string, unknown> | null {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return null
  }

  return metadata as Record<string, unknown>
}

function getComparableTurnContent(turn: Pick<VoiceTurnLike, "content" | "delivered_content">): string {
  return (turn.delivered_content ?? turn.content ?? "").trim()
}

function getTurnIndex(turn: Pick<VoiceTurnLike, "turn_index">): number {
  return typeof turn.turn_index === "number" ? turn.turn_index : Number.MAX_SAFE_INTEGER
}

function getTurnCreatedAtTime(turn: Pick<VoiceTurnLike, "created_at">): number {
  if (!turn.created_at) return Number.MAX_SAFE_INTEGER

  const timestamp = Date.parse(turn.created_at)
  return Number.isFinite(timestamp) ? timestamp : Number.MAX_SAFE_INTEGER
}

function getTurnFingerprint(turn: VoiceTurnLike): string {
  return [
    turn.role ?? "",
    getComparableTurnContent(turn),
    turn.interrupted ? "1" : "0",
  ].join("::")
}

export function getTurnDisplayContent(turn: Pick<VoiceTurnLike, "content" | "delivered_content">): string {
  return turn.delivered_content ?? turn.content ?? ""
}

export function getLegacyReplayTimestamp(metadata: unknown): number | null {
  const record = asMetadataRecord(metadata)
  if (!record || "source" in record) {
    return null
  }

  const timestamp = record.timestamp
  return typeof timestamp === "number" && Number.isFinite(timestamp) ? timestamp : null
}

export function dedupeLegacyReplayTurns<T extends VoiceTurnLike>(turns: T[]): T[] {
  const authoritativeFingerprints = new Set<string>()

  return [...turns]
    .sort((left, right) => {
      const indexDiff = getTurnIndex(left) - getTurnIndex(right)
      if (indexDiff !== 0) return indexDiff

      return getTurnCreatedAtTime(left) - getTurnCreatedAtTime(right)
    })
    .filter((turn) => {
      const fingerprint = getTurnFingerprint(turn)
      const isLegacyReplay = getLegacyReplayTimestamp(turn.metadata) !== null

      if (isLegacyReplay && authoritativeFingerprints.has(fingerprint)) {
        return false
      }

      if (!isLegacyReplay) {
        authoritativeFingerprints.add(fingerprint)
      }

      return true
    })
}
