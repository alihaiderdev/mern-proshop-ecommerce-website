import express from 'express';
import dotenv from 'dotenv';
import colors from 'colors';
import morgan from 'morgan';
import path from 'path';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

dotenv.config();

connectDB();

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json()); // parse all requests.body data

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/api/config/paypal', (req, res) => res.send(process.env.PAYPAL_CLIENT_ID));

// making upload folder static
// yahan pa ya __dirname tab hi sahi work karta hai jab hum isa common js formate ma ya require wale formate ma use karain Es6 ya import ma ya us tarha sa work nhi karta so is ko wesa behavior get karna ka lia hum ya nicha aak line of code kar raha hain // const __dirname = path.resolve()
const __dirname = path.resolve();
console.log('__dirname : ', __dirname);
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// custom middleware for 404 not found
app.use(notFound);

// custom middleware error handle
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold)
);
