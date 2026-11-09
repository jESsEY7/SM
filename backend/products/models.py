from django.db import models


class Product(models.Model):
    CATEGORY_CHOICES = [
        ('lips', 'Lips'),
        ('face', 'Face'),
        ('cheeks', 'Cheeks'),
        ('eyes', 'Eyes'),
    ]
    UNDERTONE_CHOICES = [
        ('cool', 'Cool'),
        ('neutral', 'Neutral'),
        ('warm', 'Warm'),
    ]

    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    undertone = models.CharField(max_length=20, choices=UNDERTONE_CHOICES)
    shade_name = models.CharField(max_length=100)
    shade_hex = models.CharField(max_length=7)
    finish = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    depth = models.IntegerField(default=5, help_text='1-10 skin depth match')
    badge = models.CharField(max_length=50, blank=True)
    formula_notes = models.JSONField(default=list)
    image_url = models.URLField(max_length=500, blank=True)
    sort_order = models.IntegerField(default=0)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['sort_order', 'name']

    def __str__(self):
        return f'{self.name} – {self.shade_name}'

