import 'reflect-metadata';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import userRoutes from './routes/UserRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

app.use('/users', userRoutes);

app.listen(PORT, () => {
  console.log(`App is running on port: ${PORT}`);
});
