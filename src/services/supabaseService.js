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

  // Crear foro asociado automáticamente (upsert para evitar duplicados)
  const { data: forum, error: forumError } = await supabase
    .from('team_forums')
    .upsert([{ team_id: team.id, is_public: is_public_forum }], { onConflict: 'team_id' })
    .select()
    .single()

  if (forumError) {
    console.error('[supabaseService] Error creando foro:', forumError)
    return { data: null, error: forumError }
  }

  return { data: { team, forum }, error: null }
}

export async function createPlayer({ nickname, avatar_url = null, contraseña, tipo_jugador = null, equipo = null, telefonojugador = null, zonadejuego = null, nombrecompleto = null, assault_skill = 0, scout_skill = 0, rear_guard_skill = 0, experience = 0, team_id = null }) {
  // Validación básica
  if (!nickname || !nickname.trim()) {
    return { 
      data: null, 
      error: { message: 'El nickname es obligatorio' } 
    }
  }

  if (!contraseña || !contraseña.trim()) {
    return { 
      data: null, 
      error: { message: 'La contraseña es obligatoria' } 
    }
  }

  try {
    const { data, error } = await supabase
      .from('players')
      .insert([{
        nickname: nickname.trim(),
        avatar_url,
        contraseña: contraseña.trim(),
        tipo_jugador: tipo_jugador?.trim() || null,
        equipo: equipo?.trim() || null,
        telefonojugador: telefonojugador?.trim() || null,
        zonadejuego: zonadejuego?.trim() || null,
        nombrecompleto: nombrecompleto?.trim() || null,
        assault_skill: Number(assault_skill) || 0,
        scout_skill: Number(scout_skill) || 0,
        rear_guard_skill: Number(rear_guard_skill) || 0,
        experience: Number(experience) || 0,
        team_id
      }])
      .select()
      .single()

    return { data, error }
  } catch (err) {
    console.error('Error en createPlayer:', err)
    return { 
      data: null, 
      error: { message: `Error inesperado: ${err.message}` } 
    }
  }
}

export async function updatePlayer(id, { nickname, avatar_url, contraseña, tipo_jugador, equipo, telefonojugador, zonadejuego, nombrecompleto, assault_skill, scout_skill, rear_guard_skill, experience, team_id }) {
  try {
    const updateData = {}
    
    // Solo actualizar campos que están definidos
    if (nickname !== undefined) updateData.nickname = nickname.trim()
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url
    if (contraseña !== undefined) updateData.contraseña = contraseña.trim()
    if (tipo_jugador !== undefined) updateData.tipo_jugador = tipo_jugador?.trim() || null
    if (equipo !== undefined) updateData.equipo = equipo?.trim() || null
    if (telefonojugador !== undefined) updateData.telefonojugador = telefonojugador?.trim() || null
    if (zonadejuego !== undefined) updateData.zonadejuego = zonadejuego?.trim() || null
    if (nombrecompleto !== undefined) updateData.nombrecompleto = nombrecompleto?.trim() || null
    if (assault_skill !== undefined) updateData.assault_skill = Number(assault_skill) || 0
    if (scout_skill !== undefined) updateData.scout_skill = Number(scout_skill) || 0
    if (rear_guard_skill !== undefined) updateData.rear_guard_skill = Number(rear_guard_skill) || 0
    if (experience !== undefined) updateData.experience = Number(experience) || 0
    if (team_id !== undefined) updateData.team_id = team_id

    const { data, error } = await supabase
      .from('players')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    return { data, error }
  } catch (err) {
    console.error('Error en updatePlayer:', err)
    return { 
      data: null, 
      error: { message: `Error inesperado: ${err.message}` } 
    }
  }
}

