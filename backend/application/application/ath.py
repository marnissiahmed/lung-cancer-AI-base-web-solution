from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError

class CustomAuthenticationBackend(ModelBackend):
    def authenticate(self, request, email=None, password=None, **kwargs):
        UserModel = get_user_model()
        try:
            user = UserModel._default_manager.get(email=email)
        except UserModel.DoesNotExist:
            raise ValidationError("incorrect email .")

        if user.check_password(password):
            # Check if the user is active
            if user.is_active == True:
                return user
            else:
                raise ValidationError("User account is not active. Please contact your administrator.")

        raise ValidationError("incorrect password .")
