const { supabaseAdmin } = require('../config/supabase');
const { unwrap } = require('../utils/db');
const HttpError = require('../utils/HttpError');

/** Kelas yang boleh dilihat: guru = kelas yang ia ajar, kepala sekolah = semua kelas di sekolahnya. */
async function getAccessibleClasses(user) {
  let q = supabaseAdmin.from('classes').select('id, name, grade, teacher_id')
    .eq('school_id', user.school_id).order('grade').order('name');
  if (user.role === 'teacher') q = q.eq('teacher_id', user.id);
  return unwrap(q);
}

async function assertClassAccess(user, classId) {
  const cls = await unwrap(supabaseAdmin.from('classes').select('id, name, grade, teacher_id, school_id')
    .eq('id', classId).maybeSingle());
  if (!cls || cls.school_id !== user.school_id || (user.role === 'teacher' && cls.teacher_id !== user.id)) {
    throw new HttpError(404, 'Kelas tidak ditemukan atau di luar wewenang Anda.');
  }
  return cls;
}

async function assertStudentAccess(user, studentId) {
  const student = await unwrap(supabaseAdmin.from('students').select('id, full_name, class_id, school_id, active')
    .eq('id', studentId).maybeSingle());
  if (!student || student.school_id !== user.school_id) throw new HttpError(404, 'Siswa tidak ditemukan.');
  const cls = await assertClassAccess(user, student.class_id);
  return { ...student, class: cls };
}

module.exports = { getAccessibleClasses, assertClassAccess, assertStudentAccess };
