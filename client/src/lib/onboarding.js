const KEY = 'todo:onboarded';

export function hasOnboarded() {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    // storage can be blocked (private mode etc.), just skip the intro then
    return true;
  }
}

export function markOnboarded() {
  try {
    localStorage.setItem(KEY, '1');
  } catch {
    /* ignore */
  }
}
