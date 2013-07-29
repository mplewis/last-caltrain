#!/usr/bin/python

import sys
import csv
import json

def get_minutes_from_timestamp(timestamp):
    parts = timestamp.split(':')
    hours = int(parts[0])
    minutes = int(parts[1])
    total_minutes = minutes + (hours * 60)  
    return total_minutes

def get_named_stop_from_list(stop_name, stop_list):
    for stop in stop_list:
        if stop['stop_name'] == stop_name:
            return stop
    raise KeyError

def get_last_stop_list_with_named_stop(stop_name, stop_lists):
    for stop_list in reversed(stop_lists):
        for stop in stop_list:
            if stop['stop_name'] == stop_name:
                return stop_list
    return KeyError

def get_last_stop_list_with_named_stops(stop_names_list, stop_lists):
    for stop_list in reversed(stop_lists):
        test_stop_names_list = stop_names_list[:]
        for stop in stop_list:
            if stop['stop_name'] in test_stop_names_list:
                test_stop_names_list.remove(stop['stop_name'])
        if len(test_stop_names_list) == 0:
            return stop_list
    return KeyError

def get_all_origin_destination_combinations(ordered_stops):
    combinations = []
    ordered_stops_copy = ordered_stops[:]
    ordered_stops_copy.reverse()
    while len(ordered_stops_copy) > 1:
        stop = ordered_stops_copy.pop()
        combinations.append({'origin': stop, 'destinations': ordered_stops_copy[:]})
    return combinations

def get_destination_data(combinations, stops_for_direction):
    destination_data = {}
    for combination in combinations:
        origin = combination['origin']
        destinations = combination['destinations']
        origin_data = {}
        for destination in destinations:
            stop_list = get_last_stop_list_with_named_stops([origin, destination], stops_for_direction)
            stop = get_named_stop_from_list(origin, stop_list)
            stop_time = stop['stop_time']
            last_time_from_origin_to_destination = stop_time
            origin_data[destination] = last_time_from_origin_to_destination
        destination_data[origin] = origin_data
    return destination_data

raw_stops_data = []
stops_file_loc = sys.argv[1]
with open(stops_file_loc, 'r') as f:
    reader = csv.reader(f)
    for row in reader:
        raw_stops_data.append(row)

# get rid of first row
raw_stops_data = raw_stops_data[1:]
# get rid of empty rows
raw_stops_data = list(row for row in raw_stops_data if len(row) > 0)

stop_data_grouped = {}
stop_names = set()
stop_ids = set(row[0] for row in raw_stops_data)
for stop_id in stop_ids:
    stop_data_grouped[stop_id] = []
for raw_stop_data in raw_stops_data:
    stop_id = raw_stop_data[0]
    stop_name = raw_stop_data[3].split(' Caltrain')[0]
    stop_names.add(stop_name)
    clean_stop_data = {
        'stop_name':  stop_name,
        'stop_time':  get_minutes_from_timestamp(raw_stop_data[1]),
        'stop_order': int(raw_stop_data[4])
    }
    stop_data_grouped[stop_id].append(clean_stop_data)

# ensure stops are in ascending order by stop_order key
for stop_id, stop_group in stop_data_grouped.items():
    sorted_stop_group = sorted(stop_group, key=lambda stop: stop['stop_order'])
    stop_data_grouped[stop_id] = sorted_stop_group

# group stops by northbound (to SF) and southbound (to San Jose)
stops_by_direction = {'northbound': [], 'southbound': []}
for stop_id, stop_list in stop_data_grouped.items():
    first_stop = stop_list[0]
    first_stop_name = first_stop['stop_name']
    first_stop_time = first_stop['stop_time']
    if first_stop_name == 'San Francisco':
        stops_by_direction['southbound'].append(stop_list)
    else:
        stops_by_direction['northbound'].append(stop_list)

# sort northbound and southbound trains by San Jose or San Francisco departure time
northbound_key = 'San Jose'
southbound_key = 'San Francisco'
farthest_stop_south = 'Gilroy'

stops_by_direction['northbound'] = sorted(stops_by_direction['northbound'],
                                          key=lambda stop_list: get_named_stop_from_list(northbound_key, stop_list)['stop_time'])
stops_by_direction['southbound'] = sorted(stops_by_direction['southbound'],
                                          key=lambda stop_list: get_named_stop_from_list(southbound_key, stop_list)['stop_time'])

# get the last northbound and southbound time for each station
last_stop_times_by_direction = {'northbound': {}, 'southbound': {}}
for stop_name in stop_names:
    last_northbound_stop_list = get_last_stop_list_with_named_stop(stop_name, stops_by_direction['northbound'])
    last_southbound_stop_list = get_last_stop_list_with_named_stop(stop_name, stops_by_direction['southbound'])
    last_northbound_stop = get_named_stop_from_list(stop_name, last_northbound_stop_list)
    last_southbound_stop = get_named_stop_from_list(stop_name, last_southbound_stop_list)
    last_northbound_stop_time = last_northbound_stop['stop_time']
    last_southbound_stop_time = last_southbound_stop['stop_time']
    last_stop_times_by_direction['northbound'][stop_name] = last_northbound_stop_time
    last_stop_times_by_direction['southbound'][stop_name] = last_southbound_stop_time

northbound_stops_ordered = [stop['stop_name'] for stop in
                            get_last_stop_list_with_named_stop(farthest_stop_south,
                                                               stops_by_direction['northbound'])]
southbound_stops_ordered = [stop['stop_name'] for stop in
                            get_last_stop_list_with_named_stop(farthest_stop_south,
                                                               stops_by_direction['southbound'])]

northbound_combinations = get_all_origin_destination_combinations(northbound_stops_ordered)
southbound_combinations = get_all_origin_destination_combinations(southbound_stops_ordered)

northbound_origin_destination_data = get_destination_data(northbound_combinations, stops_by_direction['northbound'])
southbound_origin_destination_data = get_destination_data(southbound_combinations, stops_by_direction['southbound'])

output_data = (
    {
        'stops': sorted(list(stop_names)),
        'departure_time_minutes_past_midnight':
        {
            'northbound': northbound_origin_destination_data,
            'southbound': southbound_origin_destination_data
        }
    })

print json.dumps(output_data)