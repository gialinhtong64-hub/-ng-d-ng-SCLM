
import { supabase } from '../supabaseClient';

type CreateUserParams = {
  userId: number;           // Số 5 chữ số (chuẩn backend)
  accountName?: string | null;
  username?: string | null;
  email: string;
  password: string;
};

const USERNAME_MIN = 3;
const USERNAME_MAX = 30;
const USERNAME_RE = /^[a-z0-9._-]+$/; // lowercase letters, digits, dot, underscore, dash

function normalizeBaseUsername(input: string) {
  // from email or display name -> safe base
  // take part before @ for email, lower, replace spaces and invalid chars with '-'
  let base = input.split('@')[0] ?? input;
  base = base.toLowerCase().trim();
  base = base.replace(/\s+/g, '.'); // spaces -> dot
  base = base.replace(/[^a-z0-9._-]/g, ''); // remove invalid chars
  if (base.length === 0) base = 'user';
  if (base.length > USERNAME_MAX) base = base.slice(0, USERNAME_MAX);
  // ensure length at least USERNAME_MIN by padding numbers if needed
  while (base.length < USERNAME_MIN) base = base + '0';
  return base;
}

function validateUsername(username: string) {
  if (!username) return 'Username is required';
  if (username.length < USERNAME_MIN) return `Username must be at least ${USERNAME_MIN} characters`;
  if (username.length > USERNAME_MAX) return `Username must be at most ${USERNAME_MAX} characters`;
  if (!USERNAME_RE.test(username)) return 'Username contains invalid characters';
  return null;
}

function randomSuffix(length = 4) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let s = '';
  for (let i = 0; i < length; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

/**
 * Try to create user safely:
 * - If username not provided, derive from email/accountName
 * - Validate username
 * - Try up to maxAttempts to insert (on unique conflict add suffix)
 * - Return { data, error } similar to supabase
 */
export async function createUserSafe(params: CreateUserParams, maxAttempts = 3) {
  const { userId, accountName, username: inputUsername, email, password } = params;
  // Đảm bảo userId là number 5 chữ số
  if (typeof userId !== 'number' || isNaN(userId) || userId < 10000 || userId > 99999) {
    return { data: null, error: { message: 'ID người dùng phải là số SCLM 5 chữ số!', status: 400 } };
  }

  // Step 1: derive base username if not provided
  let base = inputUsername ? inputUsername.toLowerCase().trim() : null;
  if (!base) {
    base = accountName ? normalizeBaseUsername(accountName) : normalizeBaseUsername(email);
  }

  // Step 2: sanitize/truncate
  if (base.length > USERNAME_MAX) base = base.slice(0, USERNAME_MAX);

  // Step 3: attempt loop
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const candidate = attempt === 0 ? base : `${base}${randomSuffix(3)}`; // append short suffix on retries
    const validationErr = validateUsername(candidate);
    if (validationErr) {
      return { data: null, error: { message: validationErr, status: 400 } };
    }

    const nowIso = new Date().toISOString();
    const payload = {
      id: userId, // kiểu number, đúng chuẩn Supabase
      account_name: accountName ?? null,
      username: candidate,
      email,
      password,
      balance: 0,
      created_at: nowIso,
    };

    // Try insert
    const { data, error } = await supabase.from('users').insert(payload);

    if (!error) {
      // success
      return { data, error: null };
    }

    // If unique violation on username, retry; otherwise return error
    // Supabase errors: message often contains 'duplicate key value' or code '23505'
    const msg = (error as any)?.message ?? '';
    const code = (error as any)?.code ?? null;

    const isUniqueViolation =
      typeof msg === 'string' && msg.toLowerCase().includes('duplicate') ||
      code === '23505';

    if (!isUniqueViolation) {
      // unexpected error, return immediately
      return { data: null, error };
    }

    // else unique violation -> continue to next attempt
    // if last attempt, return friendly error
    if (attempt === maxAttempts - 1) {
      return {
        data: null,
        error: { message: 'Username đã tồn tại. Vui lòng chọn tên khác.', status: 409 },
      };
    }

    // otherwise loop to try next candidate
  }

  // fallback (shouldn't reach)
  return { data: null, error: { message: 'Không thể tạo user, thử lại sau.', status: 500 } };
}
  // ...existing code...
// ...existing code...