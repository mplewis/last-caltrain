#!/usr/bin/python

import json
from bs4 import BeautifulSoup
from urllib2 import urlopen

weekend_timetable_url = 'http://www.caltrain.com/schedules/weekendtimetable.html'

def get_minutes_from_timestamp(timestamp):
    parts = timestamp.split(':')
    hours = int(parts[0])
    minutes = int(parts[1])
    if hours == 1:
        hours += 12
    total_minutes = minutes + (hours * 60) + (12 * 60)
    return total_minutes

soup = BeautifulSoup(urlopen(weekend_timetable_url).read())

tables = soup.find_all('table')
for table in tables:
    table_title = table.get('summary')
    if table_title is not None:
        if 'Northbound' in table_title:
            northbound_table = table
        elif 'Southbound' in table_title:
            southbound_table = table

stop_names = []

northbound_times = {'saturday': {}, 'sunday': {}}
northbound_rows = northbound_table.find('tbody').find_all('tr')[3:]
for row in northbound_rows:
    stop_name = row.find('th').text.encode('ascii', 'replace').replace('?', ' ')
    stop_names.append(stop_name)
    all_times = [td.text.replace('\n', '').replace(' ', '') for td in row.find_all('td')]
    sat_time = get_minutes_from_timestamp(all_times[-1:][0])
    sun_time = get_minutes_from_timestamp(all_times[-2:-1][0])
    northbound_times['saturday'][stop_name] = sat_time
    northbound_times['sunday'][stop_name] = sun_time

southbound_times = {'saturday': {}, 'sunday': {}}
southbound_rows = southbound_table.find('tbody').find_all('tr')[2:-2]
for row in southbound_rows:
    stop_name = row.find('th').text.encode('ascii', 'replace').replace('?', ' ')
    all_times = [td.text.replace('\n', '').replace(' ', '') for td in row.find_all('td')]
    sat_time = get_minutes_from_timestamp(all_times[-1:][0])
    sun_time = get_minutes_from_timestamp(all_times[-3:-2][0])
    southbound_times['saturday'][stop_name] = sat_time
    southbound_times['sunday'][stop_name] = sun_time

stop_names = sorted(stop_names)

output_data = (
    {
        'stops': stop_names,
        'departure_time_minutes_past_midnight':
        {
            'northbound': northbound_times,
            'southbound': southbound_times
        }
    })

print json.dumps(output_data)