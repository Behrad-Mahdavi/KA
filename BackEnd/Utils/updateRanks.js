import prisma from './prisma.js';

export async function updateStudentRankings(client = prisma) {
  try {
    await client.$executeRaw`
      WITH ranked AS (
        SELECT 
          id,
          DENSE_RANK() OVER (ORDER BY score DESC)::int as s_rank,
          DENSE_RANK() OVER (PARTITION BY COALESCE(branch, 'پسرانه') ORDER BY score DESC)::int as b_rank,
          DENSE_RANK() OVER (PARTITION BY grade ORDER BY score DESC)::int as g_rank,
          DENSE_RANK() OVER (PARTITION BY grade, class ORDER BY score DESC)::int as c_rank
        FROM "User"
        WHERE role = 'student'
      )
      UPDATE "User" u
      SET 
        "rankInSchool" = r.s_rank,
        "rankInBranch" = r.b_rank,
        "rankInGrade" = r.g_rank,
        "rankInClass" = r.c_rank
      FROM ranked r
      WHERE u.id = r.id;
    `;
  } catch (err) {
    console.error('Error in updateStudentRankings:', err);
  }
}

export default updateStudentRankings;
