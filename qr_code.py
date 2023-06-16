import qrcode

qr = qrcode.QRCode(version=5, error_correction=qrcode.ERROR_CORRECT_H,
                   box_size=7, border=2)

qr.add_data('https://vku.udn.vn')

qr.make(fit=True)
img = qr.make_image(fill_color = 'black', back_color='white')
img.save("my_qr3.png")