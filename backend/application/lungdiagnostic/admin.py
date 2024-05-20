from django.contrib import admin
from .models import Medcine
# Register your models here.
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUser
from django.utils.translation import gettext as _


class UserAdmin(BaseUser):
    ordering = ['_id']
    list_display = ['_id','email','phone_number','name']
    list_display_links = ['_id','email']
    fieldsets = (
        (None,{'fields':('phone_number','email','password')}),
        (_('Personal Info'),{'fields': ('name',)}),
        (_('Permissions'),{'fields':('is_active','is_staff','is_superuser')}),
        (_('Imp dates'),{'fields': ('last_login',)})
    )
    add_fieldsets = (
        (None,{
            'classes': ('wide',),
            'fields': ('phone_number','email','password1','password2')
        }),
    )

admin.site.register(Medcine,UserAdmin)