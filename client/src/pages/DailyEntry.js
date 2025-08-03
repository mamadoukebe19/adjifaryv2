import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import Layout from '../components/Layout';
import { stockAPI } from '../services/api';

const DailyEntry = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [pbaTypes, setPbaTypes] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadPbaTypes();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      loadDailyStock();
    }
  }, [selectedDate]);

  const loadPbaTypes = async () => {
    try {
      const response = await stockAPI.getPbaTypes();
      setPbaTypes(response.data);
      initializeStockData(response.data);
    } catch (error) {
      setMessage('Erreur lors du chargement des types PBA');
    }
  };

  const loadDailyStock = async () => {
    try {
      const dateStr = selectedDate.format('YYYY-MM-DD');
      const response = await stockAPI.getDailyStock(dateStr);
      
      if (response.data.length > 0) {
        setStockData(response.data.map(item => ({
          pba_type_id: item.pba_type_id,
          code: item.code,
          description: item.description,
          stock_initial: item.stock_initial || 0,
          production: item.production || 0,
          livraison: item.livraison || 0,
          avaries: item.avaries || 0,
          observations: item.observations || '',
        })));
      } else {
        initializeStockData(pbaTypes);
      }
    } catch (error) {
      setMessage('Erreur lors du chargement des données');
    }
  };

  const initializeStockData = (types) => {
    setStockData(types.map(type => ({
      pba_type_id: type.id,
      code: type.code,
      description: type.description,
      stock_initial: 0,
      production: 0,
      livraison: 0,
      avaries: 0,
      observations: '',
    })));
  };

  const handleInputChange = (index, field, value) => {
    const newData = [...stockData];
    newData[index][field] = field === 'observations' ? value : parseInt(value) || 0;
    setStockData(newData);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setMessage('');

    try {
      await stockAPI.saveDailyStock({
        date: selectedDate.format('YYYY-MM-DD'),
        stockData: stockData,
      });
      setMessage('Données sauvegardées avec succès');
    } catch (error) {
      setMessage('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const calculateStockActuel = (item) => {
    return item.stock_initial + item.production - item.livraison - item.avaries;
  };

  return (
    <Layout title="Saisie Quotidienne">
      <Box sx={{ mb: 3 }}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Date"
            value={selectedDate}
            onChange={setSelectedDate}
            format="DD/MM/YYYY"
            sx={{ mr: 2 }}
          />
        </LocalizationProvider>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          sx={{ ml: 2 }}
        >
          {loading ? 'Sauvegarde...' : 'Sauvegarder'}
        </Button>
      </Box>

      {message && (
        <Alert severity={message.includes('succès') ? 'success' : 'error'} sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Code PBA</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Stock Initial</TableCell>
              <TableCell>Production</TableCell>
              <TableCell>Livraison</TableCell>
              <TableCell>Avaries</TableCell>
              <TableCell>Stock Actuel</TableCell>
              <TableCell>Observations</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stockData.map((item, index) => (
              <TableRow key={item.pba_type_id}>
                <TableCell>{item.code}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell>{item.stock_initial}</TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    value={item.production}
                    onChange={(e) => handleInputChange(index, 'production', e.target.value)}
                    size="small"
                    inputProps={{ min: 0 }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    value={item.livraison}
                    onChange={(e) => handleInputChange(index, 'livraison', e.target.value)}
                    size="small"
                    inputProps={{ min: 0 }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    value={item.avaries}
                    onChange={(e) => handleInputChange(index, 'avaries', e.target.value)}
                    size="small"
                    inputProps={{ min: 0 }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {calculateStockActuel(item)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <TextField
                    value={item.observations}
                    onChange={(e) => handleInputChange(index, 'observations', e.target.value)}
                    size="small"
                    multiline
                    rows={1}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Layout>
  );
};

export default DailyEntry;