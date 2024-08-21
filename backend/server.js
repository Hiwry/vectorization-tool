const express = require('express');
const sharp = require('sharp');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const potrace = require('potrace');

const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

app.use('/output', express.static(path.join(__dirname, 'output')));

app.get('/download/:filename', (req, res) => {
    const filePath = path.join(__dirname, 'output', req.params.filename);
    res.download(filePath, req.params.filename, (err) => {
        if (err) {
            console.error('Error downloading file:', err);
            res.status(500).send('Error downloading file');
        }
    });
});

app.post('/vectorize', async (req, res) => {
    try {
        const { image } = req.body;
        console.log('Received image data');

        const buffer = Buffer.from(image.split(',')[1], 'base64');
        console.log('Image buffer created');

        const outputDir = path.join(__dirname, 'output');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir);
            console.log('Output directory created:', outputDir);
        }

        const pngOutputPath = path.join(outputDir, `image-${Date.now()}.png`);
        await sharp(buffer).png().toFile(pngOutputPath);
        console.log('PNG file saved:', pngOutputPath);

        const svgOutputPath = path.join(outputDir, `image-${Date.now()}.svg`);
        potrace.trace(pngOutputPath, { color: 'black' }, (err, svg) => {
            if (err) {
                console.error('Error during SVG creation:', err);
                return res.status(500).json({ error: 'Failed to create SVG' });
            }
            fs.writeFileSync(svgOutputPath, svg);
            console.log('SVG file saved:', svgOutputPath);

            res.status(200).json({
                pngFilePath: `output/${path.basename(pngOutputPath)}`,
                svgFilePath: `output/${path.basename(svgOutputPath)}`,
            });
        });
    } catch (error) {
        console.error('Error processing image:', error);
        res.status(500).json({ error: 'Failed to process image' });
    }
});

app.listen(5000, () => {
    console.log('Server running on port 5000');
});
