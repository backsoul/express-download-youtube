const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
app.use(bodyParser.json());
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = ['http://localhost:5173', 'http://example.com'];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Origin not allowed by CORS'));
    }
  },
}));
let videoUrl = 'https://youtube.com/shorts/xa5RMebxWz4?feature=share';
app.post('/uploadVideo', (req, res) => {
  console.log(req.body);
  videoUrl = req.body.videoUrl;
  nameVideo = req.body.nameVideo + ".mp4";
  if (ytdl.validateURL(videoUrl)) {
    const videoStream = ytdl(videoUrl, {
      quality: 'highest'
    });
    const writeStream = fs.createWriteStream(nameVideo);
    videoStream.pipe(writeStream);
    videoStream.on('progress', (chunkSize, downloaded, total) => {
      const percent = (downloaded / total) * 100;
      console.log(`Downloaded: ${percent.toFixed(2)}%`);
    });

    writeStream.on('finish', () => {
      console.log('Download completed.');
      res.download(writeStream.path, 'video.mp4')
    });

    writeStream.on('error', (err) => {
      console.error('Error writing to file:', err);
    });
  } else {
    console.error('Invalid YouTube URL.');
  }
});

app.get('/videos/:name', (req, res) => {
  const nameVideo = req.params.name + ".mp4";
  const filePath = path.join(__dirname, nameVideo);
  const videoStream = fs.createReadStream(filePath);
  res.setHeader('Content-Type', 'video/mp4');
  videoStream.pipe(res);
  videoStream.on('error', (err) => {
    console.log("Error streaming the video:", err);
    res.status(500).send("Error streaming the video");
  });
});

app.get('/', (req, res) => {
  res.json({
    status: 'Server status OK'
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});