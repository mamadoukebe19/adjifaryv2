const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../database/db');

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Tentative de connexion:', username);

    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    
    if (result.rows.length === 0) {
      console.log('Utilisateur non trouvé');
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    const user = result.rows[0];
    console.log('Utilisateur trouvé:', user.username);
    
    const validPassword = await bcrypt.compare(password, user.password);
    console.log('Mot de passe valide:', validPassword);

    if (!validPassword) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'docc_jwt_secret_key_2024',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

module.exports = { login };