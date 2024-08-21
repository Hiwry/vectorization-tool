const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const potrace = require('potrace');

exports.handler = async function(event, context) {
    try {
        const body = JSON.parse(event.body);
        const { image } = body;
        console.log('Received image data');

        const buffer = Buffer.from(image.split(',')[1], 'base64');
        console.log('Image buffer created');

        const outputDir = '/tmp'; // Use /tmp in serverless environments
        const pngOutputPath = path.join(outputDir, `image-${Date.now()}.png`);
        await sharp(buffer).png().toFile(pngOutputPath);
        console.log('PNG file saved:', pngOutputPath);

        const svgOutputPath = path.join(outputDir, `image-${Date.now()}.svg`);
        return new Promise((resolve, reject) => {
            potrace.trace(pngOutputPath, { color: 'black' }, (err, svg) => {
                if (err) {
                    console.error('Error during SVG creation:', err);
                    return reject({
                        statusCode: 500,
                        body: JSON.stringify({ error: 'Failed to create SVG' })
                    });
                }
                fs.writeFileSync(svgOutputPath, svg);
                console.log('SVG file saved:', svgOutputPath);

                resolve({
                    statusCode: 200,
                    body: JSON.stringify({
                        pngFilePath: pngOutputPath,
                        svgContent: svg // Return SVG content directly
                    })
                });
            });
        });
    } catch (error) {
        console.error('Error processing image:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to process image' })
        };
    }
};
