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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import Layout from '../components/Layout';
import { stockAPI } from '../services/api';

const Inventory = () => {
  const [inventoryData, setInventoryData] = useState([]);
  const [filters, setFilters] = useState({
    period: 'day',
    selectedDate: dayjs(),
  });
  const [totals, setTotals] = useState({
    totalStockInitial: 0,
    totalProduction: 0,
    totalLivraison: 0,
    totalAvaries: 0,
    totalStockActuel: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInventoryData();
  }, [filters]);

  const loadInventoryData = async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = getDateRange();
      
      // Charger les types PBA et l'historique
      const [pbaTypesResponse, historyResponse] = await Promise.all([
        stockAPI.getPbaTypes(),
        stockAPI.getStockHistory({
          startDate: startDate.format('YYYY-MM-DD'),
          endDate: endDate.format('YYYY-MM-DD'),
        })
      ]);

      const groupedData = groupDataByPBA(historyResponse.data, pbaTypesResponse.data);
      setInventoryData(groupedData);
      calculateTotals(groupedData);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'inventaire:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = () => {
    const { period, selectedDate } = filters;
    let startDate, endDate;

    switch (period) {
      case 'day':
        startDate = selectedDate;
        endDate = selectedDate;
        break;
      case 'week':
        startDate = selectedDate.startOf('week');
        endDate = selectedDate.endOf('week');
        break;
      case 'month':
        startDate = selectedDate.startOf('month');
        endDate = selectedDate.endOf('month');
        break;
      default:
        startDate = selectedDate;
        endDate = selectedDate;
    }

    return { startDate, endDate };
  };

  const groupDataByPBA = (data, pbaTypes) => {
    const grouped = {};
    
    // Initialiser tous les types PBA
    pbaTypes.forEach(type => {
      grouped[type.code] = {
        code: type.code,
        description: type.description,
        stockInitial: 0,
        production: 0,
        livraison: 0,
        avaries: 0,
        stockActuel: 0,
        count: 0,
      };
    });
    
    // Remplir avec les données réelles
    data.forEach(item => {
      if (grouped[item.code]) {
        grouped[item.code].production += item.production || 0;
        grouped[item.code].livraison += item.livraison || 0;
        grouped[item.code].avaries += item.avaries || 0;
        
        // Pour le stock initial, prendre la valeur la plus récente non-zéro
        if (item.stock_initial > grouped[item.code].stockInitial) {
          grouped[item.code].stockInitial = item.stock_initial;
        }
        
        // Pour le stock actuel, prendre la dernière valeur
        grouped[item.code].stockActuel = item.stock_actuel || 0;
        
        grouped[item.code].count += 1;
      }
    });

    return Object.values(grouped);
  };

  const calculateTotals = (data) => {
    const totals = data.reduce((acc, item) => ({
      totalStockInitial: acc.totalStockInitial + item.stockInitial,
      totalProduction: acc.totalProduction + item.production,
      totalLivraison: acc.totalLivraison + item.livraison,
      totalAvaries: acc.totalAvaries + item.avaries,
      totalStockActuel: acc.totalStockActuel + item.stockActuel,
    }), {
      totalStockInitial: 0,
      totalProduction: 0,
      totalLivraison: 0,
      totalAvaries: 0,
      totalStockActuel: 0,
    });

    setTotals(totals);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const getPeriodLabel = () => {
    const { period, selectedDate } = filters;
    switch (period) {
      case 'day':
        return `Jour: ${selectedDate.format('DD/MM/YYYY')}`;
      case 'week':
        return `Semaine du ${selectedDate.startOf('week').format('DD/MM')} au ${selectedDate.endOf('week').format('DD/MM/YYYY')}`;
      case 'month':
        return `Mois: ${selectedDate.format('MMMM YYYY')}`;
      default:
        return '';
    }
  };

  const StatCard = ({ title, value, color = '#1976d2' }) => (
    <Card>
      <CardContent>
        <Typography color="textSecondary" gutterBottom variant="body2">
          {title}
        </Typography>
        <Typography variant="h5" component="div" style={{ color }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Layout title="Inventaire">
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Période</InputLabel>
              <Select
                value={filters.period}
                onChange={(e) => handleFilterChange('period', e.target.value)}
                label="Période"
              >
                <MenuItem value="day">Jour</MenuItem>
                <MenuItem value="week">Semaine</MenuItem>
                <MenuItem value="month">Mois</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Date"
                value={filters.selectedDate}
                onChange={(value) => handleFilterChange('selectedDate', value)}
                format="DD/MM/YYYY"
                fullWidth
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              onClick={loadInventoryData}
              disabled={loading}
              fullWidth
            >
              {loading ? 'Chargement...' : 'Actualiser'}
            </Button>
          </Grid>
          <Grid item xs={12} md={2}>
            <Typography variant="h6" color="primary">
              {getPeriodLabel()}
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Cartes récapitulatives */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard title="Stock Initial Total" value={totals.totalStockInitial} color="#9c27b0" />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard title="Production Total" value={totals.totalProduction} color="#2196f3" />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard title="Livraison Total" value={totals.totalLivraison} color="#ff9800" />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard title="Avaries Total" value={totals.totalAvaries} color="#f44336" />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard title="Stock Actuel Total" value={totals.totalStockActuel} color="#4caf50" />
        </Grid>
      </Grid>

      {/* Tableau détaillé */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Inventaire Détaillé par Type de PBA
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Code PBA</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Stock Initial</TableCell>
                  <TableCell align="right">Production</TableCell>
                  <TableCell align="right">Livraison</TableCell>
                  <TableCell align="right">Avaries</TableCell>
                  <TableCell align="right">Stock Actuel</TableCell>
                  <TableCell align="right">Nb Entrées</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {inventoryData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography variant="body2" color="textSecondary">
                        Aucune donnée disponible pour la période sélectionnée
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  inventoryData.map((item) => (
                    <TableRow key={item.code}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {item.code}
                        </Typography>
                      </TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell align="right">
                        <Typography color="textSecondary">
                          {item.stockInitial}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography color="primary" fontWeight="bold">
                          +{item.production}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography color="warning.main" fontWeight="bold">
                          -{item.livraison}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography color="error" fontWeight="bold">
                          -{item.avaries}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography 
                          fontWeight="bold" 
                          color={item.stockActuel < 10 ? 'error' : 'success.main'}
                        >
                          {item.stockActuel}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="textSecondary">
                          {item.count}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                )}
                {inventoryData.length > 0 && (
                  <TableRow sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
                    <TableCell colSpan={2}>
                      <Typography variant="body1" fontWeight="bold">
                        TOTAUX
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight="bold">
                        {totals.totalStockInitial}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography color="primary" fontWeight="bold">
                        +{totals.totalProduction}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography color="warning.main" fontWeight="bold">
                        -{totals.totalLivraison}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography color="error" fontWeight="bold">
                        -{totals.totalAvaries}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography color="success.main" fontWeight="bold">
                        {totals.totalStockActuel}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight="bold">
                        {inventoryData.reduce((sum, item) => sum + item.count, 0)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Layout>
  );
};

export default Inventory;