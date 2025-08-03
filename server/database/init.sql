-- Création de la base de données DOCC Stock Management

-- Table des utilisateurs
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'employee' CHECK (role IN ('admin', 'employee')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des types de PBA
CREATE TABLE pba_types (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    description VARCHAR(100)
);

-- Table des mouvements de stock quotidiens
CREATE TABLE daily_stock (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    pba_type_id INTEGER REFERENCES pba_types(id),
    stock_initial INTEGER DEFAULT 0,
    production INTEGER DEFAULT 0,
    livraison INTEGER DEFAULT 0,
    avaries INTEGER DEFAULT 0,
    stock_actuel INTEGER GENERATED ALWAYS AS (stock_initial + production - livraison - avaries) STORED,
    observations TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date, pba_type_id)
);

-- Insertion des types de PBA
INSERT INTO pba_types (code, description) VALUES
('9AR150', 'Poteau béton armé 9m AR150'),
('9AR300', 'Poteau béton armé 9m AR300'),
('9AR400', 'Poteau béton armé 9m AR400'),
('9AR650', 'Poteau béton armé 9m AR650'),
('12AR400', 'Poteau béton armé 12m AR400'),
('12AR650', 'Poteau béton armé 12m AR650'),
('12B1000', 'Poteau béton armé 12m B1000'),
('12B1250', 'Poteau béton armé 12m B1250'),
('12B1600', 'Poteau béton armé 12m B1600'),
('12B2000', 'Poteau béton armé 12m B2000'),
('10B2000', 'Poteau béton armé 10m B2000');

-- Insertion des utilisateurs par défaut
INSERT INTO users (username, password, role) VALUES
('admin', '$2b$10$CwTycUXWue0Thq9StjUM0uJ8.jjAiAOyG1J5dI/aq.o1.dq0GarK.', 'admin'), -- password: password
('employee', '$2b$10$CwTycUXWue0Thq9StjUM0uJ8.jjAiAOyG1J5dI/aq.o1.dq0GarK.', 'employee'); -- password: password

-- Index pour optimiser les requêtes
CREATE INDEX idx_daily_stock_date ON daily_stock(date);
CREATE INDEX idx_daily_stock_pba_type ON daily_stock(pba_type_id);