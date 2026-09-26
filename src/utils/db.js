// Menjalankan query Supabase; melempar error jika gagal, mengembalikan data jika sukses
async function unwrap(query) {
  const { data, error } = await query;
  if (error) throw error;
  return data;
}
module.exports = { unwrap };
