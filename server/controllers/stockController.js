const pool = require('../database/db');

const getPbaTypes = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pba_types ORDER BY code');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des types PBA' });
  }
};

const getDailyStock = async (req, res) => {
  try {
    const { date } = req.params;
    const result = await pool.query(`
      SELECT ds.*, pt.code, pt.description 
      FROM daily_stock ds
      JOIN pba_types pt ON ds.pba_type_id = pt.id
      WHERE ds.date = $1
      ORDER BY pt.code
    `, [date]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération du stock' });
  }
};

const createOrUpdateDailyStock = async (req, res) => {
  try {
    const { date, stockData } = req.body;
    const userId = req.user.id;

    await pool.query('BEGIN');

    for (const item of stockData) {
      const { pba_type_id, production, livraison, avaries, observations } = item;
      
      // Récupérer le stock initial (stock actuel de la veille)
      const previousDay = new Date(date);
      previousDay.setDate(previousDay.getDate() - 1);
      
      const stockInitialResult = await pool.query(`
        SELECT stock_actuel FROM daily_stock 
        WHERE date = $1 AND pba_type_id = $2
      `, [previousDay.toISOString().split('T')[0], pba_type_id]);
      
      const stockInitial = stockInitialResult.rows.length > 0 ? stockInitialResult.rows[0].stock_actuel : 0;

      await pool.query(`
        INSERT INTO daily_stock (date, pba_type_id, stock_initial, production, livraison, avaries, observations, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (date, pba_type_id)
        DO UPDATE SET
          production = EXCLUDED.production,
          livraison = EXCLUDED.livraison,
          avaries = EXCLUDED.avaries,
          observations = EXCLUDED.observations,
          created_by = EXCLUDED.created_by
      `, [date, pba_type_id, stockInitial, production, livraison, avaries, observations, userId]);
    }

    await pool.query('COMMIT');
    res.json({ message: 'Stock mis à jour avec succès' });
  } catch (error) {
    await pool.query('ROLLBACK');
    res.status(500).json({ error: 'Erreur lors de la mise à jour du stock' });
  }
};

const getStockHistory = async (req, res) => {
  try {
    const { startDate, endDate, pbaType } = req.query;
    
    let query = `
      SELECT ds.*, pt.code, pt.description, u.username
      FROM daily_stock ds
      JOIN pba_types pt ON ds.pba_type_id = pt.id
      LEFT JOIN users u ON ds.created_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (startDate) {
      params.push(startDate);
      query += ` AND ds.date >= $${params.length}`;
    }

    if (endDate) {
      params.push(endDate);
      query += ` AND ds.date <= $${params.length}`;
    }

    if (pbaType) {
      params.push(pbaType);
      query += ` AND pt.code = $${params.length}`;
    }

    query += ' ORDER BY ds.date DESC, pt.code';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'historique' });
  }
};

const getDashboardData = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Stock actuel par type
    const currentStockResult = await pool.query(`
      SELECT pt.code, pt.description, 
             COALESCE(ds.stock_actuel, 0) as stock_actuel,
             COALESCE(ds.production, 0) as production_today,
             COALESCE(ds.livraison, 0) as livraison_today
      FROM pba_types pt
      LEFT JOIN daily_stock ds ON pt.id = ds.pba_type_id AND ds.date = $1
      ORDER BY pt.code
    `, [today]);

    // Totaux mensuels
    const monthlyTotalsResult = await pool.query(`
      SELECT 
        SUM(production) as total_production,
        SUM(livraison) as total_livraison,
        SUM(avaries) as total_avaries
      FROM daily_stock 
      WHERE date >= date_trunc('month', CURRENT_DATE)
    `);

    // Évolution des 7 derniers jours
    const weeklyEvolutionResult = await pool.query(`
      SELECT date, 
             SUM(production) as production,
             SUM(livraison) as livraison,
             SUM(avaries) as avaries
      FROM daily_stock 
      WHERE date >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY date
      ORDER BY date
    `);

    res.json({
      currentStock: currentStockResult.rows,
      monthlyTotals: monthlyTotalsResult.rows[0] || { total_production: 0, total_livraison: 0, total_avaries: 0 },
      weeklyEvolution: weeklyEvolutionResult.rows
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des données du dashboard' });
  }
};

module.exports = {
  getPbaTypes,
  getDailyStock,
  createOrUpdateDailyStock,
  getStockHistory,
  getDashboardData
};