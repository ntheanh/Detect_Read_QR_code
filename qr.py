from pyzbar import pyzbar
import cv2
import uuid
import random as rd
import subprocess




def cover_webm_mp4(input,output):
    cmd = 'ffmpeg -i ' +input + " " + output;
    subprocess.run(cmd, shell=True)

def read_barcodes(frame , domain, file_name_rd):
    result = 0
    image_Crop_QR = []
    barcode_info = []
    ext = ".jpg"
    file_name_rd_QR_dectect_video = "data/dectect/" + file_name_rd + ext
    try:
        barcodes = pyzbar.decode(frame)
        if bool(barcodes):
            result = 1
            for barcode in barcodes:
                x, y, w, h = barcode.rect
                barcode_info.append(barcode.data.decode('utf-8'))
                cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
                file_name_rd_QR_crop_video = "data/crop/" + uuid.uuid4().hex + str(rd.randint(100000, 10000000)) + ".jpg"
                image_Crop_QR.append(domain + file_name_rd_QR_crop_video)
                crop_img = frame[y:y + h, x:x + w] # CROP QR
                cv2.imwrite(file_name_rd_QR_crop_video, crop_img) # Save CROP QR

        cv2.imwrite(file_name_rd_QR_dectect_video, frame)  # Save Image QR
    except:
        result = 1
        file_name_rd_QR_dectect_video = ""
    return frame , result , barcode_info, image_Crop_QR, domain+file_name_rd_QR_dectect_video

def qrImage(imageurl,filename,domain):
    image = cv2.imread(imageurl+filename)
    decodedObjects = pyzbar.decode(image)
    text_QR = []
    image_Crop_QR = []
    file_name_rd_QR_capture = "data/capture/" + filename
    file_name_rd_QR_dectect = "data/dectect/" + filename

    cv2.imwrite(file_name_rd_QR_capture, image)  # Save Image QR
    for obj in decodedObjects:
        x, y, w, h = obj.rect
        cv2.rectangle(image, (x, y), (x + w, y + h), (0, 255, 0), 5)
        file_name_rd_QR_crop = "data/crop/" + uuid.uuid4().hex + str(rd.randint(100000, 10000000)) + ".jpg"
        crop_img = image[y:y + h, x:x + w]  # CROP QR
        cv2.imwrite(file_name_rd_QR_crop, crop_img)  # Save CROP QR
        text_QR.append(obj.data)
        image_Crop_QR.append(domain + file_name_rd_QR_crop)
        #print("Type:", obj.type)
        #print("Data: ", obj.data, "\n")

    cv2.imwrite(file_name_rd_QR_dectect, image)  # Save dectect QR
    return text_QR, image_Crop_QR , domain+file_name_rd_QR_dectect
    #cv2.imshow("QR Scanner", image)
