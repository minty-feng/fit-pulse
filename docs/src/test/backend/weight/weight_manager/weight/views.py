from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import WeightRecord
from .serializers import WeightRecordSerializer
from django.core.paginator import Paginator

class WeightRecordsView(APIView):
    def get(self, request):
        page = int(request.query_params.get('page', 1))
        size = int(request.query_params.get('size', 10))

        records = WeightRecord.objects.all()
        paginator = Paginator(records, size)
        page_obj = paginator.get_page(page)

        serializer = WeightRecordSerializer(page_obj, many=True)
        return Response({
            "code": 0,
            "data": {
                "list": serializer.data,
                "total": paginator.count
            }
        })

class CreateUpdateDeleteView(APIView):
    def post(self, request, action):
        if action == 'create':
            serializer = WeightRecordSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response({"code": 0, "data": serializer.data})
            return Response({"code": 1, "msg": serializer.errors}, status=400)

        elif action == 'update':
            record_id = request.data.get('update_id')
            new_weight = request.data.get('new_weight')
            try:
                record = WeightRecord.objects.get(id=record_id)
                record.weight = round(float(new_weight), 1)
                record.save()
                return Response({"code": 0})
            except (WeightRecord.DoesNotExist, ValueError):
                return Response({"code": 1, "msg": "记录不存在或参数错误"}, status=400)

        elif action == 'delete':
            record_id = request.data.get('del_id')
            try:
                record = WeightRecord.objects.get(id=record_id)
                record.delete()
                return Response({"code": 0})
            except WeightRecord.DoesNotExist:
                return Response({"code": 1, "msg": "记录不存在"}, status=404)

# Create your views here.
