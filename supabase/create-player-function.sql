-- Crear función mejorada para insertar jugadores con manejo de errores
-- Ejecutar en SQL Editor de Supabase

CREATE OR REPLACE FUNCTION create_player_safe(
    p_nickname TEXT,
    p_avatar_url TEXT DEFAULT NULL,
    p_assault_skill INTEGER DEFAULT 50,
    p_scout_skill INTEGER DEFAULT 50,
    p_rear_guard_skill INTEGER DEFAULT 50,
    p_experience INTEGER DEFAULT 0,
    p_team_id UUID DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
    result JSON;
    player_id UUID;
BEGIN
    -- Validar que nickname no esté vacío
    IF p_nickname IS NULL OR LENGTH(TRIM(p_nickname)) = 0 THEN
        RETURN json_build_object(
            'success', false,
            'error', 'El nickname es obligatorio'
        );
    END IF;
    
    -- Validar que nickname no esté duplicado
    IF EXISTS (SELECT 1 FROM players WHERE nickname = TRIM(p_nickname)) THEN
        RETURN json_build_object(
            'success', false,
            'error', 'El nickname ya existe'
        );
    END IF;
    
    -- Insertar jugador
    INSERT INTO players (
        nickname,
        avatar_url,
        assault_skill,
        scout_skill,
        rear_guard_skill,
        experience,
        team_id
    ) VALUES (
        TRIM(p_nickname),
        p_avatar_url,
        COALESCE(p_assault_skill, 50),
        COALESCE(p_scout_skill, 50),
        COALESCE(p_rear_guard_skill, 50),
        COALESCE(p_experience, 0),
        p_team_id
    ) RETURNING id INTO player_id;
    
    -- Retornar éxito
    RETURN json_build_object(
        'success', true,
        'player_id', player_id,
        'message', 'Jugador creado exitosamente'
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$ LANGUAGE plpgsql;