import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Alert,
  Box,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import Layout from '../components/Layout';
import { stockAPI } from '../services/api';

const InitialStock = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [pbaTypes, setPbaTypes] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadPbaTypes();
  }, []);

  const loadPbaTypes = async () => {
    try {
      const response = await stockAPI.getPbaTypes();
      setPbaTypes(response.data);
      initializeStockData(response.data);
    } catch (error) {
      setMessage('Erreur lors du chargement des types PBA');
    }
  };

  const initializeStockData = (types) => {
    setStockData(types.map(type => ({
      pba_type_id: type.id,
      code: type.code,
      description: type.description,
      stock_initial: 0,
    })));
  };

  const handleInputChange = (index, value) => {
    const newData = [...stockData];
    newData[index].stock_initial = parseInt(value) || 0;
    setStockData(newData);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setMessage('');

    try {
      const dataToSave = stockData.map(item => ({
        pba_type_id: item.pba_type_id,
        production: 0,
        livraison: 0,
        avaries: 0,
        observations: 'Stock initial ajouté',
      }));

      await stockAPI.saveInitialStock({
        date: selectedDate.format('YYYY-MM-DD'),
        stockData: stockData.map(item => ({
          pba_type_id: item.pba_type_id,
          stock_initial: item.stock_initial,
        })),
      });
      setMessage('Stock initial sauvegardé avec succès');
    } catch (error) {
      setMessage('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Ajout Stock Initial">
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
          {loading ? 'Sauvegarde...' : 'Sauvegarder Stock Initial'}
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
            </TableRow>
          </TableHead>
          <TableBody>
            {stockData.map((item, index) => (
              <TableRow key={item.pba_type_id}>
                <TableCell>{item.code}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    value={item.stock_initial}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    size="small"
                    inputProps={{ min: 0 }}
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

export default InitialStock;