from django.shortcuts import render
from django.template import loader
from django.http import HttpResponse


def render_table(request):
    return render(request, 'table.html')


