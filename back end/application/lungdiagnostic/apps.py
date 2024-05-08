from django.apps import AppConfig
import tensorflow as tf
import threading
import time

loaded_model = None  # Declare loaded_model as a global variable

class LungdiagnosticConfig(AppConfig):
    name = "lungdiagnostic"
    
    def ready(self):
        global loaded_model

        # Initialize the TensorFlow GPU and load the model in a background thread
        def initialize_gpu_and_load_model():
            gpus = tf.config.list_physical_devices('GPU')
            if gpus:
                try:
                    for gpu in gpus:
                        tf.config.experimental.set_memory_growth(gpu, True)
                except RuntimeError as e:
                    print('error', e)

            model = tf.keras.models.load_model("diagnostic/deeplabv3plus.h5", compile=False)

            # Assign the loaded model to the global variable
            global loaded_model
            loaded_model = model

        thread = threading.Thread(target=initialize_gpu_and_load_model)
        thread.daemon = True
        thread.start()

        # Wait for the model to be loaded
        while loaded_model is None:
            time.sleep(0.1)
        return loaded_model