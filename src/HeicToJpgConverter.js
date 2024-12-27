import React, { useState } from 'react';
import heic2any from 'heic2any';
import JSZip from 'jszip'; // Import JSZip
import { saveAs } from 'file-saver'; // Import file-saver for saving the zip file

const HeicToJpgConverter = () => {
    const [images, setImages] = useState([]); // Handle multiple images
    const [convertedImages, setConvertedImages] = useState([]); // Handle multiple converted images
    const [loading, setLoading] = useState(false); // New state for loading


    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files); // Get all selected files
        const validFiles = files.filter(file => file.type === 'image/heic'); // Filter valid HEIC files
        setImages(validFiles); // Update state with valid files

        setLoading(true); // Set loading to true before conversion
        const newConvertedImages = []; // Array to hold converted images

        for (const file of validFiles) {
            try {
                // Convert HEIC to JPG
                const converted = await heic2any({
                    blob: file,
                    toType: 'image/jpeg', // Output format
                });

                // Create a URL for the converted image
                const url = URL.createObjectURL(converted);
                newConvertedImages.push(url); // Add the converted URL to the array
            } catch (error) {
                console.error('Error converting HEIC to JPG:', error);
            }
        }

        setConvertedImages(newConvertedImages); // Update state with all converted images
        setLoading(false); // Set loading to false after conversion
    };

    const handleDownload = (url, index) => {
        const a = document.createElement('a');
        a.href = url;
        a.download = `converted-image-${index + 1}.jpg`; // Unique name for each converted file
        a.click();
    };

    const handleDownloadAll = async () => {
        const zip = new JSZip(); // Create a new JSZip instance

        // Add each converted image to the zip
        for (let i = 0; i < convertedImages.length; i++) {
            const response = await fetch(convertedImages[i]);
            const blob = await response.blob();
            zip.file(`converted-image-${i + 1}.jpg`, blob); // Add the image blob to the zip
        }

        // Generate the zip file
        zip.generateAsync({ type: 'blob' }).then((content) => {
            saveAs(content, 'converted-images.zip'); // Save the zip file
        });
    };

    return (
        <div className='container mt-5'>
            <h1 className='display-4'>Saurabh's</h1>
            <h1 className='lead display-5'>HEIC to JPG Converter</h1>
            <div className='d-flex justify-content-center'>
                <input type="file" className='form-control w-50 display-6 m-1' accept=".heic" multiple onChange={handleFileChange} /> {/* Allow multiple files */}
            </div>

            {loading ? ( // Conditional rendering for loader
                <div className="spinner-border text-secondary mt-5" role="status">
                    <span className="visually-hidden"></span>
                </div>) : (
                convertedImages.length > 0 && (
                    <div>
                        <h2>Converted Images:</h2>
                        <button className='btn btn-primary mt-5' onClick={handleDownloadAll}>Download All as ZIP</button>
                        <div className="container-fluid mt-5 row">
                            {convertedImages.map((url) => (
                                <div key={url} className="col-4">
                                    <div className="card">
                                        <img src={url} alt={`Converted image`} className="card-img-top" />
                                        <div className="card-body">
                                            <a onClick={() => handleDownload(url)} className="btn btn-primary">Download</a>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            )}
        </div>
    );
};

export default HeicToJpgConverter;