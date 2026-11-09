from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend

User = get_user_model()


class EmailBackend(ModelBackend):
    """Custom authentication backend supporting email authentication for both Django Admin and API."""

    def authenticate(self, request, username=None, password=None, email=None, **kwargs):
        lookup_email = email or username or kwargs.get('email') or kwargs.get(User.USERNAME_FIELD)
        if not lookup_email or not password:
            return None

        try:
            user = User.objects.get(email__iexact=lookup_email)
        except User.DoesNotExist:
            return None
        except User.MultipleObjectsReturned:
            user = User.objects.filter(email__iexact=lookup_email).order_by('id').first()

        if user and user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None

    def get_user(self, user_id):
        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None
        return user if self.user_can_authenticate(user) else None

    def user_can_authenticate(self, user):
        return getattr(user, 'is_active', False)


