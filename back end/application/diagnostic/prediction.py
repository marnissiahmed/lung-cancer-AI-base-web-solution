import tensorflow as tf
import numpy as np
import SimpleITK as sitk
import matplotlib.pyplot as plt
from skimage import measure
import cv2
import base64
from PIL import Image as im
import io

from django.apps import apps
from asgiref.sync import async_to_sync


def denoising(img):
    # Use MedianImageFilter instead of BilateralImageFilter
    median_filter = sitk.MedianImageFilter()
    denoised_image = median_filter.Execute(img)
    return denoised_image
def hu_transform(img):
    window_level = -600
    window_width = 1500

    # Apply the windowing filter
    window_filter = sitk.IntensityWindowingImageFilter()
    window_filter.SetWindowMinimum(window_level - window_width/2.0)
    window_filter.SetWindowMaximum(window_level + window_width/2.0)
    window_filter.SetOutputMinimum(0)
    window_filter.SetOutputMaximum(255)
    image_windowed = window_filter.Execute(img)
    return image_windowed
   
def get_coord(mask, image):
        # Find contours in the mask
        contours = measure.find_contours(mask.reshape((512, 512)), 0.85)

        # Set default values
        x = None
        y= None
        c = []
        center=[]
        diameter = []
     
        # Loop through the contours and extract the circle properties
        for cnt in contours:
            # Convert the contour to integer format
            cnt = np.array(cnt, dtype=np.float32)

            # Fit a circle to the contour using the minimum enclosing circle method
            (y, x), radius = cv2.minEnclosingCircle(cnt)
            center.append((x,y))
            diameter.append(radius * 2)
            # Print the circle properties
        if x is not None and y is not None:
                
                c = [image.TransformContinuousIndexToPhysicalPoint((x, y))for x,y in center]
                pixel_size = image.GetSpacing()[0]
                diameter = [d *pixel_size for d in diameter]
                return c, diameter,center
                
        else:
                
                    return None, None,None
    
def physical(img_1, imag_2):

    
    imag_2.SetSpacing(img_1.GetSpacing())
    imag_2.SetOrigin(img_1.GetOrigin())
    imag_2 = sitk.Resample(imag_2, img_1, sitk.Transform(), sitk.sitkNearestNeighbor, 0.0)
    return imag_2    
class Model:  

    def predict(self,file):
        result = {
    "stat": None,
    "centers": None,
    "diameters": None,
    "images":None,
    "nodule":None
        }
        deeplab  = apps.get_app_config('lungdiagnostic').ready()
       
        image = sitk.ReadImage(file)
        image = denoising(image)
        image = hu_transform(image)
        if image.GetDimension()==3:
                image= image[:,:,0]
        arr_2d = sitk.GetArrayFromImage(image)
        arr_2d = arr_2d/255
        mask = deeplab.predict(arr_2d.reshape((1,512,512,1)))
        mask = np.where(mask>0.5,1,0)
        center,diameter,c = get_coord(mask,image)
        mask_c = sitk.GetImageFromArray(mask.reshape((512,512)))
        mask_c = physical(image,mask_c)
        

        image_out =sitk.LabelOverlay(image, mask_c, opacity=0.7,colormap=[1,0,0])
        image_out = sitk.GetArrayFromImage(image_out)
        image_out = image_out.astype(np.uint8)
        image_pil = im.fromarray(image_out)
        buffer = io.BytesIO()
        image_pil.save(buffer, format='PNG')
        image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        if center is not None:
            result["stat"] = "cancer"
            result["centers"]= center
            result["diameters"]= diameter
            result["images"]= image_base64
            nodules = []
            for x, y in c:
                nodule = sitk.GetArrayFromImage(image)
                nodule = nodule[int(y)-32:int(y)+32,int(x)-32:int(x)+32]
                nodule = nodule.astype(np.uint8)
                nodule_pil = im.fromarray(nodule)
                image_pil = image_pil.resize((128,128))
                buffer = io.BytesIO()
                nodule_pil.save(buffer, format='PNG')
                nodule_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
                nodules.append(nodule_base64)
            result["nodule"] = nodules
            return result
        else :
                result["stat"] = "non cancer"
                result["centers"],result["diameters"] = "",""
                result["images"]= image_base64
                return result          
                            
        