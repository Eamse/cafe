import "./setup.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";

import { isEventEnded } from "../js/utils.js";

// 메뉴/카테고리/공지/이벤트 조회·저장은 js/data.js가 Supabase를 직접 호출하는
// 방식으로 바뀌어서(js/supabaseClient.js), 네트워크 없이 도는 단위 테스트로는
// 더 이상 검증할 수 없다. isEventEnded만 순수 로직이라 여기 남겨둔다.

test("isEventEnded: 수동 종료 또는 종료 예정일 경과 여부로 판단한다", () => {
  assert.equal(isEventEnded({ isEnded: false, endDate: null }), false);
  assert.equal(isEventEnded({ isEnded: true, endDate: null }), true);

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  assert.equal(isEventEnded({ isEnded: false, endDate: yesterday }), true);
  assert.equal(isEventEnded({ isEnded: false, endDate: tomorrow }), false);
});
