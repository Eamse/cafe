/* ==========================================================================
   Supabase 클라이언트 — 메뉴/카테고리/공지/이벤트 데이터의 단일 접속점.
   ========================================================================== */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://hnbbenpafqlguwzocwub.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_FTNiIHRCh4XbV65_FXlpCA_PJ6zQ-5f";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
