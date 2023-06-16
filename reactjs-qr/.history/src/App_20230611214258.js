import './App.css';
import { Container, Accordion, Image, Modal ,Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import DropFileInput from './components/drop-file-input/DropFileInput';
import { Block } from 'notiflix/build/notiflix-block-aio';
import { Loading } from 'notiflix/build/notiflix-loading-aio';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import React, { useEffect, useState, setState } from "react";
import Webcam from "react-webcam";
import ReactDOM from 'react-dom';
import Countdown from 'react-countdown';

function App() {
    const title = 'Detect and Read QR Code Barcode'
    const [showHideFAccordion ,setshowHideFAccordion] = useState("false");
    const [textQR ,settextQR] = useState(["No data found"]);
    const [imagecrop ,setimagecrop] = useState(["No data found"]);
    const [imagedectect ,setimagedectect] = useState("No data found");
    const [modalShow, setModalShow] = React.useState(false);
    const [stWebCam, setstWebCam] = React.useState(false);


    const onFileChange = (files) => {
        if(files.length > 0){
            Block.pulse('.drop-file-input', 'Please wait for data verification...');
            qrImage(files)
        }
    }

    const webcamRef = React.useRef(null);
    const mediaRecorderRef = React.useRef(null);
    const [capturing, setCapturing] = React.useState(false);
    const [recordedChunks, setRecordedChunks] = React.useState([]);
  
    const handleStartCaptureClick = React.useCallback(() => {
      setCapturing(true);
      mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
        mimeType: "video/webm"
      });
      mediaRecorderRef.current.addEventListener(
        "dataavailable",
        handleDataAvailable
      );
      mediaRecorderRef.current.start();
    }, [webcamRef, setCapturing, mediaRecorderRef]);
  
    const handleDataAvailable = React.useCallback(
      ({ data }) => {
        if (data.size > 0) {
          setRecordedChunks((prev) => prev.concat(data));
        }
      },
      [setRecordedChunks]
    );
  
    const handleStopCaptureClick = React.useCallback(() => {
      mediaRecorderRef.current.stop();
      setCapturing(false);
    }, [mediaRecorderRef, webcamRef, setCapturing]);
  
    const handleDownload = React.useCallback(() => {
      if (recordedChunks.length) {
        const blob = new Blob(recordedChunks, {
          type: "video/mp4"
        });
        qrVideo(blob);
        setRecordedChunks([]);
      }
    }, [recordedChunks]);      
    
    useEffect(() => {
        document.title = title;
    }, [title]);
    

    useEffect(() => {
        if(modalShow){
            setstWebCam(true)
            setTimeout(() => {
                setstWebCam(false)
                handleStartCaptureClick();
            }, 5000);
            setTimeout(() => {
                handleStopCaptureClick();
                handleDownload();
                setModalShow(false);
                
            }, 10000);
        }
    }, [modalShow]);

    function qrImage(files) {
        const formData = new FormData();
        formData.append('files',files[0])
        axios({
            method: 'post',
            url: 'http://localhost:8000/qr/',
            data: formData,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'multipart/form-data'
            }
        }).then(res =>{
            if(res['data']['text'].length > 0 && res['data']['imageqrcrop'].length > 0){
                Block.remove(".drop-file-input");
                setshowHideFAccordion('true')
                settextQR(res['data']['text']);
                setimagecrop(res['data']['imageqrcrop'])
                setimagedectect(res['data']['imageqrdectect'])
            }else{
                Notify.failure('Không thể nhận dạng mã QR')
            }
        })
    }

    function qrVideo(files) {
        Loading.pulse();
        const formData = new FormData();
        formData.append('files',files)
        axios({
            method: 'post',
            url: 'http://localhost:8000/qrvideo/',
            data: formData,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'multipart/form-data'
            },
            processData: false,
            contentType: false
        }).then(res =>{
            Loading.remove();
            if(res['data']['text'].length > 0 && res['data']['imageqrcrop'].length > 0){
                setshowHideFAccordion('true')
                settextQR(res['data']['text']);
                setimagecrop(res['data']['imageqrcrop'])
                setimagedectect(res['data']['imageqrdectect'])
            }else{
                Notify.failure('Không thể nhận dạng mã QR')
            }
        })
    }

    return (
        <Container>
            <div className="box">
                <h2 className="header">
                    Detect and Read QR Code Barcode
                    <p><a href='http://localhost:8000/' target="_blank">API Documentation Guide</a></p>
                    <span className="footer">Developed by <a href='https://www.facebook.com/Rin.Boss.Rin/' target="_blank">KenDzz</a></span>
                </h2>
                <DropFileInput
                    onFileChange={(files) => onFileChange(files)}
                />
                <div className="camera">
                    <Button variant="outline-primary" onClick={() => setModalShow(true)}>
                        Scan QR Codes with your WebCam
                    </Button>

                    <Modal
                        show={modalShow} onHide={() => setModalShow(false)}
                        size="lg"
                        aria-labelledby="contained-modal-title-vcenter"
                        centered
                    >
                        <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title-vcenter" className='text-center'> 
                        Scan QR Codes with your WebCam {stWebCam ? (<font color="red">(Setup WebCam <Countdown date={Date.now() + 5000} />)</font>) : (<font color="red">(The system is scanning <Countdown date={Date.now() + 5000} />)</font>)}
                        </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Webcam audio={false} ref={webcamRef}  width={770} height={580} />
                        </Modal.Body>
                    </Modal>
                </div>
                {showHideFAccordion == 'true' ?
                    <Accordion defaultActiveKey="1">
                        <Accordion.Item eventKey="1">
                            <Accordion.Header>Text QR</Accordion.Header>
                            <Accordion.Body>
                                {textQR.map(s=><React.Fragment>{s}<br/></React.Fragment>)}
                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey="2">
                            <Accordion.Header>Image Crop</Accordion.Header>
                            <Accordion.Body>
                                {imagecrop.map(img=><React.Fragment><img className="d-block mt-2" src={img} alt="Image Text Crop"/></React.Fragment>)}
                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey="3">
                            <Accordion.Header>Detect text in image</Accordion.Header>
                            <Accordion.Body>
                                <img className="d-block w-100" src={imagedectect} alt="Detect text in image"/>
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion> : null }
            </div>
        </Container>
    );
}

export default App;
