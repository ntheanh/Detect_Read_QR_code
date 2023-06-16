import os
import shutil as st
import random as rd
import uuid
import uvicorn
from fastapi import FastAPI, File, UploadFile, Request
from typing import List
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from qr import qrImage, read_barcodes, cover_webm_mp4
import cv2

app = FastAPI()
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/data", StaticFiles(directory="data"), name="data")
domain = ' http://127.0.0.1:8000/'



@app.get("/", include_in_schema=False)
async def index():
    return RedirectResponse(url="/redoc")

@app.post("/qr/")
async def upload_file_eKYC(files: List[UploadFile] = File(...)):
    ext = ".mp4"
    for file in files:
        if(file.content_type != "video/mp4"):
            file_name_rd = uuid.uuid4().hex + str(rd.randint(100000, 10000000)) + ".jpg"
            with open("data/upload/"+file_name_rd, "wb") as buffer:
                st.copyfileobj(file.file, buffer)
            text_QR , image_Crop_QR ,imageqrdectect = qrImage("data/upload/",file_name_rd,domain)
        else:
            file_name_rd = uuid.uuid4().hex + str(rd.randint(100000, 10000000))
            with open("data/upload/" + file_name_rd + ext, "wb") as buffer:
                st.copyfileobj(file.file, buffer)
            cap = cv2.VideoCapture("data/upload/" + file_name_rd + ext)
            while (cap.isOpened()):
                ret, frame = cap.read()
                frame, result, text_QR, image_Crop_QR, imageqrdectect  = read_barcodes(frame, domain, file_name_rd)
                if (result == 1):
                    break
                cv2.imshow('frame', frame)
            cap.release()
            cv2.destroyAllWindows()
    return {"text":text_QR, "imageqrcrop": image_Crop_QR, "imageqrdectect": imageqrdectect}


@app.post("/qrvideo/")
async def upload_file_eKYC(files: List[UploadFile] = File(...)):
    for file in files:
        ext = ".mp4"
        extWebm = ".webm"
        barcode_info = ""
        image_Crop_QR = []
        imageqrdectect= ""
        file_name_rd = uuid.uuid4().hex + str(rd.randint(100000, 10000000))
        with open("data/upload/"+file_name_rd+extWebm, "wb") as buffer:
            st.copyfileobj(file.file, buffer)
        # Video
        cover_webm_mp4("data/upload/"+file_name_rd+extWebm, "data/upload/"+file_name_rd+ext)
        cap = cv2.VideoCapture("data/upload/"+file_name_rd+ext)
        while (cap.isOpened()):
            ret, frame = cap.read()
            frame ,result, barcode_info, image_Crop_QR ,imageqrdectect = read_barcodes(frame, domain, file_name_rd)
            if(result == 1):
                break
            # cv2.imshow('frame', frame)
        cap.release()
        cv2.destroyAllWindows()
        os.remove("data/upload/"+file_name_rd+extWebm)
    return {"text":barcode_info, "imageqrcrop": image_Crop_QR, "imageqrdectect": imageqrdectect}

if __name__ == "__main__":
    uvicorn.run(app)