const db = require('../config/db');

class PredictionService {
  // Obtener datos históricos para un usuario
  async getHistoricalData(userId) {
    try {
      const [rows] = await db.promise().query(
        `SELECT 
          mes_periodo,
          año_periodo,
          total
         FROM huella_carbono
         WHERE id_usuario = ?
         ORDER BY año_periodo ASC, mes_periodo ASC`,
        [userId]
      );
      
      return rows;
    } catch (error) {
      console.error('Error al obtener datos históricos:', error);
      throw error;
    }
  }

  // Calcular predicción adaptativa según cantidad de datos
  calculateAdaptivePrediction(historicalData) {
    const n = historicalData.length;
    
    // Caso 1: Sin datos
    if (n === 0) {
      throw new Error('No hay datos históricos para realizar la predicción');
    }
    
    // Caso 2: Solo 1 mes de datos
    if (n === 1) {
      const lastValue = historicalData[0].total;
      return {
        prediction: lastValue,
        trend: 'estable',
        changePercent: 0,
        method: 'Último valor'
      };
    }
    
    // Caso 3: 2 meses de datos
    if (n === 2) {
      const lastValue = historicalData[1].total;
      const prevValue = historicalData[0].total;
      const avg = (lastValue + prevValue) / 2;
      const changePercent = ((lastValue - prevValue) / prevValue) * 100;
      
      let trend = 'estable';
      if (changePercent > 5) trend = 'sube';
      if (changePercent < -5) trend = 'baja';
      
      return {
        prediction: avg,
        trend,
        changePercent,
        method: 'Promedio simple'
      };
    }
    
    // Caso 4: 3+ meses de datos (regresión lineal)
    return this.calculateLinearRegression(historicalData);
  }

  // Calcular regresión lineal (para 3+ meses)
  calculateLinearRegression(data) {
    const n = data.length;
    
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;

    data.forEach((item, index) => {
      const x = index + 1;
      const y = item.total;
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumX2 += x * x;
    });

    // Calcular coeficientes
    const beta1 = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const beta0 = (sumY - beta1 * sumX) / n;

    // Predecir el siguiente período (n+1)
    const nextPeriod = n + 1;
    const prediction = beta0 + beta1 * nextPeriod;

    // Calcular cambio porcentual
    const lastValue = data[data.length - 1].total;
    const changePercent = ((prediction - lastValue) / lastValue) * 100;

    // Determinar tendencia
    let trend = 'estable';
    if (changePercent > 5) trend = 'sube';
    if (changePercent < -5) trend = 'baja';

    return {
      prediction: parseFloat(prediction.toFixed(2)),
      trend,
      changePercent: parseFloat(changePercent.toFixed(2)),
      method: 'Regresión Lineal'
    };
  }

  // Generar nueva predicción (actualizado)
  async generatePrediction(userId) {
    try {
      // Obtener datos históricos
      const historicalData = await this.getHistoricalData(userId);
      
      // Calcular predicción adaptativa
      const predictionData = this.calculateAdaptivePrediction(historicalData);
      
      // Determinar mes y año de predicción
      const lastEntry = historicalData[historicalData.length - 1];
      let predictionMonth = lastEntry.mes_periodo + 1;
      let predictionYear = lastEntry.año_periodo;
      
      if (predictionMonth > 12) {
        predictionMonth = 1;
        predictionYear++;
      }
      
      const [result] = await db.promise().query(
        `INSERT INTO predicciones (
          id_usuario, 
          mes_predicho, 
          año_prediccion, 
          valor_predicho, 
          tendencia, 
          cambio_porcentual,
          modelo_usado
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          valor_predicho = VALUES(valor_predicho),
          tendencia = VALUES(tendencia),
          cambio_porcentual = VALUES(cambio_porcentual),
          modelo_usado = VALUES(modelo_usado)`,
        [
          userId,
          predictionMonth,
          predictionYear,
          predictionData.prediction,
          predictionData.trend,
          predictionData.changePercent,
          predictionData.method
        ]
      );
      
      return {
        id_prediccion: result.insertId,
        mes_predicho: predictionMonth,
        año_prediccion: predictionYear,
        ...predictionData
      };
      
    } catch (error) {
      console.error('Error al generar predicción:', error);
      throw error;
    }
  }

  // Obtener todas las predicciones de un usuario
  async getUserPredictions(userId) {
    try {
      const [predictions] = await db.promise().query(
        `SELECT 
          id_prediccion,
          mes_predicho,
          año_prediccion,
          valor_predicho,
          tendencia,
          cambio_porcentual,
          modelo_usado,
          fecha_prediccion
         FROM predicciones
         WHERE id_usuario = ?
         ORDER BY año_prediccion DESC, mes_predicho DESC`,
        [userId]
      );
      
      return predictions;
    } catch (error) {
      console.error('Error al obtener predicciones:', error);
      throw error;
    }
  }

  // Actualizar una predicción
  async updatePrediction(predictionId, updateData) {
    try {
      const { valor_predicho, tendencia, cambio_porcentual } = updateData;
      
      await db.promise().query(
        `UPDATE predicciones
         SET 
          valor_predicho = ?,
          tendencia = ?,
          cambio_porcentual = ?,
          fecha_prediccion = CURRENT_TIMESTAMP
         WHERE id_prediccion = ?`,
        [valor_predicho, tendencia, cambio_porcentual, predictionId]
      );
      
      return this.getPredictionById(predictionId);
    } catch (error) {
      console.error('Error al actualizar predicción:', error);
      throw error;
    }
  }

  // Obtener una predicción por ID
  async getPredictionById(predictionId) {
    try {
      const [predictions] = await db.promise().query(
        `SELECT * 
         FROM predicciones
         WHERE id_prediccion = ?`,
        [predictionId]
      );
      
      if (predictions.length === 0) {
        throw new Error('Predicción no encontrada');
      }
      
      return predictions[0];
    } catch (error) {
      console.error('Error al obtener predicción por ID:', error);
      throw error;
    }
  }
}

module.exports = new PredictionService();