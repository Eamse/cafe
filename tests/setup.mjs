// node --test 환경에는 브라우저 localStorage가 없으므로, 테스트 대상 모듈이
// import되기 전에 아주 단순한 메모리 기반 폴리필을 전역에 심어둔다.
class MemoryStorage {
  constructor() {
    this.store = new Map();
  }
  getItem(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  }
  setItem(key, value) {
    this.store.set(key, String(value));
  }
  removeItem(key) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
}

globalThis.localStorage = new MemoryStorage();
