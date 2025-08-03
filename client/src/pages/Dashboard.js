import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import Layout from '../components/Layout';
import { stockAPI } from '../services/api';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    currentStock: [],
    monthlyTotals: { total_production: 0, total_livraison: 0, total_avaries: 0 },
    weeklyEvolution: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await stockAPI.getDashboardData();
      setDashboardData(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement du dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, color = '#1976d2' }) => (
    <Card>
      <CardContent>
        <Typography color="textSecondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h4" component="div" style={{ color }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );

  if (loading) {
    return <Layout title="Dashboard PDG"><Typography>Chargement...</Typography></Layout>;
  }

  const totalStockActuel = dashboardData.currentStock.reduce((sum, item) => sum + item.stock_actuel, 0);

  return (
    <Layout title="Dashboard PDG">
      <Grid container spacing={3}>
        {/* Cartes récapitulatives */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Stock Total Actuel" value={totalStockActuel} color="#4caf50" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Production Mensuelle" value={dashboardData.monthlyTotals.total_production} color="#2196f3" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Livraisons Mensuelles" value={dashboardData.monthlyTotals.total_livraison} color="#ff9800" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Avaries Mensuelles" value={dashboardData.monthlyTotals.total_avaries} color="#f44336" />
        </Grid>

        {/* Graphique d'évolution hebdomadaire */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Évolution des 7 derniers jours
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dashboardData.weeklyEvolution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="production" stroke="#2196f3" name="Production" />
                  <Line type="monotone" dataKey="livraison" stroke="#ff9800" name="Livraison" />
                  <Line type="monotone" dataKey="avaries" stroke="#f44336" name="Avaries" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Graphique stock actuel par type */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Stock Actuel par Type
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dashboardData.currentStock}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="code" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="stock_actuel" fill="#4caf50" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Tableau détaillé du stock actuel */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Stock Détaillé par Type de PBA
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Code PBA</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">Stock Actuel</TableCell>
                      <TableCell align="right">Production Aujourd'hui</TableCell>
                      <TableCell align="right">Livraison Aujourd'hui</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboardData.currentStock.map((item) => (
                      <TableRow key={item.code}>
                        <TableCell component="th" scope="row">
                          <Typography variant="body2" fontWeight="bold">
                            {item.code}
                          </Typography>
                        </TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell align="right">
                          <Typography 
                            variant="body2" 
                            fontWeight="bold"
                            color={item.stock_actuel < 10 ? 'error' : 'textPrimary'}
                          >
                            {item.stock_actuel}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">{item.production_today}</TableCell>
                        <TableCell align="right">{item.livraison_today}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  );
};

export default Dashboard;