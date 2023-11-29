// SubmissionForm.jsx
import React, { useState } from 'react';
import axios from 'axios';
import './SubmissionForm.css'
import {Link} from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import AWS from 'aws-sdk';

const minioEndpoint = 'http://10.8.0.15:9000';
const accessKey = 'minioadmin';
const secretKey = 'Minio@0710';
const bucketName = 'art1';

AWS.config.update({
  accessKeyId: accessKey,
  secretAccessKey: secretKey,
  endpoint: minioEndpoint,
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
});

const s3 = new AWS.S3();

const minioUploader = async (file, fileName) => {
  const params = {
    Bucket: bucketName,
    Key: fileName,
    Body: file,
    ContentType: file.type,
  };

  try {
    await s3.upload(params).promise();
  } catch (error) {
    console.error('Error uploading to MinIO:', error);
    throw error;
  }
};

const SubmissionForm = () => {

  const [formData,setFormData] = useState({
    paintingName: '',
    paintingId: 0,
    painter: '',
    year: 0,
    style: '',
    medium: '',
    dimensions: '',
    description: '',
    mediafile: null
  });
  const [file, setFile] = useState(null);
  const history = useNavigate(); 
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // const handleFileChange = (e) => {
  //   setFormData({...formData, file: e.target.files[0],
  //   });
  //   setFile(selectedFile);
  // };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFormData({
      ...formData,
      mediaFile: selectedFile,
    });
    setFile(selectedFile);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const {
      paintingName,
      paintingId,
      painter,
      year,
      style,
      medium,
      dimensions,
      description,
      mediaFile,
    } = formData;
  
    const data = new FormData();
    data.append('paintingName', paintingName);
    data.append('paintingId', paintingId);
    data.append('painter', painter);
    data.append('year', year);
    data.append('style', style);
    data.append('medium', medium);
    data.append('dimensions', dimensions);
    data.append('description', description);
    data.append('mediaFile', mediaFile);
  
    try {
      let minioResponse = {};
      if (mediaFile) {
        const fileName = `WC_${Date.now()}_${mediaFile.name}`;
        await minioUploader(mediaFile, fileName);
  
        minioResponse = {
          data: {
            mediaUrl: `${minioEndpoint}/${bucketName}/${fileName}`,
          },
        };
      } else {
        console.error('No file selected.');
      }
  
      if (minioResponse.data.mediaUrl) {
        const flaskResponse = await axios.post('http://localhost:5000/submit', {
          paintingName,
          paintingId,
          painter,
          year,
          style,
          medium,
          dimensions,
          description,
          mediaUrl: minioResponse.data.mediaUrl,
        });
  
        console.log('Data uploaded to MongoDB and MinIO successfully:', flaskResponse.data);
        setFormData({
          paintingName: '',
          paintingId: 0,
          painter: '',
          year: 0,
          style: '',
          medium: '',
          dimensions: '',
          description: '',
          mediaFile: null,
          // Reset other fields as needed
        });
        // history.push('/output');
        setFile(null);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  return(
    <div className="container">

      <div className="headerContainer">
        <div className="titleHeader">Submission Form</div>
      </div>

      <div className="bodyContainer"> 
      <form onSubmit={handleSubmit}>
      <div className="row0"><div className="input"></div></div>
      <div className="row1">
        <div className="input">Painting Name: <input type="text" 
        name="paintingName" value={formData.paintingName} onChange={handleChange}
        /></div>
        <div className="input">Painting ID: <input type="number" name="paintingId" 
        value={formData.paintingId} onChange={handleChange} 
        /></div></div>
        <div className="row2">
        <div className="input">Painter: <input type="text" 
        name="painter" value={formData.painter} onChange={handleChange} 
        /></div></div>
        <div className="row3">
        <div className="input">Year: <input type="number" 
        name="year" value={formData.year} onChange={handleChange} 
        /></div>
        <div className="input">Style: <input type="text" 
        name="style" value={formData.style} onChange={handleChange} 
        /></div></div>
        <div className="row4">
        <div className="input">Medium: <input type="text" 
        name="medium" value={formData.medium} onChange={handleChange}
         /></div></div>
        <div className="row5">
        <div className="input">Dimensions: <input type="text" 
        name="dimensions" value={formData.dimensions} onChange={handleChange} 
        /></div></div>
        <div className="row6">
        <div className="input">Description: <input type="text" 
        name="description" value={formData.description} onChange={handleChange} 
        /></div></div>
        {/* <textarea className="input">Description: </textarea></div> */}
        <div className="row7"> 
        <div name="mediaFile" className="input" onChange={handleFileChange} >Media: <input type="file" /></div></div>
        <div className="row8">
        <div className="submitContainer">
        <button type="submit" className='submit'>submit</button>
        <div className="link"><nav><Link to="/OutputScreen">Search</Link></nav></div>
        </div></div>
        <div className="row9"></div>
      </form>
      </div>
    </div>
  )
};

export default SubmissionForm;