// Función para verificar si un nickname ya existe
export async function checkNicknameExists(nickname) {
  const { data, error } = await supabase
    .from('players')
    .select('nickname')
    .eq('nickname', nickname.trim())
    .maybeSingle()

  if (error) {
    console.error('Error verificando nickname:', error)
    return { exists: false, error }
  }

  return { exists: !!data, error: null }
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

export async function createGame({ created_by, team_id = null, title, date = null, game_mode = null, status = 'draft', locacioncoordenadas = null, locacionclima = null }) {
  const { data, error } = await supabase
    .from('games')
    .insert([{ created_by, team_id, title, date, game_mode, status, locacioncoordenadas, locacionclima }])
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

// Función para crear equipo completo con jugadores y accesos - Versión mejorada
export async function createTeamWithPlayers({ 
  teamData, 
  playersData 
}) {
  try {
    // 1. Crear el equipo usando función directa de Supabase (sin crear foro manualmente)
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .insert([{
        name: teamData.name,
        logo_url: teamData.logo_url || null,
        team_photo_url: teamData.team_photo_url || null,
        is_public_forum: teamData.is_public_forum || true
      }])
      .select()
      .single()
    
    if (teamError) {
      console.error('Error creando equipo:', teamError)
      return { data: null, error: teamError }
    }

    // 2. Obtener o crear foro (manejar caso donde el trigger ya lo creó)
    let forum = null
    try {
      const { data: existingForum } = await supabase
        .from('team_forums')
        .select('*')
        .eq('team_id', team.id)
        .maybeSingle()

      if (existingForum) {
        forum = existingForum
      } else {
        // Si no existe, crearlo manualmente
        const { data: newForum, error: forumInsertError } = await supabase
          .from('team_forums')
          .insert([{ team_id: team.id, is_public: teamData.is_public_forum || true }])
          .select()
          .single()
        
        if (forumInsertError && !forumInsertError.message?.includes('duplicate')) {
          console.error('Error creando foro:', forumInsertError)
        } else {
          forum = newForum
        }
      }
    } catch (forumError) {
      console.error('Error manejando foro:', forumError)
      // Continuar sin foro si hay error
    }

    // 3. Crear jugadores y asignarlos al equipo
    const createdPlayers = []
    let leaderId = null
    let secondId = null

    for (const playerData of playersData) {
      // Crear jugador
      const { data: player, error: playerError } = await createPlayer({
        nickname: playerData.sobrenombre || playerData.nombre,
        avatar_url: playerData.avatar || null,
        contraseña: playerData.contraseña || 'default123', // Contraseña por defecto si no se proporciona
        tipo_jugador: playerData.experiencia || null, // Usar experiencia como tipo de jugador
        equipo: teamData.name || null, // Nombre del equipo
        telefonojugador: playerData.telefonojugador || null,
        zonadejuego: playerData.zonadejuego || null,
        nombrecompleto: playerData.nombrecompleto || null,
        assault_skill: playerData.habilidadAsalto || 50,
        scout_skill: playerData.habilidadExplorador || 50,
        rear_guard_skill: playerData.habilidadRetaguardia || 50,
        experience: playerData.experiencia === 'Novato' ? 0 : 
                   playerData.experiencia === 'Intermedio' ? 1 : 
                   playerData.experiencia === 'Avanzado' ? 2 : 
                   playerData.experiencia === 'Experto' ? 3 :
                   playerData.experiencia === 'Veterano' ? 4 : 0,
        team_id: team.id
      })

      if (playerError) {
        console.error('Error creando jugador:', playerError)
        continue
      }

      createdPlayers.push(player)

      // Determinar líder y segundo
      if (playerData.esLider) {
        leaderId = player.id
      }
      if (playerData.esSegundo) {
        secondId = player.id
      }

      // Crear acceso en access_requests si tiene contraseña (manejar duplicados)
      if (playerData.contraseña && playerData.contraseña.trim()) {
        const nickname = playerData.sobrenombre || playerData.nombre
        
        // Verificar si ya existe
        const { data: existingAccess } = await supabase
          .from('access_requests')
          .select('contact_name')
          .eq('contact_name', nickname)
          .maybeSingle()

        if (!existingAccess) {
          const { error: accessError } = await supabase
            .from('access_requests')
            .insert([{
              contact_name: nickname,
              password_hash: playerData.contraseña,
              email: `${nickname}@cpa.local`,
              status: 'approved'
            }])

          if (accessError && !accessError.message?.includes('duplicate')) {
            console.error('Error creando acceso:', accessError)
          }
        }
      }
    }

    // 4. Actualizar equipo con líder y segundo si existen
    if (leaderId || secondId) {
      const { error: updateError } = await updateTeam(team.id, {
        leader_id: leaderId,
        second_in_command_id: secondId
      })

      if (updateError) {
        console.error('Error actualizando líderes:', updateError)
      }
    }

    return { 
      data: { 
        team: team, 
        players: createdPlayers, 
        forum: forum 
      }, 
      error: null 
    }

  } catch (error) {
    console.error('Error en createTeamWithPlayers:', error)
    return { data: null, error }
  }
}

// Función para validar acceso de usuario (método anterior)
export async function validateAccess(contact_name, password) {
  const { data, error } = await supabase
    .from('access_requests')
    .select('*')
    .eq('contact_name', contact_name)
    .eq('password_hash', password)
    .maybeSingle()

  return { data, error }
}

// Nueva función para validar acceso de jugadores usando la tabla players
export async function validatePlayerAccess(nickname, password, equipo) {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('nickname', nickname)
    .eq('contraseña', password)
    .eq('equipo', equipo)
    .maybeSingle()

  return { data, error }
}

// Función simplificada para validar acceso solo con nickname y contraseña
export async function validatePlayerSimple(nickname, password) {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('nickname', nickname)
    .eq('contraseña', password)
    .maybeSingle()

  return { data, error }
}

// Función para obtener la lista de equipos
export async function getTeamsList() {
  const { data, error } = await supabase
    .from('teams')
    .select('name')
    .order('name')

  return { data, error }
}

// Función para obtener información completa de equipos
export async function getTeamsComplete() {
  const { data, error } = await supabase
    .from('teams')
    .select('id, name, logo_url, team_photo_url')
    .order('name')

  return { data, error }
}

// Función para obtener datos completos de un jugador por nickname
export async function getPlayerByNickname(nickname) {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('nickname', nickname)
    .maybeSingle()

  return { data, error }
}

// Export por defecto para importar fácilmente si se desea
const service = {
  createTeam,
  createPlayer,
  updatePlayer,
  checkNicknameExists,
  createGame,
  addGameObjective,
  registerTeamToGame,
  addParticipantToRegistration,
  createTeamWithPlayers,
  validateAccess,
  validatePlayerAccess,
  validatePlayerSimple,
  getTeamsList,
  getTeamsComplete
}

export default service
