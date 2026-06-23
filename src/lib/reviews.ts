export async function attachProfiles(
  supabase: any,
  reviews: any[],
): Promise<any[]> {
  const userIds = [...new Set((reviews ?? []).map(r => r.user_id).filter(Boolean))]
  if (userIds.length === 0) return reviews ?? []

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .in('id', userIds)

  const profileMap = Object.fromEntries((profiles ?? []).map((p: any) => [p.id, p]))
  return (reviews ?? []).map(r => ({
    ...r,
    profile: profileMap[r.user_id] ?? null,
  }))
}
