-- Create agents table
CREATE TABLE IF NOT EXISTS agents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_number CHAR(6) NOT NULL UNIQUE,
    password_hash CHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create pages table
CREATE TABLE IF NOT EXISTS pages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    page_name VARCHAR(20) NOT NULL,
    section_name VARCHAR(10) NOT NULL,
    lang CHAR(2) NOT NULL,
    content_type VARCHAR(3) NOT NULL,
    visible BOOLEAN NOT NULL DEFAULT 1,
    display_order INTEGER NOT NULL DEFAULT 0,
    attributes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create contents table
CREATE TABLE IF NOT EXISTS contents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ref_id INTEGER NOT NULL,
    short_desc VARCHAR(150),
    long_desc TEXT,
    image_path VARCHAR(100),
    title VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ref_id) REFERENCES pages(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_agents_number ON agents(agent_number);
CREATE INDEX IF NOT EXISTS idx_pages_name ON pages(page_name);
CREATE INDEX IF NOT EXISTS idx_pages_lang ON pages(lang);
CREATE INDEX IF NOT EXISTS idx_contents_ref ON contents(ref_id);
