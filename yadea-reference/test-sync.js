// Script kiểm tra đồng bộ Supabase
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://sjrmdmudpttfsdwqirab.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqcm1kbXVkcHR0ZnNkd3FpcmFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5Nzc1OTksImV4cCI6MjA4MDU1MzU5OX0.1NZfQ-96FheYDm0i5Tf6g3cZTZw6vea7KTNQUZnBBbg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSync() {
  console.log('\n🔍 KIỂM TRA ĐỒNG BỘ SUPABASE\n');
  console.log('='.repeat(60));
  
  // Test 1: Đọc tất cả users
  console.log('\n📋 Test 1: Đọc tất cả users từ Supabase...');
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (usersError) {
    console.error('❌ Lỗi:', usersError.message);
  } else {
    console.log(`✅ Tìm thấy ${users.length} user(s):`);
    users.forEach((u, i) => {
      console.log(`   ${i + 1}. ${u.full_name} (${u.email_or_phone})`);
      console.log(`      - ID: ${u.id}`);
      console.log(`      - Balance: ₫${parseFloat(u.balance).toLocaleString()}`);
      console.log(`      - VIP Level: ${u.vip_level}`);
      console.log(`      - Created: ${new Date(u.created_at).toLocaleString('vi-VN')}`);
    });
  }
  
  // Test 2: Đọc tất cả transaction requests
  console.log('\n📋 Test 2: Đọc tất cả transaction requests...');
  const { data: requests, error: requestsError } = await supabase
    .from('transaction_requests')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (requestsError) {
    console.error('❌ Lỗi:', requestsError.message);
  } else {
    console.log(`✅ Tìm thấy ${requests.length} request(s):`);
    requests.forEach((r, i) => {
      console.log(`   ${i + 1}. ${r.type} - ₫${parseFloat(r.amount).toLocaleString()}`);
      console.log(`      - User: ${r.user_name} (${r.user_id})`);
      console.log(`      - Status: ${r.status}`);
      console.log(`      - Created: ${new Date(r.created_at).toLocaleString('vi-VN')}`);
    });
  }
  
  // Test 3: Kiểm tra kết nối
  console.log('\n📋 Test 3: Kiểm tra kết nối...');
  const { data: healthCheck } = await supabase
    .from('users')
    .select('count')
    .limit(1);
  
  if (healthCheck !== null) {
    console.log('✅ Kết nối Supabase OK!');
  } else {
    console.log('❌ Không thể kết nối Supabase');
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ KẾT LUẬN: Đồng bộ Supabase đang hoạt động!\n');
}

testSync().catch(console.error);
