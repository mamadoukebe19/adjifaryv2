import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Chip,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import Layout from '../components/Layout';
import { stockAPI } from '../services/api';

const History = () => {
  const [history, setHistory] = useState([]);
  const [pbaTypes, setPbaTypes] = useState([]);
  const [filters, setFilters] = useState({
    period: 'month',
    selectedDate: dayjs(),
    pbaType: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPbaTypes();
    loadHistory();
  }, []);

  const loadPbaTypes = async () => {
    try {
      const response = await stockAPI.getPbaTypes();
      setPbaTypes(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des types PBA:', error);
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
        startDate = selectedDate.subtract(30, 'day');
        endDate = selectedDate;
    }

    return { startDate, endDate };
  };

  const loadHistory = async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = getDateRange();
      const params = {
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
      };
      
      if (filters.pbaType) {
        params.pbaType = filters.pbaType;
      }

      const response = await stockAPI.getStockHistory(params);
      setHistory(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const formatDate = (dateString) => {
    return dayjs(dateString).format('DD/MM/YYYY');
  };

  const getStockStatus = (stockActuel) => {
    if (stockActuel < 10) return { color: 'error', label: 'Critique' };
    if (stockActuel < 50) return { color: 'warning', label: 'Faible' };
    return { color: 'success', label: 'Normal' };
  };

  return (
    <Layout title="Historique des Mouvements">
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
          <Grid item xs={12} sm={6} md={3}>
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
            <FormControl fullWidth>
              <InputLabel>Type PBA</InputLabel>
              <Select
                value={filters.pbaType}
                onChange={(e) => handleFilterChange('pbaType', e.target.value)}
                label="Type PBA"
              >
                <MenuItem value="">Tous les types</MenuItem>
                {pbaTypes.map((type) => (
                  <MenuItem key={type.id} value={type.code}>
                    {type.code}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              onClick={loadHistory}
              disabled={loading}
              fullWidth
            >
              {loading ? 'Chargement...' : 'Filtrer'}
            </Button>
          </Grid>
        </Grid>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Code PBA</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Stock Initial</TableCell>
              <TableCell align="right">Production</TableCell>
              <TableCell align="right">Livraison</TableCell>
              <TableCell align="right">Avaries</TableCell>
              <TableCell align="right">Stock Actuel</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Saisi par</TableCell>
              <TableCell>Observations</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {history.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} align="center">
                  <Typography variant="body2" color="textSecondary">
                    Aucune donnée trouvée pour la période sélectionnée
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              history.map((row) => {
                const status = getStockStatus(row.stock_actuel);
                return (
                  <TableRow key={`${row.date}-${row.pba_type_id}`}>
                    <TableCell>{formatDate(row.date)}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {row.code}
                      </Typography>
                    </TableCell>
                    <TableCell>{row.description}</TableCell>
                    <TableCell align="right">{row.stock_initial}</TableCell>
                    <TableCell align="right">
                      <Typography color="primary" fontWeight="bold">
                        +{row.production}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography color="warning.main" fontWeight="bold">
                        -{row.livraison}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography color="error" fontWeight="bold">
                        -{row.avaries}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight="bold" color={status.color}>
                        {row.stock_actuel}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={status.label}
                        color={status.color}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{row.username || 'N/A'}</TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap>
                        {row.observations || '-'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {history.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="textSecondary">
            Total: {history.length} enregistrement(s)
          </Typography>
        </Box>
      )}
    </Layout>
  );
};

export default History;