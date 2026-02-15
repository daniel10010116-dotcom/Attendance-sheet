import * as data from './data.js'

/**
 * 寫入審計日誌（§5）。非同步。
 */
export async function auditLog(actorId, actorRole, action, entityType, entityId = null, oldValue = null, newValue = null) {
  return data.auditLog(actorId, actorRole, action, entityType, entityId, oldValue, newValue)
}
