import { sql } from '@vercel/postgres';

// Database schema types
export interface Group {
  id: number;
  code: string;
  name: string;
  student_names: string;
  created_at: Date;
  phase: number;
  status: 'active' | 'pending_approval' | 'approved' | 'completed';
}

export interface ActivityLog {
  id: number;
  group_id: number;
  timestamp: Date;
  action: string;
  detail: string;
}

export interface Interview {
  id: number;
  group_id: number;
  role_id: string;
  questions_asked: number;
  started_at: Date;
  last_message_at: Date;
}

export interface Download {
  id: number;
  group_id: number;
  file_id: string;
  timestamp: Date;
}

// Initialize database tables
export async function initializeDatabase() {
  try {
    // Create groups table
    await sql`
      CREATE TABLE IF NOT EXISTS groups (
        id SERIAL PRIMARY KEY,
        code VARCHAR(8) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        student_names TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        phase INTEGER DEFAULT 1,
        status VARCHAR(20) DEFAULT 'active'
      )
    `;

    // Create activity_log table
    await sql`
      CREATE TABLE IF NOT EXISTS activity_log (
        id SERIAL PRIMARY KEY,
        group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        action VARCHAR(50) NOT NULL,
        detail TEXT
      )
    `;

    // Create interviews table
    await sql`
      CREATE TABLE IF NOT EXISTS interviews (
        id SERIAL PRIMARY KEY,
        group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
        role_id VARCHAR(20) NOT NULL,
        questions_asked INTEGER DEFAULT 0,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(group_id, role_id)
      )
    `;

    // Create downloads table
    await sql`
      CREATE TABLE IF NOT EXISTS downloads (
        id SERIAL PRIMARY KEY,
        group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
        file_id VARCHAR(50) NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(group_id, file_id)
      )
    `;

    // Create chat_messages table for conversation history
    await sql`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
        role_id VARCHAR(20) NOT NULL,
        role_type VARCHAR(10) NOT NULL,
        content TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create action_proposals table
    await sql`
      CREATE TABLE IF NOT EXISTS action_proposals (
        id SERIAL PRIMARY KEY,
        group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
        root_cause_id VARCHAR(20) NOT NULL,
        description TEXT NOT NULL,
        responsible VARCHAR(100),
        cost INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    return { success: true };
  } catch (error) {
    console.error('Database initialization error:', error);
    return { success: false, error };
  }
}

// Generate unique group code
export function generateGroupCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Group operations
export async function createGroup(name: string, studentNames: string) {
  const code = generateGroupCode();

  const result = await sql`
    INSERT INTO groups (code, name, student_names)
    VALUES (${code}, ${name}, ${studentNames})
    RETURNING *
  `;

  // Log the creation
  await logActivity(result.rows[0].id, 'group_created', `Grupp "${name}" skapad`);

  return result.rows[0] as Group;
}

export async function getGroupByCode(code: string) {
  const result = await sql`
    SELECT * FROM groups WHERE code = ${code}
  `;
  return result.rows[0] as Group | undefined;
}

export async function updateGroupPhase(groupId: number, phase: number) {
  await sql`
    UPDATE groups SET phase = ${phase} WHERE id = ${groupId}
  `;
  await logActivity(groupId, 'phase_changed', `Fas ändrad till ${phase}`);
}

export async function updateGroupStatus(groupId: number, status: string) {
  await sql`
    UPDATE groups SET status = ${status} WHERE id = ${groupId}
  `;
  await logActivity(groupId, 'status_changed', `Status ändrad till ${status}`);
}

// Activity logging
export async function logActivity(groupId: number, action: string, detail: string) {
  await sql`
    INSERT INTO activity_log (group_id, action, detail)
    VALUES (${groupId}, ${action}, ${detail})
  `;
}

export async function getActivityLog(groupId: number) {
  const result = await sql`
    SELECT * FROM activity_log
    WHERE group_id = ${groupId}
    ORDER BY timestamp DESC
  `;
  return result.rows as ActivityLog[];
}

// Interview operations
export async function startInterview(groupId: number, roleId: string) {
  const result = await sql`
    INSERT INTO interviews (group_id, role_id)
    VALUES (${groupId}, ${roleId})
    ON CONFLICT (group_id, role_id) DO UPDATE
    SET last_message_at = CURRENT_TIMESTAMP
    RETURNING *
  `;
  return result.rows[0] as Interview;
}

export async function incrementQuestions(groupId: number, roleId: string) {
  await sql`
    UPDATE interviews
    SET questions_asked = questions_asked + 1,
        last_message_at = CURRENT_TIMESTAMP
    WHERE group_id = ${groupId} AND role_id = ${roleId}
  `;
}

export async function getInterviews(groupId: number) {
  const result = await sql`
    SELECT * FROM interviews WHERE group_id = ${groupId}
  `;
  return result.rows as Interview[];
}

// Download operations
export async function recordDownload(groupId: number, fileId: string) {
  await sql`
    INSERT INTO downloads (group_id, file_id)
    VALUES (${groupId}, ${fileId})
    ON CONFLICT (group_id, file_id) DO NOTHING
  `;
  await logActivity(groupId, 'file_downloaded', `Fil nedladdad: ${fileId}`);
}

export async function getDownloads(groupId: number) {
  const result = await sql`
    SELECT * FROM downloads WHERE group_id = ${groupId}
  `;
  return result.rows as Download[];
}

// Chat message operations
export async function saveChatMessage(
  groupId: number,
  roleId: string,
  roleType: 'user' | 'assistant',
  content: string
) {
  await sql`
    INSERT INTO chat_messages (group_id, role_id, role_type, content)
    VALUES (${groupId}, ${roleId}, ${roleType}, ${content})
  `;
}

export async function getChatHistory(groupId: number, roleId: string) {
  const result = await sql`
    SELECT * FROM chat_messages
    WHERE group_id = ${groupId} AND role_id = ${roleId}
    ORDER BY timestamp ASC
  `;
  return result.rows;
}

// Get group statistics
export async function getGroupStats(groupId: number) {
  const interviews = await sql`
    SELECT COUNT(*) as count FROM interviews WHERE group_id = ${groupId}
  `;

  const downloads = await sql`
    SELECT COUNT(*) as count FROM downloads WHERE group_id = ${groupId}
  `;

  return {
    interviewsCount: parseInt(interviews.rows[0].count),
    downloadsCount: parseInt(downloads.rows[0].count)
  };
}
