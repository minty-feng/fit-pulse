from django.urls import path
from . import views

urlpatterns = [
    path('weight/records', views.WeightRecordsView.as_view()),
    path('weight/create', views.CreateUpdateDeleteView.as_view(), {'action': 'create'}),
    path('weight/update', views.CreateUpdateDeleteView.as_view(), {'action': 'update'}),
    path('weight/delete', views.CreateUpdateDeleteView.as_view(), {'action': 'delete'}),
]
