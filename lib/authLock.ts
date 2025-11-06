// Global auth lock to prevent multiple simultaneous OAuth attempts
let authInProgress = false;
let authLockTimestamp = 0;
const AUTH_LOCK_DURATION = 60000; // 60 seconds lock (OAuth flows can take time)

export function setAuthInProgress(value: boolean) {
  authInProgress = value;
  if (value) {
    authLockTimestamp = Date.now();
  }
}

export function isAuthInProgress(): boolean {
  if (!authInProgress) return false;
  
  // Clear lock if it's expired
  if (Date.now() - authLockTimestamp > AUTH_LOCK_DURATION) {
    authInProgress = false;
    return false;
  }
  
  return true;
}

export function clearAuthLock() {
  authInProgress = false;
  authLockTimestamp = 0;
}

