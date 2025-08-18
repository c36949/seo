import requests
import csv
from io import StringIO
import json

# Fetch the CSV data
csv_url = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%EB%B0%B0%EA%B5%AC%EB%8C%80%ED%9A%8C_11%EA%B0%9C%EB%B6%80%EB%B3%84_%ED%81%B4%EB%9F%BD_%EB%9E%AD%ED%82%B9_%EC%9A%B0%EC%8A%B9_%EC%A4%80%EC%9A%B0%EC%8A%B9_3%EC%9C%84_%EC%A0%95%ED%99%95%EC%A0%95%EB%A0%AC-oPLKXRqsW9gEdjQDdVq1rxTmuJtmAC.csv"

try:
    response = requests.get(csv_url)
    response.raise_for_status()
    
    # Parse CSV data
    csv_content = response.text
    csv_reader = csv.DictReader(StringIO(csv_content))
    
    volleyball_data = []
    divisions = set()
    regions = set()
    
    for row in csv_reader:
        # Clean team name (remove extra spaces)
        team_name = row.get('팀명', '').strip()
        division = row.get('부별구분', '').strip()
        
        # Extract region from team name (first part before space)
        region = team_name.split()[0] if team_name else ''
        
        # Map regions to major areas
        region_mapping = {
            '서울': '수도권', '인천': '수도권', '경기': '수도권',
            '부산': '경상권', '대구': '경상권', '울산': '경상권', '경남': '경상권', '경북': '경상권',
            '광주': '전라권', '전남': '전라권', '전북': '전라권',
            '대전': '충청권', '세종': '충청권', '충남': '충청권', '충북': '충청권',
            '강원': '강원권',
            '제주': '제주권'
        }
        
        mapped_region = region_mapping.get(region, region)
        
        team_data = {
            'team_name': team_name,
            'division': division,
            'region': mapped_region,
            'wins': int(row.get('우승횟수', 0) or 0),
            'runner_ups': int(row.get('준우승횟수', 0) or 0),
            'third_places': int(row.get('3위횟수', 0) or 0)
        }
        
        volleyball_data.append(team_data)
        divisions.add(division)
        regions.add(mapped_region)
    
    print(f"Processed {len(volleyball_data)} teams")
    print(f"Divisions: {sorted(divisions)}")
    print(f"Regions: {sorted(regions)}")
    
    # Count teams by division
    division_counts = {}
    for team in volleyball_data:
        div = team['division']
        division_counts[div] = division_counts.get(div, 0) + 1
    
    print("\nTeam counts by division:")
    for div, count in sorted(division_counts.items()):
        print(f"{div}: {count} teams")
    
    # Save processed data
    with open('volleyball_data.json', 'w', encoding='utf-8') as f:
        json.dump({
            'teams': volleyball_data,
            'divisions': sorted(divisions),
            'regions': sorted(regions),
            'division_counts': division_counts
        }, f, ensure_ascii=False, indent=2)
    
    print("\nData saved to volleyball_data.json")

except Exception as e:
    print(f"Error processing CSV: {e}")
    
    # Create sample data structure for development
    sample_data = {
        'teams': [
            {'team_name': '서울 배구클럽', 'division': '남자클럽3부', 'region': '수도권', 'wins': 3, 'runner_ups': 2, 'third_places': 1},
            {'team_name': '부산 스파이커스', 'division': '남자클럽3부', 'region': '경상권', 'wins': 2, 'runner_ups': 3, 'third_places': 2},
            {'team_name': '광주 여자배구', 'division': '여자클럽3부', 'region': '전라권', 'wins': 4, 'runner_ups': 1, 'third_places': 0}
        ],
        'divisions': ['남자클럽3부', '여자클럽3부', '남자장년부', '여자장년부', '남자시니어부', '남자실버부', '남자대학부', '여자대학부', '남자국제부', '여자국제부'],
        'regions': ['수도권', '충청권', '강원권', '전라권', '경상권', '제주권'],
        'division_counts': {'남자클럽3부': 93, '여자클럽3부': 90}
    }
    
    with open('volleyball_data.json', 'w', encoding='utf-8') as f:
        json.dump(sample_data, f, ensure_ascii=False, indent=2)
    
    print("Created sample data structure")
