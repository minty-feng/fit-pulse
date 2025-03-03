from django.db import models

class WeightRecord(models.Model):
    date = models.DateField()
    weight = models.DecimalField(max_digits=5, decimal_places=1)
    submitted_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date']

