/**
 * Kristallball Relational Database Schema Definitions
 * Supporting PostgreSQL / SQLite relational models with strict ACID compliance.
 */

export const BaseSchema = {
  tableName: 'bases',
  fields: {
    id: 'INTEGER PRIMARY KEY AUTOINCREMENT / SERIAL',
    name: 'VARCHAR(100) NOT NULL UNIQUE',
    location: 'VARCHAR(150) NOT NULL',
    code: 'VARCHAR(20) NOT NULL UNIQUE',
    created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
  }
};

export const UserSchema = {
  tableName: 'users',
  fields: {
    id: 'INTEGER PRIMARY KEY AUTOINCREMENT / SERIAL',
    username: 'VARCHAR(50) UNIQUE NOT NULL',
    password_hash: 'VARCHAR(255) NOT NULL',
    role: "VARCHAR(30) CHECK (role IN ('ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER'))",
    base_id: 'INT REFERENCES bases(id) ON DELETE SET NULL',
    full_name: 'VARCHAR(100) NOT NULL',
    rank: 'VARCHAR(50) NOT NULL',
    created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
  }
};

export const EquipmentTypeSchema = {
  tableName: 'equipment_types',
  fields: {
    id: 'INTEGER PRIMARY KEY AUTOINCREMENT / SERIAL',
    name: 'VARCHAR(100) NOT NULL UNIQUE',
    category: "VARCHAR(50) CHECK (category IN ('WEAPON', 'VEHICLE', 'AMMUNITION', 'EQUIPMENT'))",
    model_number: 'VARCHAR(50)',
    unit_of_measure: 'VARCHAR(30) DEFAULT UNITS'
  }
};

export const PurchaseSchema = {
  tableName: 'purchases',
  fields: {
    id: 'INTEGER PRIMARY KEY AUTOINCREMENT / SERIAL',
    base_id: 'INT REFERENCES bases(id) ON DELETE CASCADE',
    equipment_type_id: 'INT REFERENCES equipment_types(id) ON DELETE CASCADE',
    quantity: 'INT NOT NULL CHECK (quantity > 0)',
    unit_cost: 'REAL DEFAULT 0.0',
    supplier: 'VARCHAR(150) NOT NULL',
    date: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    created_by: 'INT REFERENCES users(id)'
  }
};

export const TransferSchema = {
  tableName: 'transfers',
  fields: {
    id: 'INTEGER PRIMARY KEY AUTOINCREMENT / SERIAL',
    source_base_id: 'INT REFERENCES bases(id)',
    destination_base_id: 'INT REFERENCES bases(id)',
    equipment_type_id: 'INT REFERENCES equipment_types(id)',
    quantity: 'INT NOT NULL CHECK (quantity > 0)',
    status: "VARCHAR(20) DEFAULT 'COMPLETED' CHECK (status IN ('PENDING', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED'))",
    notes: 'TEXT',
    timestamp: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    initiated_by: 'INT REFERENCES users(id)'
  }
};

export const AuditLogSchema = {
  tableName: 'audit_logs',
  fields: {
    id: 'INTEGER PRIMARY KEY AUTOINCREMENT / SERIAL',
    user_id: 'INT REFERENCES users(id)',
    action: 'VARCHAR(50) NOT NULL',
    details: 'TEXT NOT NULL',
    ip_address: 'VARCHAR(50)',
    created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
  }
};
