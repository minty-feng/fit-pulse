# serializers.py
from rest_framework import serializers
from .models import WeightRecord

class WeightRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeightRecord
        fields = '__all__'
        read_only_fields = ['submitted_at', 'updated_at']

    def validate_weight(self, value):
        return round(value, 1)  # 强制保留1位小数
