import supabase from '../lib/supabaseClient'

// Contrato rápido (inputs/outputs):
// - createTeam({ name, logo_url, team_photo_url, leader_id, second_in_command_id, is_public_forum }) => { data, error }
// - createPlayer(player) => { data, error }
// - createGame(game) => { data, error }
// - addGameObjective(gameId, objective) => { data, error }
// - registerTeamToGame({ game_id, team_id, status }) => { data, error }

export async function createTeam({ name, logo_url = null, team_photo_url = null, leader_id = null, second_in_command_id = null, is_public_forum = true }) {
  // Insertar equipo
  const { data: team, error: teamError } = await supabase
    .from('teams')
    .insert([{
      name,
      logo_url,
      team_photo_url,
      leader_id,
      second_in_command_id,
      is_public_forum
    }])
    .select()
    .single()

  if (teamError) return { data: null, error: teamError }

  // Crear foro asociado automáticamente
  const { data: forum, error: forumError } = await supabase
    .from('team_forums')
    .insert([{ team_id: team.id, is_public: is_public_forum }])
    .select()
    .single()

  if (forumError) {
    // Intentamos eliminar el equipo si no se creó el foro (opcional)
  console.error('[supabaseService] Error creando foro:', forumError)
    return { data: null, error: forumError }
  }

  return { data: { team, forum }, error: null }
}

export async function createPlayer({ user_id = null, nickname, avatar_url = null, assault_skill = 0, scout_skill = 0, rear_guard_skill = 0, experience = 0, team_id = null }) {
  const { data, error } = await supabase
    .from('players')
    .insert([{
      user_id,
      nickname,
      avatar_url,
      assault_skill,
      scout_skill,
      rear_guard_skill,
      experience,
      team_id
    }])
    .select()
    .single()

  return { data, error }
}

export async function getTeams() {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .order('created_at', { ascending: true })

  return { data, error }
}

export async function getTeamById(id) {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  return { data, error }
}

export async function getPlayersByTeam(team_id) {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('team_id', team_id)
    .order('created_at', { ascending: true })

  return { data, error }
}

export async function updateTeam(id, patch) {
  const { data, error } = await supabase
    .from('teams')
    .update(patch)
    .eq('id', id)
    .select()
    .single()

  return { data, error }
}

export async function createGame({ created_by, team_id = null, title, date = null, game_mode = null, status = 'draft' }) {
  const { data, error } = await supabase
    .from('games')
    .insert([{ created_by, team_id, title, date, game_mode, status }])
    .select()
    .single()

  return { data, error }
}

export async function getGames() {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .order('created_at', { ascending: true })

  return { data, error }
}

export async function getGameById(id) {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  return { data, error }
}

export async function updateGame(id, patch) {
  const { data, error } = await supabase
    .from('games')
    .update(patch)
    .eq('id', id)
    .select()
    .single()

  return { data, error }
}

export async function addGameObjective(game_id, { type = 'objective', description = '', status = 'pending', score = 0 }) {
  const { data, error } = await supabase
    .from('game_objectives')
    .insert([{ game_id, type, description, status, score }])
    .select()
    .single()

  return { data, error }
}

export async function registerTeamToGame({ game_id, team_id, status = 'pending' }) {
  const { data, error } = await supabase
    .from('game_registrations')
    .insert([{ game_id, team_id, status }])
    .select()
    .single()

  return { data, error }
}

export async function addParticipantToRegistration(registration_id, { player_name, team_name = null, payment_proof_url = null, privacy_notice_accepted = false, confirmation_status = 'pending' }) {
  const { data, error } = await supabase
    .from('game_participants')
    .insert([{ registration_id, player_name, team_name, payment_proof_url, privacy_notice_accepted, confirmation_status }])
    .select()
    .single()

  return { data, error }
}

export async function getRegistrationsByGame(game_id) {
  const { data, error } = await supabase
    .from('game_registrations')
    .select('*')
    .eq('game_id', game_id)
    .order('created_at', { ascending: true })

  return { data, error }
}

export async function getParticipantsByRegistration(registration_id) {
  const { data, error } = await supabase
    .from('game_participants')
    .select('*')
    .eq('registration_id', registration_id)
    .order('created_at', { ascending: true })

  return { data, error }
}

export async function getForumByTeam(team_id) {
  const { data, error } = await supabase
    .from('team_forums')
    .select('*')
    .eq('team_id', team_id)
    .maybeSingle()

  return { data, error }
}

export async function getForumPosts(forum_id) {
  const { data, error } = await supabase
    .from('forum_posts')
    .select('*')
    .eq('forum_id', forum_id)
    .order('created_at', { ascending: false })

  return { data, error }
}

export async function createForumPost({ forum_id, author_id = null, title = '', content = '' }) {
  const { data, error } = await supabase
    .from('forum_posts')
    .insert([{ forum_id, author_id, title, content }])
    .select()
    .single()

  return { data, error }
}

// Función para validar acceso de usuario
export async function validateAccess(contact_name, password) {
  const { data, error } = await supabase
    .from('access_requests')
    .select('*')
    .eq('contact_name', contact_name)
    .eq('password_hash', password)
    .maybeSingle()

  return { data, error }
}

// Export por defecto para importar fácilmente si se desea
const service = {
  createTeam,
  createPlayer,
  createGame,
  addGameObjective,
  registerTeamToGame,
  addParticipantToRegistration,
  validateAccess
}

export default service
