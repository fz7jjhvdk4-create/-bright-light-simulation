import { sql } from '@vercel/postgres';

// Database schema types
export type SubPhase = 'intro' | 'prestudy' | 'planning' | 'execution' | 'closing';

// Gate statuses
export type GateStatus = 'not_submitted' | 'pending' | 'approved' | 'rejected';

export interface Group {
  id: number;
  code: string;
  name: string;
  student_names: string;
  created_at: Date;
  phase: number; // 1 = Projektdefinition, 2 = Projektplan, 3 = Utredning, 4 = Redovisning
  sub_phase: SubPhase;
  // Legacy fields (kept for backwards compatibility)
  project_plan_approved: boolean;
  investigation_approved: boolean;
  // Four-gate system
  gate1_status: GateStatus; // Projektdirektiv
  gate2_status: GateStatus; // Projektplan
  gate3_status: GateStatus; // Utredningsrapport
  gate4_status: GateStatus; // Slutredovisning
  status: 'active' | 'pending_approval' | 'pending_gate1' | 'pending_gate2' | 'pending_gate3' | 'pending_gate4' | 'approved' | 'completed';
}

export interface ProjectDefinition {
  id: number;
  group_id: number;
  purpose: string;
  goals: string;
  scope: string;
  exclusions: string;
  success_criteria: string;
  created_at: Date;
}

export interface InvestigationReport {
  id: number;
  group_id: number;
  summary: string;
  methodology: string;
  root_causes: string; // JSON string
  conclusions: string;
  recommendations: string;
  created_at: Date;
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
    // Create groups table with sub_phase and project_plan_approved
    await sql`
      CREATE TABLE IF NOT EXISTS groups (
        id SERIAL PRIMARY KEY,
        code VARCHAR(8) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        student_names TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        phase INTEGER DEFAULT 1,
        sub_phase VARCHAR(20) DEFAULT 'intro',
        project_plan_approved BOOLEAN DEFAULT FALSE,
        status VARCHAR(20) DEFAULT 'active'
      )
    `;

    // Add new columns if they don't exist (for existing databases)
    try {
      await sql`ALTER TABLE groups ADD COLUMN IF NOT EXISTS sub_phase VARCHAR(20) DEFAULT 'intro'`;
      await sql`ALTER TABLE groups ADD COLUMN IF NOT EXISTS project_plan_approved BOOLEAN DEFAULT FALSE`;
      await sql`ALTER TABLE groups ADD COLUMN IF NOT EXISTS investigation_approved BOOLEAN DEFAULT FALSE`;
      // Four-gate columns
      await sql`ALTER TABLE groups ADD COLUMN IF NOT EXISTS gate1_status VARCHAR(20) DEFAULT 'not_submitted'`;
      await sql`ALTER TABLE groups ADD COLUMN IF NOT EXISTS gate2_status VARCHAR(20) DEFAULT 'not_submitted'`;
      await sql`ALTER TABLE groups ADD COLUMN IF NOT EXISTS gate3_status VARCHAR(20) DEFAULT 'not_submitted'`;
      await sql`ALTER TABLE groups ADD COLUMN IF NOT EXISTS gate4_status VARCHAR(20) DEFAULT 'not_submitted'`;
    } catch (e) {
      // Columns may already exist
    }

    // Migration: Fix groups stuck in wrong phase after gate approval
    try {
      // Groups with gate2 approved should be in phase 3
      await sql`UPDATE groups SET phase = 3 WHERE gate2_status = 'approved' AND phase = 2`;
      // Groups with gate3 approved should be in phase 4
      await sql`UPDATE groups SET phase = 4 WHERE gate3_status = 'approved' AND phase = 3`;
      // Groups with gate4 approved should be completed
      await sql`UPDATE groups SET status = 'completed' WHERE gate4_status = 'approved' AND status != 'completed'`;
    } catch (e) {
      // Migration may fail if columns don't exist yet
    }

    // Create investigation_reports table
    await sql`
      CREATE TABLE IF NOT EXISTS investigation_reports (
        id SERIAL PRIMARY KEY,
        group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
        summary TEXT,
        methodology TEXT,
        root_causes TEXT,
        conclusions TEXT,
        recommendations TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(group_id)
      )
    `;

