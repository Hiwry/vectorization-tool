import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
    const [image, setImage] = useState(null);
    const [vectorPreview, setVectorPreview] = useState(null);
    const dropZoneRef = useRef(null);

    useEffect(() => {
        const handlePaste = (event) => {
            const items = event.clipboardData.items;
            for (let i = 0; i < items.length; i++) {
                if (items[i].kind === 'file' && items[i].type.startsWith('image/')) {
                    const file = items[i].getAsFile();
                    processFile(file);
                }
            }
        };

        document.addEventListener('paste', handlePaste);

        return () => {
            document.removeEventListener('paste', handlePaste);
        };
    }, []);

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        processFile(file);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        processFile(file);
    };

    const processFile = (file) => {
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDragOver = (event) => {
        event.preventDefault();
    };

    const handleVectorize = async () => {
        try {
            const response = await axios.post('/.netlify/functions/vectorize', { image });
            const svgContent = response.data.svgContent;

            // Renderizando o SVG diretamente no HTML
            setVectorPreview(svgContent);
            console.log('Image vectorized successfully:', response.data);
        } catch (error) {
            console.error('Error vectorizing image:', error);
        }
    };

    return (
        <div className="container">
            <h1>Vectorization Tool</h1>
            <div
                className="drop-zone"
                ref={dropZoneRef}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <p>Drag and drop an image here, or click to select one. You can also paste an image (Ctrl+V).</p>
                <input type="file" accept="image/*" onChange={handleImageUpload} />
            </div>

            {image && (
                <div className="image-previews">
                    <div>
                        <h3>Original Image</h3>
                        <img src={image} alt="uploaded" className="preview-image" />
                    </div>
                    {vectorPreview && (
                        <div>
                            <h3>Vectorized Preview</h3>
                            <div
                                className="preview-svg"
                                dangerouslySetInnerHTML={{ __html: vectorPreview }}
                            />
                        </div>
                    )}
                </div>
            )}

            <div>
                <button className="btn" onClick={handleVectorize} disabled={!image}>
                    Vectorize Image
                </button>
            </div>
        </div>
    );
}

export default App;
