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
   * Record camera rotation
   * @param {object} params
   */
  logCameraRotation({ fromAngle, toAngle, elapsedMs }) {
    this.log(
      'camera:rotation',
      {
        fromAngle,
        toAngle,
      },
      elapsedMs
    );
  }

  /**
   * Record secret room discovery
   * @param {object} params
   */
  logSecretFound({ atX, atY, totalFound, elapsedMs }) {
    this.log(
      'secret:found',
      {
        position: { x: atX, y: atY },
        totalFound,
      },
      elapsedMs
    );
  }

  /**
   * Record riddle relic or pedestal interaction
   * @param {object} params
   */
  logRiddleAction({ action, itemId, pedestalId, atX, atY, elapsedMs }) {
    this.log(
      'entity:riddle_action',
      {
        action,
        itemId,
        pedestalId,
        position: { x: atX, y: atY },
      },
      elapsedMs
    );
  }

  /**
   * Record room transition in multi-room dungeon
   * @param {object} params
   */
  logRoomTransition({ fromRoom, toRoom, spawn, elapsedMs }) {
    this.log(
      'room:transition',
      {
        fromRoom,
        toRoom,
        spawn,
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
   * Build deterministic replay payload from recorded session
   * @returns {object}
   */
  toReplayPayload() {
    const actions = [];
    let prevPos = this.levelInfo.spawn || { x: 0, y: 0, elevation: 0 };
    let stepIndex = 1;

    for (const ev of this.events) {
      if (ev.type === 'step:completed') {
        const currPos = ev.position || { x: 0, y: 0, elevation: 0 };
        let dir = ev.facing || 'none';
        if (currPos.x > prevPos.x) dir = 'right';
        else if (currPos.x < prevPos.x) dir = 'left';
        else if (currPos.y > prevPos.y) dir = 'down';
        else if (currPos.y < prevPos.y) dir = 'up';

        actions.push({
          stepIndex: stepIndex++,
          action: 'move',
          direction: dir,
          from: { x: prevPos.x, y: prevPos.y, elevation: prevPos.elevation || 0 },
          to: { x: currPos.x, y: currPos.y, elevation: currPos.elevation || 0 },
          isWarp: false,
          elapsedMs: ev.elapsedMs || 0,
        });

        prevPos = currPos;
      } else if (ev.type === 'camera:rotation') {
        actions.push({
          stepIndex: stepIndex++,
          action: 'rotate',
          fromAngle: ev.fromAngle,
          toAngle: ev.toAngle,
          elapsedMs: ev.elapsedMs || 0,
        });
      } else if (ev.type === 'teleport:used') {
        const currPos = ev.to || { x: 0, y: 0, elevation: 0 };
        actions.push({
          stepIndex: stepIndex++,
          action: 'teleport',
          from: ev.from || { x: prevPos.x, y: prevPos.y, elevation: prevPos.elevation || 0 },
          to: currPos,
          isWarp: true,
          elapsedMs: ev.elapsedMs || 0,
        });
        prevPos = currPos;
      } else if (ev.type === 'entity:lever_toggled') {
        actions.push({
          stepIndex: stepIndex++,
          action: 'interact',
          target: 'lever',
          leverId: ev.leverId,
          x: ev.position?.x,
          y: ev.position?.y,
          newState: ev.newState,
          elapsedMs: ev.elapsedMs || 0,
        });
      } else if (ev.type === 'entity:riddle_action') {
        actions.push({
          stepIndex: stepIndex++,
          action: 'interact',
          target: 'pedestal',
          riddleAction: ev.action,
          itemId: ev.itemId,
          pedestalId: ev.pedestalId,
          x: ev.position?.x,
          y: ev.position?.y,
          elapsedMs: ev.elapsedMs || 0,
        });
      }
    }

    return {
      schemaVersion: '1.0.0',
      type: 'casual-maze-replay',
      generator: 'session:recorded',
      sessionId: this.sessionId,
      createdAt: new Date().toISOString(),
      levelId: String(this.levelInfo.id),
      levelTitle: this.levelInfo.title,
      spawn: this.levelInfo.spawn || { x: 0, y: 0, elevation: 0 },
      exit: this.levelInfo.exit || { x: 0, y: 0, elevation: 0 },
      summary: {
        totalSteps: actions.length,
        totalTimeMs: this.completionStats?.time ?? 0,
        completed: this.isCompleted,
      },
      actions,
    };
  }

  /**
   * Export replay payload as JSON string
   * @returns {string}
   */
  exportReplayJSON() {
    return JSON.stringify(this.toReplayPayload(), null, 2);
  }

  /**
   * Copy diagnostic JSON bundle directly to system clipboard
   * @returns {Promise<boolean>}
   */
  async copyToClipboard() {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(this.exportJSON());
        return true;
      }
    } catch {
      // Fallback
    }
    return false;
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

  /**
   * Trigger browser file download of replay payload
   * @param {string} [customFilename]
   */
  downloadReplay(customFilename) {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const filename = customFilename || `replay_level_${this.levelInfo.id}_${Date.now()}.json`;
    const jsonStr = this.exportReplayJSON();
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