    // Create budget_allocations table
    await sql`
      CREATE TABLE IF NOT EXISTS budget_allocations (
        id SERIAL PRIMARY KEY,
        group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
        proposal_id INTEGER NOT NULL,
        allocated INTEGER DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create project_events table for Phase 2 events
    await sql`
      CREATE TABLE IF NOT EXISTS project_events (
        id SERIAL PRIMARY KEY,
        group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
        event_type VARCHAR(50) NOT NULL,
        week INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        impact_budget INTEGER DEFAULT 0,
        impact_time INTEGER DEFAULT 0,
        resolved BOOLEAN DEFAULT FALSE,
        resolution TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create final_reports table
    await sql`
      CREATE TABLE IF NOT EXISTS final_reports (
        id SERIAL PRIMARY KEY,
        group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
        executive_summary TEXT,
        results_vs_goals TEXT,
        budget_summary TEXT,
        lessons_learned TEXT,
        recommendations TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(group_id)
      )
    `;

    // Create project_definitions table
    await sql`
      CREATE TABLE IF NOT EXISTS project_definitions (
        id SERIAL PRIMARY KEY,
        group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
        purpose TEXT,
        goals TEXT,
        scope TEXT,
        exclusions TEXT,
        success_criteria TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(group_id)
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
        timeline VARCHAR(200),
        cost_reduction INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Add new columns to action_proposals if they don't exist
    try {
      await sql`ALTER TABLE action_proposals ADD COLUMN IF NOT EXISTS timeline VARCHAR(200)`;
      await sql`ALTER TABLE action_proposals ADD COLUMN IF NOT EXISTS cost_reduction INTEGER`;
    } catch (e) {
      // Columns may already exist
    }

    // Create document_views table
    await sql`
      CREATE TABLE IF NOT EXISTS document_views (
        id SERIAL PRIMARY KEY,
        group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
        document_id VARCHAR(50) NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(group_id, document_id)
      )
    `;

    // Create investigation_tools_data table
    await sql`
      CREATE TABLE IF NOT EXISTS investigation_tools_data (
        id SERIAL PRIMARY KEY,
        group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
        tools_7qc TEXT,
        tools_7qm TEXT,
        five_why TEXT,
        problems TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(group_id)
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
  const upperCode = code.toUpperCase();
  const result = await sql`
    SELECT * FROM groups WHERE code = ${upperCode}
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

// Document view operations
export async function getDocumentViews(groupId: number) {
  const result = await sql`
    SELECT document_id FROM document_views WHERE group_id = ${groupId}
  `;
  return result.rows.map(r => r.document_id);
}

// Sub-phase operations
export async function updateSubPhase(groupId: number, subPhase: SubPhase) {
  await sql`
    UPDATE groups SET sub_phase = ${subPhase} WHERE id = ${groupId}
  `;
  await logActivity(groupId, 'sub_phase_changed', `Delfas ändrad till ${subPhase}`);
}

export async function approveProjectPlan(groupId: number) {
  // Use RETURNING to verify the update actually happened
  const result = await sql`
    UPDATE groups SET project_plan_approved = TRUE WHERE id = ${groupId}
    RETURNING id, project_plan_approved
  `;

  if (result.rows.length === 0) {
    throw new Error(`Failed to update project_plan_approved for group ${groupId}`);
  }

  await logActivity(groupId, 'project_plan_approved', 'Projektplan godkänd av lärare');

  return result.rows[0];
}

// Project definition operations
export async function saveProjectDefinition(
  groupId: number,
  definition: {
    purpose: string;
    goals: string;
    scope: string;
    exclusions: string;
    success_criteria: string;
  }
) {
  const result = await sql`
    INSERT INTO project_definitions (group_id, purpose, goals, scope, exclusions, success_criteria)
    VALUES (${groupId}, ${definition.purpose}, ${definition.goals}, ${definition.scope}, ${definition.exclusions}, ${definition.success_criteria})
    ON CONFLICT (group_id) DO UPDATE SET
      purpose = ${definition.purpose},
      goals = ${definition.goals},
      scope = ${definition.scope},
      exclusions = ${definition.exclusions},
      success_criteria = ${definition.success_criteria}
    RETURNING *
  `;
  await logActivity(groupId, 'project_definition_saved', 'Projektdefinition sparad');
  return result.rows[0] as ProjectDefinition;
}

export async function getProjectDefinition(groupId: number) {
  const result = await sql`
    SELECT * FROM project_definitions WHERE group_id = ${groupId}
  `;
  return result.rows[0] as ProjectDefinition | undefined;
}

// Investigation report operations
export async function saveInvestigationReport(
  groupId: number,
  report: {
    summary: string;
    methodology: string;
    root_causes: Array<{ id: string; title: string; description: string; evidence: string }>;
    conclusions: string;
    recommendations: string;
  }
) {
  const rootCausesJson = JSON.stringify(report.root_causes);
  const result = await sql`
    INSERT INTO investigation_reports (group_id, summary, methodology, root_causes, conclusions, recommendations)
    VALUES (${groupId}, ${report.summary}, ${report.methodology}, ${rootCausesJson}, ${report.conclusions}, ${report.recommendations})
    ON CONFLICT (group_id) DO UPDATE SET
      summary = ${report.summary},
      methodology = ${report.methodology},
      root_causes = ${rootCausesJson},
      conclusions = ${report.conclusions},
      recommendations = ${report.recommendations}
    RETURNING *
  `;
  return result.rows[0] as InvestigationReport;
}

export async function getInvestigationReport(groupId: number) {
  const result = await sql`
    SELECT * FROM investigation_reports WHERE group_id = ${groupId}
  `;
  if (result.rows[0]) {
    const report = result.rows[0] as InvestigationReport;
    return {
      ...report,
      root_causes: report.root_causes ? JSON.parse(report.root_causes) : []
    };
  }
  return undefined;
}

export async function approveInvestigation(groupId: number) {
  await sql`
    UPDATE groups SET investigation_approved = TRUE WHERE id = ${groupId}
  `;
  await logActivity(groupId, 'investigation_approved', 'Utredning godkänd av lärare');
}

// Four-gate system operations - using explicit queries since @vercel/postgres doesn't support dynamic column names
export async function submitGate(groupId: number, gateNumber: 1 | 2 | 3 | 4) {
  const status = `pending_gate${gateNumber}`;

  if (gateNumber === 1) {
    await sql`UPDATE groups SET gate1_status = 'pending', status = ${status} WHERE id = ${groupId}`;
  } else if (gateNumber === 2) {
    await sql`UPDATE groups SET gate2_status = 'pending', status = ${status} WHERE id = ${groupId}`;
  } else if (gateNumber === 3) {
    await sql`UPDATE groups SET gate3_status = 'pending', status = ${status} WHERE id = ${groupId}`;
  } else {
    await sql`UPDATE groups SET gate4_status = 'pending', status = ${status} WHERE id = ${groupId}`;
  }

  await logActivity(groupId, `gate${gateNumber}_submitted`, `Gate ${gateNumber} skickad för godkännande`);
}

export async function approveGate(groupId: number, gateNumber: 1 | 2 | 3 | 4, feedback?: string) {
  if (gateNumber === 1) {
    await sql`UPDATE groups SET gate1_status = 'approved', phase = 2, status = 'active', project_plan_approved = TRUE WHERE id = ${groupId}`;
  } else if (gateNumber === 2) {
    await sql`UPDATE groups SET gate2_status = 'approved', phase = 3, status = 'active' WHERE id = ${groupId}`;
  } else if (gateNumber === 3) {
    await sql`UPDATE groups SET gate3_status = 'approved', phase = 4, status = 'active', investigation_approved = TRUE WHERE id = ${groupId}`;
  } else if (gateNumber === 4) {
    await sql`UPDATE groups SET gate4_status = 'approved', status = 'completed' WHERE id = ${groupId}`;
  }

  await logActivity(groupId, `gate${gateNumber}_approved`, `Gate ${gateNumber} godkänd av lärare${feedback ? `: ${feedback}` : ''}`);
}

export async function rejectGate(groupId: number, gateNumber: 1 | 2 | 3 | 4, feedback: string) {
  if (gateNumber === 1) {
    await sql`UPDATE groups SET gate1_status = 'rejected', status = 'active' WHERE id = ${groupId}`;
  } else if (gateNumber === 2) {
    await sql`UPDATE groups SET gate2_status = 'rejected', status = 'active' WHERE id = ${groupId}`;
  } else if (gateNumber === 3) {
    await sql`UPDATE groups SET gate3_status = 'rejected', status = 'active' WHERE id = ${groupId}`;
  } else {
    await sql`UPDATE groups SET gate4_status = 'rejected', status = 'active' WHERE id = ${groupId}`;
  }

  await logActivity(groupId, `gate${gateNumber}_rejected`, `Gate ${gateNumber} avvisad: ${feedback}`);
}

export async function getGateRequirements(groupId: number) {
  // Get data needed to check gate requirements
  const interviews = await sql`SELECT COUNT(*) as count FROM interviews WHERE group_id = ${groupId}`;
  const downloads = await sql`SELECT COUNT(*) as count FROM downloads WHERE group_id = ${groupId}`;
  const proposals = await sql`SELECT COUNT(*) as count FROM action_proposals WHERE group_id = ${groupId}`;
  const projectDef = await getProjectDefinition(groupId);
  const investigationReport = await getInvestigationReport(groupId);

  return {
    interviewsCount: parseInt(interviews.rows[0].count),
    downloadsCount: parseInt(downloads.rows[0].count),
    proposalsCount: parseInt(proposals.rows[0].count),
    hasProjectDefinition: !!projectDef,
    hasInvestigationReport: !!investigationReport,
    projectDefinition: projectDef,
    investigationReport: investigationReport
  };
}

// Budget allocation operations
export async function saveBudgetAllocation(
  groupId: number,
  allocations: Array<{ proposalId: number; allocated: number; notes: string }>
) {
  // Delete existing allocations
  await sql`DELETE FROM budget_allocations WHERE group_id = ${groupId}`;

  // Insert new allocations
  for (const allocation of allocations) {
    await sql`
      INSERT INTO budget_allocations (group_id, proposal_id, allocated, notes)
      VALUES (${groupId}, ${allocation.proposalId}, ${allocation.allocated}, ${allocation.notes})
    `;
  }
}

export async function getBudgetAllocation(groupId: number) {
  const result = await sql`
    SELECT proposal_id as "proposalId", allocated, notes
    FROM budget_allocations
    WHERE group_id = ${groupId}
  `;
  return result.rows;
}

// Final report operations
export async function saveFinalReport(
  groupId: number,
  report: {
    executive_summary: string;
    results_vs_goals: string;
    budget_summary: string;
    lessons_learned: string;
    recommendations: string;
  }
) {
  const result = await sql`
    INSERT INTO final_reports (group_id, executive_summary, results_vs_goals, budget_summary, lessons_learned, recommendations)
    VALUES (${groupId}, ${report.executive_summary}, ${report.results_vs_goals}, ${report.budget_summary}, ${report.lessons_learned}, ${report.recommendations})
    ON CONFLICT (group_id) DO UPDATE SET
      executive_summary = ${report.executive_summary},
      results_vs_goals = ${report.results_vs_goals},
      budget_summary = ${report.budget_summary},
      lessons_learned = ${report.lessons_learned},
      recommendations = ${report.recommendations}
    RETURNING *
  `;
  return result.rows[0];
}

export async function getFinalReport(groupId: number) {
  const result = await sql`
    SELECT * FROM final_reports WHERE group_id = ${groupId}
  `;
  return result.rows[0];
}

export async function deleteGroup(groupId: number) {
  // Related tables have ON DELETE CASCADE, so this will clean up everything
  const result = await sql`
    DELETE FROM groups WHERE id = ${groupId} RETURNING *
  `;
  return result.rows[0];
}
