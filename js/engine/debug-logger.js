/**
 * Game Telemetry & Debug Log Recorder
 * Captures full movement history, collisions, actions, and state transitions
 * for post-mortem debugging, game balancing, and automated analysis.
 */

export class DebugLogger {
  /**
   * @param {object} level Canonical level definition
   */
  constructor(level) {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    this.levelInfo = {
      id: level?.id ?? 'unknown',
      title: level?.title ?? 'Untitled',
      author: level?.author ?? 'Unknown',
      dimensions: level?.dimensions ? { ...level.dimensions } : { width: 0, height: 0 },
      spawn: level?.spawn ? { ...level.spawn } : null,
      exit: level?.exit ? { ...level.exit } : null,
      theme: level?.config?.theme ?? 'dungeon',
      totalEntities: (level?.entities || []).length,
    };

    this.sessionStartTimestamp = new Date().toISOString();
    this.events = [];
    this.isCompleted = false;
    this.completionStats = null;
  }

  /**
   * Log an event with elapsed game time
   * @param {string} type
   * @param {object} [data={}]
   * @param {number} [elapsedMs=0]
   */
  log(type, data = {}, elapsedMs = 0) {
    this.events.push({
      timestamp: (elapsedMs / 1000).toFixed(3) + 's',
      elapsedMs: Math.round(elapsedMs),
      type,
      ...data,
    });
  }

  /**
   * Record movement attempt
   * @param {object} params
   */
  logMoveAttempt({ fromX, fromY, fromElevation, toX, toY, allowed, nextElevation, reason, elapsedMs }) {
    this.log(
      allowed ? 'move:allowed' : 'move:blocked',
      {
        from: { x: fromX, y: fromY, elevation: fromElevation },
        to: { x: toX, y: toY },
        allowed,
        nextElevation,
        reason: reason || (allowed ? 'ok' : 'unknown'),
      },
      elapsedMs
    );
  }

  /**
   * Record step completion
   * @param {object} params
   */
  logStepCompleted({ stepIndex, x, y, elevation, facing, elapsedMs }) {
    this.log(
      'step:completed',
      {
        stepIndex,
        position: { x, y, elevation },
        facing,
      },
      elapsedMs
    );
  }

  /**
   * Record elevation transition
   * @param {object} params
   */
  logElevationChange({ fromElevation, toElevation, atX, atY, triggerTile, elapsedMs }) {
    this.log(
      'elevation:changed',
      {
        fromElevation,
        toElevation,
        position: { x: atX, y: atY },
        triggerTile,
      },
      elapsedMs
    );
  }

  /**
   * Record item collection
   * @param {object} params
   */
  logKeyCollected({ keyId, keyName, color, atX, atY, inventory, elapsedMs }) {
    this.log(
      'entity:key_collected',
      {
        keyId,
        keyName,
        color,
        position: { x: atX, y: atY },
        inventoryAfter: [...inventory],
      },
      elapsedMs
    );
  }

  /**
   * Record door unlock
   * @param {object} params
   */
  logDoorUnlocked({ doorId, keyUsed, atX, atY, elapsedMs }) {
    this.log(
      'entity:door_unlocked',
      {
        doorId,
        keyUsed,
        position: { x: atX, y: atY },
      },
      elapsedMs
    );
  }

  /**
   * Record lever toggle
   * @param {object} params
   */
  logLeverToggled({ leverId, state, atX, atY, targets, elapsedMs }) {
    this.log(
      'entity:lever_toggled',
      {
        leverId,
        newState: state,
        position: { x: atX, y: atY },
        targetsAffected: targets || [],
      },
      elapsedMs
    );
  }

  /**
   * Record runtime error or caught exception
   * @param {object} params
   */
  logError({ message, stack, source, elapsedMs = 0 }) {
    console.error(`[MazeGame:Error] ${message}`, { source, stack });
    this.log(
      'system:error',
      {
        message: String(message),
        stack: stack ? String(stack) : undefined,
        source: source || 'runtime',
      },
      elapsedMs
    );
  }

  /**
   * Record system or validation warning
   * @param {object} params
   */
  logWarning({ message, context, elapsedMs = 0 }) {
    console.warn(`[MazeGame:Warn] ${message}`, context || '');
    this.log(
      'system:warning',
      {
        message: String(message),
        context: context || undefined,
      },
      elapsedMs
    );
  }

  /**
   * Record level victory / completion
   * @param {object} stats
   * @param {number} elapsedMs
   */
  logVictory(stats, elapsedMs) {
    this.isCompleted = true;
    this.completionStats = { ...stats };
    this.log(
      'game:victory',
      {
        finalTimeMs: stats.time,
        finalTimeFormatted: (stats.time / 1000).toFixed(2) + 's',
        finalSteps: stats.steps,
      },
      elapsedMs
    );
  }

  /**
   * Build complete debug data payload
   * @returns {object}
   */
  buildPayload() {
    return {
      schemaVersion: '1.0.0',
      sessionId: this.sessionId,
      sessionStart: this.sessionStartTimestamp,
      sessionEnd: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'NodeJS',
      level: this.levelInfo,
      summary: {
        completed: this.isCompleted,
        totalEvents: this.events.length,
        completionStats: this.completionStats,
      },
      events: this.events,
    };
  }

  /**
   * Return formatted JSON
   * @returns {string}
   */
  exportJSON() {
    return JSON.stringify(this.buildPayload(), null, 2);
  }

  /**
   * Trigger browser file download of debug log
   * @param {string} [customFilename]
   */
  download(customFilename) {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const filename = customFilename || `debug_log_level_${this.levelInfo.id}_${Date.now()}.json`;
    const jsonStr = this.exportJSON();
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
