const pool = require('../database/db');

const setInitialStock = async (req, res) => {
  try {
    const { date, stockData } = req.body;
    const userId = req.user.id;
    
    console.log('Données reçues:', { date, stockData });

    await pool.query('BEGIN');

    for (const item of stockData) {
      const { pba_type_id, stock_initial } = item;
      console.log('Traitement:', { pba_type_id, stock_initial });
      
      await pool.query(`
        INSERT INTO daily_stock (date, pba_type_id, stock_initial, production, livraison, avaries, observations, created_by)
        VALUES ($1, $2, $3, 0, 0, 0, 'Stock initial défini', $4)
        ON CONFLICT (date, pba_type_id)
        DO UPDATE SET
          stock_initial = EXCLUDED.stock_initial,
          observations = EXCLUDED.observations
      `, [date, pba_type_id, stock_initial, userId]);
    }

    await pool.query('COMMIT');
    res.json({ message: 'Stock initial mis à jour avec succès' });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Erreur lors de la mise à jour du stock initial:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du stock initial' });
  }
};

module.exports = { setInitialStock };