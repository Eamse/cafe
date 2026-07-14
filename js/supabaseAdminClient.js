/* ==========================================================================
   Supabase 클라이언트 — 관리자 페이지 전용.

   고객용 클라이언트(supabaseClient.js)와 완전히 같은 프로젝트를 쓰지만,
   세션을 별도의 storageKey에 저장해 브라우저 로그인 상태를 분리한다.
   그렇지 않으면 세션이 localStorage에 공유돼서, 한 탭에서 관리자로
   로그인하는 순간 다른 탭에 열려 있던 고객 로그인 세션이 덮어써져
   튕겨나가는 문제가 생긴다.
   ========================================================================== */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://hnbbenpafqlguwzocwub.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_FTNiIHRCh4XbV65_FXlpCA_PJ6zQ-5f";

export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storageKey: "sb-cafe-admin-auth",
  },
});
