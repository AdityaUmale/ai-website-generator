import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { websiteRoutes } from '../src/routes/website';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;


app.use(cors());
app.use(express.json());


app.use('/api/website', websiteRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});